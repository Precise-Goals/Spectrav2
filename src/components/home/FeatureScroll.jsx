import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';

// --- Styled Components ---

const Section = styled.section`
  width: 100%;
  padding: 6rem 2rem;
  position: relative;
  z-index: 10;
`;

const SectionHeader = styled.div`
  max-width: 1100px;
  margin: 0 auto 3rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 1.25rem;
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
`;

const SectionTag = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Grid = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled(motion.div)`
  background: rgba(10, 10, 11, 0.7);
  backdrop-filter: blur(12px);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.3s ease;
  cursor: default;

  &:last-child { border-right: none; }
  &:hover { background: rgba(176, 38, 255, 0.04); }
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(176, 38, 255, 0.1);
  border: 1px solid rgba(176, 38, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
`;

const CardIndex = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.65rem;
  color: rgba(176, 38, 255, 0.6);
  border: 1px solid rgba(176, 38, 255, 0.2);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.08em;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.01em;
`;

const CardDesc = styled.p`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.65;
  flex-grow: 1;
`;

const FeatureList = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FeatureLabel = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 0.25rem;
  display: block;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.78rem;
  color: ${({ muted }) => muted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.65)'};
`;

// --- Data ---
const features = [
  {
    icon: '⇄',
    index: '[ 01 ]',
    title: 'Unified Exchange',
    desc: 'Aggregate liquidity across multiple ecosystems instantly. Execute trades with zero slippage tolerance configured via agentic models.',
    listLabel: 'Supported Protocols',
    items: [
      { text: 'Uniswap V3', enabled: true },
      { text: 'Curve Finance', enabled: true },
      { text: 'Balancer', enabled: true },
    ],
  },
  {
    icon: '◎',
    index: '[ 02 ]',
    title: 'Agentic Wallet',
    desc: 'Self-managing treasury protocols. Define risk thresholds once; the agent allocates, compounds, and secures assets autonomously.',
    listLabel: 'Security Features',
    items: [
      { text: 'EIP-712 Signatures', enabled: true },
      { text: 'Multi-sig Thresholds', enabled: true },
      { text: 'HSM Integration', enabled: true },
    ],
  },
  {
    icon: '◈',
    index: '[ 03 ]',
    title: 'Subscriptive NFTs',
    desc: 'Programmable utility layers. Issue tokens that auto-renew access to decentralized services based on yield generated within the wallet.',
    listLabel: 'Tier Benefits',
    items: [
      { text: 'Base: Gas Abstraction', enabled: true },
      { text: 'Pro: Priority Routing', enabled: true },
      { text: 'Max: Zero Protocol Fees', enabled: true },
    ],
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 70, delay: i * 0.12 },
  }),
};

export default function FeatureScroll() {
  return (
    <Section>
      <SectionHeader>
        <SectionTitle
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Core Modules
        </SectionTitle>
        <SectionTag>[ V 2.4.0 ]</SectionTag>
      </SectionHeader>

      <Grid>
        {features.map((f, i) => (
          <Card
            key={f.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <CardTop>
              <IconWrapper>{f.icon}</IconWrapper>
              <CardIndex>{f.index}</CardIndex>
            </CardTop>
            <CardTitle>{f.title}</CardTitle>
            <CardDesc>{f.desc}</CardDesc>
            <FeatureList>
              <FeatureLabel>{f.listLabel}</FeatureLabel>
              {f.items.map((item) => (
                <FeatureItem key={item.text} muted={!item.enabled}>
                  {item.enabled
                    ? <CheckCircle size={13} color="rgba(176,38,255,0.7)" />
                    : <XCircle size={13} color="rgba(255,255,255,0.2)" />}
                  {item.text}
                </FeatureItem>
              ))}
            </FeatureList>
          </Card>
        ))}
      </Grid>
    </Section>
  );
}
