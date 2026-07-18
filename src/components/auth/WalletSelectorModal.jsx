import { useState, useRef, useEffect } from "react";
import { X, Wallet, Hexagon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useError } from "../../context/ErrorContext";
import { isConnected } from '@stellar/freighter-api';

export default function WalletSelectorModal({ isOpen, onClose }) {
  const { connectWallet } = useAuth();
  const { showError } = useError();
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasFreighter, setHasFreighter] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const checkFreighter = async () => {
      try {
        if (window.freighterApi || window.freighter) {
          if (mounted) setHasFreighter(true);
          return;
        }
        const connRes = await isConnected();
        const freighterDetected = typeof connRes === 'object' && connRes !== null ? connRes.isConnected : connRes;
        if (mounted && freighterDetected) {
          setHasFreighter(true);
        }
      } catch (e) {
        console.warn('Freighter detection failed', e);
      }
    };
    checkFreighter();
    const timer = setTimeout(checkFreighter, 500);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleConnect = async (type) => {
    setIsConnecting(true);
    try {
      await connectWallet(type);
      onClose();
    } catch (err) {
      showError(err.message || `Failed to connect ${type} wallet`, 'Connection Failed');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <dialog ref={dialogRef} onClose={onClose} className="spectra-dialog">
      <div className="spectra-dialog-inner">
        <button className="spectra-dialog-close" onClick={onClose}><X size={20} /></button>
        <h2 className="spectra-dialog-title">Login.</h2>
        <p className="spectra-dialog-desc">Select your preferred network engine to authenticate.</p>
        
        {hasFreighter ? (
          <button 
            className="spectra-dialog-btn" 
            onClick={() => handleConnect('stellar')} 
            disabled={isConnecting}
          >
            <Hexagon size={18} />
            {isConnecting ? 'CONNECTING...' : 'Connect Freighter'}
          </button>
        ) : (
          <a 
            href="https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk"
            target="_blank"
            rel="noopener noreferrer"
            className="spectra-dialog-btn install-btn"
          >
            <Hexagon size={18} />
            Install Freighter
          </a>
        )}
      </div>
      <style>{`
        .spectra-dialog {
          padding: 0;
          border: 1px solid #1D4ED8;
          background: #030406;
          color: #fff;
          max-width: 500px;
          width: 100%;
          font-family: 'Poppins', sans-serif;
          box-shadow: -12px 12px 0 2px #fff;
          margin: auto;
        }
        .spectra-dialog::backdrop {
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
        }
        .spectra-dialog-inner {
          padding: 40px;
          position: relative;
        }
        .spectra-dialog-close {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: #1D4ED8;
          cursor: pointer;
        }
        .spectra-dialog-close:hover { color: #fff; }
        .spectra-dialog-title {
          font-size: 48px;
          font-weight: 700;
          text-align: center;
          margin: 0 0 16px 0;
          text-transform: uppercase;
        }
        .spectra-dialog-desc {
          text-align: center;
          color: #9CA3AF;
          margin-bottom: 32px;
          font-family: 'Geist Mono', monospace;
          font-size: 14px;
        }
        .spectra-dialog-btn {
          width: 100%;
          background: transparent;
          border: 1px solid #1D4ED8;
          color: #fff;
          padding: 16px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
          transition: all 0.2s;
          text-decoration: none;
        }
        .spectra-dialog-btn:hover:not(:disabled) {
          background: #1D4ED8;
          color: #fff;
        }
        .install-btn {
          background: rgba(16, 185, 129, 0.1);
          border-color: #10b981;
          color: #10b981;
        }
        .install-btn:hover {
          background: #10b981 !important;
          color: #fff !important;
        }
        .spectra-dialog-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </dialog>
  );
}
