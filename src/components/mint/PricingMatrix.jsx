import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

// --- Styled Components ---

const Wrapper = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const TierCard = styled(motion.div)`
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  cursor: pointer;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  background: ${({ active }) =>
    active
      ? 'linear-gradient(135deg, rgba(176,38,255,0.2) 0%, rgba(123,38,255,0.12) 100%)'
      : 'rgba(255,255,255,0.01)'};
  border-color: ${({ active }) =>
    active ? 'rgba(176,38,255,0.4)' : 'rgba(255,255,255,0.06)'};

  &:last-child { border-right: none; }
  &:hover { background: rgba(176, 38, 255, 0.06); }
`;

const ActiveGlow = styled(motion.div)`
  position: absolute;
  top: -40px;
  left: -40px;
  width: 120px;
  height: 120px;
  background: rgba(176, 38, 255, 0.3);
  filter: blur(40px);
  border-radius: 50%;
  pointer-events: none;
`;

const TierTop = styled.div``;

const TierName = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin-bottom: 0.5rem;
`;

const TierPrice = styled.div`
  display: inline-block;
  font-family: 'Geist Mono', monospace;
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  border: 1px solid ${({ active }) => active ? 'rgba(176,38,255,0.4)' : 'rgba(255,255,255,0.12)'};
  color: ${({ active }) => active ? 'rgba(176,38,255,0.9)' : 'rgba(255,255,255,0.5)'};
  background: ${({ active }) => active ? 'rgba(176,38,255,0.08)' : 'transparent'};
`;

const FeatureList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex-grow: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.78rem;
  color: ${({ muted }) => muted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)'};
  line-height: 1.5;
`;

const SelectLabel = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ active }) => active ? 'rgba(176,38,255,0.8)' : 'rgba(255,255,255,0.2)'};
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: auto;
  transition: color 0.25s ease;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.01);
`;

const StatCell = styled.div`
  padding: 0.85rem 1.25rem;
  border-right: 1px solid rgba(255, 255, 255, 0.04);
  &:last-child { border-right: none; }
`;

const StatLabel = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.25);
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const OnlineDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(100, 220, 150, 0.8);
  box-shadow: 0 0 6px rgba(100, 220, 150, 0.5);
`;

// --- Data ---
const tiers = [
  {
    id: 'alpha',
    name: 'ALPHA',
    price: '100 XLM',
    cost: 100,
    features: [
      { text: 'Read-only terminal access', enabled: true },
      { text: 'Public data feeds', enabled: true },
      { text: 'Agent deployment', enabled: false },
    ],
    label: 'SELECT [ A ]',
  },
  {
    id: 'vector',
    name: 'VECTOR',
    price: '150 XLM',
    cost: 150,
    features: [
      { text: 'Standard terminal access', enabled: true },
      { text: 'Private data channels', enabled: true },
      { text: '1 Concurrent Agent', enabled: true },
    ],
    label: 'SELECT [ V ]',
  },
  {
    id: 'nexus',
    name: 'NEXUS',
    price: '300 XLM',
    cost: 300,
    features: [
      { text: 'Root terminal access', enabled: true },
      { text: 'Unlimited data pipelines', enabled: true },
      { text: 'Infinite Agent swarm', enabled: true },
    ],
    label: 'ACTIVE SELECTION',
  },
];

/**
 * @param {object} props
 * @param {string} props.selectedTier  tier id
 * @param {function} props.onSelectTier
 */
export default function PricingMatrix({ selectedTier = 'nexus', onSelectTier }) {
  return (
    <Wrapper
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', damping: 25, stiffness: 80 }}
    >
      <Label>Select Access Tier</Label>
      <Grid>
        {tiers.map((tier) => {
          const active = selectedTier === tier.id;
          return (
            <TierCard
              key={tier.id}
              active={active}
              onClick={() => onSelectTier && onSelectTier(tier)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {active && <ActiveGlow initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
              <TierTop>
                <TierName>{tier.name}</TierName>
                <TierPrice active={active}>{tier.price}</TierPrice>
              </TierTop>
              <FeatureList>
                {tier.features.map((f) => (
                  <FeatureItem key={f.text} muted={!f.enabled}>
                    {f.enabled
                      ? <Check size={12} color="rgba(176,38,255,0.7)" style={{ flexShrink: 0, marginTop: 2 }} />
                      : <X size={12} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0, marginTop: 2 }} />}
                    {f.text}
                  </FeatureItem>
                ))}
              </FeatureList>
              <SelectLabel active={active}>
                {active ? tier.label : tier.label}
              </SelectLabel>
            </TierCard>
          );
        })}
      </Grid>

      <StatsRow>
        <StatCell>
          <StatLabel>Total Minted</StatLabel>
          <StatValue>12,408</StatValue>
        </StatCell>
        <StatCell>
          <StatLabel>Network Fee</StatLabel>
          <StatValue>0.01 XLM</StatValue>
        </StatCell>
        <StatCell>
          <StatLabel>Contract Status</StatLabel>
          <StatValue><OnlineDot /> Online [ 184A ]</StatValue>
        </StatCell>
      </StatsRow>
    </Wrapper>
  );
}
