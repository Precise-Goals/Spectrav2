import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import './styles/final.css'

const Home     = lazy(() => import('./pages/Home'));
const About    = lazy(() => import('./pages/About'));
const Agent    = lazy(() => import('./pages/Agent'));
const Exchange = lazy(() => import('./pages/Exchange'));
const Mint     = lazy(() => import('./pages/Mint'));
const Journal  = lazy(() => import('./pages/Journal'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile  = lazy(() => import('./pages/ProfileDashboard'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const Login    = lazy(() => import('./pages/Login'));
const SpectraSupport = lazy(() => import('./pages/SpectraSupport'));

import RequireAuth from './components/layout/RequireAuth';

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

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  return (
    <MainLayout>
      <ScrollToTop />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<Home />}     />
          <Route path="/about"    element={<About />}    />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/journal"  element={<Journal />}  />
          
          {/* Secret Admin Routes */}
          <Route path={`/${import.meta.env.VITE_ADMIN_URL}`} element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* <Route path="/profile"  element={<Profile />}  /> */}
          <Route path="/legal"    element={<LegalPage />} />
          <Route path="/login"    element={<Login />}    />
          <Route path="/spectra"  element={<SpectraSupport />} />

          {/* Protected Routes */}
          <Route path="/agent" element={<RequireAuth><Agent /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/mint" element={<RequireAuth><Mint /></RequireAuth>} />
        </Routes>
      </Suspense>
    </MainLayout>
  );
}
