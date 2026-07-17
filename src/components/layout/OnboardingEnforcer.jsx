import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProfile } from '../../lib/stellar/contracts/profile';

export default function OnboardingEnforcer({ children }) {
  const { stellarPublicKey, isStellarConnected } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const activeAccount = stellarPublicKey;
    
    // Don't enforce onboarding if they are already on the profile page or home page
    if (!activeAccount || location.pathname === '/profile' || location.pathname === '/') {
      return;
    }

    let isMounted = true;

    const checkProfile = async () => {
      setIsChecking(true);
      try {
        let exists = false;
        if (isStellarConnected) {
          const profile = await getProfile(activeAccount);
          if (profile && profile.name) {
            exists = true;
          }
        }

        if (isMounted && !exists) {
          navigate('/profile?onboard=true', { replace: true });
        }
      } catch (err) {
        console.warn('[OnboardingEnforcer] check failed:', err);
      } finally {
        if (isMounted) setIsChecking(false);
      }
    };

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [stellarPublicKey, isStellarConnected, location.pathname, navigate]);

  return children;
}
