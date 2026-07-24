import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

/* ─── Styled ─────────────────────────────────────────────────────────────────── */

const Page = styled.div`
  flex: 1;
  padding-top: 128px;
  padding-bottom: 96px;
  padding-left: 24px;
  padding-right: 24px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding-left: 64px;
    padding-right: 64px;
  }
`;

/* ── Hero ── */
const HeroSection = styled.section`
  margin-bottom: 128px;
`;

const Grid12 = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  align-items: end;

  @media (min-width: 768px) {
    grid-template-columns: repeat(12, 1fr);
  }
`;

const ColSpan8 = styled.div`
  grid-column: span 4;

  @media (min-width: 768px) {
    grid-column: span 8;
  }
`;

const ColSpan4Right = styled.div`
  grid-column: span 4;
  margin-top: 32px;

  @media (min-width: 768px) {
    grid-column: span 4;
    margin-top: 0;
    display: flex;
    justify-content: flex-end;
  }
`;

const PageTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--color-primary);
  margin-bottom: 24px;
`;

const PageSubtitle = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-secondary);
  max-width: 640px;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-color);
  padding: 8px 16px;
`;

const PulseDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
`;

const StatusText = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-primary);
`;

const HeroDivider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--border-color);
  margin-top: 48px;
`;

/* ── Guide Sections ── */
const GuideSection = styled.section`
  margin-bottom: 128px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(12, 1fr);
  }
`;

const StickyCol = styled.div`
  grid-column: span 4;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    grid-column: span 4;
    margin-bottom: 0;
  }
`;

const StickyTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 32px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--color-primary);
  position: sticky;
  top: 160px;
`;

const ContentCol = styled.div`
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 64px;

  @media (min-width: 768px) {
    grid-column: span 8;
  }
`;

const ContentBlock = styled.div`
  border: 1px solid var(--border-color);
  padding: 32px;
  background: var(--bg-surface);
`;

const BlockHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
`;

const BlockTitle = styled.h3`
  font-family: 'Geist', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

const BlockTag = styled.span`
  font-family: 'Geist', monospace;
  font-size: 14px;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
`;

const BodyText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-primary);
  opacity: 0.87;
  margin-bottom: 16px;
`;

const List = styled.ul`
  margin-left: 20px;
  margin-bottom: 16px;
`;

const ListItem = styled.li`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-primary);
  opacity: 0.87;
  margin-bottom: 8px;
`;

const CodeBox = styled.div`
  border: 1px solid var(--border-color);
  padding: 16px;
  background: var(--bg-surface-low);
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 16px;

  span {
    font-family: 'Geist', monospace;
    font-size: 14px;
    letter-spacing: 0.02em;
    display: block;
    color: var(--color-primary);
    line-height: 1.8;
  }

  span.comment { color: var(--color-secondary); }
`;

/* ─── Scroll reveal ─────────────────────────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const els = el.querySelectorAll('.reveal-item');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    els.forEach((e) => { if (!e.classList.contains('is-visible')) observer.observe(e); });
    return () => observer.disconnect();
  }, []);
  return ref;
}

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function Guide() {
  const pageRef = useScrollReveal();

  return (
    <Page ref={pageRef} className="bg-grid-overlay">
      {/* Hero */}
      <HeroSection>
        <Grid12>
          <ColSpan8>
            <PageTitle>[ SPECTRA GUIDE ]</PageTitle>
            <PageSubtitle>
              Complete documentation for navigating the Spectra Ecosystem. Learn how to configure your identity, execute cross-chain operations, and interact with the autonomous AI agent.
            </PageSubtitle>
          </ColSpan8>
          <ColSpan4Right>
            <StatusBadge>
              <PulseDot />
              <StatusText>TUTORIAL: ACTIVE</StatusText>
            </StatusBadge>
          </ColSpan4Right>
        </Grid12>
        <HeroDivider />
      </HeroSection>

      {/* Web3 Identity */}
      <GuideSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Web3 Identity</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Dual Authentication Model</BlockTitle>
                <BlockTag>[ FIREBASE + FREIGHTER ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Spectra uses a unique combination of Firebase (Web2) and Freighter (Web3) for identity. You can browse, read articles, and even talk to the AI Agent without a wallet. When you are ready to execute on-chain transactions, the Web3 Gateway will prompt you to connect your Stellar wallet.
              </BodyText>
            </ContentBlock>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Wallet Setup</BlockTitle>
                <BlockTag>[ FREIGHTER EXTENSION ]</BlockTag>
              </BlockHeader>
              <List>
                <ListItem><strong>1. Install Freighter:</strong> Download the Freighter extension for Chrome or Firefox from the official store. Create a new wallet or import an existing recovery phrase.</ListItem>
                <ListItem><strong>2. Switch to Testnet:</strong> Spectra operates exclusively on the Stellar Testnet. Open Freighter settings and switch your network from "Public" to "Testnet".</ListItem>
                <ListItem><strong>3. Fund your Wallet:</strong> In Freighter, click on your XLM balance and look for the "Fund with Friendbot" button to receive 10,000 test XLM automatically.</ListItem>
              </List>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </GuideSection>

      {/* Exchange & Bridge */}
      <GuideSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Liquidity<br/>Protocol</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Soroban Swap</BlockTitle>
                <BlockTag>[ INTERNAL AMM ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Trade testnet assets like XLM, USDC, and EURC instantly. Select the "Swap" mode on the Exchange page. Spectra calculates the optimal route across the Soroban liquidity pools.
              </BodyText>
            </ContentBlock>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Cross-Chain Bridge</BlockTitle>
                <BlockTag>[ AXELAR GMP ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Spectra integrates with Axelar GMP to allow cross-chain token bridging. Select "Cross-Chain Bridge" mode, input your destination EVM address (e.g. Sepolia), and Spectra will lock your Stellar assets and mint the equivalent on the destination network in one click.
              </BodyText>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </GuideSection>

      {/* AI Assistant */}
      <GuideSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>AI Assistant</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Spectra Agent</BlockTitle>
                <BlockTag>[ NATURAL LANGUAGE PROCESSING ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Our onboard LLM-powered assistant translates your natural language requests into direct blockchain actions.
              </BodyText>
              <CodeBox>
                <span className="comment">// Example Intents</span>
                <span>&gt; "Swap 100 XLM for USDC"</span>
                <span>&gt; "Bridge 50 EURC to 0xABCD..."</span>
              </CodeBox>
            </ContentBlock>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Execution Pipeline</BlockTitle>
                <BlockTag>[ HUMAN-IN-THE-LOOP ]</BlockTag>
              </BlockHeader>
              <BodyText>
                The AI parses your request and structures a blockchain intent. You will be prompted with an explicit "GRANT_EXECUTION_PERMISSION" block. Only after your approval will the agent construct the transaction and request your Freighter signature.
              </BodyText>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </GuideSection>

      {/* Subscriptions */}
      <GuideSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Access Tiers</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ContentBlock>
              <BlockHeader>
                <BlockTitle>NFT Subscriptions</BlockTitle>
                <BlockTag>[ SOULBOUND TOKENS ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Spectra utilizes Soroban Smart Contracts to manage user access tiers via non-fungible tokens.
              </BodyText>
              <List>
                <ListItem><strong>Alpha (Tier 0):</strong> Default free tier. Basic access.</ListItem>
                <ListItem><strong>Vector (Tier 1):</strong> Minted for 100 USDC. Enhanced analytics.</ListItem>
                <ListItem><strong>Nexus (Tier 2):</strong> Minted for 500 USDC. Unlimited agent access & zero routing fees.</ListItem>
              </List>
            </ContentBlock>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Minting & Burning</BlockTitle>
                <BlockTag>[ SMART CONTRACT ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Visit the Pricing page to mint a badge. If you ever want to downgrade, you can Cancel your subscription to burn the NFT and reclaim a portion of the locked collateral via the smart contract.
              </BodyText>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </GuideSection>

    </Page>
  );
}
