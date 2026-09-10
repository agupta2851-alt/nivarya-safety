import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  PhoneCall, 
  MapPin, 
  Share2, 
  ShieldAlert, 
  Users, 
  Lock, 
  Volume2, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { emergencyResourcesList } from '../data/initialData';

export default function EmergencyPage() {
  const { triggerSos, contacts, showToast, t } = useApp();

  const handleSimulatedCall = (num, name) => {
    window.location.href = `tel:${num}`;
    showToast(`Calling official helpline ${name} (${num})`, 'info');
  };

  return (
    <div className="emergency-page container animate-fade-in" style={{ paddingTop: '24px', maxWidth: '880px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <span className="section-tag" style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#F87171' }}>
          <AlertTriangle size={14} />
          <span>High-Alert Command Center</span>
        </span>
        <h1 className="section-title">
          Emergency SOS System
        </h1>
        <p className="section-desc">
          Instant multi-channel emergency broadcast. Sounds audible siren, coordinates with trusted guardians, and links directly to official emergency helplines.
        </p>
      </div>

      {/* Honesty / Prototype Warning Card */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <ShieldAlert size={22} color="#F87171" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.86rem', color: '#CBD5E1', lineHeight: '1.55' }}>
          <strong style={{ color: '#F87171' }}>Prototype Safety Disclosure: </strong>
          This application operates in demonstration mode. Activating the SOS will trigger an interactive simulated alert cascade with audio siren and WhatsApp draft. For actual emergencies requiring police dispatch, dial <strong>112</strong> directly on your phone keypad.
        </div>
      </div>

      {/* Giant SOS Trigger Hub */}
      <div className="card" style={{
        textAlign: 'center',
        padding: '48px 24px',
        background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        boxShadow: '0 0 50px rgba(239, 68, 68, 0.2)',
        marginBottom: '32px'
      }}>
        <button 
          className="btn-sos-hero"
          style={{ width: '160px', height: '160px', margin: '0 auto' }}
          onClick={triggerSos}
          aria-label="Activate Emergency SOS"
        >
          <AlertTriangle size={48} />
          <span style={{ fontSize: '1.4rem', marginTop: '6px', letterSpacing: '0.05em' }}>SOS</span>
        </button>

        <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginTop: '24px', marginBottom: '8px' }}>
          Tap to Initiate Emergency Alert
        </h2>
        <p style={{ color: '#CBD5E1', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto 20px auto' }}>
          Includes a 3-second safety window with warning audio to cancel accidental presses before dispatches are simulated.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span className="badge badge-safe">✓ 3s Cancel Window</span>
          <span className="badge badge-primary">✓ Synthesized Deterrent Siren</span>
          <span className="badge badge-warning">✓ Live Location GPS Broadcast</span>
        </div>
      </div>

      {/* Quick Dial National Helplines Strip */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PhoneCall size={20} color="#EF4444" />
          <span>Official Emergency Helplines (Direct Connect)</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {emergencyResourcesList.slice(0, 4).map(res => (
            <div key={res.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{res.category}</span>
                  <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>{res.number}</span>
                </div>
                <strong style={{ fontSize: '1rem', color: '#FFFFFF', display: 'block', marginBottom: '6px' }}>{res.name}</strong>
                <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '14px' }}>{res.description}</p>
              </div>

              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleSimulatedCall(res.number, res.name)}
              >
                <PhoneCall size={14} />
                <span>Dial {res.number} Now</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts Ready Strip */}
      <div className="card">
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="#6366F1" />
          <span>Guardians Notified During SOS Cascade</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {contacts.map(c => (
            <div key={c.id} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: c.avatarColor || '#6366F1',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.9rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{c.relation} • {c.phone}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} />
                <span>Ready for Alert</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
