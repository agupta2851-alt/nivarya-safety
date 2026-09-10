import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  MapPin, 
  PhoneCall, 
  Share2, 
  CheckCircle, 
  Copy, 
  ShieldAlert, 
  XCircle,
  MessageCircle,
  KeyRound,
  Users,
  Activity,
  Clock
} from 'lucide-react';

export default function EmergencyModal() {
  const { 
    isSosModalOpen, 
    sosPhase, 
    sosCountdown, 
    isSirenOn, 
    cancelSosCountdown, 
    disarmSos, 
    toggleSirenAudio,
    contacts,
    selectedContactsForSos,
    emergencyTimeline,
    currentCoordinates,
    userProfile,
    showToast,
    setIsRespondersModalOpen,
    t
  } = useApp();

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isSosModalOpen) return null;

  const mockCoords = currentCoordinates || {
    lat: 18.5204,
    lng: 73.8567,
    address: 'Near University North Circle, Sector 4, Pune'
  };

  const emergencyMessage = `EMERGENCY ALERT from Nivarya: I need immediate assistance. My simulated live GPS location is: https://maps.google.com/?q=${mockCoords.lat},${mockCoords.lng} (${mockCoords.address}). Please call emergency services if I do not respond.`;

  const copyCoordinates = () => {
    navigator.clipboard.writeText(`${mockCoords.lat}, ${mockCoords.lng}`);
    showToast('GPS coordinates copied to clipboard!', 'safe');
  };

  const shareWhatsApp = () => {
    const encoded = encodeURIComponent(emergencyMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    showToast('WhatsApp simulated broadcast message prepared!', 'safe');
  };

  const handleDisarm = (e) => {
    e.preventDefault();
    const success = disarmSos(enteredPin);
    if (!success) {
      setPinError(true);
    } else {
      setEnteredPin('');
      setPinError(false);
    }
  };

  return (
    <div className="sos-overlay">
      <div className="sos-hud-box" style={{ maxWidth: '640px', maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="sos-strobe-strip"></div>

        {/* Phase 1: 3-Second Confirmation Countdown */}
        {sosPhase === 'countdown' && (
          <div className="animate-fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#F87171', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
              <AlertTriangle size={20} />
              <span>CONFIRMATION TRIGGER ACTIVE</span>
            </div>
            
            <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '8px' }}>
              {t.sosModal.alertTitle}
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.95rem' }}>
              {t.sosModal.warningCountdown}
            </p>

            {/* Countdown Big Display */}
            <div className="countdown-circle">
              {sosCountdown}
            </div>

            <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '24px' }}>
              Audible warning active. If this was triggered accidentally, cancel now.
            </p>

            <button 
              className="btn btn-secondary btn-lg btn-block"
              onClick={cancelSosCountdown}
              style={{ background: '#1E293B', borderColor: '#475569', color: '#FFFFFF' }}
            >
              <XCircle size={20} />
              <span>{t.sosModal.cancelCountdown}</span>
            </button>
          </div>
        )}

        {/* Phase 2: Active Emergency Mode */}
        {sosPhase === 'active' && (
          <div className="animate-fade-in">
            {/* Top Prototype Badge */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #EF4444',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#FCA5A5',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px'
            }}>
              <ShieldAlert size={14} />
              <span>SIMULATED HIGH-ALERT PROTOCOL • PROTOTYPE ACTIVE</span>
            </div>

            <h2 style={{ fontSize: '1.7rem', color: '#FFFFFF', marginBottom: '6px' }}>
              EMERGENCY BROADCAST ACTIVE
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '20px' }}>
              {t.sosModal.activatedDesc}
            </p>

            {/* Siren Toggle Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '10px 16px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F87171', fontWeight: 600, fontSize: '0.88rem' }}>
                {isSirenOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                <span>{isSirenOn ? t.sosModal.sirenOn : t.sosModal.sirenOff}</span>
              </div>
              <button 
                onClick={toggleSirenAudio}
                className="btn btn-sm btn-outline"
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#FCA5A5' }}
              >
                {t.sosModal.toggleSiren}
              </button>
            </div>

            {/* Current Coordinates Box */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '0.82rem', fontWeight: 600 }}>
                  <MapPin size={16} />
                  <span>{t.sosModal.currentLocation}</span>
                </div>
                <button 
                  onClick={copyCoordinates}
                  className="btn btn-sm btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  <Copy size={13} />
                  <span>Copy</span>
                </button>
              </div>
              <div style={{ fontFamily: 'monospace', color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 600 }}>
                {mockCoords.lat}° N, {mockCoords.lng}° E
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '4px' }}>
                {mockCoords.address}
              </div>
            </div>

            {/* Chronological Action Timeline */}
            <div style={{
              background: 'rgba(7, 11, 20, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '0.82rem', fontWeight: 700, marginBottom: '10px', textTransform: 'uppercase' }}>
                <Activity size={15} />
                <span>Real-Time Dispatch Timeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto' }}>
                {emergencyTimeline.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', fontSize: '0.78rem', borderLeft: '2px solid var(--danger)', paddingLeft: '8px' }}>
                    <div>
                      <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{item.title}</span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{item.time}</div>
                    </div>
                    <span style={{ color: 'var(--safe-light)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Helplines Direct Call */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '10px' }}>
                {t.sosModal.callServices} (Official Helplines):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <a 
                  href="tel:112"
                  className="btn btn-danger btn-sm"
                  style={{ textDecoration: 'none', justifyContent: 'center' }}
                >
                  <PhoneCall size={15} />
                  <span>Dial 112 (All-in-One)</span>
                </a>
                <a 
                  href="tel:1091"
                  className="btn btn-danger btn-sm"
                  style={{ textDecoration: 'none', justifyContent: 'center', background: '#DC2626' }}
                >
                  <PhoneCall size={15} />
                  <span>Dial 1091 (Women)</span>
                </a>
                <a 
                  href="tel:100"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', justifyContent: 'center' }}
                >
                  <PhoneCall size={15} />
                  <span>Dial 100 (Police)</span>
                </a>
                <a 
                  href="tel:108"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none', justifyContent: 'center' }}
                >
                  <PhoneCall size={15} />
                  <span>Dial 108 (Ambulance)</span>
                </a>
              </div>
            </div>

            {/* Action Row: WhatsApp + Nearby Responders */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
              <button 
                className="btn btn-safe"
                onClick={shareWhatsApp}
              >
                <MessageCircle size={18} />
                <span>{t.sosModal.shareWhatsApp}</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => setIsRespondersModalOpen(true)}
              >
                <Users size={18} />
                <span>View Responders</span>
              </button>
            </div>

            {/* Trusted Contacts Alert Notification Status */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94A3B8', marginBottom: '8px' }}>
                {t.sosModal.contactsAlerted}:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {contacts.filter(c => selectedContactsForSos.includes(c.id)).map(contact => (
                  <div key={contact.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: '#E2E8F0', fontWeight: 500 }}>
                      {contact.name} ({contact.relation})
                    </span>
                    <span style={{ color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
                      <CheckCircle size={13} />
                      Simulated SMS & Ping Sent
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disarm SOS with Security PIN */}
            <form onSubmit={handleDisarm} style={{
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#CBD5E1', fontSize: '0.85rem', marginBottom: '10px' }}>
                <KeyRound size={15} />
                <span>{t.sosModal.enterPin}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', maxWidth: '340px', margin: '0 auto' }}>
                <input 
                  type="password"
                  maxLength={6}
                  placeholder="Enter PIN (1234)"
                  value={enteredPin}
                  onChange={(e) => { setEnteredPin(e.target.value); setPinError(false); }}
                  className="input-field"
                  style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', padding: '8px 12px' }}
                />
                <button type="submit" className="btn btn-secondary">
                  {t.sosModal.disarmBtn}
                </button>
              </div>
              {pinError && (
                <div style={{ color: '#F87171', fontSize: '0.8rem', marginTop: '8px' }}>
                  {t.sosModal.pinError}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
