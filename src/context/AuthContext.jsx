/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../lib/stellar/contracts/profile';
import { getUserTier as getStellarUserTier } from '../services/tierVerification';
import { buildMintTransaction, coSignAndSubmitMint } from '../services/mintAsset';
import { isAllowed, setAllowed, getAddress, signTransaction } from '@stellar/freighter-api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // --- Profile & Tier State ---
  const [profile, setProfile] = useState({ exists: false, data: null });
  const [userTier, setUserTier] = useState(0); // 0=Alpha, 1=Vector, 2=Nexus
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Stellar State ---
  const [stellarPublicKey, setStellarPublicKey] = useState(() => {
    return localStorage.getItem('spectra_stellar_wallet') || '';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('spectra_stellar_wallet');
  });
  const isStellarConnected = !!stellarPublicKey;

  const fetchProfileAndTier = useCallback(async (address) => {
    if (!address) return;
    setIsLoadingProfile(true);
    try {
      // Fetch from Soroban
      const fetchedProfile = await getProfile(address);
      const fetchedTier = await getStellarUserTier(address);
      setProfile({ exists: !!fetchedProfile, data: fetchedProfile });
      setUserTier(Number(fetchedTier) || 0);
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch profile/tier data:', err);
      setProfile({ exists: false, data: null });
      setUserTier(0);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('spectra_stellar_wallet');
    localStorage.removeItem('spectra_wallet_type');
    setStellarPublicKey('');
    setIsLoggedIn(false);
    setProfile({ exists: false, data: null });
    setUserTier(0);
    // Instant redirect to login when session ends
    navigate('/login');
  }, [navigate]);

  const connectWallet = useCallback(async (type) => {
    try {
      if (!(await isAllowed())) {
        await setAllowed();
      }
      
      const { address: pubKey, error: addrErr } = await getAddress();
      if (addrErr) throw new Error(addrErr);

      if (pubKey) {
        try {
          const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
          const res = await fetch(`${horizonUrl}/accounts/${pubKey}`);
          if (res.status === 404) {
            await fetch(`https://friendbot.stellar.org/?addr=${pubKey}`);
          }
        } catch (e) { console.warn('Friendbot skip error:', e); }

        // Strict profile fetch wait before unlocking session
        await fetchProfileAndTier(pubKey);

        localStorage.setItem('spectra_stellar_wallet', pubKey);
        localStorage.setItem('spectra_wallet_type', 'freighter');
        setStellarPublicKey(pubKey);
        setIsLoggedIn(true);
        return pubKey;
      }

      throw new Error('Wallet access denied.');
    } catch (err) {
      console.error('[AuthContext] connectWallet error:', err);
      throw err;
    }
  }, [fetchProfileAndTier]);

  const upgradeTier = useCallback(async (tierLevel) => {
    if (!stellarPublicKey) throw new Error("Wallet not connected");
    
    // 1. Build the transaction (tierLevel: 1 for Pro, 2 for Enterprise)
    const xdr = await buildMintTransaction(stellarPublicKey, tierLevel);
    
    // 2. Prompt user to sign
    let signedXdr;
    try {
      const response = await signTransaction(xdr, { 
        network: 'TESTNET',
        networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015'
      });
      if (typeof response === 'string') {
        signedXdr = response;
      } else if (response && typeof response === 'object') {
        if (response.error) throw new Error(response.error.message || response.error);
        signedXdr = response.signedTxXdr;
      }
      if (!signedXdr) throw new Error("Transaction was not signed");
    } catch (e) {
      throw new Error(`User rejected signature or error: ${e.message || e}`);
    }
    
    // 3. Co-sign and Submit (Mock Backend)
    const result = await coSignAndSubmitMint(signedXdr);
    
    // 4. Refresh tier immediately to unlock UI
    await fetchProfileAndTier(stellarPublicKey);
    return result;
  }, [stellarPublicKey, fetchProfileAndTier]);

  // Initial load check
  useEffect(() => {
    const checkWalletConnection = async () => {
      const savedStellarWallet = localStorage.getItem('spectra_stellar_wallet');
      if (savedStellarWallet) {
        setStellarPublicKey(savedStellarWallet);
        setIsLoggedIn(true);
        await fetchProfileAndTier(savedStellarWallet);
      } else {
        navigate('/login');
      }
      setIsInitialized(true);
    };

    checkWalletConnection();
  }, [fetchProfileAndTier, navigate]);

  const value = {
    isLoggedIn,
    // Provide an empty walletAddress property so UI that still reads it won't crash
    walletAddress: '',
    disconnectWallet,
    connectWallet,
    // Profile & SaaS
    profile,
    userTier,
    isLoadingProfile,
    isInitialized,
    fetchProfileAndTier,
    upgradeTier,
    // Stellar
    stellarPublicKey,
    isStellarConnected
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
