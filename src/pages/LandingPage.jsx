import React from 'react';
import { useApp } from '../context/AppContext';
import { initialSafetyStats } from '../data/initialData';
import { 
  Shield, 
  Navigation, 
  AlertTriangle, 
  Users, 
  Map, 
  FileWarning, 
  Bot, 
  HeartHandshake, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Radio, 
  Eye, 
  Smartphone,
  PhoneCall,
  Activity
} from 'lucide-react';

export default function LandingPage() {
  const { setCurrentPage, triggerSos, t } = useApp();

  const features = [
    {
      id: 'emergency-sos',
      title: 'Instant Emergency SOS',
      desc: 'One-touch emergency cascade with 3-second accidental cancel window, synthesized deterrent siren, and instant broadcast.',
      icon: AlertTriangle,
      colorClass: 'danger',
      target: 'sos'
    },
    {
      id: 'safe-journey',
      title: 'Safe Journey Guard',
      desc: 'Proactive route monitoring, automated checkpoint timers, and simulated live tracking link for family & friends.',
      icon: Navigation,
      colorClass: 'safe',
      target: 'journey'
    },
    {
      id: 'trusted-contacts',
      title: 'Trusted Contacts Network',
      desc: 'Categorized guardian network (Parents, Friends, Warden, Security) with single-tap check-in alerts and quick-call.',
      icon: Users,
      colorClass: 'primary',
      target: 'contacts'
    },
    {
      id: 'safety-map',
      title: 'Safety Radar & Map',
      desc: 'Crowdsourced urban map pinpointing 24/7 police stations, trauma hospitals, safe kiosks, and poorly lit hazard zones.',
      icon: Map,
      colorClass: 'primary',
      target: 'map'
    },
    {
      id: 'report-incident',
      title: 'Community Hazard Reporting',
      desc: 'Empower fellow commuters by reporting dark alleys, stalking spots, or public transit issues with anonymous protection.',
      icon: FileWarning,
      colorClass: 'warning',
      target: 'report'
    },
    {
      id: 'community-pulse',
      title: 'Verified Community Pulse',
      desc: 'Transparent, privacy-preserving community safety feed verified by local students and working women.',
      icon: HeartHandshake,
      colorClass: 'safe',
      target: 'community'
    },
    {
      id: 'ai-assistant',
      title: 'Nivarya SafeBot AI',
      desc: '24/7 intelligent advisor providing instant late-night travel checklists, de-escalation tips, and legal safety rights in India.',
      icon: Bot,
      colorClass: 'primary',
      target: 'safebot'
    },
    {
      id: 'emergency-resources',
      title: 'Emergency Helplines Hub',
      desc: 'Direct, zero-lag access to official national helplines (112, 1091, 181, 108) and nearby police desks.',
      icon: PhoneCall,
      colorClass: 'danger',
      target: 'resources'
    }
  ];

  return (
    <div className="landing-page animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Hero Text Content */}
            <div className="hero-content">
              <div className="hero-badge">
                <Shield size={16} />
                <span>Next-Gen Proactive Women Safety Platform</span>
              </div>

              <h1 className="hero-headline">
                {t.heroTitle}
              </h1>

              <p className="hero-lead">
                {t.heroSubtitle}
              </p>

              <div className="hero-cta-group">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => { setCurrentPage('journey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <Navigation size={20} />
                  <span>{t.startJourney}</span>
                </button>

                <button 
                  className="btn btn-outline btn-lg"
                  onClick={() => {
                    const el = document.getElementById('features-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span>{t.exploreFeatures}</span>
                  <ArrowRight size={18} />
                </button>
              </div>

              <div className="hero-trust-indicators">
                <div className="trust-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Privacy First (Zero Public IDs)</span>
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Sub-3s Simulated Alert Cascade</span>
                </div>
                <div className="trust-item">
                  <CheckCircle size={16} color="#10B981" />
                  <span>Mobile-First PWA</span>
                </div>
              </div>
            </div>

            {/* Right Hero Device / Interactive SOS Preview */}
            <div className="hero-device-card">
              <div className="hero-device-header">
                <div className="device-status-indicator">
                  <span className="demo-banner-dot"></span>
                  <span>Safety Guard: ACTIVE</span>
                </div>
                <span className="badge badge-primary">Pune Center</span>
              </div>

              <div className="device-sos-area">
                <button 
                  className="btn-sos-hero device-sos-circle"
                  onClick={triggerSos}
                  aria-label="Trigger Emergency SOS"
                >
                  <AlertTriangle size={36} />
                  <span style={{ fontSize: '1.2rem', marginTop: '4px' }}>SOS</span>
                </button>
                <div className="device-sos-label">
                  Tap to launch instant Emergency SOS Cascade
                </div>
              </div>

              <div className="device-quick-actions">
                <button 
                  className="device-quick-btn"
                  onClick={() => { setCurrentPage('journey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <Navigation size={18} color="#6366F1" />
                  <span>Start Journey</span>
                </button>
                <button 
                  className="device-quick-btn"
                  onClick={() => { setCurrentPage('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <Map size={18} color="#10B981" />
                  <span>Safety Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP (Clearly labeled demo data) */}
      <div className="stats-strip">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
              SIMULATED PLATFORM PERFORMANCE BENCHMARKS
            </span>
          </div>
          <div className="stats-grid">
            {initialSafetyStats.map((stat, idx) => (
              <div key={idx} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-change">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. WHY NIVARYA (Proactive Safety Philosophy) */}
      <section className="section" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Shield size={14} />
              <span>Why Nivarya</span>
            </span>
            <h2 className="section-title">
              Proactive Safety, Not Just Emergency Panic.
            </h2>
            <p className="section-desc">
              Most safety solutions only react after danger strikes. Nivarya re-engineers personal security by surrounding you with awareness, automated check-ins, and verified safe routes before an emergency ever develops.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div className="card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Clock size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Traditional Panic Buttons (Reactive)</h3>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.6' }}>
                Require an attacker to give you physical time to unlock your phone, find an app, and push a button. Often too late and prone to false alarms that leave families panicked.
              </p>
            </div>

            <div className="card" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(18, 26, 47, 0.8) 100%)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Shield size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#FFFFFF' }}>The Nivarya Paradigm (Proactive)</h3>
              <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                Continuous route monitoring with "I'm Safe" milestone check-ins. If you miss a scheduled checkpoint or deviate into an unlit hazard zone, alerts are triggered automatically.
              </p>
            </div>

            <div className="card">
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Eye size={22} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Community-Powered Intelligence</h3>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.6' }}>
                Real-time visibility into dark alleys, isolated bus stops, and broken infrastructure reported by fellow women commuters. Collective awareness prevents unsafe situations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3 Simple Steps) */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Activity size={14} />
              <span>How It Works</span>
            </span>
            <h2 className="section-title">
              Three Simple Steps to Safe Mobility
            </h2>
            <p className="section-desc">
              Designed for frictionless operation when you are in transit, in a hurry, or feeling uneasy.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Start Your Journey</h3>
              <p className="step-desc">
                Enter your destination and select your transit mode (cab, metro, walking). Nivarya calculates expected arrival and establishes a live tracking session.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Stay Connected & Aware</h3>
              <p className="step-desc">
                Your trusted contacts can view your simulated journey. Quick one-tap "I'm Safe" check-ins keep them updated with zero typing required.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Rapid Support When Needed</h3>
              <p className="step-desc">
                If trouble arises, trigger the Emergency SOS for a loud audio deterrent, instant SMS broadcast with live coordinates, and direct emergency line access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KEY FEATURES SECTION */}
      <section id="features-section" className="section" style={{ background: 'rgba(11, 17, 32, 0.6)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">
              <Smartphone size={14} />
              <span>Core Ecosystem</span>
            </span>
            <h2 className="section-title">
              Comprehensive Safety Capabilities
            </h2>
            <p className="section-desc">
              Explore the 8 integrated modules engineered to protect you across every stage of your commute.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={feat.id} 
                  className="feature-card card-interactive"
                  onClick={() => { setCurrentPage(feat.target); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <div className={`feature-icon-box ${feat.colorClass}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="feature-title">{feat.title}</h3>
                  <p className="feature-desc">{feat.desc}</p>
                  <div className="feature-link">
                    <span>Open Module</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            borderRadius: '24px',
            padding: '64px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 35px rgba(99, 102, 241, 0.15)'
          }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <span className="badge badge-safe" style={{ marginBottom: '16px' }}>
                Join the Movement
              </span>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#FFFFFF', marginBottom: '16px', lineHeight: '1.2' }}>
                "Your journey should never begin with fear."
              </h2>
              <p style={{ color: '#CBD5E1', fontSize: '1.1rem', marginBottom: '32px' }}>
                Experience the Nivarya prototype. Test safe route monitoring, simulate emergency cascades, and explore community-driven safety intelligence.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => { setCurrentPage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <span>Open User Dashboard</span>
                  <ArrowRight size={18} />
                </button>
                <button 
                  className="btn btn-outline btn-lg"
                  onClick={() => { setCurrentPage('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                >
                  <span>About Nivarya Vision</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
