import { Keypair, TransactionBuilder, rpc, Networks, Transaction } from '@stellar/stellar-sdk';
import process from 'process';
import { server, networkPassphrase } from './client';

// Ponytail: Gasless relayer utilizing Stellar's native Fee-Bump transactions.
// Avoids heavy custom relayer frameworks; relies purely on CAP-0015 (Fee-Bumps).

interface GaslessRelayResult {
  status: 'SUCCESS' | 'ERROR';
  hash: string;
  errorResult?: string;
}

/**
 * Wraps a signed user transaction in a Stellar Fee-Bump transaction,
 * sponsoring the network fees using the treasury account, and submits it.
 *
 * @param signedXdr The signed inner transaction envelope from the user's smart account / passkey.
 * @returns The relayer transaction submission result.
 */
export async function relayGaslessTransaction(signedXdr: string): Promise<GaslessRelayResult> {
  const secret = (import.meta as any).env?.VITE_STELLAR_TREASURY_SECRET || process.env.STELLAR_TREASURY_SECRET;
  if (!secret) {
    throw new Error('[Gasless] Treasury secret key (STELLAR_TREASURY_SECRET) is not configured.');
  }

  // 1. Initialize Treasury Keypair
  const treasuryKeypair = Keypair.fromSecret(secret);

  // 2. Decode the inner transaction signed by the user
  const innerTransaction = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);

  // 3. Define the sponsored base fee (in stroops)
  // Soroban txs require a slightly higher base fee to cover resource limits
  const baseFee = '120000'; 

  // 4. Build the Fee-Bump Transaction wrapper
  // Sponsoring account: treasuryKeypair
  // Inner transaction: innerTransaction (user pays 0 gas)
  const feeBumpTx = TransactionBuilder.buildFeeBumpTransaction(
    treasuryKeypair,
    baseFee,
    innerTransaction as Transaction,
    networkPassphrase
  );

  // 5. Sign the outer fee-bump envelope with treasury account key
  feeBumpTx.sign(treasuryKeypair);

  console.log('[Gasless] Relaying fee-bumped transaction to Horizon/Soroban RPC...');

  // 6. Submit the sponsored transaction to the network
  const submissionResult = await server.sendTransaction(feeBumpTx);

  if (submissionResult.status === 'ERROR') {
    return {
      status: 'ERROR',
      hash: submissionResult.hash,
      errorResult: (submissionResult as any).errorResultXdr || (submissionResult as any).errorResult,
    };
  }

  return {
    status: 'SUCCESS',
    hash: submissionResult.hash,
  };
}
