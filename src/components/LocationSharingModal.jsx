import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildTrackingUrl } from '../utils/tracking';
import { 
  MapPin, 
  Clock, 
  Share2, 
  Copy, 
  CheckCircle2, 
  X, 
  Navigation, 
  MessageSquare,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

export default function LocationSharingModal({ isOpen, onClose }) {
  const { 
    currentCoordinates, 
    isSharingLocation, 
    sharingDuration, 
    shareToken, 
    currentTrackingId,
    startLocationSharing, 
    stopLocationSharing, 
    selectedContactsForJourney, 
    contacts, 
    showToast,
    setCurrentPage 
  } = useApp();

  const [selectedDuration, setSelectedDuration] = useState(sharingDuration || '30m');

  if (!isOpen) return null;

  const trackingId = shareToken || currentTrackingId;
  const liveLink = buildTrackingUrl(trackingId);

  const copyLiveLink = () => {
    navigator.clipboard.writeText(liveLink);
    showToast('Live tracking link copied to clipboard!', 'safe');
  };

  const shareViaWhatsApp = () => {
    const text = `Nivarya Live GPS Safe Tracking: I am sharing my live route with you for ${selectedDuration === 'journey' ? 'my journey duration' : selectedDuration}. Track my live position: ${liveLink} (Last seen near ${currentCoordinates.address})`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenLiveTracking = () => {
    if (onClose) onClose();
    setCurrentPage('track', { trackingId });
  };

  const handleApplySharing = () => {
    startLocationSharing(selectedDuration);
    if (onClose) onClose();
  };

  return (
    <div className="sos-overlay" style={{ background: 'rgba(7, 11, 20, 0.88)' }}>
      <div className="sos-hud-box" style={{ maxWidth: '540px', textAlign: 'left', borderColor: 'var(--safe)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--safe-light)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Navigation size={18} />
            <span>LIVE GPS LOCATION SHARING</span>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ color: '#94A3B8' }}>
            <X size={18} />
          </button>
        </div>

        <h2 style={{ fontSize: '1.45rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '6px' }}>
          Share Live Journey & GPS
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.5 }}>
          Broadcast an encrypted real-time GPS beacon to your selected trusted contacts with automatic expiration.
        </p>

        {/* Current Coordinate / Location Box */}
        <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Live Telemetry Coordinates
            </span>
            <span style={{ fontSize: '0.75rem', color: currentCoordinates?.lat ? 'var(--safe-light)' : '#F59E0B', background: currentCoordinates?.lat ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
              {currentCoordinates.accuracy}
            </span>
          </div>
          {currentCoordinates?.lat != null ? (
            <div style={{ fontFamily: 'monospace', fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 700 }}>
              {currentCoordinates.lat.toFixed(4)}° N, {currentCoordinates.lng.toFixed(4)}° E
            </div>
          ) : (
            <div style={{ fontSize: '0.95rem', color: '#CBD5E1', fontWeight: 600 }}>
              {currentCoordinates.address}
            </div>
          )}
          {currentCoordinates?.lat != null && currentCoordinates?.address && (
            <div style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '4px' }}>
              {currentCoordinates.address}
            </div>
          )}
        </div>

        {/* Duration Selector */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
            Sharing Duration:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { id: '15m', label: '15 Mins' },
              { id: '30m', label: '30 Mins' },
              { id: '1h', label: '1 Hour' },
              { id: 'journey', label: 'Trip End' }
            ].map(d => (
              <button
                key={d.id}
                type="button"
                className={`btn btn-sm ${selectedDuration === d.id ? 'btn-safe' : 'btn-outline'}`}
                onClick={() => setSelectedDuration(d.id)}
                style={{ justifyContent: 'center' }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Shareable Link Box */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Encrypted Private Tracking Link:</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              readOnly 
              value={liveLink}
              className="input-field"
              style={{ fontSize: '0.82rem', fontFamily: 'monospace', background: 'rgba(7, 11, 20, 0.8)' }}
            />
            <button onClick={copyLiveLink} className="btn btn-secondary btn-sm" title="Copy Link">
              <Copy size={16} />
            </button>
            <button onClick={handleOpenLiveTracking} className="btn btn-secondary btn-sm" title="Open Live Tracking View">
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-safe" 
              style={{ flex: 1 }}
              onClick={handleApplySharing}
            >
              <Navigation size={16} />
              <span>{isSharingLocation ? 'Update Duration' : 'Start Live GPS Sharing'}</span>
            </button>

            <button 
              className="btn btn-secondary"
              onClick={shareViaWhatsApp}
              style={{ background: '#25D366', color: '#FFFFFF', borderColor: '#25D366' }}
            >
              <MessageSquare size={16} />
              <span>WhatsApp</span>
            </button>
          </div>

          {isSharingLocation && (
            <button 
              className="btn btn-ghost btn-sm text-danger"
              onClick={() => {
                stopLocationSharing();
                if (onClose) onClose();
              }}
              style={{ justifyContent: 'center' }}
            >
              Stop Sharing Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
