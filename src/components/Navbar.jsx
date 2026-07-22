import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronDown, ArrowUpRight, Menu, X } from 'lucide-react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WalletSelectorModal from './auth/WalletSelectorModal';

/* ─── Styled Components for Nav Shell ────────────────────────────────────── */

const NavWrap = styled.nav`
  position: fixed;
  top: 3.25%;
  left: 50%;
  transform: translateX(-50%);
  padding: 1.2% 2%;
  background: var(--bg, #0a0a0b);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 65%;
  margin: 0 auto;
  z-index: 50;
  border-radius: 9999px;
  border: 1px solid blue;

  @media (max-width: 1024px) {
    width: 90%;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    top: 16px;
    width: 92%;
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
  color: var(--color-primary, #ffffff);
  text-decoration: none;
  flex-shrink: 0;
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
`;

const ProfileIcon = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: var(--color-primary, #ffffff);
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
  color: var(--color-primary, #ffffff);
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary, #ffffff);
    opacity: 0.8;
  }
`;

/* ─── Pattern Pattern (Spectra AI) ────────────────────────────────────── */

const SpectraWrap = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: #000;

  .container {
    width: 100%;
    height: 100%;
    background: linear-gradient(blue 2px, transparent 2px),
      linear-gradient(90deg, blue 2px, transparent 2px);
    background-size: 100px 100px;
  }
  .container::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(-45deg, blue 20px, transparent 20px),
      linear-gradient(-135deg, blue 20px, transparent 20px),
      linear-gradient(135deg, blue 20px, transparent 20px),
      linear-gradient(45deg, blue 20px, transparent 20px);
    background-size: 100px 100px;
    background-position: 50px 50px;
  }
  .container::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(45deg, blue 20px, transparent 20px),
      linear-gradient(-45deg, blue 20px, transparent 20px),
      linear-gradient(135deg, blue 20px, transparent 20px),
      linear-gradient(-135deg, blue 20px, transparent 20px);
    background-size: 100px 100px;
    background-position: 1px 1px;
  }
`;

function SpectraVisual() {
  return (
    <SpectraWrap>
      <div className="container" />
    </SpectraWrap>
  );
}

/* ─── INITIAL Nav Data Only (Products & Resources) ───────────────────────── */

const PRODUCTS_DATA = [
  {
    to: '/agent', label: 'Agent', desc: 'Intent-driven DeFi assistant powered by Sarvam AI.',
    patternStyle: {
      '--s': '100px',
      '--c1': '#add8e6',
      '--c2': 'blue',
      background: [
        'radial-gradient(100% 100% at 100% 0, #add8e6 4%, blue 4% 14%, #add8e6 14% 24%, blue 22% 34%, #add8e6 34% 44%, blue 44% 56%, #add8e6 56% 66%, blue 66% 76%, #add8e6 76% 86%, blue 86% 96%, #0008 96%, transparent)',
        'radial-gradient(100% 100% at 0 100%, transparent, #0008 4%, blue 4% 14%, #add8e6 14% 24%, blue 22% 34%, #add8e6 34% 44%, blue 44% 56%, #add8e6 56% 66%, blue 66% 76%, #add8e6 76% 86%, blue 86% 96%, #add8e6 96%)',
      ].join(', '),
      backgroundColor: '#add8e6',
      backgroundSize: '100px 100px',
    },
  },
  {
    to: '/exchange', label: 'Exchange', desc: 'Cross-chain swaps with optimal routing.',
    patternStyle: {
      background: [
        'conic-gradient(from 122deg at 50% 85.15%, #000033 0 58deg, blue 0 116deg, #fff0 0 100%) 50% / 84.5px 64px',
        'conic-gradient(from 122deg at 50% 72.5%, #add8e6 0 116deg, #fff0 0 100%) 50% / 84.5px 64px',
        'conic-gradient(from 58deg at 82.85% 50%, blue 0 64deg, #fff0 0 100%) 50% / 84.5px 64px',
        'conic-gradient(from 58deg at 66.87% 50%, #add8e6 0 64deg, #000033 0 130deg, #fff0 0 100%) 50% / 84.5px 64px',
        'conic-gradient(from 238deg at 17.15% 50%, #000033 0 64deg, #fff0 0 100%) 50% / 84.5px 64px',
        'conic-gradient(from 172deg at 33.13% 50%, blue 0 66deg, #add8e6 0 130deg, #fff0 0 100%) 50% / 84.5px 64px',
        'linear-gradient(98deg, blue 0 15%, #fff0 calc(15% + 1px) 100%) 50% / 84.5px 64px',
        'linear-gradient(-98deg, #000033 0 15%, #fff0 calc(15% + 1px) 100%) 50% / 84.5px 64px',
        'conic-gradient(from -58deg at 50.25% 14.85%, blue 0 58deg, #000033 0 116deg, #fff0 0 100%) 50% / 84.5px 64px',
        'conic-gradient(from -58deg at 50% 28.125%, #add8e6 0 116deg, #fff0 0 100%) 50% / 84.5px 64px',
        'linear-gradient(90deg, #000033 0 50%, blue 0 100%) 50% / 84.5px 64px',
      ].join(', '),
    },
  },
  {
    to: '/spectra', label: 'Spectra AI', desc: '24/7 AI help desk & support center.',
    Visual: SpectraVisual,
  },
];

const RESOURCES_DATA = [
  {
    to: '/guide', label: 'Guide', desc: 'Interactive documentation & tutorials.',
    patternStyle: {
      backgroundImage: [
        'linear-gradient(45deg, #add8e6 25%, transparent 25%, transparent 75%, #add8e6 75%, #add8e6)',
        'linear-gradient(135deg, #add8e6 25%, blue 25%, blue 75%, #add8e6 75%, #add8e6)',
      ].join(', '),
      backgroundSize: '90px 90px',
      backgroundPosition: '0 0, 135px 135px',
    },
  },
  {
    to: '/journal', label: 'Journal', desc: 'Execution logs & protocol research.',
    patternStyle: {
      background: [
        'radial-gradient(25% 25% at 25% 25%, #000033 99%, transparent 101%) 60px 60px / 120px 120px',
        'radial-gradient(25% 25% at 25% 25%, #000033 99%, transparent 101%) 0 0 / 120px 120px',
        'radial-gradient(50% 50%, blue 98%, transparent) 0 0 / 60px 60px',
        'repeating-conic-gradient(blue 0 50%, #000033 0 100%) 30px 0 / 120px 60px',
      ].join(', '),
    },
  },
  {
    to: '/about', label: 'About', desc: 'Architecture overview & mission statement.',
    patternStyle: {
      backgroundImage: [
        'repeating-linear-gradient(90deg, blue 0, blue 50%, #fff 50%, #fff 100%)',
        'repeating-linear-gradient(0deg, blue 0, blue 50%, #fff 50%, #fff 100%)',
        'repeating-conic-gradient(from 45deg, #00008b 0 25%, #1e90ff 0 50%)',
      ].join(', '),
      backgroundSize: '14px 14px, 28px 28px',
      backgroundPosition: '0 0, center',
    },
  },
];

const NAV_TABS = ["Products", "Resources"];

function getTabItems(tab) {
  switch (tab) {
    case "Products":
      return PRODUCTS_DATA;
    case "Resources":
      return RESOURCES_DATA;
    default:
      return [];
  }
}

/* ─── Dropdown Animations & Visual Card ───────────────────────────────────── */

const springVisual = { type: "spring", stiffness: 350, damping: 20, mass: 0.7 };
const smoothSpring = { type: "spring", stiffness: 400, damping: 28 };

function NavVisual({ patternStyle, Visual }) {
  return (
    <motion.div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        ...(Visual ? {} : patternStyle),
      }}
      initial={{ opacity: 0, scale: 0.88, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.88, rotate: 3 }}
      transition={springVisual}
    >
      {Visual && <Visual />}
    </motion.div>
  );
}

function NavItem({ item, layoutScope, isHovered, onHover, onClick }) {
  return (
    <Link
      to={item.to}
      onClick={onClick}
      onMouseEnter={onHover}
      style={{
        textDecoration: 'none',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        borderRadius: '12px',
        cursor: 'pointer',
      }}
    >
      {/* Animated hover highlight */}
      {isHovered && (
        <motion.div
          layoutId={`nav-highlight-${layoutScope}`}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
          }}
          transition={smoothSpring}
        />
      )}
      <div style={{ minWidth: 0, position: 'relative', zIndex: 1 }}>
        <span
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 700,
            color: '#ffffff',
            fontFamily: "'Geist', sans-serif",
          }}
        >
          {item.label}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '3px',
            lineHeight: 1.4,
            fontFamily: "'Geist', sans-serif",
          }}
        >
          {item.desc}
        </span>
      </div>
      <ArrowUpRight
        style={{
          width: '14px',
          height: '14px',
          color: 'rgba(255, 255, 255, 0.25)',
          flexShrink: 0,
          marginLeft: '12px',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </Link>
  );
}

function DropdownMenu({ tab, hoveredIdx, setHoveredIdx, onItemClick }) {
  const items = getTabItems(tab);
  const activeItem = items[hoveredIdx] || items[0] || {};
  const activePattern = activeItem.patternStyle || {};
  const ActiveVisual = activeItem.Visual || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 500, damping: 35 }}
      style={{
        display: 'flex',
        width: '540px',
        borderRadius: '20px',
        background: '#141414',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
      }}
    >
      {/* Left — Items */}
      <LayoutGroup id={tab}>
        <div style={{ flex: 1, padding: '12px 8px', minWidth: 0 }}>
          {items.map((item, idx) => (
            <NavItem
              key={item.to}
              item={item}
              layoutScope={tab}
              isHovered={hoveredIdx === idx}
              onHover={() => setHoveredIdx(idx)}
              onClick={onItemClick}
            />
          ))}
        </div>
      </LayoutGroup>

      {/* Right — Visual Card */}
      <div style={{ width: '210px', padding: '12px 12px 12px 0', flexShrink: 0 }}>
        <AnimatePresence mode="wait">
          <NavVisual key={`${tab}-${hoveredIdx}`} patternStyle={activePattern} Visual={ActiveVisual} />
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ─── Main Navbar Component ───────────────────────────────────────────────── */

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isLoggedIn,
    disconnectWallet
  } = useAuth();

  const [activeTab, setActiveTab] = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
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
      setIsWalletModalOpen(true);
    }
  };

  return (
    <>
      <NavWrap>
        <NavInner>
          {/* Brand Logo */}
          <Logo to="/">SPECTRA</Logo>

          {/* Nav Items: Home, Products ▾, Resources ▾, Pricing */}
          <div className="hidden md:flex flex-col items-center relative">
            <div className="flex items-center gap-6" onMouseLeave={handleTabLeave}>
              <Link
                to="/"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setActiveTab(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
                  location.pathname === '/' ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Home
              </Link>

              {NAV_TABS.map(tab => (
                <button
                  key={tab}
                  onMouseEnter={() => handleTabHover(tab)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 cursor-pointer ${
                    activeTab === tab ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-white/10 rounded-full"
                      transition={smoothSpring}
                    />
                  )}
                  <span className="relative z-10">{tab}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 ${
                      activeTab === tab ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ))}

              <Link
                to="/mint"
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setActiveTab(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-150 ${
                  location.pathname === '/mint' ? "text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Pricing
              </Link>
            </div>

            {/* Dropdown Menu flyout */}
            <AnimatePresence mode="popLayout">
              {activeTab && (
                <div
                  key={activeTab}
                  className="absolute top-full pt-3 z-50"
                  onMouseEnter={handleFlyoutEnter}
                  onMouseLeave={handleTabLeave}
                >
                  <DropdownMenu
                    tab={activeTab}
                    hoveredIdx={hoveredIdx}
                    setHoveredIdx={setHoveredIdx}
                    onItemClick={handleItemClick}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Section */}
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
              <AuthButton onClick={() => setIsWalletModalOpen(true)}>Connect</AuthButton>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-400 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </NavRight>
        </NavInner>
      </NavWrap>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-20 left-1/2 -translate-x-1/2 w-[90%] z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-5 space-y-3">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1.5 text-gray-300 hover:text-white">Home</Link>
              <Link to="/exchange" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1.5 text-gray-300 hover:text-white">Exchange</Link>
              <Link to="/agent" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1.5 text-gray-300 hover:text-white">Agent</Link>
              <Link to="/mint" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium py-1.5 text-gray-300 hover:text-white">Pricing</Link>
              
              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                {isLoggedIn ? (
                  <AuthButton onClick={handleLogout}>Sign Out</AuthButton>
                ) : (
                  <AuthButton onClick={() => { setMobileMenuOpen(false); setIsWalletModalOpen(true); }}>Connect</AuthButton>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wallet Selector Modal */}
      <WalletSelectorModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />
    </>
  );
}
