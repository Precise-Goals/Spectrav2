import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Eye, Fingerprint, ChevronDown } from 'lucide-react';

// --- Styled Components ---

const Section = styled.section`
  padding: 0 2rem 7rem;
  max-width: 1100px;
  margin: 0 auto;
  position: relative;
  z-index: 10;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
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

const AccordionContainer = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.01);
`;

const AccordionItem = styled(motion.div)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  &:last-child { border-bottom: none; }
`;

const AccordionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.75rem 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.25s ease;

  &:hover { background: rgba(176, 38, 255, 0.04); }
`;

const AccordionLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconBox = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(176, 38, 255, 0.1);
  border: 1px solid rgba(176, 38, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const ItemTitle = styled.h4`
  font-family: 'Geist Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
`;

const ChevronIcon = styled(motion.div)`
  color: rgba(176, 38, 255, 0.6);
  flex-shrink: 0;
`;

const AccordionBody = styled(motion.div)`
  overflow: hidden;
`;

const AccordionContent = styled.div`
  padding: 0 2rem 1.75rem 4.5rem;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.48);
  line-height: 1.75;
`;

// --- Data ---
const items = [
  {
    id: 'eu-ai-act',
    icon: Gavel,
    title: 'EU AI Act: Article 50',
    content:
      'SPECTRA is engineered with deep transparency mechanisms to satisfy the disclosure obligations outlined in Article 50 of the EU AI Act. Users are unambiguously informed when they are interacting with an autonomous AI system. Agentic execution paths are logged, immutable, and fully auditable by relevant authorities upon request.',
  },
  {
    id: 'transparency',
    icon: Eye,
    title: 'Operational Transparency',
    content:
      'The "Design Shift" interface enforces structural clarity. When the system transitions from Idle (human-driven) to Active (agent-driven), visual state changes are mandatory and overt. We reject obfuscation; raw data streams and execution rationale are surfaced directly to the user interface, ensuring deterministic predictability.',
  },
  {
    id: 'hitl',
    icon: Fingerprint,
    title: 'Human-in-the-Loop (EIP-712)',
    content:
      'High-impact capital allocations require cryptographic consent. SPECTRA implements EIP-712 typed structured data hashing to enforce Human-in-the-Loop (HITL) constraints. Agents may propose complex multi-step strategies, but execution is physically blocked until explicit, on-chain signature verification is provided by the human principal.',
  },
];

export default function ComplianceBanner() {
  const [open, setOpen] = useState('hitl'); // default open

  return (
    <Section>
      <TwoCol>
        <StickyLabel>
          <SectionLabel>Regulatory<br />Compliance</SectionLabel>
        </StickyLabel>
        <AccordionContainer>
          {items.map(({ id, icon: Icon, title, content }) => {
            const isOpen = open === id;
            return (
              <AccordionItem key={id}>
                <AccordionHeader onClick={() => setOpen(isOpen ? null : id)}>
                  <AccordionLeft>
                    <IconBox>
                      <Icon size={16} color="rgba(176,38,255,0.8)" />
                    </IconBox>
                    <ItemTitle>{title}</ItemTitle>
                  </AccordionLeft>
                  <ChevronIcon animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={18} />
                  </ChevronIcon>
                </AccordionHeader>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <AccordionBody
                      key="body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <AccordionContent>{content}</AccordionContent>
                    </AccordionBody>
                  )}
                </AnimatePresence>
              </AccordionItem>
            );
          })}
        </AccordionContainer>
      </TwoCol>
    </Section>
  );
}
