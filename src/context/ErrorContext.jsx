/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';

// Ponytail: Skipped react-toastify and react-hot-toast; a single context + native <dialog>
// in ErrorDialog.jsx covers the full error surface without any new dependency.

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null); // { title, message }

  const showError = useCallback((message, title = 'Error') => {
    // Normalize common Web3 / RPC error codes to human-readable strings
    const normalized = normalizeError(message);
    console.error(`[ErrorContext Alert] ${title}:`, normalized);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ErrorContext.Provider value={{ showError, clearError, error }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used inside <ErrorProvider>');
  return ctx;
};

/* ─── Error Normalizer ───────────────────────────────────────────────────── */

function normalizeError(raw) {
  if (!raw) return 'An unexpected error occurred.';
  const msg = typeof raw === 'string' ? raw : (raw?.message || String(raw));

  // RPC / EVM codes
  if (msg.includes('-32603') || msg.includes('Internal JSON-RPC error'))
    return 'Internal RPC error. The network or contract rejected this transaction. Check your inputs and try again.';
  if (msg.includes('CALL_EXCEPTION'))
    return 'Contract call failed. The smart contract reverted — likely due to insufficient allowance, wrong chain, or liquidity issues.';
  if (msg.includes('user rejected') || msg.includes('User rejected'))
    return 'You cancelled the wallet transaction. Try again when ready.';
  if (msg.includes('insufficient funds'))
    return 'Insufficient funds. You don\'t have enough native gas token to cover this transaction.';
  if (msg.includes('nonce too low') || msg.includes('nonce has already been used'))
    return 'Nonce conflict. Your wallet is out of sync. Refresh the page and retry.';
  if (msg.includes('network changed') || msg.includes('chain mismatch'))
    return 'Network mismatch. Switch your wallet to the correct chain and retry.';
  if (msg.includes('No accounts') || msg.includes('eth_requestAccounts'))
    return 'Wallet not connected. Please connect your wallet and try again.';
  if (msg.includes('500') || msg.includes('Internal Server Error'))
    return 'Relayer error. The UGF network rejected the transaction payload. Verify token addresses and liquidity.';
  if (msg.includes('WalletConnect') || msg.includes('connection drop'))
    return 'WalletConnect session dropped. Please reconnect your wallet.';
  if (msg.includes('CRITICAL ROUTING ERROR'))
    return 'Routing error. The system detected a cross-chain address contamination and safely aborted. Please reconnect your wallet.';

  return msg;
}
