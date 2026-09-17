import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  LogIn, 
  UserPlus, 
  AlertTriangle, 
  Sparkles, 
  ArrowLeft
} from 'lucide-react';

export default function ProtectedRoute({ children, title = 'Protected Safety Portal' }) {
  const { isAuthenticated, quickDemoLogin, isLoading } = useAuth();
  const { setCurrentPage, triggerSos, showToast } = useApp();
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  if (isAuthenticated) {
    return children;
  }

  const handleDemoAccess = async () => {
    setIsDemoLoggingIn(true);
    try {
      await quickDemoLogin();
      showToast('Authenticated as Ananya Sharma (Demo Profile)', 'safe');
    } catch (err) {
      showToast('Demo login error: ' + err.message, 'danger');
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ 
      paddingTop: '40px', 
      paddingBottom: '80px', 
      maxWidth: '680px', 
      margin: '0 auto' 
    }}>
      {/* Back button */}
      <div style={{ marginBottom: '24px' }}>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => setCurrentPage('home')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>Return to Homepage</span>
        </button>
      </div>

      {/* Auth Gate Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(10, 15, 29, 0.98) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px',
        padding: '36px 28px',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.15)'
      }}>
        {/* Icon & Badge */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 0 24px rgba(99, 102, 241, 0.3)'
        }}>
          <Lock size={32} color="#818CF8" />
        </div>

        <span className="section-tag" style={{ marginBottom: '14px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>Protected Safety Area</span>
        </span>

        <h2 style={{ 
          fontSize: 'clamp(1.5rem, 3vw, 2rem)', 
          color: '#FFFFFF', 
          marginBottom: '12px',
          fontFamily: 'var(--font-heading)'
        }}>
          {title}
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '28px' }}>
          This section contains personal encrypted safety records, trusted guardian networks, or sensitive emergency settings. Please sign in or create an account to proceed.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => setCurrentPage('login')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <LogIn size={18} />
            <span>Log In to Your Account</span>
          </button>

          <button 
            className="btn btn-outline btn-lg"
            onClick={() => setCurrentPage('signup')}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <UserPlus size={18} />
            <span>Create New Safety Account</span>
          </button>

          <button 
            type="button"
            className="btn btn-secondary btn-md"
            onClick={handleDemoAccess}
            disabled={isDemoLoggingIn || isLoading}
            style={{ 
              width: '100%', 
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.12)',
              borderColor: 'rgba(99, 102, 241, 0.35)',
              color: '#C7D2FE'
            }}
          >
            <Sparkles size={16} color="#818CF8" />
            <span>{isDemoLoggingIn ? 'Unlocking Demo...' : 'Instant Demo Access (Ananya Sharma)'}</span>
          </button>
        </div>

        {/* Emergency SOS Banner (Always Accessible) */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 240px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={18} color="#EF4444" />
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 600 }}>
                Immediate Danger?
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                Emergency SOS does NOT require signing in.
              </div>
            </div>
          </div>

          <button 
            className="btn btn-danger btn-sm"
            onClick={triggerSos}
            style={{ whiteSpace: 'nowrap' }}
          >
            <AlertTriangle size={15} />
            <span>Trigger SOS Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
