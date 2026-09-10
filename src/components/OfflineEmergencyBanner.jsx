import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  WifiOff, 
  PhoneCall, 
  MessageSquare, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

export default function OfflineEmergencyBanner() {
  const { 
    isOnline, 
    toggleOfflineSimulation, 
    offlineQueue, 
    syncOfflineQueue, 
    currentCoordinates, 
    contacts, 
    showToast 
  } = useApp();

  if (isOnline && offlineQueue.length === 0) return null;

  const primaryContact = contacts.find(c => c.isPrimary) || contacts[0];
  const emergencySmsBody = `EMERGENCY ALERT (Nivarya Offline): I need urgent help. My coordinates: ${currentCoordinates.lat}, ${currentCoordinates.lng}. Near ${currentCoordinates.address}. Please call 112!`;

  const handleSendOfflineSms = () => {
    const phone = primaryContact ? primaryContact.phone.replace(/[^0-9+]/g, '') : '112';
    const smsUri = `sms:${phone}?body=${encodeURIComponent(emergencySmsBody)}`;
    window.location.href = smsUri;
    showToast('Offline emergency SMS drafted in phone messenger.', 'safe');
  };

  return (
    <div style={{
      background: !isOnline ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
      color: '#FFFFFF',
      padding: '10px 16px',
      fontSize: '0.85rem',
      fontWeight: 600,
      position: 'sticky',
      top: 'var(--navbar-height)',
      zIndex: 990,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!isOnline ? <WifiOff size={18} /> : <CheckCircle2 size={18} />}
        <span>
          {!isOnline 
            ? `Offline Emergency Mode Active • Cellular SMS & Direct Dialer Ready` 
            : `Online Mode Restored • ${offlineQueue.length} queued alert(s)`}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <a 
          href="tel:112"
          className="btn btn-sm"
          style={{ background: '#FFFFFF', color: '#0F172A', textDecoration: 'none', padding: '4px 10px', fontWeight: 700 }}
        >
          <PhoneCall size={13} />
          <span>Call 112 (Cellular)</span>
        </a>

        <button 
          onClick={handleSendOfflineSms}
          className="btn btn-sm"
          style={{ background: 'rgba(0, 0, 0, 0.4)', color: '#FFFFFF', border: '1px solid rgba(255, 255, 255, 0.4)', padding: '4px 10px' }}
        >
          <MessageSquare size={13} />
          <span>Draft SMS Alert</span>
        </button>

        {isOnline && offlineQueue.length > 0 && (
          <button 
            onClick={syncOfflineQueue}
            className="btn btn-sm"
            style={{ background: '#FFFFFF', color: '#0F172A', padding: '4px 10px' }}
          >
            <RefreshCw size={13} />
            <span>Sync Queue ({offlineQueue.length})</span>
          </button>
        )}

        <button 
          onClick={toggleOfflineSimulation}
          className="btn btn-sm btn-ghost"
          style={{ fontSize: '0.75rem', color: '#FFFFFF', padding: '2px 6px', textDecoration: 'underline' }}
        >
          {!isOnline ? 'Simulate Online' : 'Simulate Offline'}
        </button>
      </div>
    </div>
  );
}
