import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Download
} from 'lucide-react';

export default function ProfilePage() {
  const { 
    userProfile, 
    setUserProfile, 
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
    t 
  } = useApp();

  const [name, setName] = useState(userProfile.name);
  const [phone, setPhone] = useState(userProfile.phone);
  const [bloodGroup, setBloodGroup] = useState(userProfile.bloodGroup || 'O+ Positive');
  const [emergencyNotes, setEmergencyNotes] = useState(userProfile.emergencyNotes || '');
  const [safetyPin, setSafetyPin] = useState(userProfile.safetyPin || '1234');
  const [sosDelay, setSosDelay] = useState(userProfile.sosDelay || 3);
  const [highAccuracyGps, setHighAccuracyGps] = useState(userProfile.highAccuracyGps !== false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setUserProfile(prev => ({
      ...prev,
      name,
      phone,
      bloodGroup,
      emergencyNotes,
      safetyPin,
      sosDelay: Number(sosDelay),
      highAccuracyGps
    }));
    showToast('Profile and security preferences updated successfully!', 'safe');
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all demo data (contacts, incidents, profile) to factory defaults?')) {
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
                placeholder="e.g. Asthmatic, Penicillin allergy"
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
              />
            </div>
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
            <span>Reset Demo Data to Defaults</span>
          </button>
        </div>
      </form>
    </div>
  );
}
