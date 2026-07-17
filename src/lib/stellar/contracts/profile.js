import { Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';
import { CONTRACTS, invokeContract, readContract } from '../client';

/**
 * Create a new profile on-chain.
 * Contract fn: create_profile(user, name, email, phone, bio, avatar_id, cross_chain_address)
 */
export async function createProfile(publicKey, formData) {
  const args = [
    new Address(publicKey).toScVal(),
    nativeToScVal(formData.name             || '', { type: 'string' }),
    nativeToScVal(formData.email            || '', { type: 'string' }),
    nativeToScVal(formData.phone            || '', { type: 'string' }),
    nativeToScVal(formData.bio              || '', { type: 'string' }),
    nativeToScVal(formData.avatarId         || 1,  { type: 'u32'    }),
    nativeToScVal(formData.crossChainAddress|| '', { type: 'string' }),
  ];
  return await invokeContract(CONTRACTS.PROFILE, 'create_profile', args, publicKey);
}

/**
 * Update an existing profile on-chain.
 * Contract fn: update_profile(user, name, email, phone, bio, avatar_id, cross_chain_address)
 */
export async function updateProfile(publicKey, formData) {
  const args = [
    new Address(publicKey).toScVal(),
    nativeToScVal(formData.name             || '', { type: 'string' }),
    nativeToScVal(formData.email            || '', { type: 'string' }),
    nativeToScVal(formData.phone            || '', { type: 'string' }),
    nativeToScVal(formData.bio              || '', { type: 'string' }),
    nativeToScVal(formData.avatarId         || 1,  { type: 'u32'    }),
    nativeToScVal(formData.crossChainAddress|| '', { type: 'string' }),
  ];
  return await invokeContract(CONTRACTS.PROFILE, 'update_profile', args, publicKey);
}

/**
 * Read a profile from chain.
 * Returns { name, email, phone, bio, avatarId } or null.
 */
export async function getProfile(publicKey) {
  try {
    const userScVal = new Address(publicKey).toScVal();
    const result = await readContract(CONTRACTS.PROFILE, 'get_profile', [userScVal], publicKey);

    if (!result) return null;

    // scValToNative converts Soroban map → plain JS object automatically
    const native = scValToNative(result);
    if (!native) return null;

    return {
      name:             native.name              || '',
      email:            native.email             || '',
      phone:            native.phone             || '',
      bio:              native.bio               || '',
      avatarId:         native.avatar_id         || 1,
      crossChainAddress:native.cross_chain_address|| '',
    };
  } catch (err) {
    // Profile not found is a normal state (user not yet registered)
    console.warn('[Profile] getProfile:', err.message);
    return null;
  }
}

/**
 * Delete a profile on-chain.
 */
export async function deleteProfile(publicKey) {
  const args = [new Address(publicKey).toScVal()];
  return await invokeContract(CONTRACTS.PROFILE, 'delete_profile', args, publicKey);
}
