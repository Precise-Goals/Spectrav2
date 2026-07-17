import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

// --- Styled Components ---

const Section = styled.section`
  width: 100%;
  padding: 2rem 2rem 4rem;
  position: relative;
  z-index: 10;
  overflow: hidden;
`;

const TerminalWrapper = styled(motion.div)`
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(176, 38, 255, 0.2);
  border-radius: 16px;
  background: rgba(10, 10, 11, 0.6);
  backdrop-filter: blur(16px);
  overflow: hidden;
`;

const TerminalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const TerminalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
`;

const TerminalDots = styled.div`
  display: flex;
  gap: 0.4rem;
  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const scrollUp = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

const ScrollTrack = styled.div`
  height: 120px;
  overflow: hidden;
  padding: 1rem 1.5rem;
`;

const ScrollContent = styled.div`
  animation: ${scrollUp} 18s linear infinite;
  &:hover { animation-play-state: paused; }
`;

const LogLine = styled.div`
  font-family: 'Geist Mono', monospace;
  font-size: 0.78rem;
  line-height: 2;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;

  span.timestamp { color: rgba(176, 38, 255, 0.7); margin-right: 0.5rem; }
  span.highlight { color: rgba(255, 255, 255, 0.8); }
  span.success { color: rgba(100, 255, 150, 0.7); }
  span.warn { color: rgba(255, 200, 80, 0.7); }
`;

// --- Data ---
const logs = [
  { time: '14:23:01', text: 'Agent 0xF2...3a executing swap on Arbitrum: ', accent: '10 ETH → USDC', type: '' },
  { time: '14:23:02', text: 'UGF Relayer confirming meta-transaction ', accent: '0x8a...ff', type: '' },
  { time: '14:23:05', text: 'Yield sweep completed. ', accent: '+45.2 USDC', type: 'success', suffix: ' added to vault.' },
  { time: '14:23:08', text: 'Agent 0xA1...cc balancing ', accent: 'Curve pool LP', type: '' },
  { time: '14:23:12', text: 'Subscriptive NFT renewal processed for User ', accent: '0x77...b2', type: '' },
  { time: '14:23:15', text: 'Gas sponsored via UGF. Fee saved: ', accent: '0.002 ETH', type: 'success' },
  { time: '14:23:19', text: 'Cross-chain bridge initiated: ', accent: 'ETH → Arbitrum', type: 'warn' },
  { time: '14:23:22', text: 'Slippage guard triggered. ', accent: 'Re-routing...', type: 'warn' },
];

const LogItem = ({ time, text, accent, type, suffix }) => (
  <LogLine>
    <span className="timestamp">[{time}]</span>
    {text}
    <span className={type || 'highlight'}>{accent}</span>
    {suffix}
  </LogLine>
);

export default function LiveTerminal() {
  return (
    <Section>
      <TerminalWrapper
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ type: 'spring', damping: 25, stiffness: 80 }}
      >
        <TerminalHeader>
          <TerminalTitle>Live Terminal // Protocol Execution Feed</TerminalTitle>
          <TerminalDots>
            <span /><span /><span />
          </TerminalDots>
        </TerminalHeader>
        <ScrollTrack>
          <ScrollContent>
            {[...logs, ...logs].map((log, i) => (
              <LogItem key={i} {...log} />
            ))}
          </ScrollContent>
        </ScrollTrack>
      </TerminalWrapper>
    </Section>
  );
}
