import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { 
  isValidEmail, 
  isValidIndianMobile, 
  normalizePhoneNumber 
} from '../services/authService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Lock, 
  HeartHandshake, 
  Calendar, 
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
  Heart
} from 'lucide-react';

export default function ProfileSetupPage() {
  const { currentUser, updateUserProfile } = useAuth();
  const { 
    userProfile, 
    setUserProfile, 
    setContacts,
    saveProfile,
    locationState, 
    requestGpsLocation, 
    setManualLocation, 
    setCurrentPage, 
    showToast,
    triggerSos
  } = useApp();

  const [formData, setFormData] = useState({
    name: currentUser?.name || userProfile?.name || '',
    email: currentUser?.email || userProfile?.email || '',
    phone: currentUser?.phone || userProfile?.phone || '',
    age: currentUser?.age || userProfile?.age || '',
    city: currentUser?.city || userProfile?.city || '',
    location: currentUser?.location || userProfile?.location || '',
    emergencyContactName: currentUser?.emergencyContact?.name || '',
    emergencyContactPhone: currentUser?.emergencyContact?.phone || '',
    emergencyContactRelation: currentUser?.emergencyContact?.relation || 'Parent',
    safetyPin: userProfile?.safetyPin || '',
    bloodGroup: userProfile?.bloodGroup || '',
    emergencyNotes: userProfile?.emergencyNotes || ''
  });

  const [locationChoice, setLocationChoice] = useState(locationState?.source === 'gps' ? 'gps' : 'manual');
  const [gpsRequesting, setGpsRequesting] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(Boolean(locationState?.coords));
  const [gpsError, setGpsError] = useState(locationState?.status === 'denied' ? 'Location permission denied by browser.' : '');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        email: prev.email || currentUser.email || '',
        phone: prev.phone || currentUser.phone || '',
        age: prev.age || currentUser.age || '',
        city: prev.city || currentUser.city || '',
        location: prev.location || currentUser.location || '',
        emergencyContactName: prev.emergencyContactName || currentUser.emergencyContact?.name || '',
        emergencyContactPhone: prev.emergencyContactPhone || currentUser.emergencyContact?.phone || ''
      }));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleRequestGps = async () => {
    setGpsRequesting(true);
    setGpsError('');
    try {
      const res = await requestGpsLocation();
      if (res && res.coords) {
        setGpsSuccess(true);
        setLocationChoice('gps');
        showToast(`Real GPS locked: ${res.coords.lat.toFixed(4)}°N, ${res.coords.lng.toFixed(4)}°E`, 'safe');
      }
    } catch (err) {
      setGpsSuccess(false);
      setGpsError(err.message || 'Location permission denied. Please enter location manually.');
      setLocationChoice('manual');
      showToast('Location permission denied or unavailable. Please enter manually.', 'info');
    } finally {
      setGpsRequesting(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    }

    const hasEmail = Boolean(formData.email.trim());
    const hasPhone = Boolean(formData.phone.trim());

    if (!hasEmail && !hasPhone) {
      errs.email = 'Please provide at least an email or mobile number.';
    }
    if (hasEmail && !isValidEmail(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (hasPhone && !isValidIndianMobile(formData.phone)) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }

    // Location validation: either GPS is locked OR city is specified
    if (!gpsSuccess && !formData.city.trim()) {
      errs.city = 'Please enter your city, or click "Use My Current Location" for GPS.';
    }

    if (!formData.emergencyContactName.trim()) {
      errs.emergencyContactName = 'Emergency Contact Name is required.';
    }
    if (!formData.emergencyContactPhone.trim()) {
      errs.emergencyContactPhone = 'Emergency Contact Phone is required.';
    } else if (!isValidIndianMobile(formData.emergencyContactPhone)) {
      errs.emergencyContactPhone = 'Enter a valid 10-digit emergency contact phone.';
    }

    if (!formData.safetyPin.trim() || formData.safetyPin.length < 4) {
      errs.safetyPin = 'Enter a 4-digit Safety PIN for emergency disarm.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please complete all required safety setup fields.', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanPhone = formData.phone.trim() ? normalizePhoneNumber(formData.phone) : '';
      const cleanEmail = formData.email.trim().toLowerCase();
      const cleanEmergencyPhone = normalizePhoneNumber(formData.emergencyContactPhone);

      const profilePayload = {
        name: formData.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        age: formData.age ? String(formData.age).trim() : '',
        city: formData.city.trim(),
        location: formData.location.trim(),
        address: formData.location.trim(),
        coords: locationState?.coords || null,
        safetyPin: formData.safetyPin.trim(),
        bloodGroup: formData.bloodGroup || '',
        emergencyNotes: formData.emergencyNotes.trim(),
        emergencyContactName: formData.emergencyContactName.trim(),
        emergencyContactPhone: cleanEmergencyPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        isProfileComplete: true
      };

      if (typeof saveProfile === 'function') {
        await saveProfile(profilePayload);
      } else {
        // Fallback for safety
        if (currentUser?.id && updateUserProfile) {
          await updateUserProfile(profilePayload);
        }
        setUserProfile(prev => ({
          ...prev,
          ...profilePayload
        }));
      }

      showToast(`Welcome, ${formData.name.trim()}! Your safety profile is ready.`, 'safe');
      setCurrentPage('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to save profile:', err);
      showToast('Failed to save profile: ' + (err?.message || 'An unexpected error occurred. Please verify your details.'), 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-setup-page container animate-fade-in" style={{
      paddingTop: '28px',
      paddingBottom: '80px',
      maxWidth: '680px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Top Welcome Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '20px',
        padding: '24px 20px',
        marginBottom: '24px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.25)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          color: 'var(--primary-light)'
        }}>
          <Sparkles size={24} />
        </div>

        <span className="section-tag" style={{ marginBottom: '8px' }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>Step 1 of 1 • Safety Profile Onboarding</span>
        </span>

        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#FFFFFF', fontWeight: 800, marginBottom: '8px' }}>
          Complete Your Safety Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
          Set up your real identity, primary emergency guardian, and location preference. This information is saved only on your device for emergency response.
        </p>
      </div>

      {/* Profile Setup Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Personal Details */}
        <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '18px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary-light)" />
            <span>1. Personal Information</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Full Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  name="name"
                  className={`input-field ${errors.name ? 'input-error' : ''}`}
                  placeholder="Enter your real full name"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                  required
                />
              </div>
              {errors.name && <span className="form-error-msg">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email"
                  name="email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
              {errors.email && <span className="form-error-msg">{errors.email}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* Mobile Number */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Primary Mobile Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="tel"
                  name="phone"
                  className={`input-field ${errors.phone ? 'input-error' : ''}`}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
              {errors.phone && <span className="form-error-msg">{errors.phone}</span>}
            </div>

            {/* Age (Optional) */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Age</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 400 }}>(Optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="number"
                  name="age"
                  min="13"
                  max="120"
                  className="input-field"
                  placeholder="e.g. 23"
                  value={formData.age}
                  onChange={handleChange}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Location & GPS Selection */}
        <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '18px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--safe-light)" />
            <span>2. Location & Geolocation</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '16px' }}>
            Nivarya never silently uses default coordinates. Select real device GPS or specify your city manually.
          </p>

          {/* Location Choice Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '18px' }}>
            {/* Choice A: Use My Current Location */}
            <button
              type="button"
              onClick={handleRequestGps}
              disabled={gpsRequesting}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: gpsSuccess ? '2px solid #10B981' : '1px solid rgba(16, 185, 129, 0.35)',
                background: gpsSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                color: '#FFFFFF',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <Navigation size={22} color={gpsSuccess ? '#34D399' : '#10B981'} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  {gpsRequesting ? 'Acquiring GPS Signal...' : 'Use My Current GPS Location'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                  {gpsSuccess ? '✓ Real Device GPS Active' : 'Request browser device geolocation'}
                </div>
              </div>
            </button>

            {/* Choice B: Enter Manually */}
            <button
              type="button"
              onClick={() => setLocationChoice('manual')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: locationChoice === 'manual' && !gpsSuccess ? '2px solid var(--primary)' : '1px solid var(--border-medium)',
                background: locationChoice === 'manual' && !gpsSuccess ? 'rgba(99, 102, 241, 0.15)' : 'rgba(15, 23, 42, 0.7)',
                color: '#FFFFFF',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <Building size={20} color="#818CF8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                  Enter Location Manually
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94A3B8' }}>
                  Type your city & landmark
                </div>
              </div>
            </button>
          </div>

          {/* Active status indicator */}
          {gpsSuccess && locationState?.coords && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.84rem',
              color: '#34D399',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} />
              <span>Real GPS Locked: {locationState.coords.lat.toFixed(4)}°N, {locationState.coords.lng.toFixed(4)}°E (±{locationState.coords.accuracy}m)</span>
            </div>
          )}

          {gpsError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '0.84rem',
              color: '#F87171',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{gpsError}</span>
            </div>
          )}

          {/* City and Manual Location Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                City {!gpsSuccess && <span style={{ color: '#EF4444' }}>*</span>}
              </label>
              <input 
                type="text"
                name="city"
                className={`input-field ${errors.city ? 'input-error' : ''}`}
                placeholder="e.g. Mumbai, Delhi, Bengaluru, Hyderabad"
                value={formData.city}
                onChange={handleChange}
                required={!gpsSuccess}
              />
              {errors.city && <span className="form-error-msg">{errors.city}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Preferred Area / Landmark
              </label>
              <input 
                type="text"
                name="location"
                className="input-field"
                placeholder="e.g. Sector 14, Indiranagar, North Campus"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Guardian & Security PIN */}
        <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '18px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HeartHandshake size={18} color="#EC4899" />
            <span>3. Emergency Guardian & Safety PIN</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            {/* Emergency Contact Name */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Emergency Guardian Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input 
                type="text"
                name="emergencyContactName"
                className={`input-field ${errors.emergencyContactName ? 'input-error' : ''}`}
                placeholder="e.g. Mother, Sister, Father, Friend"
                value={formData.emergencyContactName}
                onChange={handleChange}
                required
              />
              {errors.emergencyContactName && <span className="form-error-msg">{errors.emergencyContactName}</span>}
            </div>

            {/* Emergency Contact Number */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Guardian Phone Number <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input 
                type="tel"
                name="emergencyContactPhone"
                className={`input-field ${errors.emergencyContactPhone ? 'input-error' : ''}`}
                placeholder="10-digit emergency number"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                required
              />
              {errors.emergencyContactPhone && <span className="form-error-msg">{errors.emergencyContactPhone}</span>}
            </div>

            {/* Relationship */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Relationship</label>
              <select 
                name="emergencyContactRelation"
                className="input-field"
                value={formData.emergencyContactRelation}
                onChange={handleChange}
              >
                <option value="Parent">Parent</option>
                <option value="Sibling">Sibling</option>
                <option value="Spouse">Spouse / Partner</option>
                <option value="Friend">Friend</option>
                <option value="Guardian">Guardian</option>
                <option value="Hostel Warden">Hostel Warden</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '16px' }}>
            {/* Safety PIN */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#EF4444" />
                <span>Safety PIN (Emergency Disarm) <span style={{ color: '#EF4444' }}>*</span></span>
              </label>
              <input 
                type="password"
                maxLength={4}
                name="safetyPin"
                className={`input-field ${errors.safetyPin ? 'input-error' : ''}`}
                placeholder="4-digit PIN (e.g. 1234)"
                value={formData.safetyPin}
                onChange={handleChange}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Used to cancel false alarms and disarm sirens.
              </span>
              {errors.safetyPin && <span className="form-error-msg">{errors.safetyPin}</span>}
            </div>

            {/* Blood Group */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Heart size={14} color="#EC4899" />
                <span>Blood Group (For Medical SOS)</span>
              </label>
              <select 
                name="bloodGroup"
                className="input-field"
                value={formData.bloodGroup}
                onChange={handleChange}
              >
                <option value="">Select Blood Group (Optional)</option>
                <option value="A+ Positive">A+ Positive</option>
                <option value="A- Negative">A- Negative</option>
                <option value="B+ Positive">B+ Positive</option>
                <option value="B- Negative">B- Negative</option>
                <option value="O+ Positive">O+ Positive</option>
                <option value="O- Negative">O- Negative</option>
                <option value="AB+ Positive">AB+ Positive</option>
                <option value="AB- Negative">AB- Negative</option>
              </select>
            </div>
          </div>

          {/* Emergency Medical Notes */}
          <div className="form-group" style={{ marginTop: '16px', marginBottom: 0 }}>
            <label className="form-label">
              Emergency Medical Notes <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 400 }}>(Optional)</span>
            </label>
            <input 
              type="text"
              name="emergencyNotes"
              className="input-field"
              placeholder="e.g. Asthmatic, allergic to penicillin, wearing medical alert band"
              value={formData.emergencyNotes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Button Strip */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <button
            type="button"
            onClick={triggerSos}
            className="btn btn-danger btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Emergency SOS (Always Ready)</span>
          </button>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
            style={{ minWidth: '220px', justifyContent: 'center' }}
          >
            <span>{isSubmitting ? 'Saving Profile...' : 'Complete Setup & Go to Dashboard'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
