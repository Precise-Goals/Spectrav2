import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, Edit2, Activity, Zap, Shield, Save, User, ArrowRightLeft, Star } from 'lucide-react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useError } from '../context/ErrorContext';
import { getProfile, createProfile, updateProfile } from '../lib/stellar/contracts/profile';
import { getUserTier } from "../services/tierVerification";

// Ponytail: Rewriting to Neo-Brutalist Cyberpunk aesthetic per user request.

/* ─── Styled Components (Neo-Brutalism Layout) ────────────────────── */

const Container = styled.div`
  padding: 120px 24px 64px;
  background-color: #030406;
  background-image: 
    linear-gradient(rgba(29, 78, 216, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 78, 216, 0.05) 1px, transparent 1px);
  background-size: 40px 40px;
  color: #fff;
  font-family: 'Geist Mono', monospace;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Grid = styled.div`
  max-width: 1100px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-top: 24px;

  @media (min-width: 900px) {
    grid-template-columns: 1.2fr 1fr;
  }
`;

const CyberCard = styled('div').withConfig({
  shouldForwardProp: (prop) => !['bg', 'borderColor', 'color'].includes(prop)
})`
  background-color: ${props => props.bg || '#0A0A0C'};
  border: 1px solid ${props => props.borderColor || '#1D4ED8'};
  padding: 32px;
  position: relative;
  color: ${props => props.color || '#fff'};
  display: flex;
  flex-direction: column;
  width:100%;
  &::before {
    content: '';
    position: absolute;
    top: -1px; right: -1px;
    width: 32px; height: 32px;
    background-color: ${props => props.bg === '#1D4ED8' ? '#0A0A0C' : '#fff'};
    background-image: radial-gradient(${props => props.bg === '#1D4ED8' ? '#1D4ED8' : '#0A0A0C'} 1px, transparent 1px);
    background-size: 4px 4px;
    clip-path: polygon(100% 0, 0 0, 100% 100%);
    z-index: 10;
  }
`;

const Flex = styled('div').withConfig({
  shouldForwardProp: (prop) => !['col', 'align', 'justify', 'gap', 'mt', 'mb', 'w', 'flex'].includes(prop)
})`
  display: flex;
  flex-direction: ${props => props.col ? 'column' : 'row'};
  align-items: ${props => props.align || 'flex-start'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap || '0'};
  margin-top: ${props => props.mt || '0'};
  margin-bottom: ${props => props.mb || '0'};
  width: ${props => props.w || 'auto'};
  flex: ${props => props.flex || 'none'};

`;

const Text = styled('span').withConfig({
  shouldForwardProp: (prop) => !['color', 'size', 'weight', 'upper', 'spacing', 'sans', 'lh', 'center'].includes(prop)
})`
  color: ${props => props.color || '#fff'};
  font-size: ${props => props.size || '14px'};
  font-weight: ${props => props.weight || '400'};
  text-transform: ${props => props.upper ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.spacing || 'normal'};
  font-family: ${props => props.sans ? "'Poppins', sans-serif" : "'Geist Mono', monospace"};
  line-height: ${props => props.lh || 'normal'};
  text-align: ${props => props.center ? 'center' : 'left'};
`;

const Badge = styled.div`
  background: #1D4ED8;
  color: #fff;
  padding: 6px 16px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const OutlineButton = styled('button').withConfig({
  shouldForwardProp: (prop) => !['full'].includes(prop)
})`
  background: transparent;
  color: #1D4ED8;
  border: 1px solid #1D4ED8;
  padding: 6px 16px;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  &:hover { background: rgba(29, 78, 216, 0.1); }
`;

const SolidButton = styled('button').withConfig({
  shouldForwardProp: (prop) => !['p', 'full'].includes(prop)
})`
  background: #1D4ED8;
  color: #fff;
  border: none;
  padding: ${props => props.p || '10px 20px'};
  text-transform: uppercase;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
  width: ${props => props.full ? '100%' : 'auto'};
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const AvatarBox = styled.div`
  width: 130px;
  height: 130px;
  background: #1D4ED8;
  padding: 4px;
  box-shadow: 8px 8px 0px #fff;
  margin-bottom: 16px;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: #0A0A0C;
  }
  
  @media (max-width: 600px) {
    width: 100px;
    height: 100px;
    box-shadow: 6px 6px 0px #fff;
  }
`;

const IconBox = styled.div`
  width: 36px;
  height: 36px;
  background: #1D4ED8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`;

const HollowIconBox = styled.div`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`;

const BlackIconBox = styled.div`
  width: 56px;
  height: 56px;
  background: #0A0A0C;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1D4ED8;
  flex-shrink: 0;
`;

const Divider = styled.div`
  width: 24px;
  height: 2px;
  background: #1D4ED8;
  margin: 32px 0;
`;

const Input = styled.input`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 14px;
  color: #fff;
  font-size: 14px;
  font-family: 'Geist Mono', monospace;
  outline: none;
  width: 100%;
  &:focus { border-color: #1D4ED8; }
`;

const TextArea = styled(Input).attrs({ as: 'textarea' })`
  resize: vertical;
  min-height: 80px;
`;

const LogItem = ({ icon, title, sub, time }) => (
  <Flex align="center" justify="space-between">
    <Flex align="center" gap="16px">
      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1D4ED8' }} />
      <HollowIconBox>
        {icon}
      </HollowIconBox>
      <Flex col gap="4px">
        <Text size="14px" weight="600">{title}</Text>
        <Text color="#9CA3AF" size="12px">{sub}</Text>
      </Flex>
    </Flex>
    <Text color="#9CA3AF" size="12px">{time}</Text>
  </Flex>
);

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function ProfileDashboard() {
  const { connectWallet, stellarPublicKey, isStellarConnected, fetchProfileAndTier } = useAuth();
  const { showError } = useError();
  const navigate = useNavigate();

  const account = stellarPublicKey;
  const [userTier, setUserTier] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatarId: 1,
    crossChainAddress: '',
  });

  useEffect(() => {
    const loadProfile = async (address) => {
      setLoading(true);
      try {
        if (isStellarConnected) {
          const [stellarProfile, tier] = await Promise.all([
            getProfile(address).catch(() => null),
            getUserTier(address).catch(() => 0),
          ]);
          
          if (stellarProfile && stellarProfile.name) {
            setHasProfile(true);
            setFormData({
              name:              stellarProfile.name,
              email:             stellarProfile.email,
              phone:             stellarProfile.phone,
              bio:               stellarProfile.bio,
              avatarId:          stellarProfile.avatarId || 1,
              crossChainAddress: stellarProfile.crossChainAddress || '',
            });
          }
          setUserTier(Number(tier));
        }
      } catch (err) {
        console.warn('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      loadProfile(account);
    } else {
      setTimeout(() => {
        setHasProfile(false);
        setFormData({ name: '', email: '', phone: '', bio: '', avatarId: 1 });
        setUserTier(0);
      }, 0);
    }
  }, [account, isStellarConnected]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (isStellarConnected) {
        if (hasProfile) {
          await updateProfile(stellarPublicKey, formData);
        } else {
          await createProfile(stellarPublicKey, formData);
        }
        setHasProfile(true);
        setIsEditing(false);
        if (fetchProfileAndTier) await fetchProfileAndTier(stellarPublicKey, true);
      } else {
        throw new Error('Please connect your Freighter wallet to save your profile.');
      }
    } catch (err) {
      showError(err.message || 'Failed to save profile. Make sure to confirm transaction.');
    } finally {
      setSaving(false);
    }
  };

  const getTierName = () => {
    if (userTier === 0) return 'ALPHA';
    if (userTier === 1) return 'VECTOR';
    return 'NEXUS';
  };

  if (!account) {
    return (
      <Container style={{ justifyContent: 'center' }} className='bg-grid-overlay'>
        <CyberCard style={{ maxWidth: '440px', width: '100%', alignItems: 'center' }}>
          <Shield size={56} style={{ margin: '0 auto 24px', color: '#1D4ED8' }} />
          <Text size="24px" weight="700" sans upper mb="16px">Web3 Identity Gateway</Text>
          <Text color="#9CA3AF" size="14px" mb="32px" center lh="1.6">
            Connect your Freighter wallet to access your unified Soroban profile.
          </Text>
          <Flex col gap="16px" w="100%">
            <SolidButton full onClick={async () => {
              try { await connectWallet('stellar'); } 
              catch(err) { showError(err.message || 'Failed to connect Freighter.'); }
            }}>
              Connect Freighter
            </SolidButton>
          </Flex>
        </CyberCard>
      </Container>
    );
  }

  return (
    <Container>
      <Grid>
        
        {/* Left Column: Identity Card */}
        <CyberCard style={{ height: '100%' }}>
          <Flex justify="space-between" align="center" mb="40px">
            <Badge>IDENTITY</Badge>
            {!isEditing && !loading && (
              <OutlineButton onClick={() => setIsEditing(true)}>
                <Edit2 size={12} /> EDIT
              </OutlineButton>
            )}
          </Flex>

          {isEditing ? (
            <Flex col gap="24px">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {[1, 2, 3, 4, 5, 6].map(id => (
                  <button 
                    key={id}
                    style={{ aspectRatio: '1', background: '#0A0A0C', border: `2px solid ${formData.avatarId === id ? '#1D4ED8' : 'transparent'}`, transition: 'all 0.2s', cursor: 'pointer', padding: '4px' }}
                    onClick={() => setFormData(prev => ({ ...prev, avatarId: id }))}
                  >
                    <img src={`/profile/${id}.png`} alt={`Avatar ${id}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + id; }} />
                  </button>
                ))}
              </div>

              <Flex col gap="8px" w="100%">
                <Text size="12px" color="#9CA3AF" upper>Display Name</Text>
                <Input placeholder="E.g. Hacker Neon" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
              </Flex>

              <Flex col gap="8px" w="100%">
                <Text size="12px" color="#9CA3AF" upper>Bio</Text>
                <TextArea placeholder="Decentralized identity developer..." value={formData.bio} onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))} />
              </Flex>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' , w:"100%"}}>
                <Flex col gap="8px" w="100%">
                  <Text size="12px" color="#9CA3AF" upper>Email</Text>
                  <Input type="email" placeholder="neon@spectra.ai" value={formData.email} onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} />
                </Flex>
                <Flex col gap="8px" w="100%">
                  <Text size="12px" color="#9CA3AF" upper>Phone</Text>
                  <Input placeholder="+1 555-0199" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} />
                </Flex>
              </div>

              <Flex gap="16px" mt="24px">
                <SolidButton onClick={saveProfile} disabled={saving}>
                  {saving ? 'SAVING...' : <><Save size={16} /> SAVE CHANGES</>}
                </SolidButton>
                <OutlineButton onClick={() => setIsEditing(false)}>CANCEL</OutlineButton>
              </Flex>
            </Flex>
          ) : (
            <Flex col gap="8px">
              <Flex align="center" gap="32px" mb="32px" style={{ flexWrap: 'wrap' }}>
                <AvatarBox>
                  <img src={`/profile/${formData.avatarId}.png`} alt="Profile Avatar" onError={(e) => { e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.avatarId; }} />
                </AvatarBox>
                <Flex col gap="12px">
                  <Text size="46px" weight="800" sans upper lh="1">{formData.name || 'ANONYMOUS USER'}</Text>
                  <Text color="#1D4ED8" size="14px" weight="600" upper spacing="0.05em">{getTierName()} SUBSCRIBER</Text>
                </Flex>
              </Flex>

              <Text color="#9CA3AF" size="14px" lh="1.8" style={{ maxWidth: '90%' }}>
                {formData.bio || 'No bio provided. Complete your profile node to register details.'}
              </Text>

              <Divider />

              <Flex col gap="16px">
                <Flex align="center" gap="16px">
                  <IconBox><Mail size={18} /></IconBox>
                  <Text color="#D1D5DB" size="14px">{formData.email || 'No email registered'}</Text>
                </Flex>
                <Flex align="center" gap="16px">
                  <IconBox><Phone size={18} /></IconBox>
                  <Text color="#D1D5DB" size="14px">{formData.phone || 'No phone registered'}</Text>
                </Flex>
                <Flex align="center" gap="16px">
                  <IconBox><Shield size={18} /></IconBox>
                  <Text color="#D1D5DB" size="14px">{account}</Text>
                </Flex>
              </Flex>
            </Flex>
          )}
        </CyberCard>

        {/* Right Column */}
        <Flex col gap="24px">
          
          {/* Usage Card */}
          <CyberCard>
            <Flex justify="space-between" align="center">
              <Flex col gap="12px">
                <Text color="#9CA3AF" size="12px" upper spacing="0.1em">HOURLY AGENT USAGES</Text>
                <div>
                  <Text color="#1D4ED8" size="42px" weight="700" sans>0</Text>
                  <Text size="42px" weight="700" sans> / {userTier === 0 ? '10' : userTier === 1 ? '15' : '30'}</Text>
                </div>
              </Flex>
              <HollowIconBox>
                <Activity size={20} color="#1D4ED8" />
              </HollowIconBox>
            </Flex>
          </CyberCard>

          {/* Plan Card */}
          <CyberCard bg="#1D4ED8" borderColor="#1D4ED8" color="#0A0A0C">
            <Flex justify="space-between" align="center">
              <Flex col gap="8px">
                <Text color="#0A0A0C" size="12px" upper spacing="0.1em" weight="600">CURRENT PLAN</Text>
                <Text color="#0A0A0C" size="42px" weight="800" sans upper>{getTierName()}</Text>
              </Flex>
              <BlackIconBox>
                <Zap size={28} fill="#1D4ED8" stroke="none" />
              </BlackIconBox>
            </Flex>
          </CyberCard>

          {/* Activity Log */}
          <CyberCard style={{ flex: 1 }}>
            <Flex justify="space-between" align="center" mb="32px">
              <Flex align="center" gap="12px">
                <Activity size={20} color="#1D4ED8" />
                <Text size="18px" weight="700" sans upper>ACTIVITY LOG</Text>
              </Flex>
              <SolidButton p="6px 16px">VIEW ALL</SolidButton>
            </Flex>

            <Flex col gap="32px">
              <LogItem 
                icon={<User size={16} />} 
                title="Profile Updated" 
                sub="via SpectraSaaS.sol" 
                time="2 mins ago" 
              />
              <LogItem 
                icon={<ArrowRightLeft size={16} />} 
                title="Gasless Swap Executed" 
                sub="100 USDC → 0.028 ETH" 
                time="4 hours ago" 
              />
              <LogItem 
                icon={<Star size={16} />} 
                title={`Subscribed to ${getTierName()}`} 
                sub="Soulbound NFT Minted" 
                time="2 days ago" 
              />
            </Flex>
          </CyberCard>

        </Flex>

      </Grid>
    </Container>
  );
}
