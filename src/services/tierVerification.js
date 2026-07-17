export async function getUserTier(userPublicKey) {
  if (!userPublicKey) return 0;
  
  try {
    const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
    const issuerKey = import.meta.env.VITE_SAAS_ISSUER_PUBLIC_KEY;
    
    if (!issuerKey) {
      console.warn("VITE_SAAS_ISSUER_PUBLIC_KEY is not set in environment.");
      return 0; // Fallback to Free
    }

    const response = await fetch(`${horizonUrl}/accounts/${userPublicKey}`);
    
    if (response.status === 404) {
      return 0; // Account doesn't exist yet -> Free Tier
    }
    
    if (!response.ok) {
      console.error("Error fetching account from Horizon:", await response.text());
      return 0; // Free Tier on error
    }

    const account = await response.json();
    let tier = 0; // Free Tier
    
    for (const balance of account.balances) {
      if (balance.asset_issuer === issuerKey) {
        if (balance.asset_code === 'AIENT') {
          tier = 2; // Enterprise
          break; // Highest tier, no need to keep searching
        }
        if (balance.asset_code === 'AIPRO' && tier === 0) {
          tier = 1; // Pro
        }
      }
    }
    
    return tier;
  } catch (error) {
    console.error("Error in tierVerification:", error);
    return 0;
  }
}
