import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  evaluatePasswordStrength, 
  isValidEmail, 
  isValidIndianMobile,
  normalizePhoneNumber 
} from '../services/authService';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  UserCheck, 
  ArrowLeft,
  AlertTriangle,
  HeartHandshake,
  Check
} from 'lucide-react';

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const { setCurrentPage, setUserProfile, addContact, showToast, triggerSos, t } = useApp();

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: 'Parent',
    agreeTerms: false
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
      errs.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required';
    } else if (!isValidIndianMobile(formData.phone)) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    // Emergency Contact Setup validation (Recommended for safety platform)
    if (formData.emergencyContactPhone && !isValidIndianMobile(formData.emergencyContactPhone)) {
      errs.emergencyContactPhone = 'Enter a valid 10-digit emergency contact number';
    }

    if (!formData.agreeTerms) {
      errs.agreeTerms = 'You must agree to the Terms of Service & Privacy Policy';
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
      const emergencyContact = formData.emergencyContactName ? {
        name: formData.emergencyContactName.trim(),
        phone: normalizePhoneNumber(formData.emergencyContactPhone),
        relation: formData.emergencyContactRelation
      } : null;

      const user = await signup({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        emergencyContact
      });

      // Synchronize with AppContext profile
      setUserProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone
      }));

      // Add emergency contact if specified
      if (emergencyContact && emergencyContact.name && emergencyContact.phone) {
        addContact({
          name: emergencyContact.name,
          phone: emergencyContact.phone,
          relation: emergencyContact.relation,
          isPrimary: true
        });
      }

      showToast(`Welcome to Nivarya, ${user.name}! Your safety guard is active.`, 'safe');
      setCurrentPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setGeneralError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="signup-page container animate-fade-in" style={{
      paddingTop: '32px',
      paddingBottom: '80px',
      maxWidth: '640px',
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
          <span>Zero Data Harvesting</span>
        </span>
      </div>

      {/* Main Registration Card */}
      <div className="glass-card" style={{
        background: 'rgba(15, 23, 42, 0.90)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.65), 0 0 35px rgba(99, 102, 241, 0.12)'
      }}>
        {/* Header */}
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
            <div className="brand-logo-wrap" style={{ width: '40px', height: '40px' }}>
              <img src="/shield.svg" alt="Nivarya Shield" className="brand-logo-img" />
            </div>
            <div className="brand-text-block" style={{ textAlign: 'left' }}>
              <span className="brand-title" style={{ fontSize: '1.35rem' }}>{t.brandName || 'NIVARYA'}</span>
              <span className="brand-tagline" style={{ fontSize: '0.7rem' }}>{t.tagline || 'Move Without Fear.'}</span>
            </div>
          </div>

          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 800, 
            color: '#FFFFFF', 
            marginBottom: '6px',
            fontFamily: 'var(--font-heading)'
          }}>
            Create Your Safety Account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Set up encrypted route guarding, personalized distress cascades, and verified emergency contacts.
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

        <form onSubmit={handleSubmit} noValidate>
          {/* 1. PERSONAL CREDENTIALS SECTION */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              1. Personal Details
            </div>

            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="signup-name">
                Full Name <span style={{ color: '#F87171' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="signup-name"
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Ananya Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    paddingLeft: '42px',
                    borderColor: errors.name ? '#EF4444' : undefined
                  }}
                  autoComplete="name"
                />
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: errors.name ? '#EF4444' : 'var(--text-dim)'
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

            {/* Email & Phone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* Email */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="signup-email">
                  Email Address <span style={{ color: '#F87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="signup-email"
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      paddingLeft: '42px',
                      borderColor: errors.email ? '#EF4444' : undefined
                    }}
                    autoComplete="email"
                  />
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.email ? '#EF4444' : 'var(--text-dim)'
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

              {/* Indian Mobile Number */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="signup-phone">
                  Mobile Number <span style={{ color: '#F87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="signup-phone"
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="98765 11223"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      paddingLeft: '42px',
                      borderColor: errors.phone ? '#EF4444' : undefined
                    }}
                    autoComplete="tel"
                  />
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.phone ? '#EF4444' : 'var(--text-dim)'
                  }}>
                    <Phone size={18} />
                  </div>
                </div>
                {errors.phone ? (
                  <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                    {errors.phone}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.74rem', marginTop: '4px', display: 'block' }}>
                    Used for SMS SOS relays in offline zones
                  </span>
                )}
              </div>
            </div>

            {/* Password & Confirm Password Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {/* Password */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="signup-password">
                  Password <span style={{ color: '#F87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      paddingLeft: '42px',
                      paddingRight: '42px',
                      borderColor: errors.password ? '#EF4444' : undefined
                    }}
                    autoComplete="new-password"
                  />
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.password ? '#EF4444' : 'var(--text-dim)'
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
                      color: 'var(--text-muted)',
                      padding: '4px'
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Password strength visual meter */}
                {formData.password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.74rem',
                      marginBottom: '4px'
                    }}>
                      <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                      <span style={{ color: pwdStrength.color, fontWeight: 700 }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${pwdStrength.percentage}%`,
                        height: '100%',
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

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="signup-confirm-password">
                  Confirm Password <span style={{ color: '#F87171' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    id="signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={{
                      paddingLeft: '42px',
                      paddingRight: '42px',
                      borderColor: errors.confirmPassword 
                        ? '#EF4444' 
                        : (formData.confirmPassword && formData.confirmPassword === formData.password)
                          ? '#10B981'
                          : undefined
                    }}
                    autoComplete="new-password"
                  />
                  <div style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.confirmPassword ? '#EF4444' : 'var(--text-dim)'
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
                      color: 'var(--text-muted)',
                      padding: '4px'
                    }}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {formData.confirmPassword && (
                  <div style={{ marginTop: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {formData.password === formData.confirmPassword ? (
                      <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> Passwords match
                      </span>
                    ) : (
                      <span style={{ color: '#F87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={14} /> Passwords do not match
                      </span>
                    )}
                  </div>
                )}

                {errors.confirmPassword && (
                  <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. EMERGENCY CONTACT SETUP (RECOMMENDED) */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.06)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '22px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HeartHandshake size={18} color="#818CF8" />
              <h3 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Primary Emergency Guardian
              </h3>
              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                Recommended
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '14px' }}>
              This guardian receives live tracking alerts, simulated automated check-ins, and priority distress SMS.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Guardian Name</label>
                <input 
                  type="text"
                  name="emergencyContactName"
                  className="form-control"
                  placeholder="e.g. Sunita Sharma"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  style={{ fontSize: '0.88rem', padding: '10px 14px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Guardian Mobile</label>
                <input 
                  type="tel"
                  name="emergencyContactPhone"
                  className="form-control"
                  placeholder="e.g. 98765 43210"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  style={{ fontSize: '0.88rem', padding: '10px 14px' }}
                />
                {errors.emergencyContactPhone && (
                  <span style={{ color: '#F87171', fontSize: '0.74rem', marginTop: '3px', display: 'block' }}>
                    {errors.emergencyContactPhone}
                  </span>
                )}
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Relationship</label>
                <select 
                  name="emergencyContactRelation"
                  className="form-control"
                  value={formData.emergencyContactRelation}
                  onChange={handleChange}
                  style={{ fontSize: '0.88rem', padding: '10px 14px' }}
                >
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Friend">Friend / Roommate</option>
                  <option value="Hostel Warden">Hostel Warden</option>
                  <option value="College Security">Campus Security</option>
                  <option value="Other">Other Guardian</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. TERMS & PRIVACY CHECKBOX */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4'
            }}>
              <input 
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                style={{
                  accentColor: 'var(--primary)',
                  width: '18px',
                  height: '18px',
                  marginTop: '2px',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
              <span>
                I agree to Nivarya's <strong style={{ color: '#FFFFFF' }}>Terms of Service</strong> and consent to encrypted client-side telemetry processing for emergency safety broadcasts and journey monitoring.
              </span>
            </label>
            {errors.agreeTerms && (
              <span style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
                {errors.agreeTerms}
              </span>
            )}
          </div>

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
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.45)'
            }}
          >
            <UserCheck size={18} />
            <span>{isSubmitting ? 'Creating Safe Account...' : 'Create Account'}</span>
          </button>
        </form>

        {/* Link back to login */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
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

      {/* EMERGENCY SOS BANNER (ALWAYS ACCESSIBLE WITHOUT AUTH) */}
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
              In Immediate Distress?
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              SOS siren, GPS sharing, and emergency relay work without registration.
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
    </div>
  );
}
