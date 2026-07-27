import React, { Suspense, lazy, useEffect } from 'react';
import styled from 'styled-components';
import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { trackPageView, trackWebVitals } from './services/analyticsService';
import './styles/final.css';

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
const Onboarding = lazy(() => import('./pages/Onboarding'));
const SpectraSupport = lazy(() => import('./pages/SpectraSupport'));
const Guide      = lazy(() => import('./pages/Guide'));

import RequireAuth from './components/layout/RequireAuth';
import ConnectWalletModal from './components/ui/ConnectWalletModal';
import { useAuth } from './context/AuthContext';

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
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const StrictOnboardingEnforcer = () => {
  const { pathname } = useLocation();
  const { isLoggedIn, isInitialized, logout } = useAuth();

  useEffect(() => {
    if (!isInitialized || !isLoggedIn) return;
    
    // Check if onboarding is strictly complete
    const hasOnboarded = !!localStorage.getItem('spectra_onboarding');
    
    // If they leave the onboarding or login page without finishing, pull them out.
    if (!hasOnboarded && pathname !== '/onboarding' && pathname !== '/login') {
      console.warn("User left onboarding before completion. Strict enforcement: logging out.");
      logout();
    }
  }, [pathname, isLoggedIn, isInitialized, logout]);
  
  return null;
};

/**
 * Real-time Analytics Tracker for Vercel Web Vitals & Firebase User Activity
 */
const RealtimeAnalyticsTracker = () => {
  const location = useLocation();
  const { currentUser, userTier } = useAuth();

  useEffect(() => {
    // 1. Log actual page view in Firestore and Local storage
    trackPageView(location.pathname, currentUser, userTier);

    // 2. Measure Web Vitals on page navigation
    const timer = setTimeout(() => {
      trackWebVitals();
    }, 1500);

    return () => clearTimeout(timer);
  }, [location.pathname, currentUser, userTier]);

  return null;
};

export default function App() {
  return (
    <MainLayout>
      <ScrollToTop />
      <StrictOnboardingEnforcer />
      <RealtimeAnalyticsTracker />
      <ConnectWalletModal />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/"         element={<Home />}     />
          <Route path="/about"    element={<About />}    />
          <Route path="/journal"  element={<Journal />}  />
          <Route path="/guide"    element={<Guide />}    />
          
          {/* Secret Admin Routes */}
          <Route path={`/${import.meta.env.VITE_ADMIN_URL || 'secret-admin-portal'}`} element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          <Route path="/legal"    element={<LegalPage />} />
          <Route path="/login"    element={<Login />}    />

          {/* Protected Routes (Products & Pricing) */}
          <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
          <Route path="/agent" element={<RequireAuth><Agent /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/mint" element={<RequireAuth><Mint /></RequireAuth>} />
          <Route path="/exchange" element={<RequireAuth><Exchange /></RequireAuth>} />
          <Route path="/spectra" element={<RequireAuth><SpectraSupport /></RequireAuth>} />
        </Routes>
      </Suspense>

      {/* Vercel Analytics & Speed Insights components */}
      <Analytics />
      <SpeedInsights />
    </MainLayout>
  );
}
