/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';

const RateLimitContext = createContext();

// Tiers: 0 = Alpha (3/hr), 1 = Vector (10/hr), 2 = Gold/Nexus (20/hr)
const LIMITS = {
  0: 3,
  1: 10,
  2: 20
};

const ONE_HOUR_MS = 60 * 60 * 1000;

export function RateLimitProvider({ children }) {
  const { walletAddress, stellarPublicKey, userTier } = useAuth();

  const consumeRequest = useCallback(() => {
    const activeAddress = walletAddress || stellarPublicKey;
    if (!activeAddress) return false;

    // --- TEST BYPASS ---
    if (localStorage.getItem('spectra_test_bypass') === 'true') {
      return { allowed: true, limit: '∞' };
    }

    const limit = LIMITS[userTier] || LIMITS[0];
    const storageKey = `spectra_ratelimit_${activeAddress}`;
    
    let timestamps = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        timestamps = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to parse rate limits:", e);
    }

    const now = Date.now();
    // Filter timestamps to only keep ones within the last hour
    timestamps = timestamps.filter(t => now - t < ONE_HOUR_MS);

    if (timestamps.length >= limit) {
      // Limit reached, cannot consume
      // Write back filtered array anyway to keep storage clean
      localStorage.setItem(storageKey, JSON.stringify(timestamps));
      return { allowed: false, remainingTime: ONE_HOUR_MS - (now - timestamps[0]), limit };
    }

    // Allowed! Push new timestamp and save
    timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
    return { allowed: true, limit };

  }, [walletAddress, stellarPublicKey, userTier]);

  return (
    <RateLimitContext.Provider value={{ consumeRequest }}>
      {children}
    </RateLimitContext.Provider>
  );
}

export const useRateLimit = () => useContext(RateLimitContext);
