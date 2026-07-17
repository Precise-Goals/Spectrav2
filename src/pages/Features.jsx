import styled from 'styled-components';
import FeaturesGrid from '../components/home/FeaturesGrid';

const FeaturesWrapper = styled.div`
  padding-top: 8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.spectraBlack};
  color: ${({ theme }) => theme.colors.spectraWhite};
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 2rem;
`;

const Features = () => {
  return (
    <FeaturesWrapper>
      <Title>Core Features</Title>
      <FeaturesGrid />
    </FeaturesWrapper>
  );
};

export default Features;
