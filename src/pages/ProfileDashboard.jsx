import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit2, Activity, Zap, Shield, Save, X, RefreshCw, Star } from 'lucide-react';
import { ethers } from 'ethers';
import { useAuth } from '../context/AuthContext';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, ensureBaseSepolia } from '../config/contracts.js';
import { getProfile, createProfile, updateProfile } from '../lib/stellar/contracts/profile';
import { getUserTier } from '../lib/stellar/contracts/saas';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Oswald:wght@700&display=swap');
`;

const Container = styled.div`
  // min-height: 100vh;
  padding: 170px 24px 64px;
  background-color: #0A0A0B;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const BentoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  width: 100%;
  max-width: 1100px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1.2fr 1fr;
  }
`;

const CyberCard = styled(motion.div)`
  background: #11131A;
  border: 1px solid #2563EB;
  position: relative;
  box-shadow: 0 0 15px rgba(37, 99, 235, 0.15), inset 0 0 20px rgba(37, 99, 235, 0.05);
  display: flex;
  flex-direction: column;
`;

const IdentityCard = styled(CyberCard)`
  padding: 32px;
  &::before {
    content: '';
    position: absolute;
    top: -1px;
    right: -1px;
    width: 40px;
    height: 40px;
    background: #fff;
    background-image: radial-gradient(#000 1.5px, transparent 1.5px);
    background-size: 6px 6px;
    clip-path: polygon(100% 0, 0 0, 100% 100%);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: -1px;
    width: 60px;
    height: 20px;
    background: repeating-linear-gradient(
      45deg,
      #2563EB,
      #2563EB 2px,
      transparent 2px,
      transparent 6px
    );
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const Badge = styled.div`
  background: #2563EB;
  color: #fff;
  padding: 6px 12px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  display: inline-block;
`;

const EditButton = styled.button`
  background: transparent;
  border: 1px solid #2563EB;
  color: #2563EB;
  padding: 6px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(37, 99, 235, 0.1);
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-end;
  margin-bottom: 24px;
`;

const AvatarSquare = styled.div`
  width: 140px;
  height: 140px;
  background: #2563EB;
  border: 3px solid #fff;
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 10px;
    left: 10px;
    width: 100%;
    height: 100%;
    background: #fff;
    z-index: -1;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NameSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const NameTitle = styled.h1`
  font-family: 'Oswald', sans-serif;
  font-size: 42px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  color: #fff;
`;

const RoleSubtitle = styled.div`
  color: #2563EB;
  font-size: 14px;
  text-transform: uppercase;
  font-weight: 700;
`;

const BioText = styled.p`
  color: #A1A1AA;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 90%;
`;

const Divider = styled.div`
  width: 32px;
  height: 2px;
  background: #2563EB;
  margin-bottom: 24px;
`;

const ContactRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #D4D4D8;
  font-size: 14px;
`;

const IconBox = styled.div`
  width: 32px;
  height: 32px;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 24px;
`;

const StatCardBox = styled(CyberCard)`
  padding: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const PlanCardBox = styled(CyberCard)`
  padding: 24px;
  background: #2563EB;
  border-color: #2563EB;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px);
    background-size: 8px 8px;
    z-index: 1;
  }
  
  > * {
    z-index: 2;
    position: relative;
  }
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${props => props.$dark ? '#000' : '#A1A1AA'};
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 0.1em;
`;

const StatValueLarge = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: #fff;
  span {
    color: #2563EB;
  }
`;

const PlanValue = styled.div`
  font-family: 'Oswald', sans-serif;
  font-size: 40px;
  font-weight: 700;
  color: #000;
  text-transform: uppercase;
`;

const StatIconSquare = styled.div`
  width: 56px;
  height: 56px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 2px; left: 2px; right: 2px; bottom: 2px;
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 4px 4px;
    z-index: -1;
  }
  
  svg {
    color: #2563EB;
  }
`;

const PlanIconSquare = styled.div`
  width: 56px;
  height: 56px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  svg {
    color: #2563EB;
  }
`;

const ActivityCardBox = styled(CyberCard)`
  padding: 24px;
  flex: 1;
`;

const ActivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ActivityTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 700;
  
  .icon-wrap {
    background: #2563EB;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    svg { width: 14px; height: 14px; }
  }
`;

const ViewAllBtn = styled.button`
  background: #2563EB;
  color: #fff;
  border: none;
  padding: 6px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  cursor: pointer;
  font-weight: 700;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 40px;
    right: 0;
    height: 1px;
    background: rgba(255, 255, 255, 0.05);
  }
  &:last-child::before {
    display: none;
  }
`;

const ActivityDot = styled.div`
  width: 6px;
  height: 6px;
  background: #2563EB;
  border-radius: 50%;
  box-shadow: 0 0 8px #2563EB;
`;

const ActivityIconBox = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  svg { width: 18px; height: 18px; }
`;

const ActivityContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActivityName = styled.div`
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 14px;
  color: #fff;
`;

const ActivitySub = styled.div`
  font-size: 12px;
  color: #A1A1AA;
`;

const ActivityTime = styled.div`
  font-size: 12px;
  color: #A1A1AA;
`;

const Input = styled.input`
  background: transparent;
  border: 1px solid #2563EB;
  padding: 12px 16px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
  margin-bottom: 16px;
  &:focus {
    outline: none;
    box-shadow: inset 0 0 10px rgba(37,99,235,0.2);
  }
`;

const TextArea = styled.textarea`
  background: transparent;
  border: 1px solid #2563EB;
  padding: 12px 16px;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  width: 100%;
  margin-bottom: 16px;
  min-height: 100px;
  resize: vertical;
  &:focus {
    outline: none;
    box-shadow: inset 0 0 10px rgba(37,99,235,0.2);
  }
`;

const Button = styled.button`
  background: ${props => props.$variant === 'secondary' ? 'transparent' : '#2563EB'};
  color: #fff;
  border: ${props => props.$variant === 'secondary' ? '1px solid #2563EB' : 'none'};
  padding: 12px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
`;

const ConnectButton = styled(Button)`
  font-size: 18px;
  padding: 16px 32px;
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
`;

const AvatarSelect = styled.div`
  aspect-ratio: 1;
  border: 2px solid ${props => props.$selected ? '#fff' : '#2563EB'};
  background: #2563EB;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Skeleton = styled.div`
  background: linear-gradient(90deg, rgba(37,99,235,0.1) 25%, rgba(37,99,235,0.2) 50%, rgba(37,99,235,0.1) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  height: ${props => props.$height || '20px'};
  width: ${props => props.$width || '100%'};
  margin-bottom: ${props => props.$mb || '0'};

  @keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

export default function ProfileDashboard() {
  const { walletAddress, connectWallet, stellarPublicKey, isStellarConnected, connectStellar, fetchProfileAndTier } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use Stellar account if connected, otherwise ETH account
  const activeAccount = isStellarConnected ? stellarPublicKey : walletAddress;
  const account = activeAccount;
  const [userTier, setUserTier] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  const queryParams = new URLSearchParams(location.search);
  const isOnboard = queryParams.get('mode') === 'onboarding';
  const [isEditing, setIsEditing] = useState(isOnboard);
  
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (isOnboard && !isEditing) {
      setIsEditing(true);
    }
  }, [isOnboard]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatarId: 1
  });

  useEffect(() => {
    if (activeAccount) {
      loadProfile(activeAccount);
    } else {
      setHasProfile(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        bio: '',
        avatarId: 1
      });
      setUserTier(0);
    }
  }, [activeAccount, isStellarConnected]);

  const handleConnectWallet = async () => {
    if (!window.ethereum) return alert("Please install MetaMask or another Web3 wallet.");
    
    try {
      const addr = await connectWallet();
      await loadProfile(addr);
    } catch (err) {}
  };

  const loadProfile = async (address) => {
    setLoading(true);
    try {
      if (isStellarConnected) {
        // --- STELLAR PROFILE LOAD (parallel) ---
        const [stellarProfile, tier] = await Promise.all([
          getProfile(address),
          getUserTier(address),
        ]);
        
        if (stellarProfile && stellarProfile.name) {
          setHasProfile(true);
          setFormData(prev => ({
            ...prev,
            name:     stellarProfile.name,
            email:    stellarProfile.email,
            phone:    stellarProfile.phone,
            bio:      stellarProfile.bio,
            avatarId: stellarProfile.avatarId || 1,
          }));
        }
        setUserTier(tier);
      } else {
        // --- ETHEREUM PROFILE LOAD ---
        await ensureBaseSepolia();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.SPECTRA_PROFILE, CONTRACT_ABIS.SPECTRA_PROFILE, provider);
        
        try {
          const profile = await contract.getProfile(address);
          if (profile.exists) {
            setHasProfile(true);
            setFormData({
              name: profile.name,
              email: profile.email,
              phone: profile.phone,
              bio: profile.bio,
              avatarId: Number(profile.avatarId)
            });
          }
        } catch (e) {}

        try {
          const saasContract = new ethers.Contract(
            CONTRACT_ADDRESSES.SPECTRA_SAAS,
            CONTRACT_ABIS.SPECTRA_SAAS,
            provider
          );
          const tier = Number(await saasContract.getUserTier(address));
          setUserTier(tier);
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Failed to load profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError('');
    try {
      if (isStellarConnected) {
        // --- STELLAR PROFILE UPDATE ---
        if (hasProfile) {
          await updateProfile(activeAccount, formData);
        } else {
          await createProfile(activeAccount, formData);
        }
        setHasProfile(true);
        setIsEditing(false);
        if (fetchProfileAndTier) await fetchProfileAndTier(activeAccount, true);
        if (isOnboard) navigate('/', { replace: true });
      } else {
        // --- ETHEREUM PROFILE UPDATE ---
        await ensureBaseSepolia();
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESSES.SPECTRA_PROFILE, CONTRACT_ABIS.SPECTRA_PROFILE, signer);

        let tx;
        if (hasProfile) {
          tx = await contract.updateProfile(formData.name, formData.email, formData.phone, formData.bio, formData.avatarId);
        } else {
          tx = await contract.createProfile(formData.name, formData.email, formData.phone, formData.bio, formData.avatarId);
        }
        
        await tx.wait();
        if (fetchProfileAndTier) await fetchProfileAndTier(walletAddress, false);
        setIsEditing(false);
        if (isOnboard) {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      console.warn("Save profile failed:", err);
      setSaveError(err.message || 'Failed to save profile. Make sure you confirm the transaction.');
    } finally {
      setSaving(false);
    }
  };

  if (!account) {
    return (
      <Container className="bg-grid-overlay" style={{minHeight:"0vh"}}>
        <GlobalStyle />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <CyberCard style={{ padding: 32, alignItems: 'center', textAlign: 'center', maxWidth: '500px' }}>
            <Shield size={64} color="#2563EB" style={{ marginBottom: 24 }} />
            <h1 style={{ fontSize: 28, marginBottom: 16 }}>Web3 Identity Gateway</h1>
            <p style={{ color: '#A1A1AA', marginBottom: 32 }}>
              Connect your wallet to access your unified profile and analytics dashboard.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <ConnectButton onClick={handleConnectWallet}>
                Connect Ethereum
              </ConnectButton>
              <ConnectButton onClick={async () => {
                try {
                  const addr = await connectStellar();
                  await loadProfile(addr);
                } catch (err) {
                  alert(err.message || 'Stellar connection failed');
                }
              }} style={{ background: '#000', border: '1px solid #fff' }}>
                Connect Stellar Snap
              </ConnectButton>
                {!isOnboard && (
                <SaveButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(profileData);
                  }}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Cancel
                </SaveButton>
              )}
            </div>
          </CyberCard>
        </motion.div>
      </Container>
    );
  }

  const getTierName = () => {
    if (userTier === 0) return 'ALPHA';
    if (userTier === 1) return 'VECTOR';
    return 'NEXUS';
  };

  return (
    <Container className="bg-grid-overlay">
      <GlobalStyle />
      <BentoGrid
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <IdentityCard>
          <CardHeader>
            <Badge>IDENTITY</Badge>
            {!isEditing && !loading && (
              <EditButton onClick={() => setIsEditing(true)}>
                <Edit2 size={14} /> EDIT
              </EditButton>
            )}
          </CardHeader>

          {loading ? (
             <>
               <Skeleton $height="140px" $width="140px" $mb="24px" />
               <Skeleton $height="40px" $width="60%" $mb="16px" />
               <Skeleton $height="20px" $mb="24px" />
               <Skeleton $height="20px" $mb="12px" />
               <Skeleton $height="20px" $mb="12px" />
             </>
          ) : isEditing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AvatarGrid>
                {[1, 2, 3, 4, 5, 6].map(id => (
                  <AvatarSelect 
                    key={id} 
                    $selected={formData.avatarId === id}
                    onClick={() => setFormData(prev => ({ ...prev, avatarId: id }))}
                  >
                    <img src={`/profile/${id}.png`} alt={`Avatar ${id}`} onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + id; }} />
                  </AvatarSelect>
                ))}
              </AvatarGrid>
              <Input 
                placeholder="DISPLAY NAME" 
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <TextArea 
                placeholder="BIO" 
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
              <Input 
                placeholder="EMAIL ADDRESS" 
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input 
                placeholder="PHONE NUMBER" 
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <Button $fullWidth onClick={saveProfile} disabled={saving}>
                  {saving ? 'SAVING...' : <><Save size={18} /> SAVE PROFILE</>}
                </Button>
                {hasProfile && (
                  <Button $fullWidth $variant="secondary" onClick={() => setIsEditing(false)} disabled={saving}>
                    <X size={18} /> CANCEL
                  </Button>
                )}
              </div>
              {saveError && (
                <div style={{ marginTop: 16, color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>
                  {saveError}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ProfileHeader>
                <AvatarSquare>
                  <img src={`/profile/${formData.avatarId}.png`} alt="Avatar" onError={(e) => { e.target.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.avatarId; }} />
                </AvatarSquare>
                <NameSection>
                  <NameTitle>{formData.name || 'ANONYMOUS USER'}</NameTitle>
                  <RoleSubtitle>{formData.name ? 'SPECTRA USER' : 'NEW USER'}</RoleSubtitle>
                </NameSection>
              </ProfileHeader>
              
              <BioText>
                {formData.bio || 'No bio provided. Complete your profile to share your journey across the decentralized web.'}
              </BioText>
              
              <Divider />
              
              <ContactRow>
                <IconBox><Mail /></IconBox>
                <span>{formData.email || 'No email provided'}</span>
              </ContactRow>
              <ContactRow>
                <IconBox><Phone /></IconBox>
                <span>{formData.phone || 'No phone provided'}</span>
              </ContactRow>
              <ContactRow>
                <IconBox><Shield /></IconBox>
                <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
              </ContactRow>
            </motion.div>
          )}
        </IdentityCard>

        <AnalyticsGrid>
          <StatCardBox>
            <div>
              <StatLabel>Daily Agent Usages</StatLabel>
              <StatValueLarge>
                {(() => {
                  const today = new Date().toDateString();
                  const usageKey = `spectra_usage_${account}`;
                  const usageData = JSON.parse(localStorage.getItem(usageKey) || '{"count":0,"date":""}');
                  const usedCount = usageData.date === today ? usageData.count : 0;
                  const limit = userTier === 1 ? 15 : (userTier === 2 ? 30 : 10);
                  return <>{usedCount} <span>/ {limit}</span></>;
                })()}
              </StatValueLarge>
            </div>
            <StatIconSquare>
              <Activity />
            </StatIconSquare>
          </StatCardBox>

          <PlanCardBox>
            <div>
              <StatLabel $dark>Current Plan</StatLabel>
              <PlanValue>{getTierName()}</PlanValue>
            </div>
            <PlanIconSquare>
              <Zap />
            </PlanIconSquare>
          </PlanCardBox>

          <ActivityCardBox>
            <ActivityHeader>
              <ActivityTitle>
                <div className="icon-wrap"><Activity /></div>
                ACTIVITY LOG
              </ActivityTitle>
              <ViewAllBtn>VIEW ALL</ViewAllBtn>
            </ActivityHeader>
            <ActivityList>
              <ActivityItem>
                <ActivityDot />
                <ActivityIconBox><User /></ActivityIconBox>
                <ActivityContent>
                  <ActivityName>Profile Updated</ActivityName>
                  <ActivitySub>via SpectraSaaS.sol</ActivitySub>
                </ActivityContent>
                <ActivityTime>2 mins ago</ActivityTime>
              </ActivityItem>
              <ActivityItem>
                <ActivityDot />
                <ActivityIconBox><RefreshCw /></ActivityIconBox>
                <ActivityContent>
                  <ActivityName>Gasless Swap Executed</ActivityName>
                  <ActivitySub>100 TYI → 0.028 ETH</ActivitySub>
                </ActivityContent>
                <ActivityTime>4 hours ago</ActivityTime>
              </ActivityItem>
              <ActivityItem>
                <ActivityDot />
                <ActivityIconBox><Star /></ActivityIconBox>
                <ActivityContent>
                  <ActivityName>Subscribed to VECTOR</ActivityName>
                  <ActivitySub>Soulbound NFT Minted</ActivitySub>
                </ActivityContent>
                <ActivityTime>2 days ago</ActivityTime>
              </ActivityItem>
            </ActivityList>
          </ActivityCardBox>
        </AnalyticsGrid>
      </BentoGrid>
    </Container>
  );
}
