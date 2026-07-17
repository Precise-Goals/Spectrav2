// Ponytail: Single dynamic button logic mapped directly to WalletContext. No bloated UI kit.
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { 
    stellarPublicKey: stellarAddress, 
    connectWallet, 
    disconnect, 
    profile, 
    isNewUser, 
    isLoadingProfile 
  } = useAuth();

  const handleConnect = async () => {
    if (!window.freighterApi) {
      window.open('https://www.freighter.app/', '_blank');
      return;
    }
    await connectWallet('stellar');
  };

  const renderActionButton = () => {
    // 1. Freighter not installed
    if (!window.freighterApi) {
      return (
        <button 
          onClick={handleConnect}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Install Freighter
        </button>
      );
    }

    // 2. Loading State (Verifying Profile)
    if (isLoadingProfile) {
      return (
        <button disabled className="bg-gray-600 text-gray-300 font-semibold py-2 px-4 rounded flex items-center gap-2 cursor-not-allowed">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing...
        </button>
      );
    }

    // 3. Not Connected
    if (!stellarAddress) {
      return (
        <button 
          onClick={handleConnect}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Connect Wallet
        </button>
      );
    }

    // 4. Connected but New User (Caught Error #2) - Onboarding State
    if (isNewUser && !profile) {
      return (
        <div className="flex items-center gap-3">
          <span className="text-orange-400 font-medium text-sm">Action Required:</span>
          <button 
            onClick={() => window.location.href = '/mint'} 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-lg transition-transform transform hover:scale-105"
          >
            Mint Subscription NFT
          </button>
          <button onClick={disconnect} className="text-gray-400 hover:text-white text-sm underline">
            Disconnect
          </button>
        </div>
      );
    }

    // 5. Fully Connected and Verified
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-gray-200 font-medium text-sm">
            {profile?.name || 'Spectra User'}
          </span>
          <span className="text-xs text-indigo-300">
            {stellarAddress.substring(0, 5)}...{stellarAddress.substring(stellarAddress.length - 4)}
          </span>
        </div>
        
        {profile?.tier && (
          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
            profile.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
            profile.tier === 'Silver' ? 'bg-gray-400/20 text-gray-300 border border-gray-400/30' :
            profile.tier === 'Bronze' ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' :
            'bg-indigo-500/20 text-indigo-300'
          }`}>
            {profile.tier}
          </span>
        )}

        <button 
          onClick={disconnect}
          className="ml-2 p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
          title="Sign Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 py-3 px-6 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="text-white font-bold text-lg">S</span>
        </div>
        <span className="text-white font-bold text-xl tracking-tight hidden sm:block">Spectra Orchestrator</span>
      </div>
      
      <div className="flex items-center">
        {renderActionButton()}
      </div>
    </nav>
  );
}
