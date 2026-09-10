import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { safetyRiskSignals } from '../data/initialData';
import { 
  BrainCircuit, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sun, 
  Users, 
  Building2, 
  MapPin, 
  Activity,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function SafetyIntelligencePage() {
  const { setCurrentPage, showToast } = useApp();

  const [selectedZone, setSelectedZone] = useState('University North Corridor');
  const [selectedHour, setSelectedHour] = useState(21); // 9 PM

  // Simulated dynamic risk calculator
  const calculateRisk = () => {
    let score = 92;
    if (selectedHour >= 22 || selectedHour < 5) score -= 24;
    else if (selectedHour >= 19) score -= 10;

    if (selectedZone.includes('Underpass') || selectedZone.includes('Depot')) score -= 28;
    if (selectedZone.includes('Commercial') || selectedZone.includes('Boulevard')) score += 6;

    return Math.max(25, Math.min(98, score));
  };

  const riskScore = calculateRisk();
  const isHighRisk = riskScore < 60;
  const isModerateRisk = riskScore >= 60 && riskScore < 85;

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
          <BrainCircuit size={16} />
          <span>PREDICTIVE SAFETY INTELLIGENCE • STATISTICAL MODEL</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Nivarya Safety Intelligence Radar
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Evaluates multi-factor danger risk by analyzing time of day, municipal streetlight telemetrics, police patrol density, and verified community incidents.
        </p>
      </div>

      {/* Interactive Zone & Hour Simulator */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '18px', marginBottom: '32px' }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="var(--primary-light)" />
          <span>Interactive Risk Assessment Calculator</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Select Urban Area / Sector
            </label>
            <select 
              className="input-field"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
            >
              <option value="University North Corridor">University North Corridor (Commercial & Student Belt)</option>
              <option value="Central Metro Plaza & Arterial">Central Metro Plaza & Arterial Highway</option>
              <option value="Old Railway Underpass Walkway">Old Railway Underpass Walkway (Isolated)</option>
              <option value="Behind Old Bus Depot Industrial Lane">Behind Old Bus Depot Industrial Lane (Low Lighting)</option>
              <option value="FC Road Commercial Avenue">FC Road Commercial Avenue (Active Market)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              <span>Time of Transit</span>
              <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
                {selectedHour}:00 ({selectedHour >= 12 ? (selectedHour === 12 ? '12 PM' : `${selectedHour - 12} PM`) : `${selectedHour} AM`})
              </span>
            </label>
            <input 
              type="range"
              min="0"
              max="23"
              value={selectedHour}
              onChange={(e) => setSelectedHour(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Score & Multi-factor Signals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '36px' }}>
        {/* Overall Safety Rating Card */}
        <div className="glass-card" style={{
          padding: '28px',
          borderRadius: '18px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: isHighRisk ? '2px solid #EF4444' : isModerateRisk ? '2px solid #F59E0B' : '2px solid #10B981'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: isHighRisk ? 'rgba(239, 68, 68, 0.15)' : isModerateRisk ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `3px solid ${isHighRisk ? '#EF4444' : isModerateRisk ? '#F59E0B' : '#10B981'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 800, color: isHighRisk ? '#F87171' : isModerateRisk ? '#FBBF24' : '#34D399', lineHeight: 1 }}>
              {riskScore}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginTop: '4px' }}>
              Out of 100
            </span>
          </div>

          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            {isHighRisk ? 'Elevated Caution Advised' : isModerateRisk ? 'Moderate Safety Rating' : 'Optimal Safe Corridor'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '340px', lineHeight: 1.5, marginBottom: '20px' }}>
            {isHighRisk 
              ? 'Dim lighting and low footfall at this hour. We strongly suggest taking the well-lit commercial bypass or starting a Safe Journey.'
              : isModerateRisk
                ? 'Standard transit precautions recommended. Stay on main arterial avenues.'
                : 'High footfall, continuous smart lighting, and active Pink Patrol units nearby.'}
          </p>

          <button 
            className="btn btn-primary"
            onClick={() => {
              setCurrentPage('routes');
              showToast('Switched to Safest Route Recommender', 'safe');
            }}
          >
            <span>View Safest Route Alternative</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Multi-Factor Radar Signals */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--primary-light)" />
            <span>5-Point Real-Time Telemetry Signals</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {safetyRiskSignals.map((signal) => {
              const adjustedScore = Math.max(30, Math.min(98, signal.score + (riskScore < 70 ? -20 : 5)));
              return (
                <div key={signal.id} style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>
                      {signal.name}
                    </span>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: adjustedScore >= 80 ? '#34D399' : adjustedScore >= 60 ? '#FBBF24' : '#F87171'
                    }}>
                      {adjustedScore}% Index
                    </span>
                  </div>
                  
                  {/* Progress bar */}
                  <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{
                      height: '100%',
                      width: `${adjustedScore}%`,
                      background: adjustedScore >= 80 ? 'var(--safe)' : adjustedScore >= 60 ? 'var(--warning)' : 'var(--danger)',
                      borderRadius: '9999px'
                    }}></div>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {signal.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actionable Protective Recommendations */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
        <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          Automated Preventive Safety Protocol
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
          Based on the current intelligence analysis for {selectedZone}, Nivarya recommends:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--safe-light)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Enable Safe Journey</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              Activate automatic 10-minute check-ins so your family receives an automatic notification when you arrive.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Building2 size={18} />
              <span>Pink Kiosk Escort Point</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              Central Metro Exit 2 has a 24/7 staffed Women Safety Kiosk. Transit through this corridor if walking alone.
            </p>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FBBF24', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Clock size={18} />
              <span>Transit Curfew Alert</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
              Public transit frequency drops 60% after 22:00. Pre-book verified cab services rather than flagging street autos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
