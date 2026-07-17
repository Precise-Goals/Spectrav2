/**
 * WalletConnectProvider.jsx
 *
 * Ponytail: Skipped installing @web3modal/react + @walletconnect/modal (~2MB).
 * The current auth flow uses Freighter which covers all current use cases 
 * without a WalletConnect cloud projectId.
 *
 * This file serves as the CAIP-2 namespace configuration contract.
 * When you're ready to activate WalletConnect V2:
 *   1. Get a projectId from https://cloud.walletconnect.com
 *   2. Run: npm install @web3modal/react @web3modal/wagmi wagmi viem
 *   3. Replace the stub below with the real createWeb3Modal() call
 */

// ── CAIP-2 Chain Namespaces ────────────────────────────────────────────────
// CAIP-2 format: "<namespace>:<reference>"
// EVM chains use the "eip155" namespace + chainId
// Stellar uses the "stellar" namespace

export const WC_EVM_CHAINS = [
  // Ponytail: Testnet-only lockdown. No mainnet chains permitted during development phase.
  { id: 'eip155:11155111', name: 'Sepolia Testnet',  rpcUrl: 'https://rpc.sepolia.org' },
  { id: 'eip155:84532',   name: 'Base Sepolia',      rpcUrl: 'https://sepolia.base.org' },
  { id: 'eip155:43113',   name: 'Fuji Testnet',      rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc' },
  { id: 'eip155:97',      name: 'BSC Testnet',       rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545' },
  { id: 'eip155:80001',   name: 'Mumbai Testnet',    rpcUrl: 'https://rpc-mumbai.maticvigil.com' },
];

// Stellar CAIP namespace — "stellar" is the registered namespace
// Reference: https://github.com/ChainAgnostic/namespaces/blob/main/stellar/caip2.md
export const WC_STELLAR_NAMESPACES = {
  stellar: {
    methods: [
      'stellar_signTransaction',
      'stellar_signAndSubmitTransaction',
    ],
    events: [],
    chains: [
      'stellar:testnet',  // Stellar Testnet (Soroban) — locked to testnet
    ],
  },
};

// Full WalletConnect V2 namespace config (pass to signClient.connect())
export const WC_NAMESPACES = {
  eip155: {
    methods: [
      'eth_sendTransaction',
      'eth_signTransaction',
      'eth_sign',
      'personal_sign',
      'eth_signTypedData',
      'eth_signTypedData_v4',
    ],
    events: ['accountsChanged', 'chainChanged'],
    chains: WC_EVM_CHAINS.map(c => c.id),
  },
  ...WC_STELLAR_NAMESPACES,
};

// ── Stub Provider ─────────────────────────────────────────────────────────
// Replace this with real createWeb3Modal() once a projectId is available.

const WC_PROJECT_ID = import.meta.env.VITE_WC_PROJECT_ID || '';

/**
 * getWCConfig() — Returns the full WalletConnect session config object.
 * Ready to pass to `new SignClient({ ...getWCConfig() })`.
 */
export function getWCConfig() {
  if (!WC_PROJECT_ID) {
    console.warn('[WalletConnect] VITE_WC_PROJECT_ID is not set. WalletConnect QR modal will not work.');
  }
  return {
    projectId: WC_PROJECT_ID,
    metadata: {
      name: 'Spectra',
      description: 'Cross-chain AI Bank Manager',
      url: 'https://spectrav2.vercel.app',
      icons: ['https://spectrav2.vercel.app/favicon.ico'],
    },
    namespaces: WC_NAMESPACES,
  };
}

// ── React Context Stub ─────────────────────────────────────────────────────
// Thin passthrough — wires into existing AuthContext when activated.

export default function WalletConnectProvider({ children }) {
  // Ponytail: No-op wrapper. Real implementation mounts createWeb3Modal() here.
  // The existing AuthContext handles all wallet state via Freighter.
  return <>{children}</>;
}
