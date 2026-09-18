import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { availableLanguages } from '../data/translations';
import { safetyModesData } from '../data/initialData';
import { 
  Shield, 
  AlertTriangle, 
  Globe, 
  Menu, 
  X, 
  ChevronDown,
  ChevronRight,
  Navigation, 
  Users, 
  FileText, 
  Bot, 
  PhoneCall, 
  UserCheck,
  Compass,
  Car,
  Mic,
  BrainCircuit,
  Lock,
  History,
  SlidersHorizontal,
  LogIn,
  LogOut,
  Home,
  LayoutDashboard,
  MapPin
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
    showToast
  } = useApp();

  const { currentUser, isAuthenticated, logout } = useAuth();

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileToolsExpanded, setIsMobileToolsExpanded] = useState(true);

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

  // Lock body scroll when mobile menu is open to prevent accidental background scrolling
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsToolsOpen(false);
        setIsLangOpen(false);
        setIsModeMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { id: 'home', label: t.nav.home || 'Home', icon: <Home size={18} /> },
    { id: 'dashboard', label: t.nav.dashboard || 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'journey', label: t.nav.safeJourney || 'Safe Journey', icon: <Navigation size={18} /> },
    { id: 'map', label: t.nav.safetyMap || 'Safety Map', icon: <MapPin size={18} /> },
    { id: 'community', label: t.nav.community || 'Community', icon: <Users size={18} /> },
    { id: 'resources', label: t.nav.resources || 'Resources', icon: <FileText size={18} /> },
    { id: 'safebot', label: t.nav.safeBot || 'SafeBot AI', icon: <Bot size={18} /> }
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
  const isSafetyToolsActive = ['routes', 'cab', 'intel', 'voice-gesture', 'evidence', 'history', 'privacy'].includes(currentPage);

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
              <span className="brand-title">{t.brandName || 'NIVARYA'}</span>
              <span className="brand-tagline">{t.tagline || 'Move Without Fear.'}</span>
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
                className={`nav-link ${isSafetyToolsActive ? 'active' : ''}`}
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
            {/* Safety Mode Indicator Pill (Desktop Only) */}
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

            {/* Language Switcher (Desktop Only) */}
            <div className="lang-selector hide-on-mobile" ref={langRef}>
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

            {/* Desktop Auth Action: Login or Profile & Logout */}
            <div className="nav-auth-desktop">
              {!isAuthenticated ? (
                <button
                  className={`btn btn-primary btn-sm ${currentPage === 'login' ? 'active' : ''}`}
                  onClick={() => handleNavClick('login')}
                  title="Log In or Create Account"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <LogIn size={15} />
                  <span>Log In</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className={`btn btn-secondary btn-sm ${currentPage === 'profile' ? 'active' : ''}`}
                    onClick={() => handleNavClick('profile')}
                    title={`Signed in as ${currentUser?.name || 'User'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '5px 10px' }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#FFFFFF'
                    }}>
                      {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                      {currentUser?.name ? currentUser.name.split(' ')[0] : 'Profile'}
                    </span>
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={async () => {
                      await logout();
                      showToast('Logged out safely. Take care!', 'info');
                      setCurrentPage('home');
                    }}
                    title="Log Out"
                    style={{ color: 'var(--text-muted)', padding: '6px 8px' }}
                    aria-label="Log Out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Emergency SOS Nav Trigger (Always accessible on mobile and desktop) */}
            <button 
              className="btn-nav-sos"
              onClick={triggerSos}
              title="Emergency SOS Instant Trigger"
            >
              <AlertTriangle size={15} />
              <span>{t.emergencySosShort || 'SOS'}</span>
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button 
              className="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
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
        <div 
          className="mobile-drawer animate-fade-in" 
          role="dialog" 
          aria-modal="true" 
          aria-label="Mobile Navigation"
        >
          {/* Main Navigation Section */}
          <div className="mobile-drawer-section-title">Main Navigation</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`mobile-nav-link ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                color: currentPage === item.id ? 'var(--primary-light)' : 'var(--text-muted)' 
              }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}

          {/* Safety Tools Accordion */}
          <div className="mobile-drawer-section-title" style={{ marginTop: '8px' }}>Safety Tools & Defense</div>
          <div className="mobile-tools-accordion">
            <button
              className={`mobile-tools-trigger ${isSafetyToolsActive ? 'active' : ''}`}
              onClick={() => setIsMobileToolsExpanded(!isMobileToolsExpanded)}
              aria-expanded={isMobileToolsExpanded}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <SlidersHorizontal size={17} color="#818CF8" />
                <span>Safety Tools</span>
                <span style={{ 
                  fontSize: '0.7rem', 
                  padding: '2px 7px', 
                  borderRadius: '9999px', 
                  background: 'rgba(99, 102, 241, 0.2)', 
                  color: 'var(--primary-light)',
                  fontWeight: 700 
                }}>
                  {safetyToolsItems.length}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: isMobileToolsExpanded ? 'rotate(180deg)' : 'none', 
                  transition: 'transform 0.2s',
                  color: 'var(--text-muted)'
                }} 
              />
            </button>

            {isMobileToolsExpanded && (
              <div className="mobile-tools-panel">
                {safetyToolsItems.map(tool => (
                  <button
                    key={tool.id}
                    className={`mobile-subtool-link ${currentPage === tool.id ? 'active' : ''}`}
                    onClick={() => handleNavClick(tool.id)}
                  >
                    <div style={{ flexShrink: 0 }}>{tool.icon}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.85rem' }}>{tool.label}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{tool.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authentication & User Account Section */}
          <div className="mobile-auth-container">
            <div className="mobile-drawer-section-title" style={{ padding: '0 4px' }}>Account & Security</div>
            {!isAuthenticated ? (
              <>
                <button
                  className={`mobile-btn-login ${currentPage === 'login' ? 'active' : ''}`}
                  onClick={() => handleNavClick('login')}
                  title="Log In to Nivarya"
                >
                  <LogIn size={18} />
                  <span>Log In to Nivarya</span>
                </button>
                <button
                  className={`mobile-btn-signup ${currentPage === 'signup' ? 'active' : ''}`}
                  onClick={() => handleNavClick('signup')}
                  title="Create Safety Account"
                >
                  <UserCheck size={18} />
                  <span>Create Safety Account</span>
                </button>
              </>
            ) : (
              <>
                <div 
                  className="mobile-user-profile-card"
                  onClick={() => handleNavClick('profile')}
                  title="View Profile Settings"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366F1 0%, #10B981 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      flexShrink: 0
                    }}>
                      {(currentUser?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>
                        {currentUser?.name || 'Safety User'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--safe-light)' }}>
                        Guardian Shield Active
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>

                <button
                  className={`mobile-nav-link ${currentPage === 'contacts' ? 'active' : ''}`}
                  onClick={() => handleNavClick('contacts')}
                  style={{ marginTop: '2px' }}
                >
                  <PhoneCall size={18} color="#10B981" />
                  <span>{t.nav.contacts || 'Trusted Contacts'}</span>
                </button>

                <button
                  className="mobile-btn-logout"
                  onClick={async () => {
                    await logout();
                    setIsMobileMenuOpen(false);
                    showToast('Logged out safely.', 'info');
                    setCurrentPage('home');
                  }}
                >
                  <LogOut size={17} />
                  <span>Log Out</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Context Settings on Mobile */}
          <div className="mobile-context-row">
            <div className="mobile-drawer-section-title" style={{ padding: '0 4px' }}>Safety Context & Language</div>
            {/* Safety Mode Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Context Mode:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {safetyModesData.map(m => (
                  <button
                    key={m.id}
                    onClick={() => changeSafetyMode(m.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '9999px',
                      background: safetyMode === m.id ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-surface)',
                      border: `1px solid ${safetyMode === m.id ? m.color : 'var(--border-subtle)'}`,
                      color: safetyMode === m.id ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: m.color }}></span>
                    <span>{m.name}</span>
                    {safetyMode === m.id && <span style={{ color: 'var(--safe-light)', fontSize: '0.72rem' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Globe size={13} />
                <span>Language:</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {availableLanguages.map(item => (
                  <button
                    key={item.code}
                    onClick={() => changeLanguage(item.code)}
                    style={{
                      padding: '4px 9px',
                      borderRadius: 'var(--radius-xs)',
                      background: language === item.code ? 'var(--primary-subtle)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${language === item.code ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      color: language === item.code ? '#FFFFFF' : 'var(--text-secondary)',
                      fontSize: '0.76rem',
                      fontWeight: language === item.code ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    {item.native}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
