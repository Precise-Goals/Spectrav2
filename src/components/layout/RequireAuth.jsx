import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

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
  color: #b026ff;
  background: #0A0A0B;
`;

export default function RequireAuth({ children }) {
  const { isLoggedIn, profile, isLoadingProfile, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <LoaderWrap>INITIALIZING_SESSION...</LoaderWrap>;
  }

  if (!isLoggedIn) {
    // Redirect unauthenticated users to login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (isLoadingProfile) {
    // Wait until profile is fetched before deciding on route
    return <LoaderWrap>FETCHING_PROFILE_DATA...</LoaderWrap>;
  }

  if (!profile.exists && location.pathname !== '/profile') {
    // If they have no profile, force them to the profile page in onboarding mode
    return <Navigate to="/profile?mode=onboarding" replace />;
  }

  return children;
}
