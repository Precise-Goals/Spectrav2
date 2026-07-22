import { useEffect } from 'react';
import styled from 'styled-components';
import { Zap, Shield } from 'lucide-react';

/* ─── YAGNI Ledger ─────────────────────────────────────────────────────────────
// Ponytail: Skipped heavy masonry layout libraries (like react-grid-layout). 
// Native CSS Grid with responsive spans handles a sleek bento layout efficiently.
──────────────────────────────────────────────────────────────────────────────── */

const Page = styled.div`
  min-height: 50vh;
  padding: 128px 24px 64px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
  color: #fff;
`;

const Header = styled.header`
  margin-bottom: 64px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const Pill = styled.div`
  font-family: 'Geist', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 255, 0.4);
  background: rgba(0, 0, 255, 0.1);
  color: rgba(0, 0, 255, 0.7);
  display: inline-block;
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
  
  span {
    color: blue;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #a1a1aa;
  max-width: 500px;
  line-height: 1.6;
  margin: 0;
`;

const BentoGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    grid-auto-rows: minmax(280px, auto);
  }
`;

const BentoCard = styled.div`
  background: rgba(10, 10, 11, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  


  /* Dynamic Spanning */
  @media (min-width: 1024px) {
    grid-column: ${props => props.$colSpan ? `span ${props.$colSpan}` : 'span 1'};
    grid-row: ${props => props.$rowSpan ? `span ${props.$rowSpan}` : 'span 1'};
  }
`;

const TweetContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  /* Tweet wrapper overrides to fit seamlessly */
  .twitter-tweet {
    margin: 0 !important;
    width: 100% !important;
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(0, 0, 255, 0.15);
  color: rgba(0, 0, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: auto;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 500;
  margin: 24px 0 8px;
  color: #ffffff;
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: #a1a1aa;
  line-height: 1.6;
  margin: 0;
`;

const LargeStat = styled.div`
  font-size: clamp(3rem, 5vw, 5rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  color: blue;
  margin-bottom: 16px;
`;

// Hook to natively load the Twitter Widget Script just-in-time
const useTwitterWidget = () => {
  useEffect(() => {
    // Only append if it doesn't already exist to prevent duplicates on remount
    if (!document.getElementById("twitter-wjs")) {
      const script = document.createElement("script");
      script.id = "twitter-wjs";
      script.src = "https://platform.x.com/widgets.js";
      script.async = true;
      script.charset = "utf-8";
      document.body.appendChild(script);
    } else if (window.twttr && window.twttr.widgets) {
      // If script exists and we re-rendered, trigger a widget load
      window.twttr.widgets.load();
    }
  }, []);
};

export default function Journal() {
  useTwitterWidget();

  return (
    <Page>
      <Header>
        {/* <Pill>Marketing & Growth</Pill> */}
        <Title>The Spectra <span>Network</span></Title>
        {/* <Subtitle>Discover the future of gasless execution. Follow our journey as we redefine decentralized agentic architectures.</Subtitle> */}
      </Header>

      <BentoGrid>
        
        {/* Main Tweet Block (Spans 2 columns, 2 rows) */}
        <BentoCard $colSpan={2} $rowSpan={2} style={{ padding: 0, border: 'none', background: "white" }}>
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
        </BentoCard>

        {/* Highlight Card 1 */}
        <BentoCard $colSpan={1} $rowSpan={1}>
          <CardIcon><Zap size={24} /></CardIcon>
          <CardTitle>Zero Gas Limits</CardTitle>
          <CardText>Experience fully abstracted meta-transactions powered by the UGF relayer network.</CardText>
        </BentoCard>

        {/* Highlight Card 2 */}
        <BentoCard $colSpan={1} $rowSpan={1}>
          <CardIcon><Shield size={24} /></CardIcon>
          <CardTitle>Bulletproof</CardTitle>
          <CardText>Military-grade multisig architecture wrapped in an impossibly simple interface.</CardText>
        </BentoCard>

        {/* Large Stat Card */}
        <BentoCard $colSpan={2} $rowSpan={1} style={{ justifyContent: 'center', background: 'linear-gradient(135deg, rgba(0,0,255,0.1), rgba(10,10,11,0.8))' }}>
          <LargeStat>Duality.</LargeStat>
          <CardTitle style={{ marginTop: 0 }}>Supported Ecosystems</CardTitle>
          <CardText>Spectra is a hybrid multichain engine that abstracts network boundaries by executing parallel Soroban actions using Freighter.</CardText>
        </BentoCard>

      </BentoGrid>
    </Page>
  );
}
