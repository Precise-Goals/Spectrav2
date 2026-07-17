import { server, networkPassphrase, CONTRACTS } from '../lib/stellar/client';
import { signStellarTransaction } from '../lib/stellar/snap';
import { relayGaslessTransaction } from '../lib/stellar/gaslessExecution';
import { TransactionBuilder, Contract, Address, xdr } from '@stellar/stellar-sdk';

// Ponytail: Standard fetch interceptor for x402 payment flow.
// No Web2 payment gateway imports or complex checkout SDKs.
// Uses native Stellar Asset Contracts (SAC) and fee-bumped Soroban calls.

interface X402PaymentRequest {
  recipient: string;
  amount: string;     // as string representation of i128 / units
  token: string;      // SAC contract ID
}

/**
 * Executes a fetch request, automatically intercepting 402 Payment Required responses
 * to handle micropayments using the user's pre-approved allowance on Stellar.
 */
export async function fetchWithX402(url: string, options: RequestInit = {}, userPublicKey: string): Promise<Response> {
  let response = await fetch(url, options);

  if (response.status === 402) {
    console.log('[x402] 402 Payment Required received. Resolving agentic payment...');

    // 1. Extract invoice/payment request details from header or body
    let paymentRequest: X402PaymentRequest;
    try {
      const authHeader = response.headers.get('WWW-Authenticate') || '';
      if (authHeader.startsWith('Stellar')) {
        // e.g. Stellar recipient="GB...", amount="10000000", token="C..."
        const matches = authHeader.match(/recipient="([^"]+)",\s*amount="([^"]+)",\s*token="([^"]+)"/);
        if (!matches) throw new Error('Malformed Stellar WWW-Authenticate header');
        paymentRequest = {
          recipient: matches[1],
          amount: matches[2],
          token: matches[3],
        };
      } else {
        // Try parsing JSON body if headers are not present
        const data = await response.clone().json();
        paymentRequest = {
          recipient: data.recipient,
          amount: data.amount,
          token: data.token,
        };
      }
    } catch (err) {
      throw new Error(`[x402] Failed to parse 402 payment requirements: ${err.message}`);
    }

    // 2. Build the micropayment transaction on Stellar using Profile contract's pay_micropayment
    // This wraps the classic XLM or SEP-41 token transfer via SAC.
    const profileContractId = CONTRACTS.PROFILE;
    if (!profileContractId) {
      throw new Error('[x402] Profile Contract ID is not set in environment.');
    }

    console.log(`[x402] Creating sponsored micropayment of ${paymentRequest.amount} to ${paymentRequest.recipient}...`);

    const contract = new Contract(profileContractId);
    
    // pay_micropayment(env, user, sac_token, amount, recipient)
    const operation = contract.call(
      'pay_micropayment',
      new Address(userPublicKey),
      new Address(paymentRequest.token),
      BigInt(paymentRequest.amount),
      new Address(paymentRequest.recipient)
    );

    const account = await server.getAccount(userPublicKey);
    const tx = new TransactionBuilder(account, {
      fee: '2000',
      networkPassphrase,
    })
      .addOperation(operation)
      .setTimeout(30)
      .build();

    // Simulate to fetch footprint and exact gas fee
    const simResponse = await server.simulateTransaction(tx);
    const assembledTx = assembledTxWithFallback(tx, simResponse);

    // 3. Request signature from the user's Smart Account (via Snap / Passkey signature wrapper)
    const signedXdr = await signStellarTransaction(assembledTx.toXDR(), true);

    // 4. Submit sponsored payment via gasless Relayer
    const relayerResult = await relayGaslessTransaction(signedXdr);

    if (relayerResult.status === 'ERROR') {
      throw new Error(`[x402] Payment transaction failed: ${JSON.stringify(relayerResult.errorResult)}`);
    }

    console.log(`[x402] Micropayment settled. Tx Hash: ${relayerResult.hash}. Retrying original request...`);

    // 5. Retry the original request including the transaction hash as the proof of payment
    const retryHeaders = new Headers(options.headers || {});
    retryHeaders.set('X-402-Payment-Proof', relayerResult.hash);

    const retryOptions = {
      ...options,
      headers: retryHeaders,
    };

    response = await fetch(url, retryOptions);
  }

  return response;
}

function assembledTxWithFallback(tx: any, simResponse: any) {
  try {
    const rpcModule = require('@stellar/stellar-sdk').rpc;
    return rpcModule.assembleTransaction(tx, simResponse).build();
  } catch {
    // Fallback for different SDK bundle layouts in client runtime
    return tx;
  }
}
