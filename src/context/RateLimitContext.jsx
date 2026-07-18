/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

const RateLimitContext = createContext();

// Tiers: 0 = Alpha (10/day), 1 = Vector (15/day), 2 = Nexus (30/day)
const LIMITS = {
  0: 10,
  1: 15,
  2: 30,
};

// Track per-day instead of per-hour (matches the tier descriptions in MintConsole)
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function RateLimitProvider({ children }) {
  const { walletAddress, stellarPublicKey, userTier } = useAuth();

  const getStorageKey = useCallback(() => {
    const addr = walletAddress || stellarPublicKey;
    return addr ? `spectra_ratelimit_${addr}` : null;
  }, [walletAddress, stellarPublicKey]);

  const getTimestamps = useCallback(() => {
    const key = getStorageKey();
    if (!key) return [];
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      const all = JSON.parse(stored);
      const now = Date.now();
      return all.filter(t => now - t < ONE_DAY_MS);
    } catch { return []; }
  }, [getStorageKey]);

  const getUsage = useCallback(() => {
    const timestamps = getTimestamps();
    const limit = LIMITS[userTier] ?? LIMITS[0];
    return { used: timestamps.length, limit };
  }, [getTimestamps, userTier]);

  const consumeRequest = useCallback(() => {
    const activeAddress = walletAddress || stellarPublicKey;
    if (!activeAddress) return false;

    // --- TEST BYPASS ---
    if (localStorage.getItem('spectra_test_bypass') === 'true') {
      return { allowed: true, limit: '∞' };
    }

    const limit = LIMITS[userTier] ?? LIMITS[0];
    const key = getStorageKey();

    let timestamps = getTimestamps();

    if (timestamps.length >= limit) {
      localStorage.setItem(key, JSON.stringify(timestamps));
      return { allowed: false, remainingTime: ONE_DAY_MS - (Date.now() - timestamps[0]), limit };
    }

    timestamps.push(Date.now());
    localStorage.setItem(key, JSON.stringify(timestamps));
    return { allowed: true, limit };

  }, [walletAddress, stellarPublicKey, userTier, getStorageKey, getTimestamps]);

  return (
    <RateLimitContext.Provider value={{ consumeRequest, getUsage }}>
      {children}
    </RateLimitContext.Provider>
  );
}

export const useRateLimit = () => useContext(RateLimitContext);

