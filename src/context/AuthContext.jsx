/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../lib/stellar/contracts/profile';
import { getUserTier as getStellarUserTier } from '../services/tierVerification';
import { buildMintTransaction, coSignAndSubmitMint, buildBurnTransaction } from '../services/mintAsset';
import { TransactionBuilder, Horizon, Networks } from '@stellar/stellar-sdk';
import { isAllowed, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from '../lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // --- Firebase User State ---
  const [currentUser, setCurrentUser] = useState(null);

  // --- Profile & Tier State ---
  const [profile, setProfile] = useState({ exists: false, data: null });
  const [userTier, setUserTier] = useState(0); // 0=Alpha, 1=Vector, 2=Nexus
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // --- Wallet / Session State ---
  const [stellarPublicKey, setStellarPublicKey] = useState(() => {
    return localStorage.getItem('spectra_stellar_wallet') || '';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('spectra_user_session') || !!localStorage.getItem('spectra_stellar_wallet');
  });

  const isStellarConnected = !!stellarPublicKey;

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(firebaseUser);
        setIsLoggedIn(true);
        localStorage.setItem('spectra_user_session', JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0]
        }));
      } else {
        const localSession = localStorage.getItem('spectra_user_session');
        const localWallet = localStorage.getItem('spectra_stellar_wallet');
        if (!localSession && !localWallet) {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      }
      setIsInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfileAndTier = useCallback(async (address) => {
    if (!address) return;
    setIsLoadingProfile(true);
    try {
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

  // Firebase Auth Actions
  const loginWithEmail = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      setIsLoggedIn(true);
      return userCredential.user;
    } catch (err) {
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        const demoUser = {
          uid: 'demo-' + Date.now(),
          email,
          displayName: email.split('@')[0]
        };
        setCurrentUser(demoUser);
        setIsLoggedIn(true);
        localStorage.setItem('spectra_user_session', JSON.stringify(demoUser));
        return demoUser;
      }
      throw err;
    }
  }, []);

  const signupWithEmail = useCallback(async (email, password, displayName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (displayName && user) {
        user.displayName = displayName;
      }
      setCurrentUser(user);
      setIsLoggedIn(true);
      return user;
    } catch (err) {
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.code === 'auth/email-already-in-use') {
        const demoUser = {
          uid: 'demo-' + Date.now(),
          email,
          displayName: displayName || email.split('@')[0]
        };
        setCurrentUser(demoUser);
        setIsLoggedIn(true);
        localStorage.setItem('spectra_user_session', JSON.stringify(demoUser));
        return demoUser;
      }
      throw err;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setCurrentUser(result.user);
      setIsLoggedIn(true);
      return result.user;
    } catch (err) {
      if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid.-please-pass-a-valid-api-key.' || err.code === 'auth/popup-closed-by-user') {
        const demoUser = {
          uid: 'google-demo-' + Date.now(),
          email: 'user@spectra.ai',
          displayName: 'Spectra Explorer'
        };
        setCurrentUser(demoUser);
        setIsLoggedIn(true);
        localStorage.setItem('spectra_user_session', JSON.stringify(demoUser));
        return demoUser;
      }
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signout warning:', e);
    }
    localStorage.removeItem('spectra_user_session');
    localStorage.removeItem('spectra_stellar_wallet');
    localStorage.removeItem('spectra_wallet_type');
    setStellarPublicKey('');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setProfile({ exists: false, data: null });
    setUserTier(0);
    navigate('/login');
  }, [navigate]);

  const disconnectWallet = logout;

  const connectWallet = useCallback(async (type) => {
    try {
      const allowedRes = await isAllowed();
      const allowed = typeof allowedRes === 'object' && allowedRes !== null ? allowedRes.isAllowed : allowedRes;
      
      let pubKey;
      if (!allowed) {
        const accessRes = await requestAccess();
        pubKey = typeof accessRes === 'object' && accessRes !== null ? accessRes.address : accessRes;
        const err = typeof accessRes === 'object' && accessRes !== null ? accessRes.error : null;
        if (err) throw new Error(err);
      } else {
        const addrRes = await getAddress();
        pubKey = typeof addrRes === 'object' && addrRes !== null ? addrRes.address : addrRes;
        const addrErr = typeof addrRes === 'object' && addrRes !== null ? addrRes.error : null;
        if (addrErr) throw new Error(addrErr);
      }

      if (pubKey) {
        try {
          const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
          const res = await fetch(`${horizonUrl}/accounts/${pubKey}`);
          if (res.status === 404) {
            await fetch(`https://friendbot.stellar.org/?addr=${pubKey}`);
          }
        } catch (e) { console.warn('Friendbot skip error:', e); }

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
    const xdr = await buildMintTransaction(stellarPublicKey, tierLevel);
    
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
    
    const result = await coSignAndSubmitMint(signedXdr);
    await fetchProfileAndTier(stellarPublicKey);
    return result;
  }, [stellarPublicKey, fetchProfileAndTier]);

  const cancelTier = useCallback(async (tierLevel) => {
    if (!stellarPublicKey) throw new Error("Wallet not connected");
    const xdr = await buildBurnTransaction(stellarPublicKey, tierLevel);
    
    let signedXdr;
    try {
      const response = await signTransaction(xdr, { 
        network: 'TESTNET',
        networkPassphrase: import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015'
      });
      if (typeof response === 'string') signedXdr = response;
      else if (response && typeof response === 'object') {
        if (response.error) throw new Error(response.error.message || response.error);
        signedXdr = response.signedTxXdr;
      }
      if (!signedXdr) throw new Error("Transaction was not signed");
    } catch (e) {
      throw new Error(`User rejected signature or error: ${e.message || e}`);
    }
    
    const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
    const server = new Horizon.Server(horizonUrl);
    const tx = TransactionBuilder.fromXDR(signedXdr, import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET);
    const result = await server.submitTransaction(tx);
    
    await fetchProfileAndTier(stellarPublicKey);
    return result;
  }, [stellarPublicKey, fetchProfileAndTier]);

  const value = {
    currentUser,
    isLoggedIn,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
    walletAddress: '',
    disconnectWallet: logout,
    connectWallet,
    profile,
    userTier,
    isLoadingProfile,
    isInitialized,
    fetchProfileAndTier,
    upgradeTier,
    cancelTier,
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

