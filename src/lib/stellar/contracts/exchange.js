import { Asset, Operation, TransactionBuilder, Horizon } from '@stellar/stellar-sdk';
import { server, networkPassphrase } from '../client';
import { signTransaction as signFreighterTransaction } from '@stellar/freighter-api';
import { relayGaslessTransaction } from '../gaslessExecution';
import { SAC_MAP } from '../../../config/contracts';

function getClassicAsset(sacAddress) {
  const norm = String(sacAddress).toUpperCase();
  if (norm === SAC_MAP['XLM'].toUpperCase() || norm === 'NATIVE') {
    return Asset.native();
  }
  if (norm === SAC_MAP['USDC'].toUpperCase()) {
    return new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');
  }
  if (norm === SAC_MAP['EURC'].toUpperCase()) {
    return new Asset('EURC', 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO');
  }
  // Default to native if unknown, to avoid crashing
  return Asset.native();
}

/**
 * Execute a token swap via Stellar Horizon Path Payment (Gasless via relayer)
 */
export async function swapTokens(publicKey, tokenIn, tokenOut, amountIn, minAmountOut = 0n) {
  const assetIn = getClassicAsset(tokenIn);
  const assetOut = getClassicAsset(tokenOut);
  
  const sendAmount = (Number(amountIn) / 10000000).toFixed(7);
  let destMinNum = Number(minAmountOut) / 10000000;
  if (destMinNum <= 0) {
    destMinNum = 0.0000001;
  }
  const destMin = destMinNum.toFixed(7);
  
  const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const horizonServer = new Horizon.Server(horizonUrl);
  
  const paths = await horizonServer.strictSendPaths(assetIn, sendAmount, [assetOut]).call();
  if (!paths || paths.records.length === 0) {
    throw new Error('No liquidity path found for this swap on Stellar Testnet.');
  }
  
  const bestPath = paths.records[0];
  
  let account;
  try {
    account = await horizonServer.loadAccount(publicKey);
  } catch (err) {
    throw new Error('Account not found on network.');
  }
  
  const operation = Operation.pathPaymentStrictSend({
    sendAsset: assetIn,
    sendAmount: sendAmount,
    destination: publicKey,
    destAsset: assetOut,
    destMin: destMin,
    path: bestPath.path,
  });
  
  const tx = new TransactionBuilder(account, {
    fee: '10000',
    networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
    
  const xdrStr = tx.toXDR();
  const response = await signFreighterTransaction(xdrStr, { 
    network: 'TESTNET',
    networkPassphrase: networkPassphrase 
  });
  
  let signedXdr;
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
  
  const sendResponse = await relayGaslessTransaction(signedXdr);
  if (sendResponse.status === 'ERROR') {
    throw new Error(`Swap rejected: ${JSON.stringify(sendResponse.errorResult || sendResponse)}`);
  }
  
  return sendResponse;
}

/**
 * Get a price quote for a swap via Horizon API
 */
export async function getQuote(tokenIn, tokenOut, amountIn, callerPublicKey) {
  try {
    const assetIn = getClassicAsset(tokenIn);
    const assetOut = getClassicAsset(tokenOut);
    const sendAmount = (Number(amountIn) / 10000000).toFixed(7);
    
    if (sendAmount <= 0) return 0;
    
    const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
    const horizonServer = new Horizon.Server(horizonUrl);
    
    const paths = await horizonServer.strictSendPaths(assetIn, sendAmount, [assetOut]).call();
    if (!paths || paths.records.length === 0) return 0;
    
    return Math.floor(Number(paths.records[0].destination_amount) * 10000000);
  } catch (err) {
    console.warn('[Exchange] getQuote failed:', err.message);
    return 0;
  }
}
