import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Navigation, AlertCircle, Map, MessageSquare } from 'lucide-react';

export default function MobileBottomBar() {
  const { currentPage, setCurrentPage, triggerSos, t } = useApp();

  return (
    <div className="mobile-bottom-bar">
      <div 
        className={`bottom-tab ${currentPage === 'home' || currentPage === 'dashboard' ? 'active' : ''}`}
        onClick={() => { setCurrentPage('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      >
        <Home size={20} />
        <span>{t.nav.dashboard}</span>
      </div>

      <div 
        className={`bottom-tab ${currentPage === 'journey' ? 'active' : ''}`}
        onClick={() => { setCurrentPage('journey'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      >
        <Navigation size={20} />
        <span>{t.nav.safeJourney}</span>
      </div>

      <div className="bottom-sos-tab">
        <button 
          className="bottom-sos-btn"
          onClick={triggerSos}
          aria-label="Emergency SOS"
        >
          <AlertCircle size={26} />
        </button>
      </div>

      <div 
        className={`bottom-tab ${currentPage === 'map' ? 'active' : ''}`}
        onClick={() => { setCurrentPage('map'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      >
        <Map size={20} />
        <span>{t.nav.safetyMap}</span>
      </div>

      <div 
        className={`bottom-tab ${currentPage === 'safebot' ? 'active' : ''}`}
        onClick={() => { setCurrentPage('safebot'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      >
        <MessageSquare size={20} />
        <span>SafeBot</span>
      </div>
    </div>
  );
}
