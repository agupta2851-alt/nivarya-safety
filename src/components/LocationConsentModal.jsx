import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Check, 
  Compass, 
  Building,
  Info
} from 'lucide-react';

export default function LocationConsentModal({ isOpen, onClose, onLocationConfirmed }) {
  const { 
    locationState, 
    requestGpsLocation, 
    setManualLocation, 
    showToast 
  } = useApp();

  const [mode, setMode] = useState('choice'); // 'choice' | 'manual'
  const [manualCity, setManualCity] = useState(locationState?.city || '');
  const [manualAddress, setManualAddress] = useState(locationState?.address || '');
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleUseGps = async () => {
    setIsRequesting(true);
    try {
      const result = await requestGpsLocation();
      if (result && result.coords) {
        showToast('Real device GPS coordinates obtained!', 'safe');
        if (onLocationConfirmed) onLocationConfirmed(result);
        if (onClose) onClose();
      }
    } catch (err) {
      showToast(err.message || 'Location permission denied or unavailable.', 'danger');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSaveManual = (e) => {
    e.preventDefault();
    if (!manualCity.trim() && !manualAddress.trim()) {
      showToast('Please enter at least a city or landmark.', 'info');
      return;
    }
    const updated = setManualLocation({
      city: manualCity.trim(),
      address: manualAddress.trim()
    });
    showToast(`Manual location set: ${manualCity || manualAddress}`, 'safe');
    if (onLocationConfirmed) onLocationConfirmed(updated);
    if (onClose) onClose();
  };

  return (
    <div className="sos-overlay" style={{ background: 'rgba(7, 11, 20, 0.88)', zIndex: 1200 }}>
      <div className="sos-hud-box" style={{ maxWidth: '520px', textAlign: 'left', borderColor: 'var(--primary-light)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.85rem' }}>
            <Compass size={18} />
            <span>LOCATION PERMISSION & CONSENT</span>
          </div>
          <button 
            onClick={onClose} 
            className="btn btn-ghost btn-sm" 
            style={{ color: '#94A3B8', padding: '4px' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '8px' }}>
          Choose Your Location Source
        </h2>

        {/* Mandatory Privacy Explanation */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.28)',
          borderRadius: '12px',
          padding: '14px 16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <ShieldCheck size={20} color="var(--safe-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.5 }}>
            <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>Privacy & Transparency:</strong>
            Your location is used only for safety and live journey tracking. Location is never silently collected or shared without your permission.
          </div>
        </div>

        {/* Live Permission Status Indicator */}
        {locationState?.status === 'denied' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#F87171',
            fontSize: '0.84rem'
          }}>
            <AlertCircle size={16} />
            <span>Location permission denied by browser. You can enter your location manually below.</span>
          </div>
        )}

        {mode === 'choice' ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              Select how you would like Nivarya to determine your position for SOS alerts and route tracking:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              {/* Option A: Use GPS */}
              <button
                type="button"
                onClick={handleUseGps}
                disabled={isRequesting}
                className="btn btn-safe"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Navigation size={22} color="#34D399" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.98rem' }}>
                    {isRequesting ? 'Requesting Device GPS...' : 'Option A: Use My Current Location'}
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '2px' }}>
                    Request real satellite GPS coordinates from device via browser Geolocation API
                  </div>
                </div>
              </button>

              {/* Option B: Enter Manually */}
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="btn btn-secondary"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  textAlign: 'left',
                  borderRadius: '14px',
                  border: '1px solid var(--border-medium)'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building size={20} color="#818CF8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.98rem' }}>
                    Option B: Enter Location Manually
                  </div>
                  <div style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '2px' }}>
                    Manually specify your city, area, campus, or landmark without sharing GPS
                  </div>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveManual}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                City <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Mumbai, Delhi, Bengaluru, Jaipur"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem' }}>
                Area / Landmark / Address
              </label>
              <input 
                type="text"
                className="input-field"
                placeholder="e.g. Near University Metro Gate, Sector 14"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setMode('choice')}
                className="btn btn-ghost btn-sm"
                style={{ flex: 1 }}
              >
                Back to Options
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                <Check size={16} />
                <span>Save Manual Location</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
