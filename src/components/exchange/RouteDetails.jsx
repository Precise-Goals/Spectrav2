import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Zap } from 'lucide-react';

// --- Styled Components ---

const Container = styled(motion.div)`
  width: 100%;
  max-width: 480px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  &:last-of-type { border-bottom: none; }
`;

const RowLabel = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
`;

const RowValue = styled.span`
  font-family: 'Geist Mono', monospace;
  font-size: 0.85rem;
  color: ${({ highlight }) => highlight ? '#ffffff' : 'rgba(255,255,255,0.65)'};
  font-weight: ${({ highlight }) => highlight ? '600' : '400'};
  display: flex;
  align-items: center;
  gap: 0.35rem;
`;

const GasZero = styled.span`
  color: rgba(100, 220, 150, 0.85);
  font-weight: 600;
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.04);
  margin: 0;
`;

const RouteRow = styled(Row)`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover { background: rgba(176, 38, 255, 0.04); }
`;

const RouteChevron = styled(motion.div)`
  color: rgba(255, 255, 255, 0.25);
`;

const RouteExpanded = styled(motion.div)`
  overflow: hidden;
`;

const RouteDetail = styled.div`
  padding: 0.75rem 1.25rem;
  font-family: 'Geist Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

/**
 * @param {object} props
 * @param {string} props.exchangeRate  e.g. "1 TYI = 0.00042 ETH"
 * @param {string} props.slippage      e.g. "0.5%"
 */
export default function RouteDetails({ exchangeRate = '1 TYI = --', slippage = '0.5%' }) {
  const [routeOpen, setRouteOpen] = useState(false);

  return (
    <Container
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, type: 'spring', damping: 25, stiffness: 100 }}
    >
      <Row>
        <RowLabel>Exchange Rate</RowLabel>
        <RowValue>{exchangeRate}</RowValue>
      </Row>
      <Row>
        <RowLabel>Gas Fee</RowLabel>
        <RowValue>
          <GasZero>0 ETH</GasZero>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>via UGF</span>
        </RowValue>
      </Row>
      <Row>
        <RowLabel>Slippage Tolerance</RowLabel>
        <RowValue>{slippage}</RowValue>
      </Row>
      <RouteRow onClick={() => setRouteOpen((v) => !v)}>
        <RowLabel>Route</RowLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RowValue highlight>
            <Zap size={12} color="rgba(176,38,255,0.8)" />
            Spectra AMM · Optimized
          </RowValue>
          <RouteChevron animate={{ rotate: routeOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown size={14} color="rgba(255,255,255,0.3)" />
          </RouteChevron>
        </div>
      </RouteRow>
      <AnimatePresence>
        {routeOpen && (
          <RouteExpanded
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <RouteDetail>
              <Zap size={11} color="rgba(176,38,255,0.5)" />
              TYI → Spectra Pool → Output Token
            </RouteDetail>
            <RouteDetail>
              Price impact: {'<'} 0.01% · Protocol fee: 0.00%
            </RouteDetail>
          </RouteExpanded>
        )}
      </AnimatePresence>
    </Container>
  );
}
