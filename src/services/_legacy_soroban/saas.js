import { Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { CONTRACTS, invokeContract, readContract } from '../client';

/**
 * Get user's subscription tier: 0=Alpha, 1=Vector, 2=Nexus
 */
export async function getUserTier(publicKey) {
  try {
    const userScVal = new Address(publicKey).toScVal();
    const result = await readContract(CONTRACTS.SAAS, 'get_user_tier', [userScVal], publicKey);
    if (result === null || result === undefined) return 0;
    // scValToNative converts enum (u32 discriminant) to a number
    const native = scValToNative(result);
    return typeof native === 'number' ? native : 0;
  } catch (err) {
    console.warn('[SaaS] getUserTier fallback to 0:', err.message);
    return 0;
  }
}

/**
 * Get remaining AI transactions for today
 */
export async function getRemainingTransactions(publicKey) {
  try {
    const userScVal = new Address(publicKey).toScVal();
    const result = await readContract(CONTRACTS.SAAS, 'get_remaining_transactions', [userScVal], publicKey);
    if (result === null || result === undefined) return 0;
    const native = scValToNative(result);
    return typeof native === 'number' ? native : 0;
  } catch (err) {
    console.warn('[SaaS] getRemainingTransactions fallback to 0:', err.message);
    return 0;
  }
}

/**
 * Subscribe to a tier (0=Alpha, 1=Vector, 2=Nexus)
 */
export async function subscribe(publicKey, tierNumber) {
  const userScVal = new Address(publicKey).toScVal();
  // Soroban enums passed as u32
  const tierScVal = nativeToScVal(tierNumber, { type: 'u32' });
  return await invokeContract(CONTRACTS.SAAS, 'subscribe', [userScVal, tierScVal], publicKey);
}

/**
 * Record usage of one AI transaction
 */
export async function recordTransaction(publicKey) {
  const userScVal = new Address(publicKey).toScVal();
  return await invokeContract(CONTRACTS.SAAS, 'record_transaction', [userScVal], publicKey);
}
