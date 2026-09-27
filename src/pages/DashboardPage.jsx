import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import SafetyModeSwitcher from '../components/SafetyModeSwitcher';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  Users, 
  PhoneCall, 
  Activity, 
  Lightbulb, 
  MapPin, 
  ChevronRight, 
  Plus, 
  Share2, 
  Radio, 
  Clock, 
  CheckCircle2, 
  Compass,
  ArrowUpRight,
  Car,
  Mic,
  BrainCircuit,
  Lock,
  History,
  Shield,
  Zap,
  BatteryLow
} from 'lucide-react';
import { emergencyResourcesList } from '../data/initialData';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { 
    userProfile, 
    contacts, 
    activeJourney, 
    setCurrentPage, 
    triggerSos, 
    performCheckin,
    showToast,
    setIsRespondersModalOpen,
    setIsLocationModalOpen,
    isLocationConsentModalOpen,
    setIsLocationConsentModalOpen,
    locationState,
    batteryLevel,
    isLowBatteryMode,
    toggleLowBatteryMode,
    platformStats,
    safetyHistory,
    t 
  } = useApp();

  const displayName = userProfile?.name || currentUser?.name || '';
  const isProfileIncomplete = !displayName || (!userProfile?.isProfileComplete && !currentUser?.isProfileComplete);
  const locationLabel = locationState?.coords
    ? `GPS Active: ${locationState.coords.lat.toFixed(4)}°N, ${locationState.coords.lng.toFixed(4)}°E`
    : (userProfile?.city ? `Location: ${userProfile.city}${userProfile.location ? ` (${userProfile.location})` : ''}` : 'Location: Not Set');

  const handleQuickCall = (phone, name) => {
    window.location.href = `tel:${phone}`;
    showToast(`Initiating quick-dial to ${name} (${phone})`, 'info');
  };

  const handleTestPing = (name) => {
    showToast(`Simulated safety ping sent to ${name}!`, 'safe');
  };

  const advancedTools = [
    {
      id: 'routes',
      title: 'Safest Route Recommender',
      desc: 'AI scores routes by lighting, CCTV, and police presence',
      icon: <Compass size={22} color="#818CF8" />,
      badge: '96% Safe Route'
    },
    {
      id: 'cab',
      title: 'Cab Safety & Variance',
      desc: 'Monitors ride deviation and provides deterrent fake calls',
      icon: <Car size={22} color="#EC4899" />,
      badge: 'Active Radar'
    },
    {
      id: 'voice-gesture',
      title: 'Voice & Shake SOS',
      desc: 'Hands-free distress keywords and 3-axis accelerometer trigger',
      icon: <Mic size={22} color="#F87171" />,
      badge: 'Low-Power Mic'
    },
    {
      id: 'intel',
      title: 'Safety Intelligence',
      desc: 'Multi-factor danger index based on time, lighting & crime density',
      icon: <BrainCircuit size={22} color="#06B6D4" />,
      badge: 'Risk: Optimal'
    },
    {
      id: 'evidence',
      title: 'Discreet Evidence Vault',
      desc: 'Automatic & manual tamper-evident audio/video buffers',
      icon: <Lock size={22} color="#10B981" />,
      badge: 'Encrypted'
    },
    {
      id: 'history',
      title: 'Safety History & Audit',
      desc: 'Complete chronological log of journeys, check-ins, and SOS drills',
      icon: <History size={22} color="#FBBF24" />,
      badge: 'Audit Ready'
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Purge',
      desc: 'Full data sovereignty: export JSON or permanently wipe local data',
      icon: <Shield size={22} color="#A5B4FC" />,
      badge: 'Zero-Knowledge'
    }
  ];

  return (
    <div className="dashboard-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Incomplete Profile Alert Banner */}
      {isProfileIncomplete && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.16) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={22} color="#FBBF24" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color: '#FBBF24', fontWeight: 700, fontSize: '0.95rem' }}>Profile Incomplete</div>
              <div style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                Set your actual emergency contact, safety PIN, and location preferences to ensure full emergency protection.
              </div>
            </div>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setCurrentPage('profile-setup')}
            style={{ fontWeight: 700 }}
          >
            Complete your profile
          </button>
        </div>
      )}

      {/* 1. Welcome & Status Banner */}
      <div className="dashboard-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            <span className="badge badge-primary">Platform v2.4 Enterprise Guard</span>
            {isLowBatteryMode && batteryLevel != null && (
              <span className="badge badge-danger">
                <BatteryLow size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Low Power Mode ({batteryLevel}%)
              </span>
            )}
            <span 
              className="badge badge-outline"
              style={{ cursor: 'pointer' }}
              onClick={() => setIsLocationConsentModalOpen(true)}
              title="Click to change location source"
            >
              <MapPin size={11} style={{ display: 'inline', marginRight: '4px' }} />
              {locationLabel}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: '#FFFFFF', marginBottom: '8px' }}>
            {displayName ? `${t.dashboard.welcomePrefix || 'Welcome back,'} ${displayName}` : 'Welcome to Nivarya'}
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '0.92rem', maxWidth: '540px' }}>
            {locationState?.coords 
              ? `Real device GPS locked (±${locationState.coords.accuracy}m) • Safety Shield Active`
              : (userProfile?.city 
                  ? `Monitored Safety Zone in ${userProfile.city} • Guardian Network Standing By` 
                  : 'Safety Shield Active • Please complete your profile and location')}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="dashboard-status-pill">
            <span className="demo-banner-dot"></span>
            <span>{t.dashboard.statusActive}</span>
          </div>

          <button 
            className="btn btn-safe btn-sm"
            onClick={() => setIsLocationModalOpen(true)}
            title="Share Live GPS Coordinates"
          >
            <Navigation size={15} />
            <span>Share Live GPS</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setIsRespondersModalOpen(true)}
            title="Nearby Verified Community Responders"
          >
            <Users size={15} />
            <span>Nearby Responders</span>
          </button>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => { setCurrentPage('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <Compass size={15} />
            <span>Radar Map</span>
          </button>
        </div>
      </div>

      {/* Real-time Dynamic Telemetry & Database Statistics Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              {platformStats?.totalUsers ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Registered Members</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              {platformStats?.activeJourneys ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Active Trips Monitored</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              {platformStats?.safetyReports ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Verified Hazard Reports</div>
          </div>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              {contacts.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Your Trusted Guardians</div>
          </div>
        </div>
      </div>

      {/* 2. Feature 16: Contextual Safety Mode Switcher */}
      <SafetyModeSwitcher />

      {/* 3. Urgent / Active Journey Alert Banner (if in progress) */}
      {activeJourney.isActive && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid #10B981',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.25)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700 }}>ACTIVE SAFE JOURNEY IN PROGRESS</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>
                {activeJourney.startPoint} ➔ {activeJourney.destination}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                Progress: {activeJourney.progress}% • ETA: ~{activeJourney.etaMinutes} mins • Mode: {activeJourney.mode}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-safe btn-sm"
              onClick={performCheckin}
            >
              <CheckCircle2 size={16} />
              <span>Safe Check-in</span>
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => { setCurrentPage('journey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <span>View Journey Tracking</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Advanced Safety Tools Grid (7 New Pillars) */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#FFFFFF', fontWeight: 800, margin: 0 }}>
              Advanced Safety Intelligence Suite
            </h2>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Proactive defense modules designed for modern urban environments
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {advancedTools.map(tool => (
            <div
              key={tool.id}
              className="glass-card"
              onClick={() => { setCurrentPage(tool.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{
                padding: '20px',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(7, 11, 20, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {tool.icon}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, background: 'rgba(255, 255, 255, 0.08)', color: '#CBD5E1', padding: '3px 8px', borderRadius: '6px' }}>
                    {tool.badge}
                  </span>
                </div>

                <h3 style={{ color: '#FFFFFF', fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>
                  {tool.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.4, margin: '0 0 14px 0' }}>
                  {tool.desc}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-light)', fontSize: '0.82rem', fontWeight: 600 }}>
                <span>Launch Tool</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Main Dashboard Grid (2 columns on desktop) */}
      <div className="dashboard-grid">
        {/* Left Column: SOS & Journey Quick Actions */}
        <div>
          {/* Giant SOS Card */}
          <div className="dashboard-sos-card">
            <span className="badge badge-danger" style={{ marginBottom: '16px' }}>
              HIGH PRIORITY EMERGENCY TRIGGER
            </span>
            <button 
              className="btn-sos-hero"
              style={{ width: '130px', height: '130px', margin: '12px auto' }}
              onClick={triggerSos}
              aria-label="Activate Emergency SOS"
            >
              <AlertTriangle size={36} />
              <span style={{ fontSize: '1.25rem', marginTop: '2px' }}>SOS</span>
            </button>
            <h3 style={{ fontSize: '1.25rem', marginTop: '16px', color: '#FFFFFF' }}>
              {t.dashboard.quickSos}
            </h3>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', maxWidth: '380px', marginTop: '4px' }}>
              {t.dashboard.quickSosDesc}
            </p>
          </div>

          {/* Quick Start Safe Journey Launcher Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--primary-subtle)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Navigation size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem' }}>{t.dashboard.startJourneyCard}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{t.dashboard.startJourneyDesc}</p>
                </div>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => { setCurrentPage('journey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <span>Launch</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Recent Route</span>
                <strong style={{ color: '#FFFFFF' }}>
                  {activeJourney?.startPoint && activeJourney?.destination 
                    ? `${activeJourney.startPoint} ➔ ${activeJourney.destination}` 
                    : 'No routes tracked yet'}
                </strong>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Check-in Interval</span>
                <strong style={{ color: '#34D399' }}>Every 10 mins (Automated)</strong>
              </div>
            </div>
          </div>

          {/* Recent Safety Activity Timeline */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#818CF8" />
                <span>{t.dashboard.recentActivity}</span>
              </h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => { setCurrentPage('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ fontSize: '0.8rem', color: 'var(--primary-light)' }}
              >
                View Full Audit Log →
              </button>
            </div>

            <div className="activity-feed">
              {safetyHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: '#94A3B8' }}>
                  <Activity size={26} style={{ margin: '0 auto 8px auto', opacity: 0.4 }} />
                  <div style={{ fontWeight: 600, color: '#E2E8F0', fontSize: '0.9rem', marginBottom: '4px' }}>
                    No activity yet
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                    Your safe journeys, automated check-ins, and emergency alerts will appear here in real-time.
                  </div>
                </div>
              ) : (
                safetyHistory.slice(0, 4).map(item => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon" style={{
                      background: item.type === 'sos' ? 'rgba(239, 68, 68, 0.15)' : item.type === 'journey' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: item.type === 'sos' ? '#F87171' : item.type === 'journey' ? '#818CF8' : '#34D399'
                    }}>
                      {item.type === 'sos' ? <AlertTriangle size={18} /> : item.type === 'journey' ? <Navigation size={18} /> : <CheckCircle2 size={18} />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">{item.title}</div>
                      <div className="activity-time">
                        {item.time} {item.date ? `• ${item.date}` : ''} {item.location ? `• ${item.location}` : ''}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Contacts, Nearby Resources & Safety Tips */}
        <div>
          {/* Trusted Contacts Strip */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#6366F1" />
                <span>{t.dashboard.trustedContactsTitle}</span>
              </h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => { setCurrentPage('contacts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ fontSize: '0.8rem', color: '#818CF8' }}
              >
                <span>View All ({contacts.length})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {contacts.slice(0, 3).map(contact => (
                <div key={contact.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: contact.avatarColor || '#6366F1',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {contact.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        {contact.relation} {contact.isPrimary && '• Primary'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleTestPing(contact.name)}
                      title="Send Test Ping"
                      style={{ padding: '6px' }}
                    >
                      <Share2 size={15} color="#10B981" />
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleQuickCall(contact.phone, contact.name)}
                      title="Quick Call"
                      style={{ padding: '6px 10px' }}
                    >
                      <PhoneCall size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-outline btn-sm btn-block"
              onClick={() => { setCurrentPage('contacts'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ marginTop: '14px' }}
            >
              <Plus size={15} />
              <span>Add or Manage Contacts</span>
            </button>
          </div>

          {/* Nearby Emergency Resources */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PhoneCall size={18} color="#EF4444" />
                <span>{t.dashboard.nearbyServices}</span>
              </h3>
              <span className="badge badge-safe">Verified</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {emergencyResourcesList.slice(0, 3).map(res => (
                <div key={res.id} style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>{res.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{res.badge} • {res.distance}</div>
                  </div>
                  <a 
                    href={`tel:${res.number}`}
                    className="btn btn-danger btn-sm"
                    style={{ textDecoration: 'none', padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Dial {res.number}
                  </a>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-ghost btn-sm btn-block"
              onClick={() => { setCurrentPage('resources'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ marginTop: '12px', color: '#818CF8' }}
            >
              <span>Full Helplines Directory</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* Today's Safety Advisory / Tips Card */}
          <div className="card" style={{
            background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FCD34D', marginBottom: '10px', fontSize: '0.88rem', fontWeight: 700 }}>
              <Lightbulb size={18} />
              <span>{t.dashboard.safetyTipTitle}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#CBD5E1', lineHeight: '1.6' }}>
              {t.dashboard.safetyTipBody}
            </p>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => { setCurrentPage('safebot'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              style={{ marginTop: '10px', padding: '0', color: '#818CF8', fontSize: '0.82rem' }}
            >
              <span>Ask SafeBot AI for more travel guidance →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
