import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/final.css';

/* ─── Styled Components (matching Spectra design system) ─────────────────── */

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  background-image: radial-gradient(var(--dot-color) 1px, transparent 1px);
  background-size: 24px 24px;
  padding: 64px 24px;
  position: relative;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 440px;
  background: var(--bg);
  border: 1px solid blue;
  box-shadow: -9px 9px 0 4px blue;
  padding: 48px;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 32px 24px;
    box-shadow: -6px 6px 0 3px blue;
  }
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  background: blue;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }
`;

const StatusLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const Title = styled.h1`
  font-family: 'Poppins', sans-serif;
  font-size: 48px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--color-primary);
  text-transform: uppercase;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Geist', monospace;
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
  margin-bottom: 32px;
`;

const ModeToggle = styled.div`
  display: flex;
  border: 1px solid var(--border-color);
  margin-bottom: 28px;
`;

const ModeTab = styled.button`
  flex: 1;
  padding: 10px;
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: ${props => props.$active ? 'blue' : 'var(--bg)'};
  color: ${props => props.$active ? '#ffffff' : 'var(--color-secondary)'};

  &:hover {
    color: ${props => props.$active ? '#ffffff' : 'var(--color-primary)'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-family: 'Geist', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const Input = styled.input`
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border-color);
  padding: 14px 16px;
  color: var(--color-primary);
  font-family: 'Geist', monospace;
  font-size: 13px;
  letter-spacing: 0.02em;
  outline: none;
  transition: border-color 0.2s ease;

  &::placeholder {
    color: var(--color-secondary);
    opacity: 0.5;
  }

  &:focus {
    border-color: blue;
  }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 16px 32px;
  border: 1px solid var(--border-color);
  background: var(--bg);
  color: var(--color-primary);
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .material-symbols-outlined {
    font-size: 18px;
    transition: transform 0.2s ease;
  }

  &:hover .material-symbols-outlined {
    transform: translateX(4px);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border-color);
  }

  span {
    font-family: 'Geist', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--color-secondary);
    padding: 0 16px;
  }
`;

const GoogleBtn = styled.button`
  width: 100%;
  padding: 14px 32px;
  border: 1px solid var(--border-color);
  background: var(--bg);
  color: var(--color-primary);
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ErrorBox = styled.div`
  font-family: 'Geist', monospace;
  font-size: 11px;
  letter-spacing: 0.02em;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 12px 16px;
  margin-top: 20px;
  background: var(--bg);
`;

const FooterMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
`;

const MetaLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function Login() {
  const {
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    isLoggedIn,
    isInitialized
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (!isInitialized) {
    return (
      <Page>
        <StatusBar>
          <PulseDot />
          <StatusLabel>INITIALIZING_SESSION...</StatusLabel>
        </StatusBar>
      </Page>
    );
  }

  if (isLoggedIn) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error('Display name is required');
        }
        await signupWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/onboarding', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-grid-overlay">
      <LoginCard>
        <StatusBar>
          <PulseDot />
          <StatusLabel>{isSignUp ? 'NEW_ACCOUNT' : 'AUTHENTICATE'}</StatusLabel>
        </StatusBar>

        <Title>{isSignUp ? 'Register' : 'Login.'}</Title>
        <Subtitle>
          {isSignUp
            ? 'Create your Spectra account to access AI-powered DeFi orchestration.'
            : 'Enter your credentials to access the Spectra protocol.'}
        </Subtitle>

        <ModeToggle>
          <ModeTab
            type="button"
            $active={!isSignUp}
            onClick={() => { setIsSignUp(false); setError(''); }}
          >
            Sign In
          </ModeTab>
          <ModeTab
            type="button"
            $active={isSignUp}
            onClick={() => { setIsSignUp(true); setError(''); }}
          >
            Register
          </ModeTab>
        </ModeToggle>

        <Form onSubmit={handleSubmit}>
          {isSignUp && (
            <InputGroup>
              <Label>Display Name</Label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignUp}
              />
            </InputGroup>
          )}

          <InputGroup>
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          <SubmitBtn type="submit" disabled={loading}>
            {loading ? 'PROCESSING...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
          </SubmitBtn>
        </Form>

        <Divider>
          <span>or continue with</span>
        </Divider>

        <GoogleBtn type="button" onClick={handleGoogleSignIn} disabled={loading}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </GoogleBtn>

        {error && <ErrorBox>{error}</ErrorBox>}

        <FooterMeta>
          <MetaLabel>SPECTRA_v2.0</MetaLabel>
          <MetaLabel>SECURE_AUTH</MetaLabel>
        </FooterMeta>
      </LoginCard>
    </Page>
  );
}
