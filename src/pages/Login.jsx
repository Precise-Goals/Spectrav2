import { useState,useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, Hexagon } from "lucide-react";
import { isConnected } from '@stellar/freighter-api';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #0A0A0B;
  color: #fff;
  padding: 24px;
`;

const LoginBox = styled.div`
  background: blue;
  border: 1px solid #27272a;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  position: relative;
  font-family: "Poppins", sans-serif;
  box-shadow: -12px 12px 0 2px white;
`;

const Title = styled.h1`
  font-size: 50px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
`;

const Description = styled.p`
  font-family: 'Geist Mono', monospace;
  font-size: 14px;
  color: #a0a0a0;
  margin-bottom: 32px;
`;

const ConnectBtn = styled.button`
  width: 100%;
  background: black;
  border: 1px solid rgba(var(--color-primary-rgb, 0, 85, 255), 0.3);
  color: #fff;
  padding: 14px;
  font-family: "Poppins", sans-serif;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all ease .5s;
  margin-bottom: 12px;

  &:hover {
    background: white;
    color: black;
    border-color: var(--color-primary);
    box-shadow: 0 0 16px rgba(var(--color-primary-rgb, 0, 85, 255), 0.2);
  }

  &:disabled {
    background: #333;
    color: #888;
    cursor: not-allowed;
    border-color: #444;
    box-shadow: none;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  margin-top: 16px;
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
`;

export default function Login() {
  const { connectWallet, isLoggedIn, profile, isLoadingProfile, isInitialized } = useAuth();
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasFreighter, setHasFreighter] = useState(false);
  const navigate = useNavigate();

  // Detect Freighter on mount
  useEffect(() => {
    let mounted = true;
    const checkFreighter = async () => {
      try {
        if (window.freighterApi || window.freighter) {
          if (mounted) setHasFreighter(true);
          return;
        }
        const { isConnected: freighterDetected } = await isConnected();
        if (mounted && freighterDetected) {
          setHasFreighter(true);
        }
      } catch (e) {
        console.warn('Freighter detection failed', e);
      }
    };
    checkFreighter();
    // Also re-check after a brief delay for slow injections
    const timer = setTimeout(checkFreighter, 500);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!isInitialized) {
    return (
      <LoginContainer>
        <Description style={{ color: '#b026ff', letterSpacing: '0.2em', textTransform: 'uppercase' }}>INITIALIZING_SESSION...</Description>
      </LoginContainer>
    );
  }

  // If already logged in, redirect them away
  if (isLoggedIn) {
    if (isLoadingProfile) {
      return (
        <LoginContainer>
          <LoginBox>
            <Description>Syncing Profile Data...</Description>
          </LoginBox>
        </LoginContainer>
      );
    }
    if (!profile.exists) {
      return <Navigate to="/profile?mode=onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  const handleStellarConnect = async () => {
    setError('');
    setIsConnecting(true);
    try {
      await connectWallet('stellar');
    } catch (err) {
      setError(err.message || 'Failed to connect Stellar wallet');
      setIsConnecting(false);
    }
  };

  return (
    <LoginContainer>
      <LoginBox>
        <Title>Login.</Title>
        <p style={{ margin:"2%",marginBottom:"4%", textAlign: "center" }}>
             Get Started with your First Swapping Transaction, authenticate now.
            </p>
            
        {hasFreighter ? (
          <ConnectBtn onClick={handleStellarConnect} disabled={isConnecting}>
            <Hexagon size={18} />
            {isConnecting ? 'CONNECTING...' : 'Connect Freighter'}
          </ConnectBtn>
        ) : (
          <ConnectBtn 
            as="a" 
            href="https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Hexagon size={18} />
            Install Freighter
          </ConnectBtn>
        )}
        
        {error && <ErrorText>{error}</ErrorText>}
      </LoginBox>
    </LoginContainer>
  );
}
