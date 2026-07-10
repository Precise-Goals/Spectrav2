import React from 'react';
import styled from 'styled-components';

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

const PageTitle = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--color-primary);
  margin-bottom: 24px;
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

const HeroDivider = styled.div`
  width: 100%;
  height: 1px;
  background: var(--border-color);
  margin-top: 48px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(12, 1fr);
  }
`;

const StickyCol = styled.div`
  grid-column: span 12;
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
  grid-column: span 12;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (min-width: 768px) {
    grid-column: span 8;
  }
`;

const ContentBlock = styled.div`
  border: 1px solid var(--border-color);
  padding: 32px;
  background: var(--bg-surface);
`;

const BlockTitle = styled.h3`
  font-family: 'Geist', monospace;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
  margin-bottom: 16px;
`;

const BodyText = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-primary);
  opacity: 0.87;
  margin-bottom: 12px;
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

export default function PrivacyPolicy() {
  return (
    <Page>
      <HeroSection className="bg-grid-overlay">
        <Grid12>
          <ColSpan8>
            <PageTitle>[ PRIVACY POLICY ]</PageTitle>
          </ColSpan8>
        </Grid12>
        <HeroDivider />
      </HeroSection>
      
      <SectionGrid>
        <StickyCol>
          <StickyTitle>Data &amp;<br />Security</StickyTitle>
          <BodyText style={{ marginTop: '16px', color: 'var(--color-secondary)' }}>
            Last Updated: July 10, 2026
          </BodyText>
        </StickyCol>
        
        <ContentCol>
          <ContentBlock>
            <BodyText>
              Spectra ("we", "our", or "the Platform") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Services.
            </BodyText>
          </ContentBlock>

          <ContentBlock>
            <BlockTitle>Information We Collect</BlockTitle>
            <List>
              <ListItem>Wallet addresses and on-chain transaction data</ListItem>
              <ListItem>Natural language inputs processed through Sarvam AI for intent parsing</ListItem>
              <ListItem>Subscription tier and usage statistics</ListItem>
              <ListItem>Standard technical data (IP address, browser information)</ListItem>
            </List>
          </ContentBlock>

          <ContentBlock>
            <BlockTitle>How We Use Your Information</BlockTitle>
            <List>
              <ListItem>To provide the GlassTerminal conversational interface</ListItem>
              <ListItem>To execute gasless transactions via the Universal Gas Framework</ListItem>
              <ListItem>To manage subscriptions and Soulbound NFT access</ListItem>
              <ListItem>To improve platform performance and security</ListItem>
              <ListItem>To comply with regulatory requirements including EU AI Act transparency</ListItem>
            </List>
          </ContentBlock>

          <ContentBlock>
            <BlockTitle>Data Sharing</BlockTitle>
            <BodyText>
              We do not sell personal data. Information may be shared with:
            </BodyText>
            <List>
              <ListItem>Tychi Labs (for UGF gasless execution)</ListItem>
              <ListItem>Sarvam AI (for natural language processing)</ListItem>
              <ListItem>Public blockchains (inherent to all on-chain activity)</ListItem>
            </List>
          </ContentBlock>

          <ContentBlock>
            <BlockTitle>Your Rights &amp; Security</BlockTitle>
            <BodyText>
              All high-impact actions require your explicit EIP-712 cryptographic consent. You are responsible for securing your own wallet and private keys. On-chain data is immutable by nature.
            </BodyText>
          </ContentBlock>

          <ContentBlock>
            <BlockTitle>Changes &amp; Contact</BlockTitle>
            <BodyText>
              <strong>Changes:</strong> We may update this policy. Continued use of Spectra after changes means you accept the updated terms.
            </BodyText>
            <BodyText>
              <strong>Contact:</strong> For questions, reach out through our official community channels.
            </BodyText>
            <BodyText style={{ marginTop: '16px', fontSize: '14px', color: 'var(--color-secondary)' }}>
              <em>This policy does not constitute legal advice. Spectra operates on public blockchains.</em>
            </BodyText>
          </ContentBlock>
        </ContentCol>
      </SectionGrid>
    </Page>
  );
}
