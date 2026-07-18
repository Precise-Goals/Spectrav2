import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';
import { resolveSacAddress } from '../../config/contracts.js';
import { swapTokens } from '../../lib/stellar/contracts/exchange';
import { bridgeToEvm } from '../../lib/stellar/contracts/bridge';
import CrossChainSelector from './CrossChainSelector';
import { Horizon } from '@stellar/stellar-sdk';

export const ASSET_OPTIONS = [
  { id: 'XLM', label: 'Stellar Lumens', tokenAddress: 'native', symbol: 'XLM', decimals: 7 },
  { id: 'USDC', label: 'USDC (Testnet)', tokenAddress: resolveSacAddress('USDC'), symbol: 'USDC', decimals: 7 },
  { id: 'EURC', label: 'Euro Coin', tokenAddress: resolveSacAddress('EURC'), symbol: 'EURC', decimals: 7 },
];

const ZERO = '0.00';

export default function SwapBox({
  payAmount,
  onPayAmountChange,
  receiveAmount,
  selectedAsset,
  onAssetChange,
  payAsset = 'XLM',
  onPayAssetChange,
  onTxHashChange,
}) {
  const { connectWallet, stellarPublicKey } = useAuth();
  const { showError } = useError();
  const account = stellarPublicKey;
  const [paymentTokenBalance, setPaymentTokenBalance] = useState(ZERO);
  const [rawPaymentTokenBalance, setRawPaymentTokenBalance] = useState('0');
  const [selectedAssetBalance, setSelectedAssetBalance] = useState(ZERO);
  const [isExecutingState, setIsExecutingState] = useState(false);

  // CrossChainSelector modal state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState('pay');
  
  // Bridge mode state
  const [mode, setMode] = useState('SWAP'); // 'SWAP' or 'BRIDGE'
  const [bridgeDestination, setBridgeDestination] = useState('');

  const [localPayAsset, setLocalPayAsset] = useState('XLM');
  const activePayAsset = payAsset || localPayAsset;
  const handlePayAssetChange = onPayAssetChange || setLocalPayAsset;

  const activePayAssetMeta = useMemo(() => ASSET_OPTIONS.find((option) => option.id === activePayAsset) || ASSET_OPTIONS[0], [activePayAsset]);
  const activeAsset = selectedAsset || ASSET_OPTIONS[1].id;
  const activeAssetMeta = useMemo(() => ASSET_OPTIONS.find((option) => option.id === activeAsset) || ASSET_OPTIONS[1], [activeAsset]);

  const fetchBalances = async (stellarAddr) => {
    try {
      if (!stellarAddr) return;
      
      const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
      const server = new Horizon.Server(horizonUrl);
      
      let payFormatted = "0.00";
      let rawBalanceStr = "0";
      try {
        const acc = await server.loadAccount(stellarAddr);
        const activeAssetCode = activePayAssetMeta.id;
        
        let balanceObj;
        if (activeAssetCode === "XLM") {
          balanceObj = acc.balances.find(b => b.asset_type === 'native');
        } else if (activeAssetCode === "USDC") {
          balanceObj = acc.balances.find(b => 
            b.asset_code === "USDC" && 
            b.asset_issuer === "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
          );
        } else {
          balanceObj = acc.balances.find(b => b.asset_code === activeAssetCode);
        }
        
        if (balanceObj) {
           const balNum = Number(balanceObj.balance);
           payFormatted = balNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6});
           
           if (activeAssetCode === "XLM") {
              const safeMax = Math.max(0, balNum - 3);
              rawBalanceStr = safeMax.toFixed(7);
           } else {
              rawBalanceStr = balanceObj.balance;
           }
        }
      } catch (e) {
         console.warn("Horizon fetch error:", e);
      }
      
      setPaymentTokenBalance(payFormatted);
      setSelectedAssetBalance("0.00");
      setRawPaymentTokenBalance(rawBalanceStr);
    } catch (err) {
      console.warn('[SwapBox] fetchBalances encountered an error:', err);
      setPaymentTokenBalance(ZERO);
      setSelectedAssetBalance(ZERO);
      setRawPaymentTokenBalance('0');
    }
  };

  const handleMaxClick = () => {
    onPayAmountChange(rawPaymentTokenBalance);
  };

  const handleConnect = async () => {
    try {
      const stellarAddr = await connectWallet('stellar');
      if (stellarAddr) {
        await fetchBalances(stellarAddr);
      }
    } catch (connectError) {
      showError(connectError?.message || 'Wallet connection failed.', 'Connection Failed');
    }
  };

  useEffect(() => {
    if (account) {
      fetchBalances(account).catch(() => {});
    } else {
      setPaymentTokenBalance(ZERO);
      setSelectedAssetBalance(ZERO);
      setRawPaymentTokenBalance('0');
    }
  }, [account, activePayAsset, activeAsset]);

  const handleExecuteSwap = async () => {
    if (isExecutingState) return;

    setIsExecutingState(true);
    onTxHashChange?.('');

    try {
      const safeAmount = Number(payAmount);
      if (!Number.isFinite(safeAmount) || safeAmount <= 0) {
        throw new Error('Enter a valid pay amount before executing swap.');
      }

      if (activePayAsset === activeAsset && mode === 'SWAP') {
        throw new Error('Pay and Receive assets must be different.');
      }
      
      if (mode === 'BRIDGE') {
        if (!bridgeDestination || !bridgeDestination.startsWith('0x') || bridgeDestination.length !== 42) {
          throw new Error('Enter a valid 0x EVM destination address.');
        }
      }

      let currentAccount = account;
      if (!currentAccount) {
        currentAccount = await connectWallet('stellar');
      }
      
      if (!currentAccount) {
        throw new Error("No Freighter wallet connected.");
      }

      // Pass symbols directly — getClassicAsset resolves XLM/USDC/EURC without SAC confusion
      const tokenInSAC = activePayAssetMeta.id;  // e.g. 'XLM', 'USDC'
      const tokenOutSAC = activeAssetMeta.id;    // e.g. 'USDC', 'EURC'
      
      const decimalsIn = activePayAssetMeta.decimals;
      const amountInParsed = Math.floor(safeAmount * Math.pow(10, decimalsIn)).toString();

      let result;
      if (mode === 'BRIDGE') {
        result = await bridgeToEvm(
          currentAccount,
          tokenInSAC,
          amountInParsed,
          'sepolia',
          bridgeDestination
        );
      } else {
        result = await swapTokens(
          currentAccount,
          tokenInSAC,
          tokenOutSAC,
          amountInParsed,
          '0'
        );
      }
      
      if (result && result.hash) {
        onTxHashChange?.(result.hash);
        fetchBalances(currentAccount).catch(() => {});
        setTimeout(() => fetchBalances(currentAccount).catch(() => {}), 3000);
      }

    } catch (swapError) {
      showError(swapError.message || 'Pipeline Execution Failed', 'Pipeline Failure');
    } finally {
      setIsExecutingState(false);
    }
  };

  const handleSelectorSelect = ({ token }) => {
    if (selectorTarget === 'pay') {
      handlePayAssetChange(token.id);
    } else {
      onAssetChange(token.id);
    }
  };

  const getButtonLabel = () => {
    if (isExecutingState) return 'PREPARING...';
    if (mode === 'BRIDGE') return 'Execute Gasless Bridge (Axelar GMP)';
    return 'Execute Gasless Swap (Soroban)';
  };

  return (
    <div className="spectra-exchange-wrap">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '4px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          type="button"
          onClick={() => setMode('SWAP')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            background: mode === 'SWAP' ? 'rgba(176, 38, 255, 0.2)' : 'transparent',
            color: mode === 'SWAP' ? '#fff' : '#888',
            border: mode === 'SWAP' ? '1px solid rgba(176, 38, 255, 0.5)' : '1px solid transparent',
            cursor: 'pointer',
            fontFamily: 'Geist Mono',
            transition: 'all 0.2s',
          }}
        >
          Swap
        </button>
        <button
          type="button"
          onClick={() => setMode('BRIDGE')}
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '6px',
            background: mode === 'BRIDGE' ? 'rgba(176, 38, 255, 0.2)' : 'transparent',
            color: mode === 'BRIDGE' ? '#fff' : '#888',
            border: mode === 'BRIDGE' ? '1px solid rgba(176, 38, 255, 0.5)' : '1px solid transparent',
            cursor: 'pointer',
            fontFamily: 'Geist Mono',
            transition: 'all 0.2s',
          }}
        >
          Cross-Chain Bridge
        </button>
      </div>
      <div className="spectra-swap-box">
        <label className="spectra-swap-label">You Pay</label>
        <div className="spectra-swap-row">
          <input
            className="spectra-swap-input"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={payAmount}
            onChange={(event) => onPayAmountChange(event.target.value)}
          />
          <button
            type="button"
            onClick={handleMaxClick}
            style={{
              background: 'rgba(176, 38, 255, 0.12)',
              border: '1px solid rgba(176, 38, 255, 0.3)',
              borderRadius: '4px',
              color: '#ffffff',
              padding: '6px 12px',
              fontSize: '11px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              marginRight: '8px',
              fontFamily: 'Geist, monospace',
              letterSpacing: '0.08em',
              transition: 'all 0.2s ease',
            }}
          >
            MAX
          </button>
          <button
            type="button"
            className="spectra-select"
            onClick={() => { setSelectorTarget('pay'); setSelectorOpen(true); }}
            style={{ cursor: 'pointer', textAlign: 'left' }}
          >
            {activePayAsset}
          </button>
        </div>
        <div className="spectra-balance-stack">
          <span className="spectra-balance-text">{activePayAssetMeta.label} Balance: {paymentTokenBalance}</span>
          {activePayAsset !== activeAsset && (
            <span className="spectra-balance-text">{activeAssetMeta.label} Balance: {selectedAssetBalance}</span>
          )}
        </div>
        {!account && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="spectra-connect-btn" type="button" onClick={handleConnect} style={{ background: '#000', border: '1px solid #333' }}>
              Connect Freighter
            </button>
          </div>
        )}
      </div>

      <div className="spectra-swap-box">
        <label className="spectra-swap-label">{mode === 'BRIDGE' ? 'Destination (Base Sepolia)' : 'You Receive'}</label>
        
        {mode === 'BRIDGE' ? (
          <>
            <div className="spectra-swap-row">
              <input
                className="spectra-swap-input"
                type="text"
                placeholder="0x... EVM Address"
                value={bridgeDestination}
                onChange={(e) => setBridgeDestination(e.target.value)}
                style={{ fontSize: '13px', width: '100%' }}
              />
            </div>
            <div className="spectra-balance-row">
              <span className="spectra-balance-text">Enter the EVM destination address on Base Sepolia.</span>
            </div>
          </>
        ) : (
          <>
            <div className="spectra-swap-row">
              <input className="spectra-swap-input" type="text" placeholder="0.0" value={receiveAmount} readOnly />
              <button
                type="button"
                className="spectra-select"
                onClick={() => { setSelectorTarget('receive'); setSelectorOpen(true); }}
                style={{ cursor: 'pointer', textAlign: 'left' }}
              >
                {activeAsset}
              </button>
            </div>
            <div className="spectra-balance-row">
              <span className="spectra-balance-text">Live quote is pulled from the exchange contract for {activeAssetMeta.label}.</span>
            </div>
          </>
        )}
      </div>

      {isExecutingState && mode === 'BRIDGE' && (
        <div className="spectra-approval-loader">
          <div className="spectra-geometric-spinner" />
          <span className="spectra-approval-text">
            Axelar GMP: Intercepting cross-chain payload...
          </span>
        </div>
      )}

      <CrossChainSelector
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectorSelect}
        title={selectorTarget === 'pay' ? 'Select Pay Asset' : 'Select Receive Asset'}
      />

      <button className="spectra-execute-btn" type="button" onClick={handleExecuteSwap} disabled={isExecutingState}>
        {getButtonLabel()}
      </button>
    </div>
  );
}
