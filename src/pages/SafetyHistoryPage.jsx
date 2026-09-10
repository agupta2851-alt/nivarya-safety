import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  History, 
  MapPin, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  Flag, 
  Car, 
  Trash2, 
  Filter, 
  Download,
  Calendar
} from 'lucide-react';

export default function SafetyHistoryPage() {
  const { safetyHistory, clearSafetyHistory, exportPersonalData, showToast } = useApp();
  const [activeFilter, setActiveFilter] = useState('all');

  const filterTabs = [
    { id: 'all', label: 'All Activity' },
    { id: 'journey', label: 'Safe Journeys' },
    { id: 'sos', label: 'SOS Broadcasts' },
    { id: 'checkin', label: 'Safe Check-ins' },
    { id: 'incident', label: 'Hazard Reports' },
    { id: 'deviation', label: 'Route Deviations' }
  ];

  const filteredHistory = safetyHistory.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'journey':
        return <Navigation size={18} color="var(--primary-light)" />;
      case 'sos':
        return <AlertTriangle size={18} color="#F87171" />;
      case 'checkin':
        return <CheckCircle2 size={18} color="var(--safe-light)" />;
      case 'incident':
        return <Flag size={18} color="#FBBF24" />;
      case 'deviation':
      case 'cab':
        return <Car size={18} color="#EC4899" />;
      default:
        return <History size={18} color="var(--info)" />;
    }
  };

  const getStatusBadgeStyle = (status) => {
    if (status.includes('Safe') || status.includes('Verified') || status.includes('Disarmed')) {
      return { background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)' };
    }
    if (status.includes('SOS') || status.includes('Alert') || status.includes('Deviation')) {
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
    }
    return { background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.3)' };
  };

  return (
    <div className="container" style={{ padding: '36px 16px 80px 16px' }}>
      {/* Header */}
      <div className="section-header text-center" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '9999px',
          padding: '6px 16px',
          color: 'var(--primary-light)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <History size={16} />
          <span>CHRONOLOGICAL SAFETY AUDIT LOG</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Personal Safety History & Audit
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          A secure, timestamped record of every journey tracked, automated check-in verified, SOS drill, and cab deviation detected.
        </p>
      </div>

      {/* Action Bar & Filter Chips */}
      <div className="glass-card" style={{ padding: '18px 24px', borderRadius: '16px', marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              className={`btn btn-sm ${activeFilter === tab.id ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={exportPersonalData}
            title="Download JSON Log"
          >
            <Download size={14} />
            <span>Export Log</span>
          </button>
          <button 
            className="btn btn-ghost btn-sm text-danger"
            onClick={clearSafetyHistory}
            title="Clear Log"
          >
            <Trash2 size={14} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <History size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p>No activity records found under this filter.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {filteredHistory.map((item, index) => (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px',
                  background: 'rgba(7, 11, 20, 0.5)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(item.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                      {item.title}
                    </h3>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      ...getStatusBadgeStyle(item.status)
                    }}>
                      {item.status}
                    </span>
                  </div>

                  <p style={{ color: '#CBD5E1', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 8px 0' }}>
                    {item.details}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {item.date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      {item.time}
                    </span>
                    {item.location && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
