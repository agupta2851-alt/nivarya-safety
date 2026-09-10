import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AlertTriangle, ShieldCheck, PhoneCall, CheckCircle2, Clock } from 'lucide-react';

export default function UnusualActivityModal() {
  const { isSafeCheckModalOpen, safeCheckReason, resolveSafeCheck } = useApp();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isSafeCheckModalOpen) {
      setCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-trigger SOS if no user response within 30s
          resolveSafeCheck(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSafeCheckModalOpen]);

  if (!isSafeCheckModalOpen) return null;

  return (
    <div className="sos-overlay" style={{ background: 'rgba(7, 11, 20, 0.92)' }}>
      <div className="sos-hud-box" style={{ borderColor: '#F59E0B', maxWidth: '460px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid #F59E0B',
          borderRadius: '9999px',
          padding: '6px 14px',
          color: '#FBBF24',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '12px'
        }}>
          <AlertTriangle size={16} />
          <span>UNUSUAL PATTERN DETECTED</span>
        </div>

        <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '8px' }}>
          Are You Safe?
        </h2>

        <p style={{ color: '#CBD5E1', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '16px' }}>
          {safeCheckReason || 'An unexpected route deviation or prolonged halt has been detected on your route.'}
        </p>

        {/* Big Countdown */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px dashed rgba(245, 158, 11, 0.4)',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Auto-Triggering Emergency SOS Broadcast In:
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#FBBF24', fontFamily: 'monospace' }}>
            {countdown}s
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
            If you do not respond, emergency alert will be dispatched to police and trusted contacts.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn btn-safe btn-lg btn-block"
            onClick={() => resolveSafeCheck(true)}
          >
            <CheckCircle2 size={20} />
            <span>I Am Safe (Everything is fine)</span>
          </button>

          <button 
            className="btn btn-danger btn-lg btn-block"
            onClick={() => resolveSafeCheck(false)}
          >
            <AlertTriangle size={20} />
            <span>I Am In Danger (Trigger SOS Now)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
