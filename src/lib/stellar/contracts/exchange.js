import { Asset, Operation, TransactionBuilder, Horizon } from '@stellar/stellar-sdk';
import { server, getNetworkConfig } from '../client';
import { signTransaction as signFreighterTransaction } from '@stellar/freighter-api';
import { SAC_MAP } from '../../../config/contracts';

// Issuer addresses for Stellar Classic assets
const ISSUERS = {
  USDC: import.meta.env.VITE_USDC_ISSUER || 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
  EURC: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',
};

// Accepts symbol (XLM/USDC/EURC) or SAC address — symbol is preferred path
function getClassicAsset(tokenId) {
  const norm = String(tokenId).toUpperCase();
  // Symbol path (fast & correct)
  if (norm.includes('XLM') || norm.includes('NATIVE')) return Asset.native();
  if (norm.includes('USDC')) return new Asset('USDC', ISSUERS.USDC);
  if (norm.includes('EURC')) return new Asset('EURC', ISSUERS.EURC);
  // SAC address fallback
  if (SAC_MAP['XLM'] && norm === SAC_MAP['XLM'].toUpperCase()) return Asset.native();
  if (SAC_MAP['USDC'] && norm === SAC_MAP['USDC'].toUpperCase()) return new Asset('USDC', ISSUERS.USDC);
  if (SAC_MAP['EURC'] && norm === SAC_MAP['EURC'].toUpperCase()) return new Asset('EURC', ISSUERS.EURC);
  // Ponytail: default native prevents crash but logs a warning so we notice routing bugs
  console.error(`[exchange] getClassicAsset: unknown tokenId "${tokenId}" — defaulting to native`);
  return Asset.native();
}

/**
 * Execute a token swap via Stellar Horizon Path Payment.
 * Automatically sets up the destination asset trustline if missing (atomic).
 */
export async function swapTokens(publicKey, tokenIn, tokenOut, amountIn, minAmountOut = 0n) {
  const assetIn  = getClassicAsset(tokenIn);
  const assetOut = getClassicAsset(tokenOut);

  const sendAmount = (Number(amountIn) / 10000000).toFixed(7);
  const destMin   = Math.max(Number(minAmountOut) / 10000000, 0.0000001).toFixed(7);

  const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';
  const horizonServer = new Horizon.Server(horizonUrl);

  // Load account — needed to check trustlines AND build the tx
  let account;
  try {
    account = await horizonServer.loadAccount(publicKey);
  } catch (err) {
    throw new Error('Account not found on network. Ensure your wallet is funded on Testnet.');
  }

  // --- Trustline check ---
  // Stellar rejects pathPaymentStrictSend with op_no_trust if the dest asset
  // has no trustline. Prepend changeTrust atomically so it's one user signature.
  const needsTrustline =
    !assetOut.isNative() &&
    !account.balances.some(
      (b) => b.asset_code === assetOut.getCode() && b.asset_issuer === assetOut.getIssuer()
    );

  // --- Path discovery ---
  // Testnet often has thin/no liquidity for strictSendPaths.
  // We try it first; if no path found, use an empty path and let the DEX order book route it.
  let swapPath = [];
  try {
    const pathResult = await horizonServer.strictSendPaths(assetIn, sendAmount, [assetOut]).call();
    if (pathResult && pathResult.records.length > 0) {
      swapPath = pathResult.records[0].path.map(p => 
        p.asset_type === 'native' ? Asset.native() : new Asset(p.asset_code, p.asset_issuer)
      );
    }
  } catch (_) {
    // Ignore path discovery errors — empty path is valid for direct DEX swaps
  }

  const txBuilder = new TransactionBuilder(account, {
    fee: '10000',
    networkPassphrase: getNetworkConfig().networkPassphrase,
  });

  // Op 1 (conditional): open trustline for the receive asset
  if (needsTrustline) {
    txBuilder.addOperation(Operation.changeTrust({ asset: assetOut }));
  }

  // Op 2: the actual swap
  txBuilder.addOperation(
    Operation.pathPaymentStrictSend({
      sendAsset:   assetIn,
      sendAmount:  sendAmount,
      destination: publicKey,
      destAsset:   assetOut,
      destMin:     destMin,
      path:        swapPath,
    })
  );

  const tx = txBuilder.setTimeout(60).build();

  const response = await signFreighterTransaction(tx.toXDR(), {
    network: getNetworkConfig().networkString,
    networkPassphrase: getNetworkConfig().networkPassphrase,
  });

  let signedXdr;
  if (typeof response === 'string') {
    signedXdr = response;
  } else if (response && typeof response === 'object') {
    if (response.error) throw new Error(`Freighter Error: ${response.error.message || response.error}`);
    signedXdr = response.signedTxXdr;
  } else {
    throw new Error('Freighter returned an invalid response.');
  }

  // Ponytail: classic txs → Horizon submitTransaction, not Soroban sendTransaction
  const signedTx = TransactionBuilder.fromXDR(signedXdr, getNetworkConfig().networkPassphrase);
  console.log(`[swap] submitting: ${sendAmount} ${assetIn.getCode ? assetIn.getCode() : 'XLM'} → ${assetOut.getCode ? assetOut.getCode() : 'XLM'}, needsTrustline=${needsTrustline}, path=${JSON.stringify(swapPath)}`);
  try {
    return await horizonServer.submitTransaction(signedTx);
  } catch (horizonErr) {
    // Extract Horizon result_codes for a meaningful error message
    const extras = horizonErr?.response?.data?.extras;
    const opCodes = extras?.result_codes?.operations?.join(', ');
    const txCode = extras?.result_codes?.transaction;
    const detail = opCodes ? `op: ${opCodes}` : txCode ? `tx: ${txCode}` : horizonErr.message;
    throw new Error(`Swap rejected by Stellar — ${detail}`);
  }
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
