import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/final.css';

/* ─── Design Tokens (matching CinematicHero / Login / Navbar) ────────────── */

const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  padding: 96px 24px 64px;
  position: relative;

  @media (min-width: 768px) {
    padding: 96px 64px 64px;
  }
`;

/* ── Top chrome ── */
const TopBar = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg);

  @media (min-width: 768px) {
    padding: 16px 64px;
  }
`;

const TopLabel = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
`;

const ProgressBar = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

const ProgressSegment = styled.div`
  width: ${props => props.$active ? '28px' : '12px'};
  height: 3px;
  background: ${props => props.$active ? 'blue' : 'var(--border-color)'};
  transition: all 0.3s ease;
`;

const NavBtnRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NavBtn = styled.button`
  font-family: 'Geist', monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-primary);
  }
`;

/* ── Content card ── */
const CardWrap = styled(motion.div)`
  width: 100%;
  max-width: 600px;
`;

const Card = styled.div`
  background: var(--bg);
  border: 1px solid blue;
  box-shadow: -9px 9px 0 4px blue;
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 480px) {
    padding: 32px 24px;
    box-shadow: -6px 6px 0 3px blue;
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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
  font-size: 42px;
  font-weight: 500;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-primary);
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 32px;
  }
`;

const Subtitle = styled.p`
  font-family: 'Geist', monospace;
  font-size: 12px;
  line-height: 1.6;
  letter-spacing: 0.02em;
  color: var(--color-secondary);
  max-width: 440px;
`;

const PrimaryCTA = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
  transition: all 0.2s ease;
  align-self: flex-start;

  &:hover:not(:disabled) {
    background: var(--color-primary);
    color: var(--color-on-primary);
  }

  &:disabled {
    opacity: 0.3;
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

const BlueCTA = styled(PrimaryCTA)`
  background: blue;
  color: white;
  border-color: blue;

  &:hover:not(:disabled) {
    background: #0000cc;
    color: white;
  }
`;

/* ── Chips (for Step 3) ── */
const ChipGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.button`
  padding: 10px 18px;
  border: 1px solid ${props => props.$selected ? 'blue' : 'var(--border-color)'};
  background: ${props => props.$selected ? 'blue' : 'var(--bg)'};
  color: ${props => props.$selected ? 'white' : 'var(--color-primary)'};
  font-family: 'Geist', monospace;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: blue;
  }
`;

const TextInput = styled.input`
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

/* ── Bento cards (Steps 4, 5) ── */
const BentoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BentoCard = styled.button`
  border: 1px solid ${props => props.$selected ? 'blue' : 'var(--border-color)'};
  background: ${props => props.$selected ? 'var(--bg-surface-low)' : 'var(--bg)'};
  box-shadow: ${props => props.$selected ? '-4px 4px 0 2px blue' : 'none'};
  padding: 16px 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: var(--bg-surface-low);
    border-color: blue;
  }
`;

const BentoIcon = styled.span`
  font-size: 24px;
`;

const BentoTitle = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary);
`;

const BentoIndex = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  color: var(--color-secondary);
  border: 1px solid var(--border-color);
  padding: 2px 8px;
  text-transform: uppercase;
`;

/* ── Language list (Step 6) ── */
const LangList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 40vh;
  overflow-y: auto;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: var(--bg); }
  &::-webkit-scrollbar-thumb { background: var(--border-color); }
`;

const LangItem = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: ${props => props.$selected ? 'blue' : 'var(--bg)'};
  border: 1px solid ${props => props.$selected ? 'blue' : 'var(--border-color)'};
  color: ${props => props.$selected ? 'white' : 'var(--color-primary)'};
  font-family: 'Geist', monospace;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: blue;
  }
`;

/* ── Footer meta ── */
const FooterMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* ─── Animation Variants ─────────────────────────────────────────────────── */

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
};

/* ─── Component ──────────────────────────────────────────────────────────── */

const TOTAL = 7;
const STEP_LABELS = [
  'WELCOME',
  'WALLET',
  'INTENT',
  'EXPERIENCE',
  'INTERACTION',
  'LANGUAGE',
  'COMPLETE'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { connectWallet, isStellarConnected } = useAuth();

  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState([]);
  const [customIntent, setCustomIntent] = useState('');
  const [experience, setExperience] = useState('');
  const [interaction, setInteraction] = useState('');
  const [language, setLanguage] = useState('English');
  const [searchLang, setSearchLang] = useState('');

  const next = () => setStep(s => Math.min(s + 1, TOTAL));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const finish = () => {
    localStorage.setItem('spectra_onboarding', JSON.stringify({
      intents: [...intent, customIntent].filter(Boolean),
      experience,
      interaction,
      language
    }));
    navigate('/agent', { replace: true });
  };

  const toggleChip = (c) => {
    setIntent(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const handleWallet = async () => {
    try {
      await connectWallet('stellar');
      next();
    } catch (err) {
      console.error(err);
    }
  };

  // auto-skip wallet step if already connected
  useEffect(() => {
    if (step === 2 && isStellarConnected) next();
  }, [step, isStellarConnected]);

  const renderStep = () => {
    switch (step) {

      /* ──────────── STEP 1: Welcome ──────────── */
      case 1:
        return (
          <CardWrap key="s1" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>SYSTEM_READY</StatusLabel>
              </StatusRow>

              <Title>Welcome to Spectra.</Title>

              <Subtitle>
                The AI-native operating system for autonomous finance.
                We'll personalize your experience in under a minute.
              </Subtitle>

              <PrimaryCTA onClick={next}>
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryCTA>

              <FooterMeta>
                <MetaLabel>STEP_01 / 07</MetaLabel>
                <MetaLabel>~45 SECONDS</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );

      /* ──────────── STEP 2: Wallet ──────────── */
      case 2:
        return (
          <CardWrap key="s2" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>WALLET_CONNECT</StatusLabel>
              </StatusRow>

              <Title>Connect your Freighter Wallet</Title>

              <Subtitle>
                Securely link to the Stellar ecosystem. You can always connect later from your profile.
              </Subtitle>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <BlueCTA onClick={handleWallet}>
                  <span className="material-symbols-outlined">account_balance_wallet</span>
                  Connect Wallet
                </BlueCTA>
                <PrimaryCTA onClick={next}>Skip for now</PrimaryCTA>
              </div>

              <FooterMeta>
                <MetaLabel>STEP_02 / 07</MetaLabel>
                <MetaLabel>OPTIONAL</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );

      /* ──────────── STEP 3: Intent ──────────── */
      case 3: {
        const chips = ['Swap tokens', 'Explore AI', 'Learn DeFi', 'Build on Stellar', 'Bridge Assets', 'Just Exploring'];
        return (
          <CardWrap key="s3" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>PERSONALIZE</StatusLabel>
              </StatusRow>

              <Title>What brings you to Spectra?</Title>

              <ChipGrid>
                {chips.map(c => (
                  <Chip key={c} $selected={intent.includes(c)} onClick={() => toggleChip(c)}>
                    {c}
                  </Chip>
                ))}
              </ChipGrid>

              <TextInput
                placeholder="Or type your own — e.g. 'Automate my DeFi portfolio'"
                value={customIntent}
                onChange={e => setCustomIntent(e.target.value)}
              />

              <PrimaryCTA onClick={next}>
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryCTA>

              <FooterMeta>
                <MetaLabel>STEP_03 / 07</MetaLabel>
                <MetaLabel>SELECT ANY</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );
      }

      /* ──────────── STEP 4: Experience ──────────── */
      case 4: {
        const levels = [
          { icon: '🟢', title: 'New to Web3', idx: '01' },
          { icon: '🔵', title: 'Crypto Enthusiast', idx: '02' },
          { icon: '🟣', title: 'DeFi Trader', idx: '03' },
          { icon: '🟠', title: 'Builder', idx: '04' },
          { icon: '⚫', title: 'Just Exploring', idx: '05' }
        ];
        return (
          <CardWrap key="s4" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>EXPERIENCE_LEVEL</StatusLabel>
              </StatusRow>

              <Title>What's your experience?</Title>

              <BentoGrid>
                {levels.map(l => (
                  <BentoCard
                    key={l.title}
                    $selected={experience === l.title}
                    onClick={() => { setExperience(l.title); setTimeout(next, 250); }}
                  >
                    <BentoIndex>{l.idx}</BentoIndex>
                    <BentoIcon>{l.icon}</BentoIcon>
                    <BentoTitle>{l.title}</BentoTitle>
                  </BentoCard>
                ))}
              </BentoGrid>

              <FooterMeta>
                <MetaLabel>STEP_04 / 07</MetaLabel>
                <MetaLabel>TAP TO SELECT</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );
      }

      /* ──────────── STEP 5: Interaction ──────────── */
      case 5:
        return (
          <CardWrap key="s5" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>INTERACTION_MODE</StatusLabel>
              </StatusRow>

              <Title>How do you prefer interacting?</Title>

              <BentoGrid>
                <BentoCard
                  $selected={interaction === 'Type'}
                  onClick={() => { setInteraction('Type'); setTimeout(next, 250); }}
                >
                  <BentoIndex>A</BentoIndex>
                  <BentoIcon>⌨️</BentoIcon>
                  <BentoTitle>Type</BentoTitle>
                </BentoCard>

                <BentoCard
                  $selected={interaction === 'Voice'}
                  onClick={() => { setInteraction('Voice'); setTimeout(next, 250); }}
                >
                  <BentoIndex>B</BentoIndex>
                  <BentoIcon>🎙</BentoIcon>
                  <BentoTitle>Voice</BentoTitle>
                </BentoCard>

                <BentoCard
                  $selected={interaction === 'Both'}
                  onClick={() => { setInteraction('Both'); setTimeout(next, 250); }}
                >
                  <BentoIndex>C</BentoIndex>
                  <BentoIcon>✨</BentoIcon>
                  <BentoTitle>Both</BentoTitle>
                </BentoCard>
              </BentoGrid>

              <FooterMeta>
                <MetaLabel>STEP_05 / 07</MetaLabel>
                <MetaLabel>TAP TO SELECT</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );

      /* ──────────── STEP 6: Language ──────────── */
      case 6: {
        const langs = ['English', 'Hindi', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Auto Detect'];
        const filtered = langs.filter(l => l.toLowerCase().includes(searchLang.toLowerCase()));
        return (
          <CardWrap key="s6" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>LANGUAGE_PREFERENCE</StatusLabel>
              </StatusRow>

              <Title>Preferred Language</Title>

              <TextInput
                placeholder="Search languages..."
                value={searchLang}
                onChange={e => setSearchLang(e.target.value)}
              />

              <LangList>
                {filtered.map(l => (
                  <LangItem
                    key={l}
                    $selected={language === l}
                    onClick={() => { setLanguage(l); setTimeout(next, 250); }}
                  >
                    {l}
                    {language === l && <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>}
                  </LangItem>
                ))}
              </LangList>

              <PrimaryCTA onClick={next}>
                Continue
                <span className="material-symbols-outlined">arrow_forward</span>
              </PrimaryCTA>

              <FooterMeta>
                <MetaLabel>STEP_06 / 07</MetaLabel>
                <MetaLabel>TAP TO SELECT</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );
      }

      /* ──────────── STEP 7: Finish ──────────── */
      case 7:
        return (
          <CardWrap key="s7" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <Card>
              <StatusRow>
                <PulseDot />
                <StatusLabel>ONBOARDING_COMPLETE</StatusLabel>
              </StatusRow>

              <Title>You're all set.</Title>

              <Subtitle>
                Let's redefine how people interact with Web3.
                Your AI assistant has been personalized and is ready.
              </Subtitle>

              <BlueCTA onClick={finish}>
                <span className="material-symbols-outlined">rocket_launch</span>
                Launch Spectra
              </BlueCTA>

              <FooterMeta>
                <MetaLabel>SPECTRA_v2.0</MetaLabel>
                <MetaLabel>AI_READY</MetaLabel>
              </FooterMeta>
            </Card>
          </CardWrap>
        );

      default:
        return null;
    }
  };

  return (
    <Page>
      {/* ── Fixed top bar ── */}
      <TopBar>
        <TopLabel>SPECTRA — ONBOARDING</TopLabel>

        <ProgressBar>
          {Array.from({ length: TOTAL }, (_, i) => (
            <ProgressSegment key={i} $active={i < step} />
          ))}
        </ProgressBar>

        <NavBtnRow>
          {step > 1 && step < TOTAL && (
            <NavBtn onClick={prev}>
              ← Back
            </NavBtn>
          )}
          {step > 1 && step < TOTAL && (
            <NavBtn onClick={next}>
              Skip →
            </NavBtn>
          )}
        </NavBtnRow>
      </TopBar>

      {/* ── Step content ── */}
      <AnimatePresence mode="wait">
        {renderStep()}
      </AnimatePresence>
    </Page>
  );
}
