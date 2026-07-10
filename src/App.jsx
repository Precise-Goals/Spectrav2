import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import './styles/final.css'

const Home     = lazy(() => import('./pages/Home'));
const About    = lazy(() => import('./pages/About'));
const Agent    = lazy(() => import('./pages/Agent'));
const Exchange = lazy(() => import('./pages/Exchange'));
const Mint     = lazy(() => import('./pages/Mint'));
const Journal  = lazy(() => import('./pages/Journal'));
const Admin    = lazy(() => import('./pages/Admin'));
const Profile  = lazy(() => import('./pages/ProfileDashboard'));
const LegalPage = lazy(() => import('./pages/LegalPage'));

const LoaderWrap = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-primary);
  background: var(--bg);
`;

const Loader = () => <LoaderWrap>SPECTRA — LOADING...</LoaderWrap>;

export default function App() {
  return (
    <MainLayout>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/"         element={<Home />}     />
          <Route path="/about"    element={<About />}    />
          <Route path="/agent"    element={<Agent />}    />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/mint"     element={<Mint />}     />
          <Route path="/journal"  element={<Journal />}  />
          <Route path="/admin"    element={<Admin />}    />
          <Route path="/profile"  element={<Profile />}  />
          <Route path="/legal"    element={<LegalPage />} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}
