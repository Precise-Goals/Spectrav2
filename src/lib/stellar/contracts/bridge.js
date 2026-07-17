import { Address, nativeToScVal } from '@stellar/stellar-sdk';
import { CONTRACTS, invokeContract } from '../client';

/**
 * Initiate a gasless cross-chain bridge transfer from Soroban to EVM via Axelar GMP.
 * @param {string} publicKey - Stellar public key of the user initiating the bridge
 * @param {string} tokenAddress - Soroban Asset Contract (SAC) address to bridge
 * @param {string} amountIn - Amount of tokens (formatted for decimals)
 * @param {string} destinationChain - Name of the destination chain (e.g. "base-sepolia")
 * @param {string} destinationAddress - The target 0x... EVM address
 */
export async function bridgeToEvm(publicKey, tokenAddress, amountIn, destinationChain, destinationAddress) {
  const args = [
    new Address(publicKey).toScVal(),
    new Address(tokenAddress).toScVal(),
    nativeToScVal(BigInt(amountIn), { type: 'i128' }),
    nativeToScVal(destinationChain, { type: 'string' }),
    nativeToScVal(destinationAddress, { type: 'string' }),
  ];
  
  return await invokeContract(CONTRACTS.BRIDGE, 'bridge_to_evm', args, publicKey);
}
