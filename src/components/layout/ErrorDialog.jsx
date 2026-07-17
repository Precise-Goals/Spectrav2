import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useError } from '../../context/ErrorContext';

// Ponytail: Skipped react-toastify. Native <dialog> with ::backdrop covers this entirely.

/* ─── Animations ──────────────────────────────────────────────────────────── */

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(-12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1);    }
`;

/* ─── Styled Components ───────────────────────────────────────────────────── */

const Dialog = styled.dialog`
  border: none;
  padding: 0;
  background: transparent;
  width: min(480px, 92vw);
  outline: none;

  &::backdrop {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
`;

const Card = styled.div`
  background: linear-gradient(
    135deg,
    rgba(15, 10, 20, 0.97) 0%,
    rgba(30, 10, 40, 0.95) 100%
  );
  border: 1px solid rgba(176, 38, 255, 0.35);
  border-top: 1px solid rgba(239, 68, 68, 0.5);
  border-radius: 16px;
  padding: 28px;
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.6),
    0 0 40px rgba(176, 38, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
  animation: ${slideIn} 0.22s cubic-bezier(0.22, 1, 0.36, 1) forwards;
`;

const IconRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ErrorIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
`;

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Label = styled.span`
  font-family: 'Geist', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ef4444;
`;

const Title = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
`;

const Body = styled.p`
  font-family: 'Geist', monospace;
  font-size: 13px;
  line-height: 1.65;
  color: #a1a1aa;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 24px;
  word-break: break-word;
`;

const Footer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const DismissBtn = styled.button`
  padding: 10px 22px;
  border-radius: 8px;
  border: 1px solid rgba(176, 38, 255, 0.4);
  background: rgba(176, 38, 255, 0.15);
  color: #fff;
  font-family: 'Geist', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(176, 38, 255, 0.3);
    border-color: rgba(176, 38, 255, 0.7);
    box-shadow: 0 0 16px rgba(176, 38, 255, 0.25);
  }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */

/**
 * ErrorDialog — renders once at app root via ErrorProvider.
 * Reads from ErrorContext; call useError().showError(msg) from anywhere.
 */
export default function ErrorDialog() {
  const { error, clearError } = useError();
  const dialogRef = useRef(null);

  // Drive native dialog open/close imperatively
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (error && !el.open) {
      el.showModal();
    } else if (!error && el.open) {
      el.close();
    }
  }, [error]);

  // Allow Escape key to dismiss
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e) => { e.preventDefault(); clearError(); };
    el.addEventListener('cancel', handleCancel);
    return () => el.removeEventListener('cancel', handleCancel);
  }, [clearError]);

  return (
    <Dialog ref={dialogRef} id="spectra-error-dialog">
      {error && (
        <Card>
          <IconRow>
            <ErrorIcon>⚠️</ErrorIcon>
            <TitleBlock>
              <Label>System Alert</Label>
              <Title>{error.title}</Title>
            </TitleBlock>
          </IconRow>
          <Body>{error.message}</Body>
          <Footer>
            <DismissBtn id="error-dialog-dismiss" onClick={clearError}>
              Dismiss
            </DismissBtn>
          </Footer>
        </Card>
      )}
    </Dialog>
  );
}
