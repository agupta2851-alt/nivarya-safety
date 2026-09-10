import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { nearbyRespondersData } from '../data/initialData';
import { 
  Users, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Radio, 
  X, 
  CheckCircle2, 
  Star 
} from 'lucide-react';

export default function NearbyRespondersModal({ isOpen, onClose }) {
  const { showToast } = useApp();
  const [alertedResponders, setAlertedResponders] = useState([]);

  if (!isOpen) return null;

  const handleAlertResponder = (responder) => {
    setAlertedResponders(prev => [...prev, responder.id]);
    showToast(`Dispatched simulated SOS beacon to ${responder.name} (${responder.role})`, 'safe');
  };

  return (
    <div className="sos-overlay" style={{ background: 'rgba(7, 11, 20, 0.88)' }}>
      <div className="sos-hud-box" style={{ maxWidth: '620px', textAlign: 'left', borderColor: 'var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Users size={18} />
            <span>COMMUNITY FIRST-RESPONDER RADAR</span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: '#94A3B8' }}>
            <X size={18} />
          </button>
        </div>

        <h2 style={{ fontSize: '1.45rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '6px' }}>
          Nearby Verified Responders
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', marginBottom: '20px', lineHeight: 1.5 }}>
          Vetted volunteers, transit safety officers, and pink patrol personnel within 1.5 km who can provide immediate physical presence in emergencies.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', marginBottom: '20px' }}>
          {nearbyRespondersData.map((responder) => {
            const isAlerted = alertedResponders.includes(responder.id);

            return (
              <div 
                key={responder.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: isAlerted ? '1px solid var(--safe)' : '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: responder.avatarColor,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.1rem'
                  }}>
                    {responder.name.charAt(0)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>
                        {responder.name}
                      </span>
                      <ShieldCheck size={14} color="#10B981" />
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                      {responder.role} • <span style={{ color: '#FBBF24' }}>{responder.badge}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                      <span><MapPin size={11} style={{ display: 'inline', marginRight: '2px' }} />{responder.distance}</span>
                      <span><Clock size={11} style={{ display: 'inline', marginRight: '2px' }} />ETA ~{responder.eta}</span>
                      <span>{responder.rating}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a 
                    href={`tel:${responder.phone}`}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '6px 10px', textDecoration: 'none' }}
                  >
                    <PhoneCall size={13} />
                    <span>Call</span>
                  </a>

                  <button 
                    className={`btn btn-sm ${isAlerted ? 'btn-safe' : 'btn-primary'}`}
                    onClick={() => handleAlertResponder(responder)}
                    disabled={isAlerted}
                  >
                    <Radio size={13} />
                    <span>{isAlerted ? 'Beacon Sent ✓' : 'Dispatch SOS Beacon'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '10px 14px', borderRadius: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
          Note: This is a simulated prototype network for demonstration and college review. In an active life-threatening situation, immediately dial 112 or 1091.
        </div>
      </div>
    </div>
  );
}
