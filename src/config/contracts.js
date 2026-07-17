/**
 * Deployed Contract Addresses on Stellar Soroban Testnet.
 */
export const CONTRACT_ADDRESSES = {
  SPECTRA_PROFILE: import.meta.env.VITE_PROFILE_CONTRACT_ID || 'CAIVPYSHCJTMYFOCLLNJXY33377SWJLEIIYQY53UFSU6HJDTEVMATCIJ',
};

export const NETWORK_INFO = {
  name: 'Stellar Testnet',
  network: 'TESTNET',
  rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL || 'https://stellar-soroban-testnet-public.nodies.app',
};

export const SAC_MAP = {
  'XLM': import.meta.env.VITE_STELLAR_SAC_XLM || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  'USDC': import.meta.env.VITE_STELLAR_SAC_USDC || 'CCW67CDAYNMDVWZVKX6BPPX6FUI4NSI6QL6N6HWM6Z7S6TWXA7YAC4K5',
  'EURC': import.meta.env.VITE_STELLAR_SAC_EURC || 'CCUUDM434BMZMYWYDITHFXHDMIVTGGD6T2I5UKNX5BSLXLW7HVR4MCGZ'
};

export const TOKEN_DECIMALS = {
  USDC: 7,
  EURC: 7,
  XLM: 7,
};

export function resolveTokenDecimals(symbol) {
  return TOKEN_DECIMALS[String(symbol || '').toUpperCase()] ?? 7;
}

export function resolveSacAddress(assetId) {
  return SAC_MAP[String(assetId || '').toUpperCase()] || SAC_MAP['XLM'];
}

export function assertAddressFormat(address, expectedNetwork, label = 'token') {
  if (!address) throw new Error(`${label}: address is undefined`);
  if (expectedNetwork === 'stellar' && !address.startsWith('C') && !address.startsWith('G')) {
    throw new Error(`[Cross-chain mismatch] ${label} address "${address}" is not a valid Stellar address. Aborting.`);
  }
}

export function resolveTokenLabel(symbol) {
  const normalized = String(symbol || '').toUpperCase();
  return normalized || 'XLM';
}

export const CONTRACT_ABIS = {
  SPECTRA_PROFILE: [
    "function getProfile(address _user) external view returns (tuple(string name, string email, string phone, string bio, uint8 avatarId, bool exists))",
    "function createProfile(string _name, string _email, string _phone, string _bio, uint8 _avatarId) external",
    "function updateProfile(string _name, string _email, string _phone, string _bio, uint8 _avatarId) external"
  ]
};
