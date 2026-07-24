import styled from 'styled-components';
import Navbar from '../Navbar';
import Footer from './Footer';

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  color: var(--color-primary);
`;

const PageContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

import { useLocation } from 'react-router-dom';

export default function MainLayout({ children }) {
  const location = useLocation();
  const hideNavFooter = location.pathname === '/onboarding';

  return (
    <Shell>
      {!hideNavFooter && <div className="scroll-progress-bar" />}
      {!hideNavFooter && <Navbar />}
      <PageContent>{children}</PageContent>
      {!hideNavFooter && <Footer />}
    </Shell>
  );
}
