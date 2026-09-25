import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildTrackingUrl } from '../utils/tracking';
import { 
  Car, 
  ShieldAlert, 
  AlertTriangle, 
  PhoneCall, 
  Navigation, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Share2, 
  Volume2, 
  UserCheck, 
  ShieldCheck,
  Compass,
  FileWarning
} from 'lucide-react';

export default function CabSafetyPage() {
  const { 
    cabDetails, 
    setCabDetails, 
    isCabMonitoringActive, 
    startCabMonitoring, 
    stopCabMonitoring, 
    cabDeviationDetected, 
    triggerCabDeviation, 
    triggerUnusualStop, 
    triggerSos,
    showToast,
    userProfile,
    currentCoordinates,
    currentTrackingId
  } = useApp();

  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [fakeCallTimer, setFakeCallTimer] = useState(null);

  const startFakeCall = () => {
    setIsFakeCallActive(true);
    showToast('Simulated incoming call started. Answer to play deterrent audio.', 'info');
  };

  const endFakeCall = () => {
    setIsFakeCallActive(false);
    showToast('Deterrent fake call ended.', 'info');
  };

  return (
    <div className="container" style={{ padding: '36px 16px 80px 16px' }}>
      {/* Header */}
      <div className="section-header text-center" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '9999px',
          padding: '6px 16px',
          color: '#F87171',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <ShieldAlert size={16} />
          <span>CAB SAFETY RADAR & ROUTE DEVIATION • V1.8</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Cab Safety & Route Deviation Detection
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Monitors driver path in real-time. Automatically prompts "Are you safe?" if the vehicle detours into isolated streets or halts unusually long.
        </p>
      </div>

      {/* Fake Call Active Overlay (if triggered) */}
      {isFakeCallActive && (
        <div className="glass-card animate-fade-in" style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #10B981',
          padding: '24px',
          borderRadius: '18px',
          marginBottom: '28px',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
            <PhoneCall size={20} className="animate-pulse" />
            <span>DETERRENT CALL IN PROGRESS • LOUD SPEAKER ACTIVE</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', marginBottom: '6px' }}>
            "Dad (Calling...)"
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 16px auto', fontStyle: 'italic' }}>
            Voice Audio: "Beta, I am standing at the society security gate right now with the guard. How many minutes away is your cab?"
          </p>
          <button 
            className="btn btn-danger"
            onClick={endFakeCall}
          >
            End Deterrent Call
          </button>
        </div>
      )}

      {/* Cab Details & Monitoring Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* Cab Information Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <Car size={22} />
              </div>
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700 }}>
                  Active Ride Details
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {cabDetails.cabCompany}
                </span>
              </div>
            </div>

            <span style={{
              background: isCabMonitoringActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
              color: isCabMonitoringActive ? '#10B981' : '#94A3B8',
              border: `1px solid ${isCabMonitoringActive ? '#10B981' : '#64748B'}`,
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              {isCabMonitoringActive ? '● MONITORING ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vehicle Plate</div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                {cabDetails.cabNumber}
              </div>
            </div>

            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Driver Name</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF' }}>
                {cabDetails.driverName}
              </div>
            </div>

            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Verified Ride OTP</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--safe-light)', fontFamily: 'monospace' }}>
                {cabDetails.otp}
              </div>
            </div>

            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Destination</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                Sector 14 Hostel
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isCabMonitoringActive ? (
              <button 
                className="btn btn-primary btn-block"
                onClick={startCabMonitoring}
              >
                <ShieldCheck size={18} />
                <span>Start Cab Route Monitoring</span>
              </button>
            ) : (
              <button 
                className="btn btn-secondary btn-block"
                onClick={stopCabMonitoring}
              >
                <span>Stop Cab Monitoring</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Variance HUD */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="var(--primary-light)" />
              <span>Route Variance Radar</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Threshold: &gt; 350m
            </span>
          </div>

          <div style={{
            background: cabDeviationDetected ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
            border: `1px solid ${cabDeviationDetected ? '#EF4444' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cabDeviationDetected ? '#F87171' : '#34D399', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
              {cabDeviationDetected ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{cabDeviationDetected ? 'DEVIATION ALERT TRIGGERED' : 'CAB ON APPROVED CORRIDOR'}</span>
            </div>
            <p style={{ color: '#CBD5E1', fontSize: '0.84rem', margin: 0 }}>
              {cabDeviationDetected 
                ? 'Current location is 480 meters off the official GPS track into an unverified bypass.'
                : 'Vehicle is strictly following the well-lit arterial road with active CCTV surveillance.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Route</div>
              <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>
                Metro Arterial Highway
              </div>
            </div>
            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Variance</div>
              <div style={{ fontSize: '0.85rem', color: cabDeviationDetected ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                {cabDeviationDetected ? '+480m (High Risk)' : '±12m (Normal Drift)'}
              </div>
            </div>
          </div>

          {/* Simulation Testing Buttons */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '10px', textTransform: 'uppercase' }}>
              Interactive Protocol Simulations (Demo):
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-sm btn-outline"
                style={{ borderColor: 'rgba(239, 68, 68, 0.5)', color: '#FCA5A5', flex: 1 }}
                onClick={triggerCabDeviation}
              >
                Simulate Route Deviation
              </button>
              <button 
                className="btn btn-sm btn-outline"
                style={{ borderColor: 'rgba(245, 158, 11, 0.5)', color: '#FCD34D', flex: 1 }}
                onClick={triggerUnusualStop}
              >
                Simulate 10m Stop
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Immediate Deterrent & Emergency Action Strip */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          Instant Defensive Shield Actions
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          If you feel uncomfortable or if the driver acts suspiciously, engage these instant tools immediately.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <button 
            className="btn btn-safe"
            onClick={startFakeCall}
            style={{ padding: '14px', justifyContent: 'center' }}
          >
            <PhoneCall size={18} />
            <span>Simulate Incoming Deterrent Call</span>
          </button>

          <a 
            href="tel:112"
            className="btn btn-danger"
            style={{ textDecoration: 'none', padding: '14px', justifyContent: 'center' }}
          >
            <ShieldAlert size={18} />
            <span>Direct Dial Police (112)</span>
          </a>

          <button 
            className="btn btn-danger"
            onClick={triggerSos}
            style={{ padding: '14px', justifyContent: 'center', background: '#DC2626' }}
          >
            <AlertTriangle size={18} />
            <span>Trigger Full Emergency SOS</span>
          </button>

          <button 
            className="btn btn-secondary"
            onClick={() => {
              const liveLink = currentCoordinates 
                ? `https://maps.google.com/?q=${currentCoordinates.lat},${currentCoordinates.lng}` 
                : (currentTrackingId ? buildTrackingUrl(currentTrackingId) : (userProfile?.manualLocation ? `Location: ${userProfile.manualLocation}` : 'Live tracking active'));
              navigator.clipboard.writeText(`I am in cab ${cabDetails.cabNumber} (${cabDetails.cabCompany}). Driver: ${cabDetails.driverName}. Live Location: ${liveLink}`);
              showToast('Cab details and live location copied to share!', 'safe');
            }}
            style={{ padding: '14px', justifyContent: 'center' }}
          >
            <Share2 size={18} />
            <span>Share Cab Registration Link</span>
          </button>
        </div>
      </div>
    </div>
  );
}
