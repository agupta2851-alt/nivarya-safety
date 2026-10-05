import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft,
  KeyRound,
  X,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const { login, loginWithGoogle, quickDemoLogin, resetPassword, isLoading } = useAuth();
  const { setCurrentPage, setUserProfile, syncUserProfileFromSession, showToast, triggerSos, t } = useApp();

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Validation & Error States
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const validateForm = () => {
    const errs = {};
    if (!identifier.trim()) {
      errs.identifier = 'Please enter your email or 10-digit mobile number';
    }
    if (!password) {
      errs.password = 'Please enter your password';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const user = await login(identifier, password);
      // Synchronize with AppContext profile, contacts, and location
      if (typeof syncUserProfileFromSession === 'function') {
        syncUserProfileFromSession(user);
      } else {
        setUserProfile(prev => ({
          ...prev,
          name: user.name,
          email: user.email || '',
          phone: user.phone || '',
          city: user.city || '',
          location: user.location || '',
          bloodGroup: user.bloodGroup || '',
          emergencyNotes: user.emergencyNotes || '',
          safetyPin: user.safetyPin || '',
          isProfileComplete: Boolean(user.isProfileComplete)
        }));
      }
      showToast(`Welcome back, ${user.name}! Safety Guard active.`, 'safe');
      if (!user.isProfileComplete) {
        setCurrentPage('profile-setup');
      } else {
        setCurrentPage('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGeneralError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError('');
    setIsGoogleSubmitting(true);
    try {
      const user = await loginWithGoogle();
      if (typeof syncUserProfileFromSession === 'function') {
        syncUserProfileFromSession(user);
      } else {
        setUserProfile(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          phone: user.phone || prev.phone
        }));
      }
      showToast('Signed in securely with Google.', 'safe');
      if (!user.isProfileComplete) {
        setCurrentPage('profile-setup');
      } else {
        setCurrentPage('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      // Show as a gentle info notice, not a destructive error —
      // Google OAuth is intentionally not configured in this prototype
      setGeneralError(err.message || 'Google sign-in is not available. Please use email/password login.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleQuickDemo = async () => {
    setGeneralError('');
    setIsDemoSubmitting(true);
    try {
      const user = await quickDemoLogin();
      if (typeof syncUserProfileFromSession === 'function') {
        syncUserProfileFromSession(user);
      } else {
        setUserProfile(prev => ({
          ...prev,
          name: user.name,
          email: user.email,
          phone: user.phone
        }));
      }
      showToast(`Signed in as ${user.name}.`, 'safe');
      if (!user.isProfileComplete) {
        setCurrentPage('profile-setup');
      } else {
        setCurrentPage('dashboard');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGeneralError(err.message || 'Demo login failed.');
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError('Please enter a valid email address.');
      return;
    }
    setIsResetting(true);
    try {
      await resetPassword(forgotEmail);
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.message || 'Failed to dispatch reset link.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="login-page container animate-fade-in" style={{
      paddingTop: '32px',
      paddingBottom: '80px',
      maxWidth: '520px',
      margin: '0 auto'
    }}>
      {/* Top back navigation */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          className="btn btn-ghost btn-sm"
          onClick={() => setCurrentPage('home')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <span className="badge badge-safe">
          <span className="demo-banner-dot" style={{ width: '6px', height: '6px' }}></span>
          <span>SSL 256-Bit Encrypted</span>
        </span>
      </div>

      {/* Main Login Card */}
      <div className="glass-card" style={{
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(99, 102, 241, 0.12)',
        position: 'relative'
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div 
            onClick={() => setCurrentPage('home')}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            <div className="brand-logo-wrap" style={{ width: '42px', height: '42px' }}>
              <img src="/shield.svg" alt="Nivarya Shield" className="brand-logo-img" />
            </div>
            <div className="brand-text-block" style={{ textAlign: 'left' }}>
              <span className="brand-title" style={{ fontSize: '1.4rem' }}>{t.brandName || 'NIVARYA'}</span>
              <span className="brand-tagline" style={{ fontSize: '0.72rem' }}>{t.tagline || 'Move Without Fear.'}</span>
            </div>
          </div>

          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            marginBottom: '6px',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access your personal safety dashboard, route guard, and guardian network.
          </p>
        </div>

        {/* General Error Banner */}
        {generalError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '20px',
            color: '#FCA5A5',
            fontSize: '0.88rem'
          }} role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              <span>{generalError}</span>
            </div>
            {generalError.includes('No account found') && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentPage('signup')}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  fontWeight: 700,
                  marginTop: '10px',
                  padding: '8px 12px'
                }}
              >
                Create an Account Now
              </button>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} noValidate>
          {/* Email / Mobile Field */}
          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label" htmlFor="login-identifier" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Email or Mobile Number</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="login-identifier"
                type="text"
                className={`form-control ${errors.identifier ? 'error' : ''}`}
                placeholder="name@example.com or 9876543210"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors(prev => ({ ...prev, identifier: null }));
                }}
                style={{
                  paddingLeft: '42px',
                  borderColor: errors.identifier ? '#EF4444' : undefined,
                  fontSize: '0.92rem'
                }}
                autoComplete="username"
              />
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: errors.identifier ? '#EF4444' : 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex'
              }}>
                <Mail size={18} />
              </div>
            </div>
            {errors.identifier && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '5px', display: 'block' }}>
                {errors.identifier}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" htmlFor="login-password" style={{ marginBottom: 0 }}>
                Password
              </label>
              <button 
                type="button" 
                className="btn-ghost"
                onClick={() => {
                  setForgotEmail(identifier.includes('@') ? identifier : '');
                  setForgotSuccess(false);
                  setForgotError('');
                  setIsForgotModalOpen(true);
                }}
                style={{ 
                  color: 'var(--primary-light)', 
                  fontSize: '0.82rem', 
                  padding: 0,
                  fontWeight: 500
                }}
              >
                Forgot Password?
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Enter your security password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                }}
                style={{
                  paddingLeft: '42px',
                  paddingRight: '42px',
                  borderColor: errors.password ? '#EF4444' : undefined,
                  fontSize: '0.92rem'
                }}
                autoComplete="current-password"
              />
              <div style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: errors.password ? '#EF4444' : 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex'
              }}>
                <Lock size={18} />
              </div>

              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '5px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember me option */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px' }}>
            <input 
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                accentColor: 'var(--primary)',
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <label htmlFor="remember-me" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', cursor: 'pointer' }}>
              Keep me signed in on this device
            </label>
          </div>

          {/* Primary Login Button */}
          <button 
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting || isLoading}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '14px 20px',
              borderRadius: '12px',
              boxShadow: '0 4px 18px rgba(99, 102, 241, 0.45)'
            }}
          >
            <LogIn size={18} />
            <span>{isSubmitting ? 'Verifying Credentials...' : 'Log In'}</span>
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '22px 0',
          color: 'var(--text-dim)',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></span>
          <span style={{ padding: '0 12px' }}>OR</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }}></span>
        </div>

        {/* Continue with Google */}
        <button 
          type="button"
          className="btn btn-outline"
          onClick={handleGoogleLogin}
          disabled={isGoogleSubmitting || isLoading}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '12px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'var(--border-medium)',
            color: '#FFFFFF',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.39 7.33 24 12 24z"/>
            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12c0 2.06.46 3.84 1.26 5.42l4.02-3.15z"/>
            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
          </svg>
          <span>
            {isGoogleSubmitting
              ? 'Checking Google...'
              : 'Continue with Google'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            background: 'rgba(255,165,0,0.18)',
            color: '#FBB040',
            borderRadius: '4px',
            padding: '1px 6px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginLeft: '4px'
          }}>Coming Soon</span>
        </button>

        {/* Quick Demo Login Option */}
        <div style={{ marginTop: '16px' }}>
          <button 
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleQuickDemo}
            disabled={isDemoSubmitting || isLoading}
            style={{
              width: '100%',
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.08)',
              borderColor: 'rgba(99, 102, 241, 0.25)',
              color: 'var(--primary-light)',
              fontSize: '0.82rem',
              padding: '10px 12px'
            }}
          >
            <Sparkles size={14} />
            <span>{isDemoSubmitting ? 'Authenticating Demo...' : '[DEMO] 1-Click Tester Login (Development Only)'}</span>
          </button>
        </div>

        {/* Switch to Signup Link */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button 
            type="button"
            className="btn-ghost"
            onClick={() => setCurrentPage('signup')}
            style={{
              color: 'var(--primary-light)',
              fontWeight: 700,
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            Create Account
          </button>
        </div>
      </div>

      {/* EMERGENCY SOS CARD (ALWAYS ACCESSIBLE WITHOUT LOGGING IN) */}
      <div className="glass-card animate-pulse-glow" style={{
        marginTop: '24px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '20px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 240px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(239, 68, 68, 0.6)',
            flexShrink: 0
          }}>
            <AlertTriangle size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.94rem' }}>
              Emergency Distress Access
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              In danger? SOS broadcast and siren NEVER require logging in.
            </div>
          </div>
        </div>

        <button 
          type="button"
          className="btn btn-danger btn-md"
          onClick={triggerSos}
          style={{
            padding: '10px 18px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap'
          }}
        >
          <AlertTriangle size={16} />
          <span>TRIGGER SOS</span>
        </button>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {isForgotModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '28px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setIsForgotModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                color: 'var(--text-muted)',
                padding: '6px'
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            {!forgotSuccess ? (
              <form onSubmit={handleResetPasswordSubmit}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <KeyRound size={18} color="#818CF8" />
                  </div>
                  <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                    Reset Password
                  </h3>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '18px', lineHeight: '1.5' }}>
                  Enter your registered email address. We will simulate sending a secure reset link to regain access.
                </p>

                {forgotError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    color: '#FCA5A5',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    marginBottom: '14px'
                  }}>
                    {forgotError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">Registered Email</label>
                  <input 
                    type="email"
                    className="form-control"
                    placeholder="e.g. your.email@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setIsForgotModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-sm"
                    disabled={isResetting}
                  >
                    {isResetting ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}>
                  <CheckCircle2 size={28} color="#10B981" />
                </div>
                <h4 style={{ color: '#FFFFFF', fontSize: '1.15rem', marginBottom: '8px' }}>
                  Reset Link Dispatched
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
                  A secure verification link has been queued for <strong>{forgotEmail}</strong>. (In production, this triggers your SMTP or Firebase Auth mailer).
                </p>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsForgotModalOpen(false)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
