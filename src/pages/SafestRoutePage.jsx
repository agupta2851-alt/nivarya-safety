import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { safeRoutesData } from '../data/initialData';
import { 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Navigation, 
  Eye, 
  Sun, 
  Building2, 
  Users, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';

export default function SafestRoutePage() {
  const { startJourney, setCurrentPage, showToast, locationState, userProfile } = useApp();
  
  const defaultStart = locationState?.address 
    ? `${locationState.address}${locationState.city ? `, ${locationState.city}` : ''}`
    : (userProfile?.manualLocation || userProfile?.location || userProfile?.city || 'Current Location');

  const [startPoint, setStartPoint] = useState(defaultStart);
  const [destination, setDestination] = useState('Central Safe Zone Transit');
  const [selectedRouteId, setSelectedRouteId] = useState('route-safest');

  const selectedRoute = safeRoutesData.find(r => r.id === selectedRouteId) || safeRoutesData[0];

  const handleLaunchRoute = (route) => {
    startJourney({
      startPoint,
      destination,
      mode: 'cab',
      etaMinutes: route.etaMinutes
    });
    setCurrentPage('journey');
  };

  return (
    <div className="container" style={{ padding: '36px 16px 80px 16px' }}>
      {/* Header Banner */}
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
          <Sparkles size={16} />
          <span>AI-POWERED SAFETY ROUTING • ALGORITHM V2.4</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Safest Route Recommender
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Prioritizes well-lit corridors, active police checkpoints, dense CCTV coverage, and safe transit hubs over simply finding the shortest distance.
        </p>
      </div>

      {/* Input Route Form */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', borderRadius: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Current Starting Location
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--safe-light)' }} />
              <input 
                type="text"
                className="input-field"
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                style={{ paddingLeft: '42px' }}
                placeholder="Enter pickup point"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Safe Destination
            </label>
            <div style={{ position: 'relative' }}>
              <Navigation size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-light)' }} />
              <input 
                type="text"
                className="input-field"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                style={{ paddingLeft: '42px' }}
                placeholder="Enter destination"
              />
            </div>
          </div>

          <div>
            <button 
              className="btn btn-primary btn-block"
              onClick={() => showToast('Recalculated safety matrix for current coordinates', 'safe')}
              style={{ height: '46px' }}
            >
              <SlidersHorizontal size={18} />
              <span>Calculate Safety Routes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Route Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        {safeRoutesData.map((route) => {
          const isSelected = selectedRouteId === route.id;
          const isRecommended = route.id === 'route-safest';

          return (
            <div 
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '18px',
                cursor: 'pointer',
                border: isSelected 
                  ? '2px solid var(--primary)' 
                  : isRecommended 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : '1px solid var(--border-subtle)',
                background: isSelected 
                  ? 'rgba(30, 41, 75, 0.85)' 
                  : 'rgba(15, 23, 42, 0.65)',
                position: 'relative',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 0 24px rgba(99, 102, 241, 0.3)' : 'none'
              }}
            >
              {isRecommended && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}>
                  <ShieldCheck size={14} />
                  <span>RECOMMENDED SAFEST</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ color: '#FFFFFF', fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>
                    {route.name}
                  </h3>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {route.distanceKm} km • {route.tag}
                  </span>
                </div>
                
                <div style={{
                  textAlign: 'right',
                  background: route.safetyScore >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  border: `1px solid ${route.safetyScore >= 90 ? '#10B981' : '#F59E0B'}`,
                  borderRadius: '10px',
                  padding: '6px 12px'
                }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: route.safetyScore >= 90 ? '#34D399' : '#FBBF24' }}>
                    {route.safetyScore}/100
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Safety Index
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '10px',
                background: 'rgba(7, 11, 20, 0.5)',
                padding: '12px',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Clock size={15} color="#818CF8" />
                  <span>{route.etaMinutes} mins ETA</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Sun size={15} color="#FBBF24" />
                  <span>{route.lightingScore}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Eye size={15} color="#06B6D4" />
                  <span>{route.cctvCoverage}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Building2 size={15} color="#34D399" />
                  <span>{route.policePresence}</span>
                </div>
              </div>

              {/* Highlights & Warnings */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A5B4FC', marginBottom: '8px' }}>
                  Key Corridor Features:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {route.highlights.slice(0, 2).map((hl, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '6px' }}>
                      <CheckCircle2 size={14} color="#10B981" style={{ flexShrink: 0 }} />
                      <span>{hl}</span>
                    </li>
                  ))}
                  {route.warnings.map((warn, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#FCA5A5', marginBottom: '6px' }}>
                      <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                className={`btn btn-block ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleLaunchRoute(route);
                }}
              >
                <span>Select & Start Safe Journey</span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Route Detailed Breakdown */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Route Inspection
            </span>
            <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 700, marginTop: '2px' }}>
              {selectedRoute.name} Details
            </h2>
          </div>

          <button 
            className="btn btn-safe"
            onClick={() => handleLaunchRoute(selectedRoute)}
          >
            <ShieldCheck size={18} />
            <span>Engage Safe Journey with this Route</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Route Safety Score</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: selectedRoute.safetyScore >= 90 ? '#10B981' : '#F59E0B' }}>
              {selectedRoute.safetyScore} / 100
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
              Evaluated using street lighting, CCTV coverage, crowd density, and police patrol history.
            </div>
          </div>

          <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Police & Escort Points</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818CF8' }}>
              {selectedRoute.policePresence}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
              Rapid intervention police booth located along Main Boulevard.
            </div>
          </div>

          <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Surveillance Rating</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06B6D4' }}>
              {selectedRoute.cctvCoverage}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
              Smart City cameras integrated with municipal control network.
            </div>
          </div>
        </div>

        {/* Safety Corridor Checklist */}
        <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          <h4 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
            Why Nivarya recommends this route:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {selectedRoute.highlights.map((point, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={16} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
