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

/* ── Mission / Sections ── */
const MissionSection = styled.section`
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
  top: 96px;
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

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const BodyText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-primary);
  opacity: 0.87;
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

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface);
  color: var(--color-primary);
  font-family: 'Geist', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 24px;

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  .material-symbols-outlined { font-size: 14px; }
`;

/* ── Compliance / Accordion ── */
const ComplianceSection = styled.section`
  margin-bottom: 96px;
`;

const ComplianceList = styled.div`
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
`;

const ComplianceItem = styled.div`
  padding: 32px;
  border-bottom: 1px solid var(--border-color);
  cursor: default;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--bg-surface-low); }
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const ItemTitle = styled.h4`
  font-family: 'Geist', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);

  &:hover { text-decoration: underline; }
`;

const ItemText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-secondary);
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
export default function About() {
  const pageRef = useScrollReveal();

  return (
    <Page ref={pageRef}>
      {/* Hero */}
      <HeroSection className="bg-grid-overlay">
        <Grid12>
          <ColSpan8>
            <PageTitle>[ ABOUT SPECTRA ]</PageTitle>
            <PageSubtitle>
              SPECTRA operates at the intersection of high-speed autonomous execution and rigorous regulatory adherence. Our architecture is designed to demystify complex Web3 interactions while maintaining an unyielding commitment to legal frameworks.
            </PageSubtitle>
          </ColSpan8>
          <ColSpan4Right>
            <StatusBadge>
              <PulseDot />
              <StatusText>SYSTEM_STATUS: OPERATIONAL</StatusText>
            </StatusBadge>
          </ColSpan4Right>
        </Grid12>
        <HeroDivider />
      </HeroSection>

      {/* About Spectra */}
      <MissionSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>About Spectra</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ContentBlock>
              <BodyText>
                Spectra is a vertically-integrated, gasless Web3 Agentic Wallet and Decentralized Exchange. Built on Base Sepolia and powered by the Universal Gas Framework (UGF) and Sarvam AI, Spectra removes the biggest barrier to Web3 adoption — gas fees. Users can swap tokens, manage subscriptions, and mint Soulbound NFTs without ever needing native tokens like ETH.
              </BodyText>
            </ContentBlock>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Our Vision</BlockTitle>
              </BlockHeader>
              <BodyText>
                To deliver a seamless, intelligent, Web2-like experience for decentralized finance where anyone can execute complex financial actions through natural language.
              </BodyText>
            </ContentBlock>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Key Features</BlockTitle>
              </BlockHeader>
              <List>
                <ListItem>AI-powered GlassTerminal for conversational intent parsing</ListItem>
                <ListItem>Fully gasless transactions settled in TYI Mock USD</ListItem>
                <ListItem>Tiered SaaS model (Alpha, Vector, Nexus) enforced by non-transferable Soulbound NFTs</ListItem>
                <ListItem>Real-time AMM exchange with decimal-aware pricing</ListItem>
                <ListItem>Human-in-the-Loop security via EIP-712 signatures</ListItem>
              </List>
              <BodyText style={{ marginTop: '16px' }}>
                Spectra combines cutting-edge AI, gas abstraction, and on-chain subscription logic to create the next generation of accessible DeFi.
              </BodyText>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </MissionSection>

      {/* Mission Object */}
      <MissionSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Mission Object</StickyTitle>
          </StickyCol>
          <ContentCol>
            {/* Gas Abstraction */}
            <ContentBlock>
              <BlockHeader>
                <BlockTitle>Gas Abstraction</BlockTitle>
                <BlockTag>[ UGF ARCHITECTURE ]</BlockTag>
              </BlockHeader>
              <TwoColGrid>
                <BodyText>
                  The Universal Gas Facility (UGF) represents a paradigm shift in autonomous transaction execution. By abstracting the underlying network fee mechanics, SPECTRA ensures that agents can execute complex, multi-step strategies without the friction of variable gas costs halting execution.
                </BodyText>
                <CodeBox>
                  <span className="comment">// Execution Flow</span>
                  <span>&gt; Agent Init</span>
                  <span>&gt; UGF Estimate</span>
                  <span>&gt; Relay Confirm</span>
                  <span>&gt; Transaction Success</span>
                </CodeBox>
              </TwoColGrid>
            </ContentBlock>

            {/* TYI */}
            <ContentBlock>
              <BlockHeader>
                <BlockTitle>TYI Integration</BlockTitle>
                <BlockTag>[ SANDBOX ENVIRONMENT ]</BlockTag>
              </BlockHeader>
              <BodyText>
                Prior to live deployment, all agentic strategies undergo rigorous stress testing utilizing TYI within our proprietary sandbox. This isolates financial risk, allowing users to validate logic, monitor slippage parameters, and assess UGF impact before committing actual capital to the active protocol state.
              </BodyText>
              <ActionButton>
                <span>View Sandbox Docs</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </ActionButton>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </MissionSection>

      {/* Regulatory Compliance */}
      <ComplianceSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Regulatory<br />Compliance</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ComplianceList>
              {[
                {
                  title: 'EU AI ACT: ARTICLE 50',
                  icon: 'gavel',
                  text: 'SPECTRA is engineered with deep transparency mechanisms to satisfy the disclosure obligations outlined in Article 50 of the EU AI Act. Users are unambiguously informed when they are interacting with an autonomous AI system. Agentic execution paths are logged, immutable, and fully auditable by relevant authorities upon request.',
                },
                {
                  title: 'OPERATIONAL TRANSPARENCY',
                  icon: 'visibility',
                  text: 'The "Design Shift" interface enforces structural clarity. When the system transitions from Idle (human-driven) to Active (agent-driven), visual state changes are mandatory and overt. We reject obfuscation; raw data streams and execution rationale are surfaced directly to the user interface, ensuring deterministic predictability.',
                },
                {
                  title: 'HUMAN-IN-THE-LOOP (EIP-712)',
                  icon: 'fingerprint',
                  text: 'High-impact capital allocations require cryptographic consent. SPECTRA implements EIP-712 typed structured data hashing to enforce Human-in-the-Loop (HITL) constraints. Agents may propose complex multi-step strategies, but execution is physically blocked until explicit, on-chain signature verification is provided by the human principal.',
                },
              ].map((item) => (
                <ComplianceItem key={item.title}>
                  <ItemHeader>
                    <ItemTitle>{item.title}</ItemTitle>
                    <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>{item.icon}</span>
                  </ItemHeader>
                  <ItemText>{item.text}</ItemText>
                </ComplianceItem>
              ))}
            </ComplianceList>
          </ContentCol>
        </SectionGrid>
      </ComplianceSection>
    </Page>
  );
}
