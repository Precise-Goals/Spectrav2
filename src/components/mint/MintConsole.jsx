import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserTier } from '../../services/tierVerification';
import { userTokenId as getStellarUserTokenId, burn as stellarBurn } from '../../lib/stellar/contracts/nft';
import { getTokenBalance, getTokenDecimals } from '../../lib/stellar/contracts/token';
import { resolveSacAddress } from '../../config/contracts';
import { Horizon } from '@stellar/stellar-sdk';

const TIERS = [
  {
    id: 'alpha',
    name: 'ALPHA',
    price: '100 XLM',
    deduction: '100.00',
    plan: 0,
    badge: '/1.png',
    spline: '/1.mp4',
    description: 'Read-only terminal access and public data feeds.',
    features: ['Read-only terminal access', 'Public data feeds', '10 Daily Agent Usages'],
  },
  {
    id: 'vector',
    name: 'VECTOR',
    price: '150 XLM',
    deduction: '150.00',
    plan: 1,
    badge: '/2.png',
    spline: '/2.mp4',
    description: 'Standard terminal access with private data channels.',
    features: ['Standard terminal access', 'Private data channels', '15 Daily Agent Usages'],
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    price: '300 XLM',
    deduction: '300.00',
    plan: 2,
    badge: '/3.png',
    spline: '/3.mp4',
    description: 'Root terminal access with unlimited data pipelines.',
    features: ['Root terminal access', 'Unlimited data pipelines', '30 Daily Agent Usages'],
  },
];

const ZERO = '0.00';

export default function MintConsole() {
  const [selectedTier, setSelectedTier] = useState('nexus');
  const [mockUsdBalance, setMockUsdBalance] = useState(ZERO);
  const [isMinting, setIsMinting] = useState(false);
  const [status, setStatus] = useState('IDLE');
  const [executionError, setExecutionError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [userTier, setUserTier] = useState(-1);
  const [ownedTokenId, setOwnedTokenId] = useState(0);
  
  const { connectWallet, stellarPublicKey, isStellarConnected, upgradeTier } = useAuth();
  const account = stellarPublicKey;

  const activeTier = useMemo(() => TIERS.find((tier) => tier.id === selectedTier) || TIERS[2], [selectedTier]);

  const fetchBalances = async (addr) => {
    if (!addr) return;
    try {
      const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
      const server = new Horizon.Server(horizonUrl);
      const acc = await server.loadAccount(addr);
      
      const nativeBalance = acc.balances.find(b => b.asset_type === 'native');
      if (nativeBalance) {
        const formatted = Number(nativeBalance.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        setMockUsdBalance(formatted);
      }
      
      const tier = await getUserTier(addr);
      const tokenId = await getStellarUserTokenId(addr);
      
      setUserTier(tier);
      setOwnedTokenId(tokenId);
    } catch (err) {
      console.warn('[MintConsole] fetchBalances encountered a critical error:', err);
      setMockUsdBalance(ZERO);
      setUserTier(-1);
      setOwnedTokenId(0);
    }
  };

  const connectWalletLocal = async () => {
    try {
      const stellarAddr = await connectWallet('stellar');
      if (stellarAddr) {
        await fetchBalances(stellarAddr);
        return stellarAddr;
      }
    } catch (e) {
      throw new Error('No Freighter wallet found or connection denied.');
    }
  };

  useEffect(() => {
    if (account) {
      fetchBalances(account).catch(e => console.warn('[MintConsole] Hydration failed:', e));
    } else {
      setMockUsdBalance(ZERO);
      setUserTier(-1);
      setOwnedTokenId(0);
    }
  }, [account, isStellarConnected]);

  const handleMint = async () => {
    if (isMinting) return;

    setIsMinting(true);
    setExecutionError('');
    setTxHash('');

    try {
      const tier = activeTier;
      if (tier.id === 'alpha') {
        throw new Error('Alpha tier is read-only and cannot mint a subscription badge.');
      }

      setStatus('CONNECTING');
      let currentAccount = account;
      if (!currentAccount) {
        currentAccount = await connectWalletLocal();
      }
      
      setStatus('MINTING_BADGE');
      const tierLevel = tier.id === 'nexus' ? 2 : 1;
      const result = await upgradeTier(tierLevel);
      
      if (result && result.successful) {
        setTxHash(result.hash);
        setStatus('MINTED');
        await fetchBalances(currentAccount);
      }
    } catch (err) {
      console.error('[MintConsole] Execution Error:', err);
      const msg = err.reason || err.shortMessage || err.message || 'Unknown error';
      setExecutionError(msg);
      setStatus('ERROR');
    } finally {
      setIsMinting(false);
    }
  };

  const handleCancelNFT = async () => {
    if (activeTier.id === 'alpha') return;
    if (isMinting) return;
    if (!window.confirm('Are you sure you want to cancel the NFT? This will remove the benefits too.')) {
      return;
    }

    setIsMinting(true);
    setExecutionError('');
    setTxHash('');
    setStatus('CANCELLING');

    try {
      let currentAccount = account;
      if (!currentAccount) {
        currentAccount = await connectWalletLocal();
      }
      
      if (ownedTokenId > 0) {
        setStatus('BURNING_NFT');
        await stellarBurn(currentAccount, ownedTokenId);
      }

      setStatus('CANCELLED');
      await fetchBalances(currentAccount);
    } catch (err) {
      console.error('[MintConsole] Cancellation Error:', err);
      setExecutionError(err.message);
      setStatus('ERROR');
    } finally {
      setIsMinting(false);
    }
  };

  const renderStatusIndicator = () => {
    if (isMinting) {
      return (
        <div className="spectra-agent-loader-row" style={{ marginTop: '12px' }}>
          <div className="spectra-agent-geometric-spinner" />
          <span className="spectra-agent-loader-text">
            {status === 'CONNECTING' && 'Establishing Secure Connection...'}
            {status === 'MINTING_BADGE' && 'Preparing Gasless Mint...'}
            {status === 'CANCELLING' && 'Initializing Cancellation...'}
            {status === 'BURNING_NFT' && 'Burning Subscription Badge NFT...'}
          </span>
        </div>
      );
    }
    return null;
  };

  const isBadgeOwned = activeTier.plan <= userTier;
  const badgeStyle = {
    filter: isBadgeOwned ? 'none' : 'grayscale(100%) opacity(50%)',
    transition: 'all 0.3s ease'
  };

  return (
    <div className="spectra-mint-grid">
      <div className="spectra-mint-left">
        <div className="spectra-render-box" style={{ position: 'relative' }}>
          {activeTier.spline ? (
            <div className='nftdiv' style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video 
              className='nftvideo'
                src={activeTier.spline} 
                autoPlay 
                loop 
                muted 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover', ...badgeStyle }}
              />
            </div>
          ) : (
            <img className="spectra-badge-image" style={badgeStyle} src={activeTier.badge} alt={`${activeTier.name} badge`} />
          )}
        </div>

        <div className="spectra-action-box">
          <div className="spectra-action-head">
            <span className="spectra-action-label">Estimated Deduction</span>
            <span className="spectra-action-value">{activeTier.deduction} XLM/MO</span>
          </div>

          {executionError && (
            <div className="spectra-error-alert" style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              color: '#ff4d4d',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '12px',
              fontSize: '0.85rem',
              fontFamily: 'Geist Mono',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>[ PIPELINE_FAILURE ]</div>
              {executionError.split('\n').map((line, i) => <div key={i}>{line}</div>)}
            </div>
          )}

          <button className="spectra-mint-btn" type="button" onClick={handleMint} disabled={isMinting || isBadgeOwned}>
            {isMinting ? 'PIPELINE_ACTIVE...' : isBadgeOwned ? 'BADGE_ALREADY_OWNED' : 'MINT_SUBSCRIPTION_BADGE'}
          </button>

          {isBadgeOwned && activeTier.id !== 'alpha' && (
            <button 
              className="spectra-mint-btn" 
              type="button" 
              onClick={handleCancelNFT}
              disabled={isMinting}
              style={{
                marginTop: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#fca5a5',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              {isMinting ? 'CANCELLING...' : 'CANCEL SUBSCRIPTION & BURN NFT'}
            </button>
          )}
          
          {renderStatusIndicator()}

          {status !== 'IDLE' && (
            <div className="spectra-mint-status">{status === 'MINTED' ? 'SUCCESS: TRANSACTION CONFIRMED' : `STATUS: ${status}`}</div>
          )}

          <div className="spectra-balance-stack">
            <span className="spectra-balance-text">XLM Wallet Balance: {mockUsdBalance}</span>
          </div>
          {txHash && <div className="spectra-tx-panel">Mint confirmed: {txHash}</div>}
        </div>
      </div>

      <div className="spectra-mint-right">
        <div className="spectra-tier-label">Select Access Tier</div>
        <div className="spectra-tier-grid">
          {TIERS.map((tier) => {
            const isActive = tier.id === selectedTier;
            return (
              <div
                key={tier.id}
                className={`spectra-tier-card scroll-dribble-card ${isActive ? 'spectra-tier-card-active' : ''}`}
                onClick={() => setSelectedTier(tier.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    setSelectedTier(tier.id);
                  }
                }}
              >
                <div className="spectra-tier-top">
                  <h3 className="spectra-tier-name">{tier.name}</h3>
                  <div className="spectra-tier-price">{tier.price}</div>
                </div>
                <p className="spectra-tier-description">{tier.description}</p>
                <ul className="spectra-tier-list">
                  {tier.features.map((feature, index) => (
                    <li key={feature} className="spectra-tier-item">
                      <span className="material-symbols-outlined spectra-tier-icon">
                        {tier.id === 'alpha' && index === 2 ? 'close' : 'check'}
                      </span>
                      <span className="spectra-tier-feature">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={`spectra-tier-foot ${isActive ? 'spectra-tier-foot-active' : ''}`}>
                  {isActive ? 'ACTIVE SELECTION' : `SELECT [ ${tier.name.charAt(0)} ]`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
