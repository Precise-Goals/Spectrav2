import { useState } from 'react';
import styled from 'styled-components';
import GlassTerminal from '../components/agent/GlassTerminal';

const PageWrap = styled.main`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px 64px;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  min-height: 100vh;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const DotBg = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 24px 24px;

  [data-theme='light'] & {
    background-image: radial-gradient(circle at 50% 50%, rgba(9, 9, 11, 0.03) 1px, transparent 1px);
  }
`;

const ContentLayout = styled.div`
  display: flex;
  width: 100%;
  gap: 24px;
  align-items: stretch;
  z-index: 1;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const ChartContainer = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(10,10,11,0.8);
  padding: 12px 16px;
`;

const ChartTitle = styled.div`
  font-family: 'Geist Mono', monospace;
  color: #fff;
  font-size: 14px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const TokenSelect = styled.select`
  background: #0a0a0c;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.2);
  padding: 8px 12px;
  font-family: 'Geist Mono', monospace;
  font-size: 12px;
  outline: none;
  cursor: pointer;

  &:hover {
    border-color: rgba(176,38,255,0.5);
  }
`;

const TerminalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const TRADING_VIEW_SYMBOL = {
  XLM: "BINANCE:XLMUSDT",
  USDC: "BINANCE:USDCUSDT",
  EURC: "KRAKEN:EURUSD",
};

export default function Agent() {
  return (
    <PageWrap className="bg-grid-overlay">
      <DotBg />
      <GlassTerminal />
    </PageWrap>
  );
}
