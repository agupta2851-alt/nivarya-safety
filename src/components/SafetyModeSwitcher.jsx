import React from 'react';
import { useApp } from '../context/AppContext';
import { safetyModesData } from '../data/initialData';
import { 
  User, 
  GraduationCap, 
  Home, 
  Briefcase, 
  Compass, 
  CheckCircle2, 
  Sparkles,
  Shield
} from 'lucide-react';

export default function SafetyModeSwitcher({ isCompact = false }) {
  const { safetyMode, changeSafetyMode } = useApp();

  const getModeIcon = (iconName, color) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap size={20} color={color} />;
      case 'Home':
        return <Home size={20} color={color} />;
      case 'Briefcase':
        return <Briefcase size={20} color={color} />;
      case 'Compass':
        return <Compass size={20} color={color} />;
      default:
        return <User size={20} color={color} />;
    }
  };

  if (isCompact) {
    return (
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {safetyModesData.map((mode) => {
          const isActive = safetyMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => changeSafetyMode(mode.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{
                flexShrink: 0,
                border: isActive ? `1px solid ${mode.color}` : '1px solid var(--border-subtle)',
                background: isActive ? 'rgba(30, 41, 75, 0.85)' : 'rgba(15, 23, 42, 0.6)'
              }}
            >
              {getModeIcon(mode.icon, isActive ? mode.color : '#94A3B8')}
              <span>{mode.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            <Sparkles size={14} />
            <span>CONTEXTUAL SAFETY PROFILES</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 800, margin: '2px 0 0 0' }}>
            Active Safety Mode
          </h2>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Reconfigures triggers and responders dynamically
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        {safetyModesData.map((mode) => {
          const isActive = safetyMode === mode.id;

          return (
            <div
              key={mode.id}
              onClick={() => changeSafetyMode(mode.id)}
              style={{
                background: isActive ? 'rgba(30, 41, 75, 0.9)' : 'rgba(7, 11, 20, 0.5)',
                border: isActive ? `2px solid ${mode.color}` : '1px solid var(--border-subtle)',
                borderRadius: '14px',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? `0 0 20px ${mode.color}40` : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: `${mode.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getModeIcon(mode.icon, mode.color)}
                </div>

                {isActive && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: `${mode.color}25`,
                    color: mode.color,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    border: `1px solid ${mode.color}`
                  }}>
                    ACTIVE
                  </span>
                )}
              </div>

              <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '4px' }}>
                {mode.name}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                {mode.description}
              </p>

              <div style={{ fontSize: '0.72rem', color: '#A5B4FC', fontWeight: 600 }}>
                Tailored for: {mode.tag}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
