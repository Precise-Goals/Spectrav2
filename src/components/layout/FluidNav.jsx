import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import WalletSelectorModal from '../auth/WalletSelectorModal';

/* ─── Styled Components ──────────────────────────────────────────────────────── */

const NavWrap = styled.nav`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: var(--bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 960px;
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
const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/about',    label: 'About' },
  { to: '/agent',    label: 'Agent' },
  { to: '/exchange', label: 'Exchange' },
  { to: '/mint',     label: 'Pricing' },
  { to: '/journal',  label: 'Journal' },
];

export default function FluidNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { isLoggedIn, disconnectWallet } = useAuth();

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
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <NavLink key={to} to={to} $active={isActive}>
                {label}
              </NavLink>
            );
          })}
        </NavLinks>

        <NavRight>
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
