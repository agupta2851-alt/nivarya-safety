import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { availableLanguages } from '../data/translations';
import { safetyModesData } from '../data/initialData';
import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  Navigation, 
  Radio, 
  Users, 
  FileText, 
  Bot, 
  PhoneCall, 
  Info,
  UserCheck,
  Compass,
  Car,
  Mic,
  BrainCircuit,
  Lock,
  History,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const { 
    currentPage, 
    setCurrentPage, 
    language, 
    changeLanguage, 
    t, 
    triggerSos,
    safetyMode,
    changeSafetyMode,
    setIsRespondersModalOpen
  } = useApp();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toolsRef = useRef(null);
  const langRef = useRef(null);
  const modeRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setIsToolsOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setIsLangOpen(false);
      if (modeRef.current && !modeRef.current.contains(e.target)) setIsModeMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navItems = [
    { id: 'home', label: t.nav.home },
    { id: 'dashboard', label: t.nav.dashboard },
    { id: 'journey', label: t.nav.safeJourney },
    { id: 'map', label: t.nav.safetyMap },
    { id: 'community', label: t.nav.community },
    { id: 'resources', label: t.nav.resources },
    { id: 'safebot', label: t.nav.safeBot }
  ];

  const safetyToolsItems = [
    { id: 'routes', label: 'Safest Route Recommender', icon: <Compass size={16} color="#818CF8" />, desc: 'AI-analyzed well-lit corridors' },
    { id: 'cab', label: 'Cab Safety & Route Deviation', icon: <Car size={16} color="#EC4899" />, desc: 'Monitors ride variance & deterrent calls' },
    { id: 'voice-gesture', label: 'Voice & Shake SOS', icon: <Mic size={16} color="#F87171" />, desc: 'Hands-free sensor distress triggers' },
    { id: 'intel', label: 'Safety Intelligence Radar', icon: <BrainCircuit size={16} color="#06B6D4" />, desc: 'Predictive multi-factor danger index' },
    { id: 'evidence', label: 'Discreet Evidence Vault', icon: <Lock size={16} color="#10B981" />, desc: 'Tamper-evident audio & video recording' },
    { id: 'history', label: 'Safety History & Audit', icon: <History size={16} color="#FBBF24" />, desc: 'Timestamped log of check-ins and trips' },
    { id: 'privacy', label: 'Privacy & Data Purge', icon: <Shield size={16} color="#A5B4FC" />, desc: 'Sensor permissions & JSON archive' }
  ];

  const currentModeObj = safetyModesData.find(m => m.id === safetyMode) || safetyModesData[0];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setIsMobileMenuOpen(false);
    setIsToolsOpen(false);
    setIsModeMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          {/* Brand Logo */}
          <div className="brand-link" onClick={() => handleNavClick('home')}>
            <div className="brand-logo-wrap">
              <img src="/shield.svg" alt="Nivarya Shield" className="brand-logo-img" />
            </div>
            <div className="brand-text-block">
              <span className="brand-title">{t.brandName}</span>
              <span className="brand-tagline">{t.tagline}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="nav-menu-desktop">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                {item.label}
              </button>
            ))}

            {/* Safety Tools Dropdown */}
            <div className="tools-dropdown-wrap" ref={toolsRef} style={{ position: 'relative' }}>
              <button 
                className={`nav-link ${['routes', 'cab', 'intel', 'voice-gesture', 'evidence', 'history', 'privacy'].includes(currentPage) ? 'active' : ''}`}
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <span>Safety Tools</span>
                <ChevronDown size={14} style={{ transform: isToolsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isToolsOpen && (
                <div className="glass-card animate-fade-in" style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  width: '320px',
                  background: 'rgba(15, 23, 42, 0.96)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '16px',
                  padding: '10px',
                  marginTop: '8px',
                  boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6)',
                  zIndex: 1100
                }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', padding: '6px 12px', letterSpacing: '0.05em' }}>
                    Advanced Defense Tools
                  </div>
                  {safetyToolsItems.map(item => (
                    <button
                      key={item.id}
                      className="dropdown-tool-item"
                      onClick={() => handleNavClick(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        textAlign: 'left',
                        background: currentPage === item.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ marginTop: '2px' }}>{item.icon}</div>
                      <div>
                        <div style={{ color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 600 }}>{item.label}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>{item.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Bar */}
          <div className="nav-actions">
            {/* Safety Mode Indicator Pill */}
            <div ref={modeRef} style={{ position: 'relative' }} className="hide-on-mobile">
              <button 
                onClick={() => setIsModeMenuOpen(!isModeMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: `1px solid ${currentModeObj.color}60`,
                  borderRadius: '9999px',
                  padding: '5px 12px',
                  color: '#FFFFFF',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Change Safety Mode"
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: currentModeObj.color }}></span>
                <span>{currentModeObj.name}</span>
                <ChevronDown size={12} />
              </button>

              {isModeMenuOpen && (
                <div className="glass-card animate-fade-in" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '240px',
                  background: 'rgba(15, 23, 42, 0.96)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '14px',
                  padding: '8px',
                  marginTop: '8px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                  zIndex: 1100
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, padding: '4px 8px', textTransform: 'uppercase' }}>
                    Select Context Profile:
                  </div>
                  {safetyModesData.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { changeSafetyMode(m.id); setIsModeMenuOpen(false); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: safetyMode === m.id ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.color }}></span>
                        <span>{m.name}</span>
                      </span>
                      {safetyMode === m.id && <span style={{ color: 'var(--safe-light)', fontSize: '0.75rem' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="lang-selector" ref={langRef}>
              <button 
                className="lang-btn"
                onClick={() => setIsLangOpen(!isLangOpen)}
                aria-label="Select Language"
              >
                <Globe size={15} />
                <span>{language.toUpperCase()}</span>
              </button>

              {isLangOpen && (
                <div className="lang-menu" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {availableLanguages.map(item => (
                    <button 
                      key={item.code}
                      className={`lang-item ${language === item.code ? 'active' : ''}`}
                      onClick={() => { changeLanguage(item.code); setIsLangOpen(false); }}
                    >
                      {item.native}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Quick Link */}
            <button
              className={`btn btn-secondary btn-sm ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavClick('profile')}
              title="Profile & Settings"
            >
              <UserCheck size={16} />
              <span className="hide-on-mobile">Profile</span>
            </button>

            {/* Emergency SOS Nav Trigger */}
            <button 
              className="btn-nav-sos"
              onClick={triggerSos}
              title="Emergency SOS Instant Trigger"
            >
              <AlertTriangle size={16} />
              <span>{t.emergencySosShort || 'SOS'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              className="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Demo Notice Banner */}
      <div className="demo-banner">
        <span className="demo-banner-dot"></span>
        <span>{t.demoBadge}</span>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700 }}>
            Main Navigation
          </div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.label}
            </button>
          ))}

          <div style={{ padding: '12px 16px 4px 16px', color: 'var(--primary-light)', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, borderTop: '1px solid var(--border-subtle)', marginTop: '8px' }}>
            Advanced Safety Tools
          </div>
          {safetyToolsItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '8px', paddingTop: '8px' }}>
            <button
              className={`mobile-nav-link ${currentPage === 'contacts' ? 'active' : ''}`}
              onClick={() => handleNavClick('contacts')}
            >
              {t.nav.contacts}
            </button>
            <button
              className={`mobile-nav-link ${currentPage === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavClick('profile')}
            >
              {t.nav.profile}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
