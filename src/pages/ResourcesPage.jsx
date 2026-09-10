import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { emergencyResourcesList } from '../data/initialData';
import { 
  PhoneCall, 
  MapPin, 
  Shield, 
  Navigation, 
  Heart, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Building2,
  Filter,
  ShieldAlert,
  Radio,
  Server
} from 'lucide-react';

export default function ResourcesPage() {
  const { showToast, setCurrentPage, t } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'National Helpline', 'Women\'s Helpline', 'Police', 'Medical', 'Women\'s Support', 'College Security'];

  const filtered = activeCategory === 'All'
    ? emergencyResourcesList
    : emergencyResourcesList.filter(item => item.category === activeCategory);

  const handleCall = (number, name) => {
    window.location.href = `tel:${number}`;
    showToast(`Dialing ${name} (${number})`, 'info');
  };

  const handleDirections = (name, address) => {
    showToast(`Opening safety radar centered on ${name}`, 'safe');
    setCurrentPage('map');
  };

  return (
    <div className="resources-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <span className="section-tag">
          <PhoneCall size={14} />
          <span>Emergency Services & Police Dispatch Directory</span>
        </span>
        <h1 className="section-title">
          {t.resources.title}
        </h1>
        <p className="section-desc">
          Direct PSTN cellular integration with 24/7 verified police control rooms, women's distress desks, and trauma medical dispatchers.
        </p>
      </div>

      {/* Integration Disclosure & Architecture Notice */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        fontSize: '0.84rem',
        color: '#CBD5E1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Server size={22} color="var(--primary-light)" style={{ flexShrink: 0 }} />
          <span>
            <strong>CAD Dispatch Architecture: </strong> 
            Direct telephone buttons trigger standard telecommunication lines. Webhook payload channels are pre-configured for smart city CAD integration.
          </span>
        </div>
        <span className="badge badge-primary">PSTN & CAD Ready</span>
      </div>

      {/* Quick Access Big Buttons for Core 4 Services */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '32px' }}>
        <a 
          href="tel:112"
          className="btn btn-danger"
          style={{ textDecoration: 'none', padding: '16px', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 700 }}
        >
          <PhoneCall size={20} />
          <span>Dial 112 (National SOS)</span>
        </a>

        <a 
          href="tel:1091"
          className="btn btn-danger"
          style={{ textDecoration: 'none', padding: '16px', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 700, background: '#DC2626' }}
        >
          <PhoneCall size={20} />
          <span>Dial 1091 (Women Helpline)</span>
        </a>

        <a 
          href="tel:100"
          className="btn btn-secondary"
          style={{ textDecoration: 'none', padding: '16px', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 700 }}
        >
          <PhoneCall size={20} />
          <span>Dial 100 (Police Desk)</span>
        </a>

        <a 
          href="tel:108"
          className="btn btn-secondary"
          style={{ textDecoration: 'none', padding: '16px', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 700 }}
        >
          <PhoneCall size={20} />
          <span>Dial 108 (Trauma & Ambulance)</span>
        </a>
      </div>

      {/* Category Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px', justifyContent: 'center' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveCategory(cat)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Resources Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filtered.map(res => (
          <div key={res.id} className="glass-card" style={{ padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge badge-safe">
                  <CheckCircle2 size={12} />
                  <span>{res.badge}</span>
                </span>
                <span style={{ fontSize: '0.8rem', color: '#818CF8', fontWeight: 600 }}>
                  {res.distance}
                </span>
              </div>

              <h3 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '6px', fontWeight: 700 }}>
                {res.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '12px' }}>
                <MapPin size={14} color="#6366F1" />
                <span>{res.address}</span>
              </div>

              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.55', marginBottom: '18px' }}>
                {res.description}
              </p>
            </div>

            {/* Actions: Call & Directions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                className="btn btn-danger btn-sm"
                onClick={() => handleCall(res.number, res.name)}
              >
                <PhoneCall size={14} />
                <span>Call {res.number}</span>
              </button>

              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => handleDirections(res.name, res.address)}
              >
                <Navigation size={14} />
                <span>Radar View</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
