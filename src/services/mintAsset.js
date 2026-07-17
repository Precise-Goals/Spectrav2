import { TransactionBuilder, Asset, Operation, Networks, Keypair, Horizon } from '@stellar/stellar-sdk';

const getHorizonConfig = () => {
  const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
  const passphrase = import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
  return { horizonUrl, passphrase };
};

export async function buildMintTransaction(userPublicKey, tier) {
  const { horizonUrl, passphrase } = getHorizonConfig();
  const server = new Horizon.Server(horizonUrl);
  
  const issuerKey = import.meta.env.VITE_SAAS_ISSUER_PUBLIC_KEY;
  if (!issuerKey) throw new Error("VITE_SAAS_ISSUER_PUBLIC_KEY not found in environment.");
  
  // tier 2 -> AIENT, tier 1 -> AIPRO
  const assetCode = tier === 2 ? 'AIENT' : 'AIPRO';
  const saasAsset = new Asset(assetCode, issuerKey);
  
  // Load user account to get the sequence number
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
    // 1. User changes trust to accept the asset
    .addOperation(Operation.changeTrust({
      asset: saasAsset,
      limit: "1.0000000"
    }))
    // 2. Issuer pays the user 1.0 of the asset
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
