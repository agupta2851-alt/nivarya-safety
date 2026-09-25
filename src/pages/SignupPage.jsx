import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  evaluatePasswordStrength, 
  isValidEmail, 
  isValidIndianMobile 
} from '../services/authService';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowLeft,
  AlertTriangle,
  Check,
  ShieldCheck,
  UserPlus
} from 'lucide-react';

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const { setCurrentPage, setUserProfile, showToast, triggerSos, t } = useApp();

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const pwdStrength = evaluatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const hasEmail = Boolean(formData.email.trim());
    const hasPhone = Boolean(formData.phone.trim());

    if (!hasEmail && !hasPhone) {
      errs.identifier = 'Please provide either an email address or a 10-digit mobile number.';
    }

    if (hasEmail && !isValidEmail(formData.email)) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (hasPhone && !isValidIndianMobile(formData.phone)) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters long.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const user = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password
      });

      // Synchronize with AppContext profile
      setUserProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email || '',
        phone: user.phone || ''
      }));

      showToast(`Account created! Welcome, ${user.name}. Let's set up your safety profile.`, 'safe');
      setCurrentPage('profile-setup');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page container animate-fade-in" style={{
      paddingTop: '28px',
      paddingBottom: '80px',
      maxWidth: '540px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top back navigation */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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
          <span>Zero Data Harvesting</span>
        </span>
      </div>

      {/* Main Registration Card */}
      <div className="glass-card" style={{
        background: 'rgba(15, 23, 42, 0.92)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(99, 102, 241, 0.28)',
        borderRadius: '24px',
        padding: '32px 24px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(99, 102, 241, 0.12)',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div 
            onClick={() => setCurrentPage('home')}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            <div className="brand-logo-wrap" style={{ width: '40px', height: '40px' }}>
              <img src="/shield.svg" alt="Nivarya Shield" className="brand-logo-img" />
            </div>
            <div className="brand-text-block" style={{ textAlign: 'left' }}>
              <span className="brand-title" style={{ fontSize: '1.35rem' }}>{t.brandName || 'NIVARYA'}</span>
              <span className="brand-tagline" style={{ fontSize: '0.7rem' }}>{t.tagline || 'Move Without Fear.'}</span>
            </div>
          </div>

          <h1 style={{ 
            fontSize: '1.7rem', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            marginBottom: '6px',
            fontFamily: 'var(--font-heading)'
          }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
            Sign up using your email or mobile number to activate route guarding and personal distress cascades.
          </p>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#FCA5A5',
            fontSize: '0.86rem'
          }} role="alert">
            <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
            <span>{generalError}</span>
          </div>
        )}

        {errors.identifier && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '12px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#FDE68A',
            fontSize: '0.84rem'
          }}>
            {errors.identifier}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="signup-name">
              Full Legal or Display Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="signup-name"
                name="name"
                type="text"
                className={`form-control ${errors.name ? 'error' : ''}`}
                placeholder="e.g. Priya Patel"
                value={formData.name}
                onChange={handleChange}
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                autoComplete="name"
                required
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: errors.name ? '#EF4444' : 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex'
              }}>
                <User size={18} />
              </div>
            </div>
            {errors.name && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="signup-email" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Email Address</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 400 }}>
                (Email or Mobile required)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="signup-email"
                name="email"
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                autoComplete="email"
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: errors.email ? '#EF4444' : 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex'
              }}>
                <Mail size={18} />
              </div>
            </div>
            {errors.email && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Mobile Field */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="signup-phone" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Mobile Number</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', fontWeight: 400 }}>
                10-digit Indian mobile
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="signup-phone"
                name="phone"
                type="tel"
                className={`form-control ${errors.phone ? 'error' : ''}`}
                placeholder="e.g. 9876543210"
                value={formData.phone}
                onChange={handleChange}
                style={{ paddingLeft: '40px', fontSize: '0.92rem' }}
                autoComplete="tel"
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: errors.phone ? '#EF4444' : 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex'
              }}>
                <Phone size={18} />
              </div>
            </div>
            {errors.phone && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {errors.phone}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="signup-password">
              Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.92rem' }}
                autoComplete="new-password"
                required
              />
              <div style={{
                position: 'absolute',
                left: '12px',
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

            {/* Password strength meter */}
            {formData.password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                  <span style={{ color: pwdStrength.color, fontWeight: 700 }}>{pwdStrength.label}</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pwdStrength.percentage}%`,
                    background: pwdStrength.color,
                    transition: 'width 0.3s ease, background 0.3s ease'
                  }}></div>
                </div>
              </div>
            )}

            {errors.password && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" htmlFor="signup-confirm-password">
              Confirm Password <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                id="signup-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ paddingLeft: '40px', paddingRight: '40px', fontSize: '0.92rem' }}
                autoComplete="new-password"
                required
              />
              <div style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: errors.confirmPassword ? '#EF4444' : 'var(--text-dim)',
                pointerEvents: 'none',
                display: 'flex'
              }}>
                <Lock size={18} />
              </div>
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Terms Agreement */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '22px' }}>
            <input 
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              style={{
                accentColor: 'var(--primary)',
                width: '18px',
                height: '18px',
                marginTop: '2px',
                cursor: 'pointer'
              }}
            />
            <label htmlFor="agreeTerms" style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', cursor: 'pointer', lineHeight: 1.5 }}>
              I agree to the <span style={{ color: 'var(--primary-light)' }}>Terms of Service</span> and acknowledge that emergency distress broadcast features require location authorization.
            </label>
          </div>
          {errors.agreeTerms && (
            <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '-12px', marginBottom: '16px', display: 'block' }}>
              {errors.agreeTerms}
            </span>
          )}

          {/* Submit Button */}
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
            <UserPlus size={18} />
            <span>{isSubmitting ? 'Creating Account...' : 'Create Account & Continue'}</span>
          </button>
        </form>

        {/* Switch to Login Link */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button 
            type="button"
            className="btn-ghost"
            onClick={() => setCurrentPage('login')}
            style={{
              color: 'var(--primary-light)',
              fontWeight: 700,
              padding: 0,
              textDecoration: 'underline'
            }}
          >
            Log In
          </button>
        </div>
      </div>

      {/* EMERGENCY SOS ALWAYS ACCESSIBLE */}
      <div className="glass-card animate-pulse-glow" style={{
        marginTop: '20px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        borderRadius: '20px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 220px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(239, 68, 68, 0.6)',
            flexShrink: 0
          }}>
            <AlertTriangle size={18} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.92rem' }}>
              Immediate Emergency?
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              SOS broadcast & siren NEVER require signing up.
            </div>
          </div>
        </div>

        <button 
          type="button"
          className="btn btn-danger btn-sm"
          onClick={triggerSos}
          style={{ fontWeight: 700, whiteSpace: 'nowrap' }}
        >
          <AlertTriangle size={15} />
          <span>TRIGGER SOS</span>
        </button>
      </div>
    </div>
  );
}
