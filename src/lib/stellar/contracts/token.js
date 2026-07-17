import { Horizon, Networks } from '@stellar/stellar-sdk';

const getHorizonConfig = () => {
  const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
  return { horizonUrl };
};

export async function getTokenBalance(tokenAddress, userPublicKey) {
  try {
    const { horizonUrl } = getHorizonConfig();
    const server = new Horizon.Server(horizonUrl);
    
    // For native XLM, the 'tokenAddress' might be a SAC address or just 'XLM'
    // If it's the actual string 'XLM', or if the asset matches XLM, we look for 'native'
    
    const account = await server.loadAccount(userPublicKey);
    
    // If the tokenAddress is exactly "XLM", find native
    if (tokenAddress === "XLM" || tokenAddress === import.meta.env.VITE_STELLAR_SAC_XLM) {
      const nativeBalance = account.balances.find(b => b.asset_type === 'native');
      if (nativeBalance) {
        // Horizon returns balances as strings like "100.0000000"
        return nativeBalance.balance;
      }
      return "0";
    }

    // For other Classic Assets, we match the asset_code and asset_issuer
    const balance = account.balances.find(b => {
      if (tokenAddress === "USDC" || tokenAddress === import.meta.env.VITE_STELLAR_SAC_USDC) {
        return b.asset_code === "USDC" && b.asset_issuer === "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
      }
      return b.asset_code === tokenAddress;
    });
    
    if (balance) {
      return balance.balance;
    }
    
    return "0";
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // Account doesn't exist on ledger yet
      return "0";
    }
    console.warn(`[Token] Failed to get balance for ${tokenAddress}:`, err);
    return "0";
  }
}

export async function getTokenDecimals(tokenAddress) {
  // Stellar Classic Assets always have 7 decimals.
  return 7;
}
