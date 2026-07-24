import React from 'react';
import styled from 'styled-components';
import { Hexagon, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useError } from '../../context/ErrorContext';

const SolidButton = styled.button`
  background: var(--color-primary);
  color: #000;
  border: none;
  padding: 14px 24px;
  font-family: 'Geist', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: ${props => props.full ? '100%' : 'auto'};
  
  &:hover {
    background: #fff;
    box-shadow: 0 0 16px rgba(255,255,255,0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Text = styled.p`
  margin: 0;
  font-family: ${props => props.sans ? "'Geist', sans-serif" : "'Geist Mono', monospace"};
  font-size: ${props => props.size || '14px'};
  font-weight: ${props => props.weight || '400'};
  color: ${props => props.color || '#fff'};
  text-transform: ${props => props.upper ? 'uppercase' : 'none'};
  letter-spacing: ${props => props.spacing || 'normal'};
  line-height: ${props => props.lh || '1.5'};
  margin-bottom: ${props => props.mb || '0'};
  text-align: ${props => props.center ? 'center' : 'left'};
`;

export default function ConnectWalletModal() {
  const { isWalletModalOpen, setWalletModalOpen, connectWallet } = useAuth();
  const { showError } = useError();

  if (!isWalletModalOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0, 0, 20, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', margin: '0 24px' }}>
        {/* The white offset block */}
        <div style={{ position: 'absolute', inset: 0, background: '#fff', transform: 'translate(-12px, 12px)', zIndex: 0 }}></div>
        
        {/* The main block */}
        <div style={{ position: 'relative', background: '#050505', border: '1px solid #1D4ED8', padding: '48px 32px', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button 
            onClick={() => setWalletModalOpen(false)} 
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#1D4ED8', cursor: 'pointer', padding: 0 }}
          >
            <X size={20} />
          </button>
          
          <Text size="42px" weight="800" sans upper center mb="16px" style={{ letterSpacing: '0.02em', color: '#fff' }}>LOGIN.</Text>
          
          <Text color="#9CA3AF" size="14px" mb="40px" center lh="1.6">
            Select your preferred network engine to authenticate.
          </Text>
          
          <SolidButton full onClick={async () => {
            try { 
              await connectWallet('stellar'); 
              setWalletModalOpen(false); 
            } catch(err) { 
              showError(err.message || 'Failed to connect Freighter.'); 
            }
          }}>
            <Hexagon size={18} />
            Connect Freighter
          </SolidButton>
        </div>
      </div>
    </div>
  );
}
