import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// --- Styled Components ---

const Section = styled.section`
  padding: 7rem 2rem;
  position: relative;
  z-index: 10;
  max-width: 1100px;
  margin: 0 auto;
`;

const PageHeader = styled(motion.div)`
  margin-bottom: 5rem;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const EyebrowDot = styled.div`
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #B026FF;
  box-shadow: 0 0 8px #B026FF;
  animation: pulse 2s ease-in-out infinite;
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
`;

const EyebrowText = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(176, 38, 255, 0.8);
`;

const PageTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #ffffff;
  line-height: 1.05;
  margin-bottom: 1.5rem;
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.5);
  max-width: 640px;
  line-height: 1.7;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 5rem;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const StickyLabel = styled.div`
  position: sticky;
  top: 6rem;
  align-self: start;
`;

const SectionLabel = styled.h2`
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: -0.01em;
  line-height: 1.3;
`;

const ContentStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const GlassCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 20px;
  padding: 2rem;
  backdrop-filter: blur(12px);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const CardTitle = styled.h3`
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
`;

const CardBadge = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.65rem;
  color: rgba(176, 38, 255, 0.7);
  background: rgba(176, 38, 255, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  letter-spacing: 0.06em;
`;

const CardBody = styled.p`
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.7;
  margin-bottom: 1.25rem;
`;

const CodeBlock = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.8rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  color: rgba(176, 38, 255, 0.7);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const CodeLine = styled.span`
  color: rgba(255, 255, 255, 0.45);
  &::before { content: '> '; color: rgba(176, 38, 255, 0.5); }
`;

const CheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-top: 0.75rem;
`;

const CheckRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.5;
`;

const SandboxButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding: 0.7rem 1.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Geist Mono', monospace;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-size: 0.7rem;
  &:hover {
    color: #ffffff;
    border-color: rgba(176, 38, 255, 0.4);
    background: rgba(176, 38, 255, 0.06);
  }
`;

export default function MissionStatement() {
  return (
    <Section>
      <PageHeader
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <Eyebrow>
          <EyebrowDot />
          <EyebrowText>Transparency & Compliance</EyebrowText>
        </Eyebrow>
        <PageTitle>[ Transparency &<br />Compliance ]</PageTitle>
        <PageSubtitle>
          SPECTRA operates at the intersection of high-speed autonomous execution and rigorous regulatory adherence. Our architecture is designed to demystify complex Web3 interactions while maintaining an unyielding commitment to legal frameworks.
        </PageSubtitle>
      </PageHeader>

      <TwoCol>
        <StickyLabel>
          <SectionLabel>Mission Object</SectionLabel>
        </StickyLabel>
        <ContentStack>
          {/* Gas Abstraction */}
          <GlassCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', damping: 25, stiffness: 80 }}
          >
            <CardHeader>
              <CardTitle>Gas Abstraction</CardTitle>
              <CardBadge>UGF Architecture</CardBadge>
            </CardHeader>
            <CardBody>
              The Universal Gas Facility (UGF) represents a paradigm shift in autonomous transaction execution. By abstracting the underlying network fee mechanics, SPECTRA ensures that agents can execute complex, multi-step strategies without the friction of variable gas costs halting execution.
            </CardBody>
            <CodeBlock>
              <span style={{ color: 'rgba(176,38,255,0.5)', marginBottom: '0.25rem', fontSize: '0.7rem' }}>
                // Execution Flow
              </span>
              {['Agent Init', 'UGF Estimate', 'Relay Confirm', 'Transaction Success'].map((s) => (
                <CodeLine key={s}>{s}</CodeLine>
              ))}
            </CodeBlock>
          </GlassCard>

          {/* TYI */}
          <GlassCard
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ type: 'spring', damping: 25, stiffness: 80, delay: 0.1 }}
          >
            <CardHeader>
              <CardTitle>TYI Integration</CardTitle>
              <CardBadge>Sandbox Environment</CardBadge>
            </CardHeader>
            <CardBody>
              Prior to live deployment, all agentic strategies undergo rigorous stress testing utilizing TYI within our proprietary sandbox. This isolates financial risk, allowing users to validate logic, monitor slippage parameters, and assess UGF impact before committing actual capital to the active protocol state.
            </CardBody>
            <CheckList>
              {[
                'Isolated financial risk environment',
                'Slippage parameter validation',
                'UGF impact simulation',
              ].map((item) => (
                <CheckRow key={item}>
                  <CheckCircle size={15} color="rgba(176,38,255,0.7)" style={{ flexShrink: 0, marginTop: 2 }} />
                  {item}
                </CheckRow>
              ))}
            </CheckList>
            <SandboxButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Sandbox Docs →
            </SandboxButton>
          </GlassCard>
        </ContentStack>
      </TwoCol>
    </Section>
  );
}
