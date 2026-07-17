import styled from 'styled-components';
import { motion } from 'framer-motion';
import { CheckCircle2, Fingerprint } from 'lucide-react';

// --- Styled Components ---

const Card = styled(motion.div)`
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(176, 38, 255, 0.25);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
`;

const CardGlow = styled.div`
  position: absolute;
  top: -60px;
  right: -60px;
  width: 150px;
  height: 150px;
  background: rgba(176, 38, 255, 0.2);
  filter: blur(50px);
  border-radius: 50%;
  pointer-events: none;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const HeaderTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
`;

const CodePanel = styled.div`
  margin: 1.25rem 1.5rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  overflow-x: auto;
`;

const Pre = styled.pre`
  font-family: 'Geist Mono', monospace;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;

  .key { color: rgba(176, 38, 255, 0.8); }
  .value { color: rgba(255, 255, 255, 0.8); }
  .string { color: rgba(100, 220, 180, 0.8); }
  .number { color: rgba(255, 180, 80, 0.8); }
`;

const FieldGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0 1.5rem 1.25rem;
`;

const FieldRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  &:last-child { border-bottom: none; }
`;

const FieldLabel = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
`;

const FieldValue = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
`;

const SignButton = styled(motion.button)`
  margin: 0 1.5rem 1.5rem;
  width: calc(100% - 3rem);
  padding: 1rem;
  border-radius: 14px;
  background: linear-gradient(90deg, #B026FF, #7B26FF);
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.6rem;
  box-shadow: 0 4px 20px rgba(176, 38, 255, 0.35);
  transition: box-shadow 0.3s ease;
  &:hover { box-shadow: 0 8px 32px rgba(176, 38, 255, 0.55); }
`;

/**
 * @param {object} props
 * @param {{ action: string, amount: string, token: string }} props.intent
 * @param {function} props.onSign
 */
export default function IntentCard({ intent, onSign }) {
  if (!intent) return null;

  const jsonString = JSON.stringify({
    intent_id: '0x' + Math.random().toString(16).slice(2, 10) + '...',
    action: intent.action,
    amount: intent.amount,
    token: intent.token,
    estimated_fees: '~$0.00 (via UGF)',
  }, null, 2);

  return (
    <Card
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', damping: 22, stiffness: 100 }}
    >
      <CardGlow />

      <CardHeader>
        <CheckCircle2 size={18} color="#B026FF" />
        <HeaderTitle>Intent Parsed — Awaiting Signature</HeaderTitle>
      </CardHeader>

      <FieldGrid>
        <FieldRow>
          <FieldLabel>Action</FieldLabel>
          <FieldValue>{intent.action}</FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Amount</FieldLabel>
          <FieldValue>{intent.amount}</FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldLabel>Token</FieldLabel>
          <FieldValue>{intent.token}</FieldValue>
        </FieldRow>
      </FieldGrid>

      <CodePanel>
        <Pre dangerouslySetInnerHTML={{ __html: jsonString
          .replace(/"([^"]+)":/g, '<span class="key">"$1"</span>:')
          .replace(/: "([^"]+)"/g, ': <span class="string">"$1"</span>')
          .replace(/: (\d+\.?\d*)/g, ': <span class="number">$1</span>')
        }} />
      </CodePanel>

      <SignButton
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onSign && onSign(intent)}
      >
        <Fingerprint size={18} />
        Sign & Execute (EIP-712)
      </SignButton>
    </Card>
  );
}
