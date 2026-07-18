import { TransactionBuilder, Asset, Operation, Networks, Keypair, Horizon } from '@stellar/stellar-sdk';

const getHorizonConfig = () => {
  const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
  const passphrase = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
  return { horizonUrl, passphrase };
};

// Tier prices in XLM — must match MintConsole.jsx TIERS config
const TIER_PRICE_XLM = { 1: '150.0000000', 2: '300.0000000' };

export async function buildMintTransaction(userPublicKey, tier) {
  const { horizonUrl, passphrase } = getHorizonConfig();
  const server = new Horizon.Server(horizonUrl);

  const issuerKey = import.meta.env.VITE_SAAS_ISSUER_PUBLIC_KEY;
  if (!issuerKey) throw new Error("VITE_SAAS_ISSUER_PUBLIC_KEY not found in environment.");

  const treasuryKey = import.meta.env.VITE_SAAS_TREASURY_PUBLIC_KEY;
  if (!treasuryKey) throw new Error("VITE_SAAS_TREASURY_PUBLIC_KEY not found in environment.");

  const xlmPrice = TIER_PRICE_XLM[tier];
  if (!xlmPrice) throw new Error(`Unknown tier: ${tier}`);

  // tier 2 -> AIENT (Nexus), tier 1 -> AIPRO (Vector)
  const assetCode = tier === 2 ? 'AIENT' : 'AIPRO';
  const saasAsset = new Asset(assetCode, issuerKey);

  let userAccount;
  try {
    userAccount = await server.loadAccount(userPublicKey);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(`User account ${userPublicKey} is not funded on Testnet yet.`);
    }
    throw error;
  }

  const tx = new TransactionBuilder(userAccount, {
    fee: "1000",
    networkPassphrase: passphrase
  })
    // 1. User pays XLM to treasury — badge only issues if this succeeds (atomic)
    .addOperation(Operation.payment({
      source: userPublicKey,
      destination: treasuryKey,
      asset: Asset.native(),
      amount: xlmPrice
    }))
    // 2. User opens trustline to accept the subscription badge asset
    .addOperation(Operation.changeTrust({
      asset: saasAsset,
      limit: "1.0000000"
    }))
    // 3. Issuer mints 1 badge to the user
    .addOperation(Operation.payment({
      source: issuerKey,
      destination: userPublicKey,
      asset: saasAsset,
      amount: "1.0000000"
    }))
    .setTimeout(180)
    .build();

  return tx.toXDR();
}

export async function coSignAndSubmitMint(signedUserXdr) {
  const { horizonUrl, passphrase } = getHorizonConfig();
  const server = new Horizon.Server(horizonUrl);
  
  const secretKey = import.meta.env.VITE_SAAS_ISSUER_SECRET_KEY;
  if (!secretKey) throw new Error("VITE_SAAS_ISSUER_SECRET_KEY not found in environment.");
  
  const issuerKeypair = Keypair.fromSecret(secretKey);
  
  // Reconstruct the transaction from the user's signed XDR
  const tx = TransactionBuilder.fromXDR(signedUserXdr, passphrase);
  
  // Add the backend (issuer) signature
  tx.sign(issuerKeypair);
  
  // Submit the multi-sig transaction to Horizon
  const response = await server.submitTransaction(tx);
  return response;
}

export async function buildBurnTransaction(userPublicKey, tier) {
  const { horizonUrl, passphrase } = getHorizonConfig();
  const server = new Horizon.Server(horizonUrl);
  
  const issuerKey = import.meta.env.VITE_SAAS_ISSUER_PUBLIC_KEY;
  if (!issuerKey) throw new Error("VITE_SAAS_ISSUER_PUBLIC_KEY not found in environment.");
  
  const assetCode = tier === 2 ? 'AIENT' : 'AIPRO';
  const saasAsset = new Asset(assetCode, issuerKey);
  
  let userAccount;
  try {
    userAccount = await server.loadAccount(userPublicKey);
  } catch (error) {
    throw new Error(`User account ${userPublicKey} not found on network.`);
  }
  
  const tx = new TransactionBuilder(userAccount, {
    fee: "1000",
    networkPassphrase: passphrase
  })
    .addOperation(Operation.payment({
      source: userPublicKey,
      destination: issuerKey,
      asset: saasAsset,
      amount: "1.0000000"
    }))
    .setTimeout(180)
    .build();
    
  return tx.toXDR();
}
