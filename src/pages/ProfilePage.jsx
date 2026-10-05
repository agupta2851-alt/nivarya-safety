import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { availableLanguages } from '../data/translations';
import { safetyModesData } from '../data/initialData';
import { 
  User, 
  Shield, 
  Key, 
  Globe, 
  Bell, 
  Lock, 
  Trash2, 
  Save, 
  Heart, 
  CheckCircle2, 
  AlertTriangle,
  BatteryCharging,
  Sliders,
  Sparkles,
  Download,
  LogOut,
  MapPin
} from 'lucide-react';

export default function ProfilePage() {
  const { 
    userProfile, 
    setUserProfile, 
    saveProfile,
    language, 
    changeLanguage, 
    setCurrentPage, 
    showToast,
    safetyMode,
    changeSafetyMode,
    batteryLevel,
    isLowBatteryMode,
    toggleLowBatteryMode,
    exportPersonalData,
    locationState,
    setIsLocationConsentModalOpen,
    t 
  } = useApp();

  const { currentUser, logout, updateUserProfile } = useAuth();

  const [name, setName] = useState(userProfile.name || currentUser?.name || '');
  const [phone, setPhone] = useState(userProfile.phone || currentUser?.phone || '');
  const [age, setAge] = useState(userProfile.age || '');
  const [city, setCity] = useState(userProfile.city || '');
  const [manualLocation, setManualLocationVal] = useState(userProfile.manualLocation || '');
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup || 'O+ Positive');
  const [emergencyNotes, setEmergencyNotes] = useState(userProfile.emergencyNotes || '');
  const [safetyPin, setSafetyPin] = useState(userProfile.safetyPin || '');
  const [sosDelay, setSosDelay] = useState(userProfile.sosDelay || 3);
  const [highAccuracyGps, setHighAccuracyGps] = useState(userProfile.highAccuracyGps !== false);

  React.useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || currentUser?.name || '');
      setPhone(userProfile.phone || currentUser?.phone || '');
      setAge(userProfile.age || '');
      setCity(userProfile.city || '');
      setManualLocationVal(userProfile.manualLocation || '');
      setBloodGroup(userProfile.bloodGroup || 'O+ Positive');
      setEmergencyNotes(userProfile.emergencyNotes || '');
      setSafetyPin(userProfile.safetyPin || '');
      if (userProfile.sosDelay != null) setSosDelay(userProfile.sosDelay);
    }
  }, [userProfile, currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const updated = {
      name,
      phone,
      age,
      city,
      manualLocation,
      location: manualLocation || city,
      bloodGroup,
      emergencyNotes,
      safetyPin,
      sosDelay: Number(sosDelay),
      highAccuracyGps
    };
    if (safetyPin.trim() && safetyPin.trim().length < 4) {
      showToast('Safety PIN must be at least 4 digits.', 'danger');
      return;
    }
    try {
      if (typeof saveProfile === 'function') {
        await saveProfile(updated);
      } else {
        setUserProfile(prev => ({
          ...prev,
          ...updated
        }));
        if (updateUserProfile) {
          await updateUserProfile(updated);
        }
      }
      showToast('Profile and security preferences updated successfully!', 'safe');
    } catch (err) {
      showToast('Failed to update profile: ' + (err?.message || 'Error saving changes'), 'danger');
    }
  };

  const handleResetDemoData = () => {
    if (window.confirm('Clear all local session cache and stored data? This will log you out.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="profile-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px', maxWidth: '840px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <span className="section-tag">
          <User size={14} />
          <span>Security & Identity</span>
        </span>
        <h1 className="section-title">
          {t.profile.title}
        </h1>
        <p className="section-desc">
          {t.profile.subtitle}
        </p>
      </div>

      {/* Active Account Identity Card */}
      {currentUser && (
        <div className="glass-card" style={{
          padding: '20px 24px',
          borderRadius: '18px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}>
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.02rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{currentUser.name}</span>
                <span className="badge badge-safe" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                  {currentUser.provider === 'google' ? 'Google SSO' : 'Verified Member'}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {currentUser.email} • {currentUser.phone || userProfile.phone}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={async () => {
              await logout();
              showToast('Logged out of your safety profile.', 'info');
              setCurrentPage('home');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      )}

      <form onSubmit={handleSaveProfile}>
        {/* 1. Personal Information */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--primary-light)" />
            <span>Personal & Medical Information</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Mobile Phone</label>
              <input 
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Age (Optional)</label>
              <input 
                type="number"
                min="10"
                max="120"
                className="input-field"
                placeholder="e.g. 24"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Mumbai, Bengaluru, Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred / Manual Location</label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Indiranagar, Bengaluru"
                value={manualLocation}
                onChange={(e) => setManualLocationVal(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select 
                className="input-field"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
              >
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

            <div className="form-group">
              <label className="form-label">Emergency Medical Notes</label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Asthmatic, Penicillin allergy (optional)"
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Location & Geolocation Privacy Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="#10B981" />
              <span>Location Privacy & Geolocation Status</span>
            </h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsLocationConsentModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <MapPin size={14} />
              <span>Change Location Mode / Re-detect</span>
            </button>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '12px',
            padding: '14px 18px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current Location Status</div>
              <div style={{ fontWeight: 600, color: '#FFFFFF', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: locationState?.mode === 'gps' ? '#10B981' : (locationState?.mode === 'manual' ? '#6366F1' : '#F59E0B')
                }}></span>
                <span>
                  {locationState?.mode === 'gps' && locationState.coords
                    ? `Live Device GPS (${locationState.coords.lat.toFixed(4)}, ${locationState.coords.lng.toFixed(4)})`
                    : (locationState?.mode === 'manual' && locationState.manualAddress
                      ? `Manual Location: ${locationState.manualAddress}`
                      : 'Location not configured')}
                </span>
              </div>
            </div>
            <span className={`badge ${locationState?.mode === 'gps' ? 'badge-safe' : 'badge-primary'}`}>
              {locationState?.mode === 'gps' ? 'Real-Time GPS' : (locationState?.mode === 'manual' ? 'Manual Fallback' : 'Pending')}
            </span>
          </div>
        </div>

        {/* 2. Security & SOS Settings */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="#EF4444" />
            <span>Emergency SOS Security PIN & Cancellation</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Safety Cancellation PIN</label>
              <input 
                type="password"
                maxLength={4}
                className="input-field"
                placeholder="4-digit PIN (1234)"
                value={safetyPin}
                onChange={(e) => setSafetyPin(e.target.value)}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Required to disarm active emergency siren & broadcasts (Default: 1234).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">SOS Trigger Countdown Delay</label>
              <select 
                className="input-field"
                value={sosDelay}
                onChange={(e) => setSosDelay(e.target.value)}
              >
                <option value={3}>3 Seconds (Standard Protocol)</option>
                <option value={5}>5 Seconds</option>
                <option value={10}>10 Seconds (Extra buffer)</option>
              </select>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '4px', display: 'block' }}>
                Audible warning buffer to abort accidental presses before alarm dispatch.
              </span>
            </div>
          </div>
        </div>

        {/* 3. Safety Mode & Language */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', marginBottom: '28px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--safe-light)" />
            <span>Platform Language & Context Mode</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Interface Language (10 Indian Languages)</label>
              <select 
                className="input-field"
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                {availableLanguages.map(item => (
                  <option key={item.code} value={item.code}>
                    {item.label} - {item.native}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Context Safety Profile Mode</label>
              <select 
                className="input-field"
                value={safetyMode}
                onChange={(e) => changeSafetyMode(e.target.value)}
              >
                {safetyModesData.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.tag})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <input 
              type="checkbox"
              id="highAccuracyGpsCheck"
              checked={highAccuracyGps}
              onChange={(e) => setHighAccuracyGps(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
            />
            <label htmlFor="highAccuracyGpsCheck" style={{ fontSize: '0.88rem', color: '#CBD5E1', cursor: 'pointer' }}>
              Enable High-Accuracy GPS Emulation (±3m satellite lock)
            </label>
          </div>
        </div>

        {/* 4. Privacy Dashboard Shortcut Strip */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '18px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem' }}>
              Data Sovereignty & Privacy Dashboard
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Manage camera/mic permissions, export complete JSON archive, or wipe data.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={exportPersonalData}
            >
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button 
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setCurrentPage('privacy')}
            >
              <span>Open Privacy Controls</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={18} />
            <span>Save Preferences</span>
          </button>

          <button 
            type="button" 
            className="btn btn-ghost btn-sm"
            onClick={handleResetDemoData}
            style={{ color: '#F87171' }}
          >
            <Trash2 size={15} />
            <span>Clear App Cache & Data</span>
          </button>
        </div>
      </form>
    </div>
  );
}
