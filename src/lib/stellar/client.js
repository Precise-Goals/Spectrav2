import { rpc, Networks, TransactionBuilder, Contract, Keypair } from '@stellar/stellar-sdk';
import { signTransaction as signFreighterTransaction } from '@stellar/freighter-api';
import { relayGaslessTransaction } from './gaslessExecution';

export function getNetworkConfig() {
  const isMainnet = localStorage.getItem('spectra_preferred_network') === 'mainnet';
  
  return {
    isMainnet,
    rpcUrl: isMainnet ? 'https://mainnet.sorobanrpc.com' : (import.meta.env.VITE_STELLAR_RPC_URL || 'https://stellar-soroban-testnet-public.nodies.app'),
    horizonUrl: isMainnet ? 'https://horizon.stellar.org' : (import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org'),
    networkPassphrase: isMainnet ? Networks.PUBLIC : Networks.TESTNET,
    networkString: isMainnet ? 'PUBLIC' : 'TESTNET'
  };
}

export function getContractId(name) {
  const isMainnet = localStorage.getItem('spectra_preferred_network') === 'mainnet';
  if (isMainnet) {
    return import.meta.env[`VITE_${name}_CONTRACT_ID_MAINNET`] || import.meta.env[`VITE_${name}_CONTRACT_ID`];
  }
  return import.meta.env[`VITE_${name}_CONTRACT_ID`];
}

export const CONTRACTS = {
  get SAAS()     { return getContractId('SAAS'); },
  get PROFILE()  { return getContractId('PROFILE'); },
  get EXCHANGE() { return getContractId('EXCHANGE'); },
  get NFT()      { return getContractId('NFT'); },
  get FEEDBACK() { return getContractId('STELLAR_FEEDBACK'); },
  get BRIDGE()   { return getContractId('STELLAR_BRIDGE'); },
};

let _serverInstance = null;
let _serverRpcUrl = null;
export const server = new Proxy({}, {
  get(target, prop) {
    const rpcUrl = getNetworkConfig().rpcUrl;
    if (!_serverInstance || _serverRpcUrl !== rpcUrl) {
      _serverInstance = new rpc.Server(rpcUrl, { allowHttp: true });
      _serverRpcUrl = rpcUrl;
    }
    return _serverInstance[prop];
  }
});

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
      if (getNetworkConfig().isMainnet) {
        throw new Error('Account not found on Mainnet. Please fund it with XLM first.');
      }
      console.warn('[Stellar] Account not found. Auto-funding via Friendbot...');
      await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${publicKey}`);
      // Retry fetching account
      account = await server.getAccount(publicKey);
    } else {
      throw err;
    }
  }

  // 2. Build the transaction
  const config = getNetworkConfig();
  let tx = new TransactionBuilder(account, {
    fee: '1000',
    networkPassphrase: config.networkPassphrase,
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
    network: config.networkString,
    networkPassphrase: config.networkPassphrase 
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

  const config = getNetworkConfig();
  const tx = new TransactionBuilder(fakeAccount, { fee: '100', networkPassphrase: config.networkPassphrase })
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
