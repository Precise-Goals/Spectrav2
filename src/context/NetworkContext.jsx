import React, { createContext, useContext, useState, useEffect } from 'react';
import { Networks } from '@stellar/stellar-sdk';

const NetworkContext = createContext(null);

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [network, setNetwork] = useState(() => {
    // Default to mainnet, fallback to local storage
    return localStorage.getItem('spectra_preferred_network') || 'mainnet';
  });

  useEffect(() => {
    localStorage.setItem('spectra_preferred_network', network);
  }, [network]);

  const toggleNetwork = () => {
    setNetwork((prev) => (prev === 'mainnet' ? 'testnet' : 'mainnet'));
  };

  const isMainnet = network === 'mainnet';

  const rpcUrl = isMainnet 
    ? 'https://mainnet.sorobanrpc.com'
    : import.meta.env.VITE_STELLAR_RPC_URL || 'https://stellar-soroban-testnet-public.nodies.app';

  const horizonUrl = isMainnet
    ? 'https://horizon.stellar.org'
    : import.meta.env.VITE_STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';

  const networkPassphrase = isMainnet 
    ? Networks.PUBLIC 
    : Networks.TESTNET;

  const getContractId = (contractName) => {
    // Use testnet contract variables as fallback if mainnet ones don't exist yet
    if (isMainnet) {
      return import.meta.env[`VITE_${contractName}_CONTRACT_ID_MAINNET`] || import.meta.env[`VITE_${contractName}_CONTRACT_ID`];
    }
    return import.meta.env[`VITE_${contractName}_CONTRACT_ID`];
  };

  const value = {
    network, // 'mainnet' | 'testnet'
    isMainnet,
    toggleNetwork,
    setNetwork,
    rpcUrl,
    horizonUrl,
    networkPassphrase,
    getContractId
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
};
