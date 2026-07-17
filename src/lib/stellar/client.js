import { rpc, Networks, TransactionBuilder, Contract, Keypair } from '@stellar/stellar-sdk';
import { signTransaction as signFreighterTransaction } from '@stellar/freighter-api';
import { relayGaslessTransaction } from './gaslessExecution';
const RPC_URL = import.meta.env.VITE_STELLAR_RPC_URL || 'https://stellar-soroban-testnet-public.nodies.app';
export const networkPassphrase = Networks.TESTNET; // Ponytail: Strictly locked to Testnet environment

export const server = new rpc.Server(RPC_URL, { allowHttp: true });

export const CONTRACTS = {
  SAAS:     import.meta.env.VITE_SAAS_CONTRACT_ID,
  PROFILE:  import.meta.env.VITE_PROFILE_CONTRACT_ID,
  EXCHANGE: import.meta.env.VITE_EXCHANGE_CONTRACT_ID,
  NFT:      import.meta.env.VITE_NFT_CONTRACT_ID,
  FEEDBACK: import.meta.env.VITE_STELLAR_FEEDBACK_CONTRACT,
  BRIDGE:   import.meta.env.VITE_STELLAR_BRIDGE_CONTRACT,
};

// ─── Simple read-cache: avoid repeat RPC for same key within 60s ──────────────
const _readCache = new Map();
function _cacheKey(contractId, method, args) {
  return `${contractId}:${method}:${args.length}`;
}
function _getCached(key) {
  const entry = _readCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > 60_000) { _readCache.delete(key); return null; }
  return entry.value;
}
function _setCache(key, value) {
  _readCache.set(key, { value, ts: Date.now() });
}

/**
 * Invoke a Soroban smart contract (write — requires signing)
 */
export async function invokeContract(contractId, method, args, publicKey) {
  if (!contractId) throw new Error(`Contract ID not set for method: ${method}`);

  const contract = new Contract(contractId);
  const operation = contract.call(method, ...args);

  // 1. Get account for sequence number
  let account;
  try {
    account = await server.getAccount(publicKey);
  } catch (err) {
    if (err?.response?.status === 404) {
      console.warn('[Stellar] Account not found. Auto-funding via Friendbot...');
      await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${publicKey}`);
      // Retry fetching account
      account = await server.getAccount(publicKey);
    } else {
      throw err;
    }
  }

  // 2. Build the transaction (Hard-locked to TESTNET)
  let tx = new TransactionBuilder(account, {
    fee: '1000',
    networkPassphrase, // Strictly Networks.TESTNET
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // 3. Simulate to get footprint + updated fee
  const simResponse = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simResponse)) {
    throw new Error(`Simulation error: ${simResponse.error}`);
  }

  // 4. Assemble (inject auth + update fee) — new SDK: only 2 args
  const assembledTx = rpc.assembleTransaction(tx, simResponse).build();

  // 5. Sign via Freighter
  const xdrStr = assembledTx.toXDR();
  let signedXdr;
  
  // CRITICAL FIX: Freighter requires explicit network properties to prevent Mainnet fallback
  const response = await signFreighterTransaction(xdrStr, { 
    network: 'TESTNET',
    networkPassphrase: networkPassphrase 
  });
  
  if (typeof response === 'string') {
    signedXdr = response;
  } else if (response && typeof response === 'object') {
    if (response.error) {
      throw new Error(`Freighter Error: ${response.error.message || response.error}`);
    }
    signedXdr = response.signedTxXdr;
  } else {
    throw new Error('Freighter returned an invalid response.');
  }

  // 6. Submit via relayer (gasless fee-bump transaction)
  const sendResponse = await relayGaslessTransaction(signedXdr);

  if (sendResponse.status === 'ERROR') {
    throw new Error(`Transaction rejected: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  // 7. Poll until confirmed
  let statusResponse;
  for (let i = 0; i < 20; i++) {
    statusResponse = await server.getTransaction(sendResponse.hash);
    if (statusResponse.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) break;
    await new Promise(r => setTimeout(r, 2000));
  }

  if (!statusResponse || statusResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error('Transaction failed on-chain');
  }

  return statusResponse;
}

/**
 * Read from a Soroban contract (simulation only — free, no signing, cached 60s)
 * Returns the parsed ScVal result.
 */
export async function readContract(contractId, method, args, _publicKey) {
  if (!contractId) throw new Error(`Contract ID not set for method: ${method}`);

  const cacheKey = _cacheKey(contractId, method, args);
  const cached = _getCached(cacheKey);
  if (cached) return cached;

  const contract = new Contract(contractId);
  const operation = contract.call(method, ...args);

  // For reads we only need any valid-looking account for the transaction envelope.
  // We use a random ephemeral keypair so we never need a network getAccount() call.
  const ephemeral = Keypair.random();
  const fakeAccount = {
    accountId: () => ephemeral.publicKey(),
    sequenceNumber: () => '0',
    incrementSequenceNumber: () => {},
  };

  const tx = new TransactionBuilder(fakeAccount, { fee: '100', networkPassphrase })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const simResponse = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simResponse)) {
    throw new Error(`Read simulation error: ${simResponse.error}`);
  }

  const result = simResponse.result?.retval ?? null;
  _setCache(cacheKey, result);
  return result;
}
