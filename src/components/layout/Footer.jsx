import styled from 'styled-components';
import { Link } from 'react-router-dom';

/* ─── Styled Components ──────────────────────────────────────────────────────── */

const FooterEl = styled.footer`
  width: 100%;
  padding: 32px 64px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const Copyright = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-primary);
`;

const LinkGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;

  @media (min-width: 768px) {
    gap: 32px;
  }
`;

const FooterLink = styled(Link)`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
  text-decoration: none;

  &:hover {
    color: var(--color-primary);
  }
`;

/* ─── Component ──────────────────────────────────────────────────────────────── */
export default function Footer() {
  return (
    <FooterEl>
      <Copyright>© 2026 Spectra. Gasless Execution.</Copyright>
      <LinkGroup>
        <FooterLink to="/about">Documentation</FooterLink>
        <FooterLink to="/agent">Terminal</FooterLink>
        <FooterLink to="/exchange">Status</FooterLink>
        <FooterLink to="/legal">Privacy Policy</FooterLink>
        <FooterLink to="/about">EU AI Act Compliance</FooterLink>
      </LinkGroup>
    </FooterEl>
  );
}
