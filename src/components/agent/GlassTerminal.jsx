import { useEffect, useMemo, useState, useCallback, useRef } from 'react';

import styled, { keyframes } from 'styled-components';
import { tryParseDefiIntent } from '../../api/sarvamAgent.js';
import { resolveSacAddress } from '../../config/contracts.js';
import { swapTokens } from '../../lib/stellar/contracts/exchange';
import { bridgeToEvm } from '../../lib/stellar/contracts/bridge';
import { useAuth } from '../../context/AuthContext';
import { useRateLimit } from '../../context/RateLimitContext';
import { useError } from '../../context/ErrorContext';
import { Horizon } from '@stellar/stellar-sdk';

const Card = styled.section`
  width: 100%;
  max-width: 980px;
  background: rgba(10, 10, 11, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 20px 70px rgba(176, 38, 255, 0.14);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  resize: vertical;
  min-height: 400px;
  max-height: 90vh;
`;

const Header = styled.header`
  height: 52px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.div`
  font-family: 'Geist', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const Dots = styled.div`
  display: inline-flex;
  gap: 8px;

  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.35);
  }
`;

const Body = styled.div`
  flex: 1;
  min-height: 150px;
  overflow-y: auto;
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EmptyState = styled.div`
  border: 1px dashed rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.02);
  color: #e5e5e5;
  font-family: 'Geist', monospace;
  font-size: 14px;
  padding: 18px;
`;

const Message = styled.div`
  align-self: ${({ $agent }) => ($agent ? 'flex-start' : 'flex-end')};
  width: min(88%, 760px);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MessageLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e5e5e5;
`;

const MessageBubble = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: ${({ $agent }) => ($agent ? 'rgba(255,255,255,0.04)' : 'rgba(176,38,255,0.15)')};
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px 14px;
`;

const glowPulse = keyframes`
  0% { transform: scale(0.9) rotate(0deg); opacity: 0.35; }
  50% { transform: scale(1.08) rotate(180deg); opacity: 1; }
  100% { transform: scale(0.9) rotate(360deg); opacity: 0.35; }
`;

const LoaderWrap = styled.div`
  align-self: flex-start;
  width: min(88%, 760px);
  border: 1px solid rgba(176, 38, 255, 0.55);
  background: rgba(176, 38, 255, 0.08);
  padding: 14px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const LoaderGeo = styled.div`
  width: 18px;
  height: 18px;
  border: 2px solid #b026ff;
  box-shadow: 0 0 14px rgba(176, 38, 255, 0.7);
  animation: ${glowPulse} 1.1s linear infinite;
`;

const LoaderText = styled.span`
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const IntentCard = styled.article`
  border: 1px solid rgba(176, 38, 255, 0.6);
  background: rgba(176, 38, 255, 0.12);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const IntentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const SuggestionRail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SuggestionButton = styled.button`
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.03);
  color: #ffffff;
  padding: 10px 12px;
  font-family: 'Geist', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    border-color: rgba(176, 38, 255, 0.65);
    background: rgba(176, 38, 255, 0.14);
  }
`;

const IntentItem = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(10, 10, 11, 0.45);
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const IntentLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  color: #e5e5e5;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const IntentValue = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  color: #ffffff;
  text-transform: uppercase;
`;

const ExecuteButton = styled.button`
  width: 100%;
  border: 1px solid #b026ff;
  color: #ffffff;
  background: rgba(176, 38, 255, 0.2);
  padding: 12px;
  font-family: 'Geist', monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    box-shadow: 0 0 20px rgba(176, 38, 255, 0.45);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Footer = styled.form`
  height: 54px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  color: #ffffff;
  font-family: 'Geist', monospace;
  font-size: 15px;
  &:focus { outline: none; }
`;

const SendButton = styled.button`
  border: 1px solid #b026ff;
  color: #ffffff;
  background: rgba(176, 38, 255, 0.2);
  padding: 9px 14px;
  font-family: 'Geist', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const StatusText = styled.p`
  font-family: 'Geist', monospace;
  font-size: 12px;
  color: #e5e5e5;
`;

const WarningBox = styled.div`
  border: 1px solid rgba(245, 158, 11, 0.65);
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  font-family: 'Geist', monospace;
  font-size: 11px;
  padding: 12px;
  border-radius: 6px;
  margin-top: 10px;
  line-height: 1.5;
`;

const LayoutGrid = styled.div`
  display: flex;
  gap: 20px;
  width: 100%;
  max-width: 1280px;
  align-items: flex-start;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const SidebarCard = styled.aside`
  flex: 0 0 320px;
  background: rgba(10, 10, 11, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  font-family: 'Geist', monospace;
`;

const SidebarHeader = styled.header`
  height: 54px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: #888888;
  background: rgba(255, 255, 255, 0.01);
`;

const SidebarBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
`;

const BalanceBlock = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const BalanceLabel = styled.span`
  font-size: 10px;
  color: #888888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const BalanceValue = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
`;

const SidebarConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: ${props => props.$connected ? '#10b981' : '#ef4444'};
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
`;

const ConnectWall = styled.dialog`
  border: none;
  padding: 0;
  background: transparent;
  width: min(420px, 90vw);

  &::backdrop {
    background: rgba(10, 10, 11, 0.72);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
`;

const ConnectWallCard = styled.div`
  background: linear-gradient(135deg, rgba(15, 10, 25, 0.98), rgba(25, 10, 40, 0.96));
  border: 1px solid rgba(176, 38, 255, 0.4);
  border-radius: 20px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(176,38,255,0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const ConnectWallBtn = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(176, 38, 255, 0.5);
  background: rgba(176, 38, 255, 0.2);
  color: #fff;
  font-family: 'Poppins', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
`;

const normalizeAmount = (value) => Number(String(value || '0').replace(/,/g, '')) || 0;

export default function GlassTerminal({ onFlowStateChange }) {
  const { connectWallet, stellarPublicKey } = useAuth();
  const { consumeRequest } = useRateLimit();
  const { showError } = useError();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [intent, setIntent] = useState(null);
  const [flowState, setFlowState] = useState('IDLE');
  const [tokenBalances, setTokenBalances] = useState({});
  const [hasHydratedWallet, setHasHydratedWallet] = useState(false);

  useEffect(() => {
    if (onFlowStateChange) onFlowStateChange(flowState);
  }, [flowState, onFlowStateChange]);

  const connectWallRef = useRef(null);
  const [showConnectWall, setShowConnectWall] = useState(false);

  useEffect(() => {
    const el = connectWallRef.current;
    if (!el) return;
    if (showConnectWall && !el.open) el.showModal();
    else if (!showConnectWall && el.open) el.close();
  }, [showConnectWall]);

  useEffect(() => {
    if (stellarPublicKey) {
      setShowConnectWall(false);
    }
  }, [stellarPublicKey]);

  const pushMessage = useCallback((from, content) => {
    setMessages((prev) => [...prev, { from, content }]);
  }, []);

  const hydrateWallet = async () => {
    if (!stellarPublicKey) return;
    
    try {
      const horizonUrl = import.meta.env.VITE_STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org";
      const server = new Horizon.Server(horizonUrl);
      const acc = await server.loadAccount(stellarPublicKey);
      
      const fetchedBalances = {};
      acc.balances.forEach(b => {
        if (b.asset_type === 'native') {
          fetchedBalances['XLM'] = Number(b.balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
        } else if (b.asset_code === 'USDC') {
          fetchedBalances['USDC'] = Number(b.balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
        } else {
          fetchedBalances[b.asset_code] = Number(b.balance).toLocaleString('en-US', { minimumFractionDigits: 2 });
        }
      });
      
      setTokenBalances(fetchedBalances);
      setHasHydratedWallet(true);
    } catch (err) {
      console.warn('[GlassTerminal] Error in hydrateWallet:', err);
    }
  };

  useEffect(() => {
    if (stellarPublicKey) {
      hydrateWallet().catch(() => {});
    } else {
      setTokenBalances({});
      setHasHydratedWallet(false);
    }
  }, [stellarPublicKey]);

  useEffect(() => {
    if (stellarPublicKey && messages.length === 0 && !isLoading && hasHydratedWallet) {
      pushMessage('agent', `Terminal connected to ${stellarPublicKey.slice(0, 6)}...${stellarPublicKey.slice(-4)}. How can I assist you today?`);
    } else if (!stellarPublicKey && messages.length === 0) {
      pushMessage('agent', `Welcome to Spectra Agent Terminal. Please connect your Freighter wallet to execute swaps.`);
    }
  }, [stellarPublicKey, messages.length, isLoading, hasHydratedWallet, pushMessage]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    setIntent(null);
    setIsLoading(true);
    const userPrompt = inputValue.trim();
    pushMessage('user', userPrompt);

    if (!stellarPublicKey) {
      setShowConnectWall(true);
      setInputValue('');
      setIsLoading(false);
      return;
    }

    const rateLimit = consumeRequest();
    if (rateLimit && !rateLimit.allowed) {
      pushMessage('agent', `[RATE_LIMIT_EXCEEDED] You have reached your limit. Please wait.`);
      setInputValue('');
      setIsLoading(false);
      return;
    }

    try {
      const context = `Active wallet connected: ${stellarPublicKey}. Balances: ${Object.entries(tokenBalances).map(([s, b]) => `${b} ${s}`).join(', ')}.`;
      const parsed = await tryParseDefiIntent(userPrompt, { context });
      if (!parsed || parsed.error || parsed.action === 'unknown') {
        throw new Error(parsed?.error || 'Agent could not derive a valid on-chain intent.');
      }
      pushMessage('agent', `Intent resolved: ${parsed.action.toUpperCase()} ${parsed.amount} ${String(parsed.token).toUpperCase()}`);
      setIntent(parsed);
      setFlowState('EU_CONSENT');
      setInputValue('');
    } catch (apiError) {
      showError(apiError?.message || 'Failed to contact agent backend.', 'Agent Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!stellarPublicKey) {
      try { await connectWallet('stellar'); } 
      catch (err) { showError(err.message || 'Failed to connect wallet.', 'Connection Failed'); return; }
    }
    setFlowState('CHART_REVIEW');
  };

  const handleSignAndExecute = async () => {
    if (!intent || isSigning) return;
    setIsSigning(true);
    setFlowState('EXECUTING');

    try {
      if (!stellarPublicKey) throw new Error('No active wallet found.');

      const tokenIn = resolveSacAddress('XLM'); 
      const tokenOut = resolveSacAddress(intent.token);
      const amountInParsed = Math.floor(Number(intent.amount || '0') * 10000000).toString(); // 7 decimals usually for Stellar

      let result;
      if (intent.action.toLowerCase() === 'bridge') {
        pushMessage('agent', 'Relaying bridge intent to Stellar Testnet...');
        result = await bridgeToEvm(
          stellarPublicKey,
          tokenIn,
          amountInParsed,
          'base-sepolia',
          '0x0000000000000000000000000000000000000000'
        );
      } else {
        pushMessage('agent', 'Relaying intent to Stellar Testnet...');
        result = await swapTokens(
          stellarPublicKey,
          tokenIn,
          tokenOut,
          amountInParsed,
          '0'
        );
      }
      
      if (result && result.hash) {
        pushMessage('agent', (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Transaction Successful on Stellar Testnet</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              Hash: {result.hash.slice(0,8)}...{result.hash.slice(-8)}
            </div>
            <a 
              href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: '#b026ff', textDecoration: 'underline', fontSize: '12px', marginTop: '4px' }}
            >
              View on Stellar Expert Explorer ↗
            </a>
          </div>
        ));
        setIntent(null);
        setFlowState('IDLE');
        hydrateWallet();
      }
    } catch (signError) {
      showError(signError?.message || 'Execution failed.', 'Execution Failed');
      setFlowState('CHART_REVIEW');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <>
    <LayoutGrid>
      <Card style={{ flex: 2 }}>
        <Header>
          <HeaderTitle>
            <span className="material-symbols-outlined">terminal</span>
            AGENTIC_WALLET_OS // ACTIVE_MODE
          </HeaderTitle>
          <Dots><span /><span /><span /></Dots>
        </Header>

        <Body>
          {messages.length === 0 && !isLoading && (
            <EmptyState>Agent terminal is idle. Send an on-chain instruction to start.</EmptyState>
          )}

          <SuggestionRail>
            <SuggestionButton type="button" onClick={() => setInputValue('Swap 10 XLM for USDC')}>Swap 10 XLM to USDC</SuggestionButton>
            <SuggestionButton type="button" onClick={() => setInputValue('Bridge 50 XLM to Base')}>Bridge 50 XLM to Base</SuggestionButton>
            <SuggestionButton type="button" onClick={() => setInputValue('Swap 5 XLM for EURC')}>Swap 5 XLM for EURC</SuggestionButton>
            <SuggestionButton type="button" onClick={() => setInputValue('Swap 25 USDC for XLM')}>Swap 25 USDC to XLM</SuggestionButton>
          </SuggestionRail>

          {messages.map((msg, idx) => (
            <Message key={`${msg.from}-${idx}`} $agent={msg.from === 'agent'}>
              <MessageLabel>{msg.from === 'agent' ? 'SYSTEM_AGENT' : 'USER_INPUT'}</MessageLabel>
              <MessageBubble $agent={msg.from === 'agent'}>{msg.content}</MessageBubble>
            </Message>
          ))}

          {isLoading && (
            <LoaderWrap>
              <LoaderGeo />
              <LoaderText>Parsing intent via Sarvam Agent...</LoaderText>
            </LoaderWrap>
          )}

          {intent && (
            <IntentCard>
              <IntentGrid>
                <IntentItem>
                  <IntentLabel>Action</IntentLabel>
                  <IntentValue>{intent.action}</IntentValue>
                </IntentItem>
                <IntentItem>
                  <IntentLabel>Amount</IntentLabel>
                  <input
                    type="text"
                    value={intent.amount || ''}
                    onChange={(e) => setIntent({ ...intent, amount: e.target.value })}
                    style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', width: '100%' }}
                  />
                </IntentItem>
                <IntentItem>
                  <IntentLabel>Token</IntentLabel>
                  <IntentValue>{intent.token}</IntentValue>
                </IntentItem>
              </IntentGrid>

              {flowState === 'EU_CONSENT' && (
                <div style={{ marginTop: '10px' }}>
                  <ExecuteButton type="button" onClick={handleGrantPermission}>Grant Permission</ExecuteButton>
                </div>
              )}

              {(flowState === 'CHART_REVIEW' || flowState === 'EXECUTING') && (
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <iframe
                    title="tradingview"
                    src={`https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(intent.token?.toUpperCase() === 'USDC' ? 'BINANCE:USDCUSDT' : intent.token?.toUpperCase() === 'EURC' ? 'KRAKEN:EURUSD' : 'BINANCE:XLMUSDT')}&interval=60&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=0&saveimage=0&toolbarbg=0A0A0B&theme=dark&style=1&locale=en`}
                    style={{ width: '100%', height: '300px', border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a0c' }}
                  />
                  {flowState === 'CHART_REVIEW' && (
                    <ExecuteButton type="button" onClick={handleSignAndExecute}>Confirm Execution</ExecuteButton>
                  )}
                </div>
              )}
            </IntentCard>
          )}
        </Body>

        <Footer onSubmit={handleSubmit}>
          <Input
            type="text"
            placeholder="What onchain action can I route for you?"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            disabled={isLoading || isSigning}
          />
          <SendButton type="submit" disabled={isLoading || isSigning || !inputValue.trim()}>
            Send
          </SendButton>
        </Footer>
      </Card>

      <SidebarCard style={{ flex: 1 }}>
        <SidebarHeader>LIVE_WALLET_STATUS</SidebarHeader>
        <SidebarBody>
          <div>
            <SidebarConnectionStatus $connected={!!stellarPublicKey}>
              {stellarPublicKey ? 'Connected to Freighter' : 'Disconnected'}
            </SidebarConnectionStatus>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(tokenBalances).map(([symbol, bal]) => (
                <BalanceBlock key={symbol}>
                  <BalanceLabel>{symbol} Balance</BalanceLabel>
                  <BalanceRow>
                    <BalanceValue>{bal}</BalanceValue>
                  </BalanceRow>
                </BalanceBlock>
              ))}
            </div>
          </div>
        </SidebarBody>
      </SidebarCard>
    </LayoutGrid>

    <ConnectWall ref={connectWallRef}>
      <ConnectWallCard>
        <h2>Connect Wallet to Continue</h2>
        <ConnectWallBtn onClick={async () => {
          try { await connectWallet('stellar'); setShowConnectWall(false); }
          catch (err) { showError('Failed', 'Failed'); }
        }}>
          Connect Freighter
        </ConnectWallBtn>
      </ConnectWallCard>
    </ConnectWall>
    </>
  );
}
