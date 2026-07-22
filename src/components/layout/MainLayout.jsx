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

export default function MainLayout({ children }) {
  return (
    <Shell>
      <div className="scroll-progress-bar" />
      <Navbar />
      <PageContent>{children}</PageContent>
      <Footer />
    </Shell>
  );
}
