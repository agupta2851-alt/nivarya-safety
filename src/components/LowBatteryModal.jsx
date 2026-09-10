import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BatteryLow, 
  BatteryCharging, 
  Zap, 
  MapPin, 
  Share2, 
  CheckCircle2, 
  AlertTriangle,
  X,
  Sliders
} from 'lucide-react';

export default function LowBatteryModal({ isOpen, onClose }) {
  const { 
    batteryLevel, 
    setBatteryLevel, 
    isLowBatteryMode, 
    toggleLowBatteryMode, 
    currentCoordinates, 
    showToast 
  } = useApp();

  if (!isOpen && !isLowBatteryMode) return null;

  const handleBroadcastLastLocation = () => {
    showToast(`Emergency battery snapshot (${batteryLevel}%) sent to primary contacts!`, 'safe');
  };

  return (
    <div className="sos-overlay" style={{ background: 'rgba(0, 0, 0, 0.92)' }}>
      <div className="sos-hud-box" style={{ borderColor: '#EF4444', maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', fontWeight: 700, fontSize: '0.85rem' }}>
            <BatteryLow size={20} className="animate-pulse" />
            <span>BATTERY-AWARE EMERGENCY PROTOCOL</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="btn-ghost btn-sm" style={{ color: '#94A3B8' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', marginBottom: '8px' }}>
          Low Battery Safety Shield ({batteryLevel}%)
        </h2>
        <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
          Your phone battery is critically low. Nivarya has switched into low-draw mode to conserve power while preserving live GPS transmission.
        </p>

        {/* Battery Simulation Testing Slider */}
        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '16px', borderRadius: '12px', marginBottom: '20px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            <span>Simulate Battery Level:</span>
            <span style={{ color: batteryLevel < 20 ? '#F87171' : 'var(--safe-light)' }}>{batteryLevel}%</span>
          </div>
          <input 
            type="range"
            min="3"
            max="100"
            value={batteryLevel}
            onChange={(e) => setBatteryLevel(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: batteryLevel < 20 ? '#EF4444' : '#10B981', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748B', marginTop: '4px' }}>
            <span>Critical (3%)</span>
            <span>20% Threshold</span>
            <span>Full (100%)</span>
          </div>
        </div>

        {/* Optimizations Enabled */}
        <div style={{ textAlign: 'left', background: 'rgba(7, 11, 20, 0.6)', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '0.78rem', color: '#A5B4FC', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase' }}>
            Active Power-Saving Protections:
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.82rem', color: '#CBD5E1' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Reduced GPS polling frequency to 90-sec bursts</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Background animations & high-draw renders paused</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Emergency SMS pre-cached in device memory</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            className="btn btn-danger btn-block"
            onClick={handleBroadcastLastLocation}
          >
            <Share2 size={18} />
            <span>Broadcast Last-Known Coordinates Now</span>
          </button>

          <button 
            className="btn btn-secondary btn-block"
            onClick={toggleLowBatteryMode}
          >
            <span>{isLowBatteryMode ? 'Exit Battery-Aware Mode' : 'Keep Battery-Aware Mode'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
