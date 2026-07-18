import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { tryParseDefiIntent } from '../../api/sarvamAgent.js';
import { resolveSacAddress } from '../../config/contracts.js';
import { swapTokens } from '../../lib/stellar/contracts/exchange';
import { bridgeToEvm } from '../../lib/stellar/contracts/bridge';

const SUGGESTION_PILLS = [
  "Swap 10 XLM to USDC",
  "Bridge 5 XLM to Base",
  "Mint Genesis Badge",
  "Swap 5 XLM for TYI"
];

function buildIntentJson(intent) {
  return {
    intent_id: `0x${Math.random().toString(16).slice(2, 10)}...${Date.now().toString(16).slice(-4)}`,
    trigger: {
      type: 'USER_SIGNATURE',
      network: 'stellar_testnet',
      condition: 'immediate',
    },
    execution_graph: [
      {
        step: 1,
        action: intent.action.toUpperCase(),
        amount: intent.amount,
        asset: intent.token,
        venue: intent.action.toLowerCase() === 'bridge' ? 'AXELAR_GMP' : 'SPECTRA_EXCHANGE',
      },
    ],
    estimated_fees: '~$0.00 (via Soroban)',
  };
}

export default function AgentTerminal() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingState, setIsExecutingState] = useState(false);
  const [intent, setIntent] = useState(null);
  const [status, setStatus] = useState('READY');
  const [error, setError] = useState('');
  const [executionError, setExecutionError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [history, setHistory] = useState([]);
  
  const { connectWallet, stellarPublicKey } = useAuth();

  const intentJson = useMemo(() => {
    if (!intent || intent.error) {
      return null;
    }
    return buildIntentJson(intent);
  }, [intent]);

  const handleSubmit = async (event, customPrompt) => {
    if (event) event.preventDefault();
    const input = customPrompt || prompt;
    if (!input.trim() || isLoading) {
      return;
    }

    setPrompt(input);
    setIsLoading(true);
    setError('');
    setExecutionError('');
    setTxHash('');
    setStatus('PARSING');
    setIntent(null);

    try {
      const parsedResult = await tryParseDefiIntent(input.trim());
      if (!parsedResult) {
        setError('Agent parser request failed.');
        setStatus('ERROR');
      } else {
        setIntent(parsedResult);
        setStatus('READY');
        if (!parsedResult.error) {
          setHistory(prev => [input.trim(), ...prev]);
        }
      }
    } catch (parseError) {
      setError(parseError?.message || 'Agent parser request failed.');
      setStatus('ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAndExecute = async () => {
    if (!intent || intent.error || isExecutingState) {
      return;
    }

    setError('');
    setExecutionError('');
    setTxHash('');
    setIsExecutingState(true);
    setStatus('CONNECTING_WALLET');

    try {
      let currentAccount = stellarPublicKey;
      if (!currentAccount) {
        currentAccount = await connectWallet('stellar');
      }

      // Pass symbols directly — getClassicAsset resolves by symbol (XLM/USDC/EURC)
      const tokenIn = 'XLM';
      const tokenOut = String(intent.token || 'USDC').toUpperCase();
      const amountInParsed = Math.floor(Number(intent.amount || '0') * 10000000).toString(); // 7 decimals for Stellar

      let result;
      if (intent.action.toLowerCase() === 'bridge') {
        result = await bridgeToEvm(
          currentAccount,
          tokenIn,
          amountInParsed,
          'sepolia',
          '0x0000000000000000000000000000000000000000' // mock destination
        );
      } else {
        result = await swapTokens(
          currentAccount,
          tokenIn,
          tokenOut,
          amountInParsed,
          '0'
        );
      }

      if (result && result.hash) {
        setTxHash(result.hash);
        setStatus('EXECUTED');
      }

    } catch (execError) {
      console.error('[AgentTerminal] Pipeline Error:', execError);
      
      let message = execError.message || 'Intent Execution Failed';
      setExecutionError(message);
      setStatus('ERROR');
    } finally {
      setIsExecutingState(false);
    }
  };

  const renderStatusIndicator = () => {
    if (status === 'CONNECTING_WALLET') {
      return (
        <div className="spectra-agent-loader-row">
          <div className="spectra-agent-geometric-spinner" />
          <span className="spectra-agent-loader-text">
            Connecting Agent Wallet...
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="spectra-agent-page">
      <div className="spectra-agent-terminal-header" style={{ marginBottom: '16px' }}>
        <div className="spectra-agent-header-left">
          <span className="material-symbols-outlined spectra-agent-header-icon">terminal</span>
          <span className="spectra-agent-header-title">AGENTIC_WALLET_OS // ACTIVE_MODE</span>
        </div>
      </div>
      
      <div className="spectra-agent-layout">
        
        {/* Sidebar History */}
        <div className="spectra-agent-sidebar">
          <div className="spectra-sidebar-title">Session History</div>
          {history.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontFamily: 'Geist Mono' }}>
              No previous intents in this session.
            </div>
          ) : (
            history.map((h, i) => (
              <div 
                key={i} 
                className="spectra-history-item"
                onClick={() => setPrompt(h)}
              >
                {h}
              </div>
            ))
          )}
        </div>

        {/* Central Terminal */}
        <div className="spectra-agent-main">
          
          {/* Glassmorphic Pills */}
          <div className="spectra-agent-pills">
            {SUGGESTION_PILLS.map((pill, i) => (
              <div 
                key={i} 
                className="spectra-pill"
                onClick={() => handleSubmit(null, pill)}
              >
                {pill}
              </div>
            ))}
          </div>

          <div className="spectra-agent-chat-area">
            {prompt && (
              <div className="spectra-agent-card spectra-agent-card-user">
                <span className="spectra-agent-label">USER_INPUT</span>
                <div className="spectra-agent-bubble">{prompt}</div>
              </div>
            )}

            {(intent || isLoading || error || executionError) && (
              <div className="spectra-agent-card spectra-agent-card-system">
                <span className="spectra-agent-label">SYSTEM_AGENT</span>
                <div className="spectra-agent-bubble">
                  
                  {intent?.error ? (
                    <div className="spectra-agent-system-lines">
                      <p className="spectra-agent-line" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                        &gt; [ CLARIFICATION_REQUIRED ]
                      </p>
                      <p className="spectra-agent-line">{intent.error}</p>
                    </div>
                  ) : (
                    <>
                      <div className="spectra-agent-system-lines">
                        {isLoading && <p className="spectra-agent-line">&gt; Parsing intent...</p>}
                        {intent && !intent.error && <p className="spectra-agent-line">&gt; Constructing transaction payload...</p>}
                        <p className="spectra-agent-line">
                          &gt; Status: <span className="spectra-agent-status">[ {status} ]</span>
                        </p>
                      </div>

                      {renderStatusIndicator()}

                      {executionError && (
                        <div className="spectra-error-alert" style={{
                          background: 'rgba(255, 0, 0, 0.1)',
                          border: '1px solid rgba(255, 0, 0, 0.3)',
                          color: '#ff4d4d',
                          padding: '12px',
                          borderRadius: '4px',
                          margin: '12px 0',
                          fontSize: '0.85rem',
                          fontFamily: 'Geist Mono'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>[ PIPELINE_FAILURE ]</div>
                          {executionError}
                        </div>
                      )}

                      {intent && !intent.error && (
                        <div className="spectra-agent-json">
                          <pre className="spectra-agent-pre">
                            {JSON.stringify(intentJson, null, 2)}
                          </pre>
                        </div>
                      )}

                      {intent && !intent.error && (
                        <button
                          type="button"
                          className="spectra-agent-cta"
                          onClick={handleSignAndExecute}
                          disabled={!intent || isExecutingState}
                        >
                          <span className="material-symbols-outlined spectra-agent-cta-icon">signature</span>
                          <span className="spectra-agent-cta-text">{isExecutingState ? 'PIPELINE_ACTIVE...' : 'Sign & Execute (Stellar Gasless)'}</span>
                        </button>
                      )}
                    </>
                  )}

                  {stellarPublicKey && (
                    <p className="spectra-agent-line spectra-agent-wallet">Connected: {stellarPublicKey}</p>
                  )}
                  {txHash && (
                    <p className="spectra-agent-line spectra-agent-wallet">Tx Hash: {txHash}</p>
                  )}
                </div>
              </div>
            )}

            {error && <div className="spectra-agent-error">{error}</div>}
          </div>

          {/* Central Input Bar */}
          <div className="spectra-agent-input-container">
            <form className="spectra-agent-input-row" onSubmit={handleSubmit}>
              <span className="material-symbols-outlined spectra-agent-input-icon">chevron_right</span>
              <input
                className="spectra-agent-input"
                placeholder="What onchain action can I route for you?"
                type="text"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                disabled={isLoading || isExecutingState}
              />
              <button className="spectra-agent-submit" type="submit" disabled={isLoading || isExecutingState || !prompt.trim()}>
                {isLoading ? '[ PARSING ]' : '[ SUBMIT ]'}
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
