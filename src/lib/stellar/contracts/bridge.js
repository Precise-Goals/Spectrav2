import { Address, nativeToScVal } from '@stellar/stellar-sdk';
import { CONTRACTS, invokeContract } from '../client';
import { resolveSacAddress } from '../../../config/contracts';

/**
 * Initiate a gasless cross-chain bridge transfer from Soroban to EVM via Axelar GMP.
 * @param {string} publicKey - Stellar public key of the user initiating the bridge
 * @param {string} tokenSymbolOrAddress - Token symbol (e.g. 'USDC') or SAC address to bridge
 * @param {string} amountIn - Amount of tokens (formatted for decimals)
 * @param {string} destinationChain - Name of the destination chain (e.g. "base-sepolia")
 * @param {string} destinationAddress - The target 0x... EVM address
 */
export async function bridgeToEvm(publicKey, tokenSymbolOrAddress, amountIn, destinationChain, destinationAddress) {
  // If a symbol like 'XLM' is passed, resolve it to its Soroban Asset Contract (SAC) address.
  // If it's already a C... address, resolveSacAddress will safely return or handle it.
  const sacAddress = tokenSymbolOrAddress.startsWith('C') && tokenSymbolOrAddress.length === 56 
    ? tokenSymbolOrAddress 
    : resolveSacAddress(tokenSymbolOrAddress);

  const args = [
    new Address(publicKey).toScVal(),
    new Address(sacAddress).toScVal(),
    nativeToScVal(BigInt(amountIn), { type: 'i128' }),
    nativeToScVal(destinationChain, { type: 'string' }),
    nativeToScVal(destinationAddress, { type: 'string' }),
  ];
  
  return await invokeContract(CONTRACTS.BRIDGE, 'bridge_to_evm', args, publicKey);
}
