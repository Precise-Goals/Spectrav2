import styled from 'styled-components';
import { motion } from 'framer-motion';

const GridContainer = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.colors.spectraBlack};
  width: 100%;
  min-height: 50vh;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureCard = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.colors.spectraWhite};
  padding: 3rem 2rem;
  color: ${({ theme }) => theme.colors.spectraWhite};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.5rem;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  p {
    font-size: 1rem;
    font-weight: 300;
    line-height: 1.6;
    opacity: 0.8;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.spectraWhite};
    color: ${({ theme }) => theme.colors.spectraBlack};
    border-bottom: 8px solid ${({ theme }) => theme.colors.neonPurple};
    
    p {
      opacity: 1;
    }
  }
`;

const features = [
  {
    title: "Unified Web3 Exchange",
    description: "Sleek, minimal interface connected to Base Sepolia liquidity pools with zero-gas routing."
  },
  {
    title: "Autonomous Agentic Wallet",
    description: "Natural language intent processing powered by AI. Sign transactions without native gas fees."
  },
  {
    title: "Subscriptive NFT Engine",
    description: "Gated minting for premium tiers. Dynamic NFTs that evolve with your platform interaction."
  }
];

const FeaturesGrid = () => {
  return (
    <GridContainer>
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </FeatureCard>
      ))}
    </GridContainer>
  );
};

export default FeaturesGrid;
