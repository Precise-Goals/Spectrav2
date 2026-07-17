import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import '../../styles/final.css'
import { HeroDesign } from './HeroDesign';
/* ─── Styled ─────────────────────────────────────────────────────────────────── */

const Page = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  flex: 1;

  @media (min-width: 768px) {
    padding: 0 64px;
  }
`;

/* ── Hero ── */
const HeroSection = styled.section`
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 128px;
  padding-bottom: 64px;
  position: relative;
  /* dot background */
  background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
`;

const SystemStatus = styled.div`
  position: absolute;
  top: 128px;
  left: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);
  padding: 4px 12px;
  background: var(--bg);
  z-index: 20;

  @media (min-width: 768px) {
    left: 64px;
  }
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.25; }
  }
`;

const StatusLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

const HeroCard = styled.div`
  z-index: 10;
  max-width: 960px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  background : rgba(4, 0, 255, 0.97);
  padding: 32px;
  border: 1px solid rgba(0,0,0,0.1);
  backdrop-filter: blur(4px);

  @media (min-width: 768px) {
    padding: 64px;
  }
`;

const HeroTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 70px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-primary);  
  text-transform: uppercase;
`;

const HeroSubtitle = styled.p`
  font-family: 'Geist', monospace;
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
  max-width: 480px;
`;

const CTALink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 32px;
  border: 1px solid var(--border-color);
  background: var(--bg);
  color: var(--color-primary);
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .material-symbols-outlined {
    font-size: 18px;
    transition: transform 0.2s ease;
  }

  &:hover .material-symbols-outlined {
    transform: translateX(4px);
  }
`;

const StatsBar = styled.div`
  position: absolute;
  bottom: 96px;
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 16px 32px;
  background: var(--bg);
  z-index: 20;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
`;

const StatLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const StatValue = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  color: var(--color-primary);
`;

const StatDivider = styled.div`
  width: 1px;
  height: 32px;
  background: var(--border-color);
  align-self: center;
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: var(--bg);
  padding: 0 8px;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const ScrollLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

/* ── Infrastructure Section ── */
const Section = styled.section`
  padding: 96px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 48px;
  position: relative;

  &.bg-grid {
    background-size: 40px 40px;
    background-image:
      linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 16px;
  background: var(--bg);
`;

const SectionTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-primary);
`;

const SectionMeta = styled.span`
  font-family: 'Geist', monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
  display: none;

  @media (min-width: 768px) { display: inline-block; }
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  align-items: center;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ContentCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--bg);
  padding: 24px;
  border: 1px solid var(--border-color);
`;

const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: var(--color-primary);
`;

const CardText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-secondary);
`;

const CheckList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-family: 'Geist', monospace;
  font-size: 12px;
  color: var(--color-primary);
  list-style: none;
  margin-top: 16px;
`;

const CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;

  .material-symbols-outlined {
    font-size: 14px;
  }
`;

const DiagramBox = styled.div`
  border: 1px solid var(--border-color);
  background: blue;
  padding: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;

  svg rect, svg circle { fill: white; stroke: var(--border-color); }
  svg text { fill: blue; font-size:16px; }
  svg path, svg line { stroke: white; }
`;

/* ── Features (Core Modules) ── */
const FeaturesSection = styled.section`
  padding: 48px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 48px;
`;

const ThreeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  border: 1px solid var(--border-color);
  background: var(--bg);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  &:hover {
    background: var(--bg-surface-low);
  }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CardIcon = styled.span`
  .material-symbols-outlined {
    font-size: 30px;
    color: var(--color-primary);
  }
`;

const CardIndex = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  color: var(--color-primary);
  border: 1px solid var(--border-color);
  padding: 2px 8px;
  text-transform: uppercase;
`;

const CardBody = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--color-primary);
  margin-bottom: 12px;
`;

const FeatureDesc = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-secondary);
  margin-bottom: 24px;
`;

const ProtoList = styled.div`
  border-top: 1px solid rgba(0,0,0,0.15);
  padding-top: 16px;
`;

const ProtoLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
  display: block;
  margin-bottom: 8px;
`;

const ProtoItem = styled.div`
  font-family: 'Geist', monospace;
  font-size: 12px;
  color: var(--color-primary);
  margin-top: 4px;
`;

/* ── Live Terminal ── */
const TerminalBar = styled.div`
  width: 100%;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  background: var(--bg);
  height: 128px;
  overflow: hidden;
  position: relative;
  margin: 48px 0 32px;

  @media (max-width: 768px) { display: none; }
`;

const TerminalLabel = styled.div`
  position: absolute;
  top: 8px;
  left: 64px;
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
  z-index: 20;
  background: var(--bg);
  padding-right: 8px;
`;

const TerminalScroll = styled.div`
  height: 100%;
  padding: 32px 64px 8px;
  overflow: hidden;
`;

const TerminalLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  animation: scrollUp 20s linear infinite;

  &:hover { animation-play-state: paused; }

  @keyframes scrollUp {
    0%   { transform: translateY(0); }
    100% { transform: translateY(-50%); }
  }
`;

const TerminalLine = styled.div`
  font-family: 'Geist', monospace;
  font-size: 12px;
  color: var(--color-primary);
  letter-spacing: 0.02em;
`;

/* ─── Scroll reveal hook ────────────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const els = el.querySelectorAll('.reveal-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach((e) => {
      if (!e.classList.contains('is-visible')) observer.observe(e);
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Terminal lines data ──────────────────────────────────────────────────── */
const TERMINAL_LINES = [
  '[14:23:01] Agent 0xF2... executing swap on Arbitrum: 10 ETH -> USDC',
  '[14:23:02] UGF Relayer confirming meta-transaction 0x8a...',
  '[14:23:05] Yield sweep completed. +45.2 USDC added to vault.',
  '[14:23:08] Agent 0xA1... balancing Curve pool LP position.',
  '[14:23:12] Subscriptive NFT renewal processed for User 0x77...',
  '[14:23:15] Gas sponsored via UGF. Fee saved: 0.002 ETH.',
];

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function CinematicHero() {
  const pageRef = useScrollReveal();

  return (
    <Page ref={pageRef}>
      {/* Hero */}
      <HeroSection>
        <SystemStatus>
          <PulseDot />
          <StatusLabel>System Online</StatusLabel>
        </SystemStatus>

        <HeroCard className="reveal-item is-visible">
          <HeroTitle>
            Ai Orchestrated.<br />Frictionless Execution.
          </HeroTitle>
          <HeroSubtitle>
            [ SYSTEM_STATUS: READY ] INITIALIZING PROTOCOL FOR ADVANCED ON-CHAIN EXECUTION.
          </HeroSubtitle>
          <div>
            <CTALink to="/agent">
              Initialize Agent
              <span className="material-symbols-outlined">arrow_forward</span>
            </CTALink>
          </div>
        </HeroCard>

        <StatsBar className="reveal-item delay-200  "
        style={{
          position:"relative",
          bottom: "2rem",
        }}
        >
          <StatItem>
            <StatLabel>Total Volume</StatLabel>
            <StatValue>$4.2B+</StatValue>
          </StatItem>
          <StatDivider />
          <StatItem>
            <StatLabel>Active Agents</StatLabel>
            <StatValue>12,405</StatValue>
          </StatItem>
          <StatDivider />
          <StatItem>
            <StatLabel>Gas Saved</StatLabel>
            <StatValue>845 ETH</StatValue>
          </StatItem>
        </StatsBar>

        <ScrollIndicator>
          <ScrollLabel>Scroll</ScrollLabel>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>south</span>
        </ScrollIndicator>
      </HeroSection>
        <HeroDesign/>
      {/* Infrastructure */}
      <Section className="bg-grid">
        <SectionHeader className="reveal-item">
          <SectionTitle>The Infrastructure</SectionTitle>
          <SectionMeta>UGF_ARCHITECTURE</SectionMeta>
        </SectionHeader>
        <TwoCol className="reveal-item delay-100">
          <ContentCard>
            <CardTitle>Universal Gas Facility</CardTitle>
            <CardText>
              Spectra abstracts away the complexities of native gas tokens, allowing users and agents to execute operations across Ethereum, L2s, and alternative L1s using a unified stablecoin balance or sponsored transactions.
            </CardText>
            <CheckList>
              {['Abstracted Gas Sponsoring', 'Cross-Chain Execution Routing', 'Meta-Transaction Relayers'].map((item) => (
                <CheckItem key={item}>
                  <span className="material-symbols-outlined">check</span>
                  {item}
                </CheckItem>
              ))}
            </CheckList>
          </ContentCard>
          <DiagramBox>
            <svg width="100%" height="200" viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="80" width="80" height="40" />
              <text fontFamily="monospace" fontSize="10" x="40" y="105">USER</text>
              <path d="M100 100 L180 100" strokeDasharray="4 4" />
              <circle cx="200" cy="100" r="30" />
              <text fontFamily="monospace" fontSize="12" fontWeight="bold" x="188" y="104">UGF</text>
              <path d="M230 100 L310 50" />
              <path d="M230 100 L310 100" />
              <path d="M230 100 L310 150" />
              <rect x="310" y="35" width="60" height="30" />
              <text fontFamily="monospace" fontSize="10" x="325" y="55">ETH</text>
              <rect x="310" y="85" width="60" height="30" />
              <text fontFamily="monospace" fontSize="10" x="320" y="105">USDC</text>
              <rect x="310" y="135" width="60" height="30" />
              <text fontFamily="monospace" fontSize="10" x="325" y="155">OP</text>
            </svg>
          </DiagramBox>
        </TwoCol>
      </Section>

      {/* Core Modules */}
      <FeaturesSection>
        <SectionHeader className="reveal-item">
          <SectionTitle>Core Modules</SectionTitle>
          <SectionMeta>[ V 2.4.0 ]</SectionMeta>
        </SectionHeader>
        <ThreeGrid>
          {[
            {
              icon: 'currency_exchange', index: '[ 01 ]', title: 'Unified Exchange',
              desc: 'Aggregate liquidity across multiple ecosystems instantly. Execute trades with zero slippage tolerance parameters configured via agentic models.',
              listLabel: 'Supported Protocols', items: ['> Uniswap V3', '> Curve Finance', '> Balancer'],
              delay: 'delay-100',
            },
            {
              icon: 'account_balance_wallet', index: '[ 02 ]', title: 'Agentic Wallet',
              desc: 'Self-managing treasury protocols. Define risk thresholds once; the agent allocates, compounds, and secures assets autonomously.',
              listLabel: 'Security Features', items: ['> EIP-712 Signatures', '> Multi-sig Thresholds', '> HSM Integration'],
              delay: 'delay-200',
            },
            {
              icon: 'token', index: '[ 03 ]', title: 'Subscriptive NFTs',
              desc: 'Programmable utility layers. Issue tokens that auto-renew access to decentralized services based on yield generated within the wallet.',
              listLabel: 'Tier Benefits', items: ['> Base: Gas Abstraction', '> Pro: Priority Routing', '> Max: Zero Protocol Fees'],
              delay: 'delay-300',
            },
          ].map((f) => (
            <FeatureCard key={f.title} className={`reveal-item ${f.delay}`}>
              <CardTop>
                <CardIcon><span className="material-symbols-outlined">{f.icon}</span></CardIcon>
                <CardIndex>{f.index}</CardIndex>
              </CardTop>
              <CardBody>
                <FeatureTitle>{f.title}</FeatureTitle>
                <FeatureDesc>{f.desc}</FeatureDesc>
                <ProtoList>
                  <ProtoLabel>{f.listLabel}</ProtoLabel>
                  {f.items.map((item) => <ProtoItem key={item}>{item}</ProtoItem>)}
                </ProtoList>
              </CardBody>
            </FeatureCard>
          ))}
        </ThreeGrid>
      </FeaturesSection>

      {/* Live Terminal */}
      <TerminalBar>
        <TerminalLabel>LIVE TERMINAL</TerminalLabel>
        <TerminalScroll>
          <TerminalLines>
            {[...TERMINAL_LINES, '-- CYCLE REPEAT --', ...TERMINAL_LINES].map((line, i) => (
              <TerminalLine key={i}>{line}</TerminalLine>
            ))}
          </TerminalLines>
        </TerminalScroll>
      </TerminalBar>
    </Page>
  );
}
