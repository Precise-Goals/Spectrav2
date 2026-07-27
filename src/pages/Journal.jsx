import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Zap, Shield, Globe } from 'lucide-react';
import SEO from '../components/ui/SEO';

/* ─── Styled Components (Matching About/Guide) ───────────────────────────── */

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

const JournalSection = styled.section`
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
  display: flex;
  align-items: center;
  gap: 12px;
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

const TweetContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Overrides to make twitter embed fit seamlessly */
  .twitter-tweet {
    margin: 0 !important;
    width: 100% !important;
  }
`;

const LargeStat = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: clamp(3rem, 5vw, 5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  color: blue;
  margin-bottom: 24px;
  line-height: 1;
`;

const TwoColGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

// Hook to natively load the Twitter Widget Script just-in-time
const useTwitterWidget = () => {
  useEffect(() => {
    if (!document.getElementById("twitter-wjs")) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.x.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    } else if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load();
    }
  }, []);
};

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

export default function Journal() {
  useTwitterWidget();
  const pageRef = useScrollReveal();

  return (
    <Page ref={pageRef} className="bg-grid-overlay">
      <SEO 
        title="Spectra Journal — Decentralized Agentic Finance & News" 
        description="Explore the Spectra Web3 Journal for insights on gasless execution, autonomous AI agents, Soroban smart contracts, and DeFi innovations."
        keywords="Spectra Journal, Web3 News, Crypto Blog, Soroban DeFi, AI Agents, Gasless Crypto, Stellar News"
      />
      {/* Hero */}
      <HeroSection>
        <Grid12>
          <ColSpan8>
            <PageTitle>[ SPECTRA JOURNAL ]</PageTitle>
            <PageSubtitle>
              Discover the future of gasless execution. Follow our journey as we redefine decentralized agentic architectures and ecosystem growth.
            </PageSubtitle>
          </ColSpan8>
          <ColSpan4Right>
            <StatusBadge>
              <PulseDot />
              <StatusText>NETWORK: ONLINE</StatusText>
            </StatusBadge>
          </ColSpan4Right>
        </Grid12>
        <HeroDivider />
      </HeroSection>

      {/* Announcements */}
      <JournalSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Announcements</StickyTitle>
          </StickyCol>
          <ContentCol>
            <ContentBlock style={{ background: '#fff' }}>
              <TweetContainer>
                <blockquote className="twitter-tweet" data-theme="light">
                  <p lang="en" dir="ltr">
                    Web3&#39;s native gas bottleneck stops users. <br/>Spectra Wallet fix this with an AI agent &amp; zero-gas execution via UGF. ⚡
                    <a href="https://x.com/BuildOnStellar?ref_src=twsrc%5Etfw">@BuildOnStellar</a> 
                    <a href="https://x.com/riseinweb3?ref_src=twsrc%5Etfw">@riseinweb3</a> 
                    <a href="https://x.com/IND_stellar?ref_src=twsrc%5Etfw">@IND_stellar</a> 
                    <a href="https://x.com/StellarOrg?ref_src=twsrc%5Etfw">@StellarOrg</a> 
                    <a href="https://x.com/fair_communityy?ref_src=twsrc%5Etfw">@fair_communityy</a> 
                    <a href="https://x.com/hashtag/StellarBuildStation?src=hash&amp;ref_src=twsrc%5Etfw">#StellarBuildStation</a> 
                    <a href="https://x.com/hashtag/StellarBuildStationPune?src=hash&amp;ref_src=twsrc%5Etfw">#StellarBuildStationPune</a> 
                    <a href="https://x.com/hashtag/BuildOnStellar?src=hash&amp;ref_src=twsrc%5Etfw">#BuildOnStellar</a> 
                    <a href="https://x.com/hashtag/RiseIn?src=hash&amp;ref_src=twsrc%5Etfw">#RiseIn</a> 
                    <a href="https://x.com/hashtag/FAIRCommunity?src=hash&amp;ref_src=twsrc%5Etfw">#FAIRCommunity</a> 
                    <a href="https://t.co/ziinxfOZBy">pic.twitter.com/ziinxfOZBy</a>
                  </p>
                  &mdash; Spectra Ai - Agentic Wallet (@spectra_falcons) 
                  <a href="https://x.com/spectra_falcons/status/2075670710924828861?ref_src=twsrc%5Etfw">July 10, 2026</a>
                </blockquote>
              </TweetContainer>
            </ContentBlock>
          </ContentCol>
        </SectionGrid>
      </JournalSection>

      {/* Network Capabilities */}
      <JournalSection>
        <SectionGrid>
          <StickyCol>
            <StickyTitle>Network<br/>Capabilities</StickyTitle>
          </StickyCol>
          <ContentCol>
            
            <TwoColGrid>
              <ContentBlock>
                <BlockHeader>
                  <BlockTitle><Zap size={16} /> Zero Gas Limits</BlockTitle>
                </BlockHeader>
                <BodyText>
                  Experience fully abstracted meta-transactions powered by the UGF relayer network. Say goodbye to native token bottlenecks.
                </BodyText>
              </ContentBlock>

              <ContentBlock>
                <BlockHeader>
                  <BlockTitle><Shield size={16} /> Bulletproof</BlockTitle>
                </BlockHeader>
                <BodyText>
                  Military-grade multisig architecture wrapped in an impossibly simple interface designed for non-custodial security.
                </BodyText>
              </ContentBlock>
            </TwoColGrid>

            <ContentBlock>
              <BlockHeader>
                <BlockTitle><Globe size={16} /> Supported Ecosystems</BlockTitle>
                <BlockTag>[ CROSS-CHAIN ]</BlockTag>
              </BlockHeader>
              <LargeStat>Duality.</LargeStat>
              <BodyText>
                Spectra is a hybrid multichain engine that abstracts network boundaries by executing parallel Soroban actions seamlessly bridging Stellar and EVM environments without user friction.
              </BodyText>
            </ContentBlock>

          </ContentCol>
        </SectionGrid>
      </JournalSection>

    </Page>
  );
}
