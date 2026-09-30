import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import MobileBottomBar from './components/MobileBottomBar';
import EmergencyModal from './components/EmergencyModal';
import ToastNotification from './components/ToastNotification';
import UnusualActivityModal from './components/UnusualActivityModal';
import LowBatteryModal from './components/LowBatteryModal';
import OfflineEmergencyBanner from './components/OfflineEmergencyBanner';
import NearbyRespondersModal from './components/NearbyRespondersModal';
import LocationSharingModal from './components/LocationSharingModal';
import LocationConsentModal from './components/LocationConsentModal';
import ProtectedRoute from './components/ProtectedRoute';

// Authentication Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfileSetupPage from './pages/ProfileSetupPage';

// Existing Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SafeJourneyPage from './pages/SafeJourneyPage';
import EmergencyPage from './pages/EmergencyPage';
import TrustedContactsPage from './pages/TrustedContactsPage';
import SafetyMapPage from './pages/SafetyMapPage';
import ReportIncidentPage from './pages/ReportIncidentPage';
import CommunityPage from './pages/CommunityPage';
import SafeBotPage from './pages/SafeBotPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';

// Advanced Safety Feature Pages
import SafestRoutePage from './pages/SafestRoutePage';
import CabSafetyPage from './pages/CabSafetyPage';
import SafetyIntelligencePage from './pages/SafetyIntelligencePage';
import VoiceGestureSosPage from './pages/VoiceGestureSosPage';
import EvidenceRecordingPage from './pages/EvidenceRecordingPage';
import PrivacyDashboardPage from './pages/PrivacyDashboardPage';
import SafetyHistoryPage from './pages/SafetyHistoryPage';
import LiveTrackPage from './pages/LiveTrackPage';

// Styles
import './styles/globals.css';
import './styles/components.css';

function MainApp() {
  const { 
    currentPage, 
    currentTrackingId,
    isRespondersModalOpen, 
    setIsRespondersModalOpen,
    isLocationModalOpen,
    setIsLocationModalOpen,
    isLocationConsentModalOpen,
    setIsLocationConsentModalOpen
  } = useApp();

  const renderCurrentPage = () => {
    // Robust route check for /track/:trackingId or /track
    const pathname = typeof window !== 'undefined' ? (window.location.pathname || '') : '';
    const isTrackRoute = /^\/track(?:\/|$)/i.test(pathname) || currentPage === 'track';

    if (isTrackRoute) {
      return <LiveTrackPage trackingId={currentTrackingId} />;
    }

    switch (currentPage) {
      case 'home':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'profile-setup':
        return <ProfileSetupPage />;
      case 'dashboard':
        return (
          <ProtectedRoute title="Personal Safety Dashboard">
            <DashboardPage />
          </ProtectedRoute>
        );
      case 'journey':
        return <SafeJourneyPage />;
      case 'sos':
        return <EmergencyPage />;
      case 'contacts':
      case 'safety-circle':
        return (
          <ProtectedRoute title="Safety Circle & Trusted Contacts">
            <TrustedContactsPage />
          </ProtectedRoute>
        );
      case 'map':
        return <SafetyMapPage />;
      case 'report':
        return <ReportIncidentPage />;
      case 'community':
        return <CommunityPage />;
      case 'safebot':
        return <SafeBotPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'profile':
        return (
          <ProtectedRoute title="Identity & Emergency Settings">
            <ProfilePage />
          </ProtectedRoute>
        );
      case 'about':
        return <AboutPage />;
      // Advanced New Safety Features
      case 'routes':
        return <SafestRoutePage />;
      case 'cab':
        return <CabSafetyPage />;
      case 'intel':
        return <SafetyIntelligencePage />;
      case 'voice-gesture':
        return <VoiceGestureSosPage />;
      case 'evidence':
        return <EvidenceRecordingPage />;
      case 'privacy':
        return (
          <ProtectedRoute title="Privacy & Data Purge Controls">
            <PrivacyDashboardPage />
          </ProtectedRoute>
        );
      case 'history':
        return (
          <ProtectedRoute title="Safety History & Audit Logs">
            <SafetyHistoryPage />
          </ProtectedRoute>
        );
      case 'track':
        return <LiveTrackPage trackingId={currentTrackingId} />;
      default:
        if (/^\/track/i.test(pathname)) {
          return <LiveTrackPage trackingId={currentTrackingId} />;
        }
        return <LandingPage />;
    }
  };

  return (
    <div className="app-layout">
      {/* Global Navbar */}
      <Navbar />

      {/* Offline Mode Indicator & Quick Action Banner */}
      <OfflineEmergencyBanner />

      {/* Main View Area */}
      <main className="main-content">
        {renderCurrentPage()}
      </main>

      {/* Full-Screen Emergency SOS Modal */}
      <EmergencyModal />

      {/* Unusual Activity / Route Deviation 'Are You Safe?' Verification Modal */}
      <UnusualActivityModal />

      {/* Battery-Aware Emergency Mode Modal */}
      <LowBatteryModal />

      {/* Nearby Verified Responders Modal */}
      <NearbyRespondersModal 
        isOpen={isRespondersModalOpen} 
        onClose={() => setIsRespondersModalOpen(false)} 
      />

      {/* Location Sharing Duration & Link Modal */}
      <LocationSharingModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Location Consent & GPS Selection Modal */}
      <LocationConsentModal
        isOpen={isLocationConsentModalOpen}
        onClose={() => setIsLocationConsentModalOpen(false)}
      />

      {/* Toast Alert Notifications */}
      <ToastNotification />

      {/* Mobile Sticky Bottom Bar */}
      <MobileBottomBar />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </AppProvider>
  );
}
