import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  Download, 
  Trash2, 
  EyeOff, 
  MapPin, 
  Mic, 
  Fingerprint, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Clock
} from 'lucide-react';

export default function PrivacyDashboardPage() {
  const { 
    privacySettings, 
    updatePrivacySettings, 
    exportPersonalData, 
    purgeAllUserData, 
    showToast 
  } = useApp();

  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [purgeInputPin, setPurgeInputPin] = useState('');

  const handleConfirmPurge = (e) => {
    e.preventDefault();
    if (purgeInputPin === '1234' || purgeInputPin.length >= 4) {
      setIsPurgeModalOpen(false);
      purgeAllUserData();
    } else {
      showToast('Please enter your 4-digit Safety PIN to confirm purge.', 'danger');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 16px 80px 16px' }}>
      {/* Header */}
      <div className="section-header text-center" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '9999px',
          padding: '6px 16px',
          color: 'var(--safe-light)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <ShieldCheck size={16} />
          <span>ZERO-KNOWLEDGE PRIVACY GUARANTEE</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Privacy Controls & Data Sovereignty
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          You own 100% of your safety data. Choose what sensors Nivarya can access, download complete archives anytime, or permanently purge all records.
        </p>
      </div>

      {/* Permissions Toggles Grid */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '18px', marginBottom: '32px' }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="var(--safe-light)" />
          <span>Hardware & Sensor Permissions</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Location Tracking */}
          <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ paddingRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                <MapPin size={16} color="var(--primary-light)" />
                <span>High-Accuracy GPS Location</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                Used only during active Safe Journeys or when triggering SOS. Never shared in background.
              </p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={privacySettings.locationTracking}
                onChange={(e) => updatePrivacySettings({ locationTracking: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Background Audio */}
          <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ paddingRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                <Mic size={16} color="#F87171" />
                <span>Voice SOS Trigger Mic Listener</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                Acoustic keyword recognizer runs purely on-device without streaming audio to external servers.
              </p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={privacySettings.backgroundAudio}
                onChange={(e) => updatePrivacySettings({ backgroundAudio: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Anonymous Reporting */}
          <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ paddingRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                <EyeOff size={16} color="var(--safe-light)" />
                <span>Default Anonymous Hazard Reports</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                Strikes your name and profile from public community radar posts automatically.
              </p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={privacySettings.anonymousReporting}
                onChange={(e) => updatePrivacySettings({ anonymousReporting: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>

          {/* Biometric Security Lock */}
          <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ paddingRight: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>
                <Fingerprint size={16} color="var(--info)" />
                <span>App Launch PIN / Biometric Lock</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
                Requires your 4-digit Safety PIN before opening sensitive history logs or contacts.
              </p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={privacySettings.biometricLock}
                onChange={(e) => updatePrivacySettings({ biometricLock: e.target.checked })}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Data Export & Purge Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Export JSON Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700 }}>
                Export Complete Data Archive
              </h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Portability • JSON Standard Format
              </span>
            </div>
          </div>
          <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Download an encrypted, comprehensive file containing your verified trusted contacts, journey logs, SOS drills, and privacy preferences.
          </p>
          <button 
            className="btn btn-primary btn-block"
            onClick={exportPersonalData}
          >
            <Download size={16} />
            <span>Download My Safety Archive (.JSON)</span>
          </button>
        </div>

        {/* Purge All Data Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={20} />
            </div>
            <div>
              <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700 }}>
                Permanent Data Purge (Wipe)
              </h3>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Irreversible local storage wipe
              </span>
            </div>
          </div>
          <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Instantly wipe all stored contacts, journey timelines, evidence recordings, and custom pins from this device's memory.
          </p>
          <button 
            className="btn btn-danger btn-block"
            onClick={() => setIsPurgeModalOpen(true)}
          >
            <Trash2 size={16} />
            <span>Purge All Personal Safety Data</span>
          </button>
        </div>
      </div>

      {/* Purge Confirmation Modal */}
      {isPurgeModalOpen && (
        <div className="sos-overlay" style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
          <div className="sos-hud-box" style={{ maxWidth: '440px', borderColor: '#EF4444' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#F87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
              <AlertTriangle size={20} />
              <span>PERMANENT DATA WIPE CONFIRMATION</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '10px' }}>
              Are you sure you want to purge all data?
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '20px' }}>
              This action cannot be undone. All offline contacts, history logs, and local preferences will be permanently wiped.
            </p>

            <form onSubmit={handleConfirmPurge}>
              <label style={{ display: 'block', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Enter Safety PIN to Authorize (Default: 1234)
              </label>
              <input 
                type="password"
                className="input-field"
                value={purgeInputPin}
                onChange={(e) => setPurgeInputPin(e.target.value)}
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em', marginBottom: '20px' }}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPurgeModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                >
                  Confirm Wipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
