import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import WalletSelectorModal from '../auth/WalletSelectorModal';
import { useAuth } from '../../context/AuthContext';

/* ─── Original Styled Components ─────────────────────────────────────────── */

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
    width: 90%;
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
`;

const DropdownTrigger = styled.div`
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

/* ─── Refined Ghost Finance Dropdown Data & Styling ────────────────────────── */

const PRODUCTS_DATA = [
  { to: '/agent',    label: 'Agent',      desc: 'Intent-driven DeFi assistant powered by Sarvam AI.', colors: ['#818cf8', '#4f46e5', '#a5b4fc'] },
  { to: '/exchange', label: 'Exchange',   desc: 'Cross-chain swaps with optimal routing & slippage.', colors: ['#a78bfa', '#7c3aed', '#c4b5fd'] },
  { to: '/spectra',  label: 'Spectra AI', desc: '24/7 AI help desk & support center.',              colors: ['#67e8f9', '#0891b2', '#a5f3fc'] },
];

const RESOURCES_DATA = [
  { to: '/guide',    label: 'Guide',      desc: 'Interactive documentation & tutorials.',            colors: ['#fbbf24', '#d97706', '#fde68a'] },
  { to: '/journal',  label: 'Journal',    desc: 'Execution logs & protocol research.',               colors: ['#86efac', '#16a34a', '#bbf7d0'] },
  { to: '/about',    label: 'About',      desc: 'Architecture overview & mission statement.',        colors: ['#f472b6', '#db2777', '#fbcfe8'] },
];

const springVisual = { type: 'spring', stiffness: 350, damping: 20, mass: 0.7 };
const smoothSpring = { type: 'spring', stiffness: 400, damping: 28 };

function NavVisual({ colors }) {
  return (
    <motion.div
      className="w-full h-full rounded-2xl overflow-hidden relative shadow-inner"
      style={{ background: colors[0] }}
      initial={{ opacity: 0, scale: 0.88, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.88, rotate: 3 }}
      transition={springVisual}
    >
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '75%',
          height: '75%',
          background: colors[1],
          right: '-10%',
          bottom: '-10%'
        }}
        initial={{ scale: 0.5, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 0.75, y: 0 }}
        transition={{ ...springVisual, delay: 0.04 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: '50%',
          height: '50%',
          background: colors[2],
          right: '5%',
          bottom: '5%'
        }}
        initial={{ scale: 0.3, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 0.65, y: 0 }}
        transition={{ ...springVisual, delay: 0.08 }}
      />
      <motion.div
        className="absolute"
        style={{
          width: '40%',
          height: '100%',
          background: `linear-gradient(180deg, ${colors[1]}88, ${colors[2]}44)`,
          left: '30%',
          top: 0
        }}
        initial={{ opacity: 0, x: -30, scaleY: 0.8 }}
        animate={{ opacity: 0.5, x: 0, scaleY: 1 }}
        transition={{ ...smoothSpring, delay: 0.06 }}
      />
    </motion.div>
  );
}

function NavDropdownRow({ item, layoutScope, isHovered, onHover, onClick }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      className="relative flex items-center justify-between px-4 py-3 rounded-xl group cursor-pointer"
      onMouseEnter={onHover}
    >
      {isHovered && (
        <motion.div
          layoutId={`nav-highlight-${layoutScope}`}
          className="absolute inset-0 bg-white/[0.08] rounded-xl border border-white/10"
          transition={smoothSpring}
        />
      )}
      <div className="min-w-0 relative z-10 pr-2">
        <span className="text-sm font-semibold text-white tracking-wide block">{item.label}</span>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-500 shrink-0 relative z-10 group-hover:text-white transition-colors" />
    </Link>
  );
}

function GhostDropdownPanel({ tab, items, hoveredIdx, setHoveredIdx, onItemClick }) {
  const activeColors = items[hoveredIdx]?.colors || items[0]?.colors || ['#333', '#555', '#777'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      className="flex rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.85)] border border-white/[0.14] bg-[#121214]/95 backdrop-blur-2xl overflow-hidden"
      style={{ width: 520 }}
    >
      <LayoutGroup id={tab}>
        <div className="flex-1 py-3 px-3 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold font-mono text-indigo-400/90 px-4 pt-2 pb-1.5">
              {tab}
            </p>
            <div className="space-y-1">
              {items.map((item, idx) => (
                <NavDropdownRow
                  key={item.to}
                  item={item}
                  layoutScope={tab}
                  isHovered={hoveredIdx === idx}
                  onHover={() => setHoveredIdx(idx)}
                  onClick={onItemClick}
                />
              ))}
            </div>
          </div>
        </div>
      </LayoutGroup>

      <div className="w-[200px] p-2.5 shrink-0 h-full min-h-[220px]">
        <AnimatePresence mode="wait">
          <NavVisual key={`${tab}-${hoveredIdx}`} colors={activeColors} />
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function FluidNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isLoggedIn, disconnectWallet } = useAuth();

  const [activeTab, setActiveTab] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(0);
  const timeoutRef = useRef(null);

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

  const handleTabHover = useCallback((tab) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveTab(prev => {
      if (prev !== tab) setHoveredIdx(0);
      return tab;
    });
  }, []);

  const handleTabLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setActiveTab(null);
    }, 200);
  }, []);

  const handleFlyoutEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const handleItemClick = useCallback(() => {
    setActiveTab(null);
  }, []);

  const handleLogout = () => {
    disconnectWallet();
  };

  const userData = { avatarId: 1 };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      setIsModalOpen(true);
    }
  };

  const isProductsActive = PRODUCTS_DATA.some(p => location.pathname.startsWith(p.to));
  const isResourcesActive = RESOURCES_DATA.some(r => location.pathname.startsWith(r.to));

  return (
    <>
      <NavWrap>
        <NavInner>
          <Logo to="/">SPECTRA</Logo>

          <NavLinks>
            <NavLink to="/" $active={location.pathname === '/'}>
              Home
            </NavLink>

            {/* Products Dropdown */}
            <DropdownWrap
              onMouseEnter={() => handleTabHover('Products')}
              onMouseLeave={handleTabLeave}
            >
              <DropdownTrigger $active={isProductsActive}>
                Products <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeTab === 'Products' ? 'rotate-180' : ''}`} />
              </DropdownTrigger>

              <AnimatePresence>
                {activeTab === 'Products' && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-5 z-50"
                    onMouseEnter={handleFlyoutEnter}
                    onMouseLeave={handleTabLeave}
                  >
                    <GhostDropdownPanel
                      tab="Products"
                      items={PRODUCTS_DATA}
                      hoveredIdx={hoveredIdx}
                      setHoveredIdx={setHoveredIdx}
                      onItemClick={handleItemClick}
                    />
                  </div>
                )}
              </AnimatePresence>
            </DropdownWrap>

            {/* Resources Dropdown */}
            <DropdownWrap
              onMouseEnter={() => handleTabHover('Resources')}
              onMouseLeave={handleTabLeave}
            >
              <DropdownTrigger $active={isResourcesActive}>
                Resources <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeTab === 'Resources' ? 'rotate-180' : ''}`} />
              </DropdownTrigger>

              <AnimatePresence>
                {activeTab === 'Resources' && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-5 z-50"
                    onMouseEnter={handleFlyoutEnter}
                    onMouseLeave={handleTabLeave}
                  >
                    <GhostDropdownPanel
                      tab="Resources"
                      items={RESOURCES_DATA}
                      hoveredIdx={hoveredIdx}
                      setHoveredIdx={setHoveredIdx}
                      onItemClick={handleItemClick}
                    />
                  </div>
                )}
              </AnimatePresence>
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
