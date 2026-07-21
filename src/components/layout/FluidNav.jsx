import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import WalletSelectorModal from '../auth/WalletSelectorModal';

/* ─── Styled Components ──────────────────────────────────────────────────────── */

const NavWrap = styled.nav`
  position: fixed;
  top: 3.25%;
  left: 50%;
  transform: translateX(-50%);
  padding: 1.2% 2%;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 65%;
  margin: 0 auto;
  z-index: 50;

  @media (max-width: 768px) {
    padding: 12px 16px;
    top: 16px;
  }
`;

const NavInner = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
  justify-content: space-between;
`;

const Logo = styled(Link)`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-primary);
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: none;
  align-items: center;
  gap: 32px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled(Link)`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--color-secondary)'};
  text-decoration: none;
  border-bottom: ${({ $active }) => $active ? '1px solid var(--border-color)' : '1px solid transparent'};
  padding-bottom: 2px;

  &:hover {
    color: var(--color-primary);
  }
`;

const DropdownWrap = styled.div`
  position: relative;

  &:hover > div {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const DropdownTrigger = styled.span`
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $active }) => $active ? 'var(--color-primary)' : 'var(--color-secondary)'};
  cursor: pointer;
  padding-bottom: 2px;
  border-bottom: ${({ $active }) => $active ? '1px solid var(--border-color)' : '1px solid transparent'};
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: var(--color-primary);
  }
`;

const DropdownPanel = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 0;
  min-width: 160px;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    height: 12px;
  }
`;

const DropdownLink = styled(Link)`
  display: block;
  padding: 8px 16px;
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-secondary);
  text-decoration: none;
  transition: color 0.15s ease, background 0.15s ease;

  &:hover {
    color: var(--color-primary);
    background: var(--border-color);
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ProfileIcon = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-color);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AuthButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ $isGhost }) => $isGhost ? 'var(--color-secondary)' : 'var(--color-primary)'};
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: ${({ $isGhost }) => $isGhost ? '#ef4444' : 'var(--color-primary)'};
  }
`;

import { useAuth } from '../../context/AuthContext';

/* ─── Component ──────────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { to: '/agent',    label: 'Agent' },
  { to: '/exchange', label: 'Exchange' },
  { to: '/spectra',  label: 'Spectra AI' },
];

const RESOURCES = [
  { to: '/guide',    label: 'Guide' },
  { to: '/journal',  label: 'Journal' },
  { to: '/about',    label: 'About' },
];

export default function FluidNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, disconnectWallet } = useAuth();

  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().then(() => {
        setIsMuted(false);
        audioRef.current.muted = false;
      }).catch(e => {
        console.warn("Autoplay blocked by browser:", e);
        setIsMuted(true);
        audioRef.current.muted = true;
      });
    }
  }, []);

  const toggleMute = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(console.error);
        audioRef.current.muted = false;
        setIsMuted(false);
      } else {
        const nextMuted = !audioRef.current.muted;
        audioRef.current.muted = nextMuted;
        setIsMuted(nextMuted);
      }
    }
  };

  const handleLogout = () => {
    disconnectWallet();
  };

  // We will load avatarId from smart contract eventually, but for now we default to 1 if logged in
  const userData = { avatarId: 1 };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <NavWrap>
      <NavInner>
        <Logo to="/">SPECTRA</Logo>

        <NavLinks>
          <NavLink to="/" $active={location.pathname === '/'}>
            Home
          </NavLink>

          <DropdownWrap>
            <DropdownTrigger $active={PRODUCTS.some(p => location.pathname.startsWith(p.to))}>
              Products ▾
            </DropdownTrigger>
            <DropdownPanel>
              {PRODUCTS.map(({ to, label }) => (
                <DropdownLink key={to} to={to}>{label}</DropdownLink>
              ))}
            </DropdownPanel>
          </DropdownWrap>

          <DropdownWrap>
            <DropdownTrigger $active={RESOURCES.some(r => location.pathname.startsWith(r.to))}>
              Resources ▾
            </DropdownTrigger>
            <DropdownPanel>
              {RESOURCES.map(({ to, label }) => (
                <DropdownLink key={to} to={to}>{label}</DropdownLink>
              ))}
            </DropdownPanel>
          </DropdownWrap>

          <NavLink to="/mint" $active={location.pathname === '/mint'}>
            Pricing
          </NavLink>
        </NavLinks>

        <NavRight>
          <audio ref={audioRef} src="/aud.mp3" loop />
          <button 
            onClick={toggleMute} 
            title={isMuted ? "Play Music" : "Mute Music"}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: isMuted ? 'var(--color-secondary)' : 'var(--color-primary)', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center',
              padding: '4px'
            }}
          >
            {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
          </button>
          
          {isLoggedIn ? (
            <>
              <ProfileIcon onClick={handleProfileClick} title="Go to Profile">
                <img
                  src={`/profile/${userData.avatarId}.png`}
                  alt="Profile"
                  onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.avatarId; }}
                />
              </ProfileIcon>
              <AuthButton onClick={handleLogout}>Sign Out</AuthButton>
            </>
          ) : (
            <AuthButton onClick={() => setIsModalOpen(true)}>Connect</AuthButton>
          )}
        </NavRight>
      </NavInner>
    </NavWrap>
    <WalletSelectorModal 
      isOpen={isModalOpen} 
      onClose={() => setIsModalOpen(false)} 
    />
    </>
  );
}
