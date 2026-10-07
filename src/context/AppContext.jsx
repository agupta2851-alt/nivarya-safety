import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { translations } from '../data/translations';
import { 
  initialContacts, 
  initialCommunityIncidents, 
  initialSafetyHistory,
  safetyModesData 
} from '../data/initialData';
import { playCountdownBeep, startEmergencySiren, stopEmergencySiren } from '../utils/audio';
import { generateTrackingId, buildTrackingUrl } from '../utils/tracking';
import { authService, normalizePhoneNumber } from '../services/authService';
import { databaseService } from '../services/databaseService';
import { 
  calculateHaversineDistanceKm, 
  calculateHaversineDistanceMeters, 
  isSignificantMovement, 
  geocodeDestination, 
  MODE_SPEEDS_KMH 
} from '../utils/geoUtils';

const AppContext = createContext();

function getInitialRoute() {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname || '';
    if (/^\/track(?:\/|$)/i.test(pathname)) {
      const trackMatch = pathname.match(/^\/track(?:\/([^/?#]+))?/i);
      const rawId = (trackMatch && trackMatch[1]) 
        ? decodeURIComponent(trackMatch[1].replace(/\/+$/, '')) 
        : null;
      return {
        page: 'track',
        trackingId: rawId || generateTrackingId()
      };
    }
    const cleanPath = pathname.replace(/^\//, '').split('/')[0].toLowerCase();
    const validPages = [
      'login', 'signup', 'profile-setup',
      'dashboard', 'journey', 'sos', 'contacts', 'safety-circle', 'map', 'report',
      'community', 'safebot', 'resources', 'profile', 'about',
      'routes', 'cab', 'intel', 'voice-gesture', 'evidence',
      'privacy', 'history', 'track'
    ];
    if (validPages.includes(cleanPath)) {
      return { page: cleanPath === 'safety-circle' ? 'contacts' : cleanPath, trackingId: null };
    }
  }
  return { page: 'home', trackingId: null };
}

export function AppProvider({ children }) {
  // Navigation: 'home' | 'login' | 'signup' | 'dashboard' | 'journey' | 'sos' | 'contacts' | 'map' | 'report' | 'community' | 'safebot' | 'resources' | 'profile' | 'about' | 'routes' | 'cab' | 'intel' | 'voice-gesture' | 'evidence' | 'privacy' | 'history' | 'track'
  const initialRoute = getInitialRoute();
  const [currentPage, setCurrentPageState] = useState(initialRoute.page);
  const [currentTrackingId, setCurrentTrackingId] = useState(() => initialRoute.trackingId || generateTrackingId());

  // Guarantee active tracking sync with browser URL on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname || '';
      if (/^\/track(?:\/|$)/i.test(pathname)) {
        if (currentPage !== 'track') {
          setCurrentPageState('track');
        }
        const trackMatch = pathname.match(/^\/track(?:\/([^/?#]+))?/i);
        if (trackMatch && trackMatch[1]) {
          const rawId = decodeURIComponent(trackMatch[1].replace(/\/+$/, ''));
          if (rawId && currentTrackingId !== rawId) {
            setCurrentTrackingId(rawId);
          }
        }
      }
    }
  }, []);

  const setCurrentPage = (page, options = {}) => {
    setCurrentPageState(page);
    if (options.trackingId) {
      setCurrentTrackingId(options.trackingId);
    }
    if (typeof window !== 'undefined' && !options.skipPush) {
      const activeId = options.trackingId || currentTrackingId || generateTrackingId();
      const targetPath = page === 'home' 
        ? '/' 
        : page === 'track' 
          ? `/track/${activeId}` 
          : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ page, trackingId: options.trackingId || currentTrackingId }, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentPageState(route.page);
      if (route.trackingId) {
        setCurrentTrackingId(route.trackingId);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Language: 'en', 'hi', 'mr', 'ta', 'te', 'bn', 'kn', 'gu', 'ml', 'pa'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nivarya_lang') || 'en';
  });

  const t = translations[language] || translations.en;

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('nivarya_lang', lang);
  };

  // Safety Mode: 'personal' | 'college' | 'hostel' | 'office' | 'travel'
  const [safetyMode, setSafetyMode] = useState(() => {
    return localStorage.getItem('nivarya_safety_mode') || 'personal';
  });

  const changeSafetyMode = (modeId) => {
    setSafetyMode(modeId);
    localStorage.setItem('nivarya_safety_mode', modeId);
    const modeObj = safetyModesData.find(m => m.id === modeId);
    showToast(`Safety Mode switched to ${modeObj ? modeObj.name : modeId}`, 'info');
    addSafetyHistory({
      type: 'mode',
      title: `Safety Mode Changed: ${modeObj ? modeObj.name : modeId}`,
      details: `Active profile updated with tailored triggers and emergency network.`,
      status: 'Mode Active'
    });
  };

  // Real Dynamic Platform Statistics (from real database records)
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeJourneys: 0,
    completedJourneys: 0,
    sosEvents: 0,
    safetyReports: 0,
    verifiedHubs: 7,
    activeUsers: 0
  });

  const refreshPlatformStats = async () => {
    try {
      const stats = await databaseService.getPublicStatistics();
      if (stats) setPlatformStats(stats);
    } catch (e) {
      console.warn('Failed to load dynamic statistics:', e);
    }
  };

  // ─── Unified Realtime Subscription ──────────────────────────────────────────
  // Single subscription handles ALL table events to avoid duplicate channels.
  // Previously two separate subscribeToRealtimeUpdates calls were registered,
  // causing doubled callbacks on every DB change.
  useEffect(() => {
    refreshPlatformStats();
    const unsub = databaseService.subscribeToRealtimeUpdates((evt) => {
      const table = evt?.table;

      // Stats refresh on any change
      refreshPlatformStats();

      // Safety reports: reload community incidents
      if (table === 'safety_reports') {
        databaseService.getSafetyReports().then(reps => {
          if (Array.isArray(reps)) setIncidents(reps);
        }).catch(() => {});
      }

      // Contacts: reload for current user (handled here instead of a second subscription)
      if (table === 'trusted_contacts' || table === 'emergency_contacts') {
        const u = authService.getCurrentUser();
        if (u?.id) {
          loadUserContacts(u.id);
        }
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User Profile & Settings
  const [userProfile, setUserProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionUserRaw = localStorage.getItem('nivarya_auth_session');
        if (sessionUserRaw) {
          const u = JSON.parse(sessionUserRaw);
          if (u && u.name) {
            return {
              name: u.name || '',
              role: u.role || 'Verified Member',
              phone: u.phone || '',
              email: u.email || '',
              age: u.age || '',
              city: u.city || '',
              location: u.location || '',
              bloodGroup: u.bloodGroup || '',
              emergencyNotes: u.emergencyNotes || '',
              safetyPin: u.safetyPin || '',  // Must be user-set
              sosDelay: 3,
              autoAudioRecord: true,
              highAccuracyGps: true,
              isProfileComplete: Boolean(u.isProfileComplete)
            };
          }
        }
        const saved = localStorage.getItem('nivarya_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name) {
            return parsed;
          }
        }
      } catch (e) { /* ignore */ }
    }
    return {
      name: '',
      role: 'Verified Member',
      phone: '',
      email: '',
      age: '',
      city: '',
      location: '',
      bloodGroup: '',
      emergencyNotes: '',
      safetyPin: '',   // Must be set by user in profile setup
      sosDelay: 3,
      autoAudioRecord: true,
      highAccuracyGps: true,
      isProfileComplete: false
    };
  });

  useEffect(() => {
    if (userProfile.name) {
      localStorage.setItem('nivarya_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  // Safety Circle / Trusted Contacts (Strict User Isolation & Database Backed)
  const [contacts, setContacts] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const u = authService.getCurrentUser();
        if (u && u.id) {
          const allContacts = JSON.parse(localStorage.getItem('nivarya_db_trusted_contacts') || '[]');
          return allContacts.filter(c => c.user_id === u.id);
        }
      } catch (e) { /* ignore */ }
    }
    return [];
  });
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // Selected Contacts for SOS and Journey
  const [selectedContactsForSos, setSelectedContactsForSos] = useState(() => {
    return contacts.filter(c => c.alert_status !== 'muted').map(c => c.id);
  });

  const [selectedContactsForJourney, setSelectedContactsForJourney] = useState(() => {
    return contacts.filter(c => c.is_primary || c.isPrimary || c.alert_status === 'active' || c.alert_status === 'journey_only').map(c => c.id);
  });

  const loadUserContacts = useCallback(async (userId) => {
    if (!userId) {
      setContacts([]);
      setSelectedContactsForSos([]);
      setSelectedContactsForJourney([]);
      return [];
    }
    setIsLoadingContacts(true);
    try {
      const data = await databaseService.getTrustedContacts(userId);
      const safeData = Array.isArray(data) ? data : [];
      setContacts(safeData);
      setSelectedContactsForSos(safeData.filter(c => c.alert_status !== 'muted').map(c => c.id));
      setSelectedContactsForJourney(safeData.filter(c => c.is_primary || c.isPrimary || c.alert_status === 'active' || c.alert_status === 'journey_only').map(c => c.id));
      return safeData;
    } catch (err) {
      console.warn('Failed to load user trusted contacts:', err);
      return [];
    } finally {
      setIsLoadingContacts(false);
    }
  }, []);

  // Listen to auth events (login, logout, account switch) to reload strictly for active user
  useEffect(() => {
    const handleAuthEvent = () => {
      const u = authService.getCurrentUser();
      if (u?.id) {
        loadUserContacts(u.id);
      } else {
        setContacts([]);
        setSelectedContactsForSos([]);
        setSelectedContactsForJourney([]);
      }
    };

    window.addEventListener('storage', handleAuthEvent);
    window.addEventListener('nivarya:auth_state_change', handleAuthEvent);
    return () => {
      window.removeEventListener('storage', handleAuthEvent);
      window.removeEventListener('nivarya:auth_state_change', handleAuthEvent);
    };
  }, [loadUserContacts]);

  // (Contacts realtime reload is now handled inside the unified subscription above)

  const toggleContactSosSelection = (id) => {
    setSelectedContactsForSos(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(cId => cId !== id) : prev) : [...prev, id]
    );
  };

  const toggleContactJourneySelection = (id) => {
    setSelectedContactsForJourney(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(cId => cId !== id) : prev) : [...prev, id]
    );
  };

  const addContact = async (newContact) => {
    const u = authService.getCurrentUser();
    if (!u || !u.id) {
      showToast('Please log in to add contacts to your Safety Circle.', 'danger');
      throw new Error('User authentication required.');
    }

    try {
      const saved = await databaseService.saveTrustedContact(u.id, {
        ...newContact,
        priority: contacts.length + 1
      });
      if (saved) {
        setContacts(prev => {
          const exists = prev.some(c => c.id === saved.id);
          return exists ? prev.map(c => c.id === saved.id ? saved : c) : [saved, ...prev];
        });
        if (saved.alert_status !== 'muted') {
          setSelectedContactsForSos(prev => prev.includes(saved.id) ? prev : [...prev, saved.id]);
        }
        if (saved.is_primary || saved.alert_status === 'active' || saved.alert_status === 'journey_only') {
          setSelectedContactsForJourney(prev => prev.includes(saved.id) ? prev : [...prev, saved.id]);
        }
        showToast(`${saved.name} added to your Safety Circle`, 'safe');
        return saved;
      }
    } catch (err) {
      console.error('Error adding contact to Safety Circle:', err);
      showToast(err.message || 'Failed to add contact', 'danger');
      throw err;
    }
  };

  const updateContact = async (id, updatedFields) => {
    const u = authService.getCurrentUser();
    if (!u || !u.id) {
      showToast('Please log in to edit trusted contacts.', 'danger');
      throw new Error('User authentication required.');
    }

    try {
      const existing = contacts.find(c => c.id === id) || {};
      const saved = await databaseService.saveTrustedContact(u.id, {
        ...existing,
        ...updatedFields,
        id
      });
      if (saved) {
        setContacts(prev => prev.map(c => c.id === id ? saved : c));
        showToast('Contact details updated successfully', 'info');
        return saved;
      }
    } catch (err) {
      console.error('Error updating contact:', err);
      showToast(err.message || 'Failed to update contact', 'danger');
      throw err;
    }
  };

  const deleteContact = async (id) => {
    const u = authService.getCurrentUser();
    if (!u || !u.id) {
      showToast('Please log in to delete contacts.', 'danger');
      throw new Error('User authentication required.');
    }

    try {
      await databaseService.deleteTrustedContact(u.id, id);
      setContacts(prev => prev.filter(c => c.id !== id));
      setSelectedContactsForSos(prev => prev.filter(cId => cId !== id));
      setSelectedContactsForJourney(prev => prev.filter(cId => cId !== id));
      showToast('Contact removed from Safety Circle', 'info');
      return true;
    } catch (err) {
      console.error('Error deleting contact:', err);
      showToast(err.message || 'Failed to delete contact', 'danger');
      throw err;
    }
  };

  // Real-Time Location & Telemetry State
  const [locationState, setLocationState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const sessionUserRaw = localStorage.getItem('nivarya_auth_session');
        if (sessionUserRaw) {
          const u = JSON.parse(sessionUserRaw);
          if (u.locationState) return u.locationState;
          if (u.city || u.location) {
            return {
              coords: null,
              city: u.city || '',
              address: u.location || '',
              status: 'manual',
              statusMessage: `Manual: ${u.city || u.location}`,
              source: 'manual',
              lastUpdated: null
            };
          }
        }
        const saved = localStorage.getItem('nivarya_location_state');
        if (saved) return JSON.parse(saved);
      } catch (e) { /* ignore */ }
    }
    return {
      coords: null,
      city: '',
      address: '',
      status: 'idle',
      statusMessage: 'Location not set',
      source: null,
      lastUpdated: null
    };
  });

  // Cross-tab and auth-event synchronization
  useEffect(() => {
    const handleAuthSync = () => {
      try {
        const sessionUserRaw = localStorage.getItem('nivarya_auth_session');
        if (sessionUserRaw) {
          const u = JSON.parse(sessionUserRaw);
          setUserProfile(prev => ({
            ...prev,
            name: u.name || '',
            role: u.role || 'Verified Member',
            phone: u.phone || '',
            email: u.email || '',
            age: u.age || '',
            city: u.city || '',
            location: u.location || '',
            bloodGroup: u.bloodGroup || '',
            emergencyNotes: u.emergencyNotes || '',
            safetyPin: u.safetyPin || '',   // Must be user-set
            isProfileComplete: Boolean(u.isProfileComplete)
          }));
          if (u.id) {
            loadUserContacts(u.id);
          }
          if (u.locationState) {
            setLocationState(u.locationState);
          }
        } else {
          // Logged out: reset to clean state
          setUserProfile({
            name: '',
            role: 'Verified Member',
            phone: '',
            email: '',
            age: '',
            city: '',
            location: '',
            bloodGroup: '',
            emergencyNotes: '',
            safetyPin: '',   // Reset on logout
            sosDelay: 3,
            autoAudioRecord: true,
            highAccuracyGps: true,
            isProfileComplete: false
          });
          setContacts([]);
          setLocationState({
            coords: null,
            city: '',
            address: '',
            status: 'idle',
            statusMessage: 'Location not set',
            source: null,
            lastUpdated: null
          });
          localStorage.removeItem('nivarya_profile');
          localStorage.removeItem('nivarya_contacts');
          localStorage.removeItem('nivarya_location_state');
        }
      } catch (err) {
        console.error('Error syncing auth state in AppContext', err);
      }
    };

    window.addEventListener('storage', handleAuthSync);
    return () => window.removeEventListener('storage', handleAuthSync);
  }, []);

  // Real Battery Detection with Device Battery Status API
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [isLowBatteryMode, setIsLowBatteryMode] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        const level = Math.round(battery.level * 100);
        setBatteryLevel(level);
        if (level < 20) setIsLowBatteryMode(true);

        const handleLevel = () => {
          const updated = Math.round(battery.level * 100);
          setBatteryLevel(updated);
          if (updated < 20) setIsLowBatteryMode(true);
        };
        battery.addEventListener('levelchange', handleLevel);
      }).catch(() => {
        setBatteryLevel(null);
      });
    }
  }, []);

  const toggleLowBatteryMode = () => {
    setIsLowBatteryMode(prev => {
      const next = !prev;
      showToast(next ? 'Battery-Aware Emergency Mode enabled: Minimal UI, maximum GPS preservation' : 'Standard power profile restored', 'info');
      return next;
    });
  };

  const [isLocationConsentModalOpen, setIsLocationConsentModalOpen] = useState(false);

  // Request browser Geolocation with explicit user permission
  const requestGpsLocation = () => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !navigator.geolocation) {
        const errState = {
          coords: null,
          city: locationState.city,
          address: locationState.address,
          status: 'unavailable',
          statusMessage: 'Geolocation not supported by device',
          source: null,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setLocationState(errState);
        localStorage.setItem('nivarya_location_state', JSON.stringify(errState));
        return reject(new Error('Geolocation not supported by this browser.'));
      }

      setLocationState(prev => ({ ...prev, status: 'requesting', statusMessage: 'Requesting device GPS...' }));

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy || 10)
          };
          const newState = {
            coords: newCoords,
            city: locationState.city,
            address: locationState.address || 'Real-time GPS Location',
            status: 'granted',
            statusMessage: `GPS Active (±${newCoords.accuracy}m)`,
            source: 'gps',
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setLocationState(newState);
          localStorage.setItem('nivarya_location_state', JSON.stringify(newState));
          // Persist to database architecture
          try {
            const sessionRaw = localStorage.getItem('nivarya_auth_session');
            const u = sessionRaw ? JSON.parse(sessionRaw) : null;
            databaseService.recordLiveLocation({
              userId: u?.id || null,
              journeyId: activeJourney?.id || null,
              coords: newCoords,
              source: 'gps',
              address: newState.address,
              city: newState.city,
              batteryLevel: batteryLevel,
              trackingToken: currentTrackingId
            });
            if (u && u.id) {
              const usersRaw = localStorage.getItem('nivarya_auth_users');
              if (usersRaw) {
                const users = JSON.parse(usersRaw);
                const idx = users.findIndex(usr => usr.id === u.id);
                if (idx !== -1) {
                  users[idx].locationState = newState;
                  localStorage.setItem('nivarya_auth_users', JSON.stringify(users));
                }
              }
            }
          } catch (e) { /* ignore */ }
          resolve(newState);
        },
        (err) => {
          const isDenied = err.code === 1;
          const newState = {
            coords: null,
            city: locationState.city,
            address: locationState.address,
            status: isDenied ? 'denied' : 'unavailable',
            statusMessage: isDenied ? 'Location permission denied' : 'Location unavailable',
            source: locationState.source === 'manual' ? 'manual' : null,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setLocationState(newState);
          localStorage.setItem('nivarya_location_state', JSON.stringify(newState));
          reject(new Error(isDenied ? 'Location permission denied by browser.' : 'Unable to acquire GPS signal.'));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
      );
    });
  };

  // Set location manually
  const setManualLocation = ({ city, address }) => {
    const newState = {
      coords: locationState.coords,
      city: city || locationState.city || '',
      address: address || locationState.address || '',
      status: 'manual',
      statusMessage: `Manual: ${city || address}`,
      source: 'manual',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLocationState(newState);
    localStorage.setItem('nivarya_location_state', JSON.stringify(newState));
    setUserProfile(prev => ({
      ...prev,
      city: city || prev.city,
      location: address || prev.location
    }));
    // Persist to user record
    try {
      const sessionRaw = localStorage.getItem('nivarya_auth_session');
      if (sessionRaw) {
        const u = JSON.parse(sessionRaw);
        if (u && u.id) {
          const usersRaw = localStorage.getItem('nivarya_auth_users');
          if (usersRaw) {
            const users = JSON.parse(usersRaw);
            const idx = users.findIndex(usr => usr.id === u.id);
            if (idx !== -1) {
              users[idx].city = city || users[idx].city;
              users[idx].location = address || users[idx].location;
              users[idx].locationState = newState;
              localStorage.setItem('nivarya_auth_users', JSON.stringify(users));
            }
          }
        }
      }
    } catch (e) { /* ignore */ }
    return newState;
  };

  // Derived currentCoordinates object
  const currentCoordinates = locationState.coords ? {
    lat: locationState.coords.lat,
    lng: locationState.coords.lng,
    address: locationState.address || locationState.city || 'Device GPS Location',
    accuracy: `GPS (±${locationState.coords.accuracy}m)`,
    source: 'gps',
    lastUpdated: locationState.lastUpdated || 'Active'
  } : {
    lat: null,
    lng: null,
    address: locationState.address || locationState.city || (userProfile.city ? `${userProfile.location || ''} ${userProfile.city}`.trim() : 'Location not set'),
    accuracy: locationState.status === 'denied' ? 'Permission Denied' : (locationState.source === 'manual' ? 'Manual Location' : 'Not Set'),
    source: locationState.source || null,
    lastUpdated: locationState.lastUpdated || null
  };

  /**
   * Synchronizes active user profile, contacts, and location state from an authenticated user record.
   */
  const syncUserProfileFromSession = (user) => {
    if (!user) return;
    setUserProfile(prev => ({
      ...prev,
      name: user.name || prev.name || '',
      role: user.role || prev.role || 'Verified Member',
      phone: user.phone || prev.phone || '',
      email: user.email || prev.email || '',
      age: user.age || prev.age || '',
      city: user.city || prev.city || '',
      location: user.location || prev.location || '',
      bloodGroup: user.bloodGroup || prev.bloodGroup || '',
      emergencyNotes: user.emergencyNotes || prev.emergencyNotes || '',
      safetyPin: user.safetyPin || prev.safetyPin || '',  // Must be user-set
      isProfileComplete: Boolean(user.isProfileComplete)
    }));

    if (Array.isArray(user.contacts) && user.contacts.length > 0) {
      setContacts(user.contacts);
      try {
        localStorage.setItem('nivarya_contacts', JSON.stringify(user.contacts));
      } catch (e) { /* ignore */ }
    }

    if (user.locationState) {
      setLocationState(user.locationState);
      try {
        localStorage.setItem('nivarya_location_state', JSON.stringify(user.locationState));
      } catch (e) { /* ignore */ }
    }
  };

  /**
   * Unified saveProfile method:
   * - Accepts real user profile data
   * - Saves profile data to state & storage
   * - Updates contacts if emergency contact details are supplied
   * - Updates location state if GPS coords or manual city/address provided
   * - Marks profile as complete
   * - Updates user in auth session & registered users database
   */
  const saveProfile = async (profileData) => {
    if (!profileData || typeof profileData !== 'object') {
      throw new Error('Invalid profile data provided.');
    }

    const cleanName = profileData.name ? profileData.name.trim() : (userProfile.name ? userProfile.name.trim() : '');
    if (!cleanName) {
      throw new Error('Full Name is required.');
    }

    const cleanPhone = profileData.phone ? normalizePhoneNumber(profileData.phone) : (userProfile.phone || '');
    const cleanEmail = profileData.email ? profileData.email.trim().toLowerCase() : (userProfile.email || '');

    // 1. Process and save contacts
    let updatedContacts = [...contacts];
    if (Array.isArray(profileData.contacts)) {
      updatedContacts = profileData.contacts;
    } else if (profileData.emergencyContactName && profileData.emergencyContactPhone) {
      const cleanEmergencyPhone = normalizePhoneNumber(profileData.emergencyContactPhone);
      const existingIdx = updatedContacts.findIndex(c => c.isPrimary);
      const primaryContact = {
        id: existingIdx !== -1 ? updatedContacts[existingIdx].id : `cnt-${Date.now()}`,
        name: profileData.emergencyContactName.trim(),
        phone: cleanEmergencyPhone,
        relation: profileData.emergencyContactRelation || 'Parent',
        isPrimary: true,
        priority: 1,
        avatarColor: '#6366F1'
      };
      if (existingIdx !== -1) {
        updatedContacts[existingIdx] = primaryContact;
      } else {
        updatedContacts = [primaryContact, ...updatedContacts];
      }
    }
    setContacts(updatedContacts);
    try {
      localStorage.setItem('nivarya_contacts', JSON.stringify(updatedContacts));
    } catch (e) { /* ignore */ }

    // 2. Process and save location
    let updatedLoc = { ...locationState };
    if (profileData.coords) {
      updatedLoc = {
        coords: profileData.coords,
        city: profileData.city !== undefined ? profileData.city.trim() : locationState.city,
        address: profileData.address !== undefined ? profileData.address.trim() : (profileData.location !== undefined ? profileData.location.trim() : locationState.address),
        status: 'active',
        statusMessage: 'Device GPS locked',
        source: 'gps',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setLocationState(updatedLoc);
      try {
        localStorage.setItem('nivarya_location_state', JSON.stringify(updatedLoc));
      } catch (e) { /* ignore */ }
    } else if (profileData.city || profileData.location || profileData.address) {
      const city = profileData.city !== undefined ? profileData.city.trim() : locationState.city;
      const addr = profileData.address !== undefined ? profileData.address.trim() : (profileData.location !== undefined ? profileData.location.trim() : locationState.address);
      updatedLoc = {
        coords: locationState.coords,
        city,
        address: addr,
        status: locationState.coords ? locationState.status : 'manual',
        statusMessage: locationState.coords ? locationState.statusMessage : `Manual: ${city || addr}`,
        source: locationState.coords ? locationState.source : 'manual',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setLocationState(updatedLoc);
      try {
        localStorage.setItem('nivarya_location_state', JSON.stringify(updatedLoc));
      } catch (e) { /* ignore */ }
    }

    // 3. Process and save userProfile
    const updatedProfile = {
      ...userProfile,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      age: profileData.age !== undefined ? String(profileData.age).trim() : (userProfile.age || ''),
      city: profileData.city !== undefined ? profileData.city.trim() : (userProfile.city || ''),
      location: profileData.location !== undefined ? profileData.location.trim() : (profileData.address !== undefined ? profileData.address.trim() : (userProfile.location || '')),
      manualLocation: profileData.manualLocation !== undefined ? profileData.manualLocation.trim() : (userProfile.manualLocation || ''),
      safetyPin: profileData.safetyPin !== undefined ? profileData.safetyPin.trim() : (userProfile.safetyPin || ''),
      bloodGroup: profileData.bloodGroup !== undefined ? profileData.bloodGroup : (userProfile.bloodGroup || ''),
      emergencyNotes: profileData.emergencyNotes !== undefined ? profileData.emergencyNotes.trim() : (profileData.medicalNotes !== undefined ? profileData.medicalNotes.trim() : (userProfile.emergencyNotes || '')),
      sosDelay: profileData.sosDelay !== undefined ? Number(profileData.sosDelay) : (userProfile.sosDelay ?? 3),
      autoAudioRecord: profileData.autoAudioRecord !== undefined ? Boolean(profileData.autoAudioRecord) : (userProfile.autoAudioRecord ?? true),
      highAccuracyGps: profileData.highAccuracyGps !== undefined ? Boolean(profileData.highAccuracyGps) : (userProfile.highAccuracyGps ?? true),
      isProfileComplete: true
    };
    setUserProfile(updatedProfile);
    try {
      localStorage.setItem('nivarya_profile', JSON.stringify(updatedProfile));
    } catch (e) { /* ignore */ }

    // 4. Persist to logged-in user database & auth session
    try {
      const sessionUser = authService.getCurrentUser();
      const uId = sessionUser?.id || updatedProfile.id || `usr-${Date.now()}`;
      const emergencyContactObj = (profileData.emergencyContactName && profileData.emergencyContactPhone) ? {
        name: profileData.emergencyContactName.trim(),
        phone: normalizePhoneNumber(profileData.emergencyContactPhone),
        relation: profileData.emergencyContactRelation || 'Parent'
      } : (profileData.emergencyContact || sessionUser?.emergencyContact || null);

      if (sessionUser && sessionUser.id) {
        authService.updateUserProfile(sessionUser.id, {
          ...updatedProfile,
          emergencyContact: emergencyContactObj,
          contacts: updatedContacts,
          locationState: updatedLoc,
          isProfileComplete: true
        });
      }

      await databaseService.upsertUserProfile({
        id: uId,
        ...updatedProfile,
        isProfileComplete: true
      });
      refreshPlatformStats();
    } catch (authErr) {
      console.warn('Failed to update auth session in saveProfile:', authErr);
    }

    return {
      success: true,
      profile: updatedProfile,
      contacts: updatedContacts,
      locationState: updatedLoc
    };
  };

  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [sharingDuration, setSharingDuration] = useState('30m'); // '15m' | '30m' | '1h' | 'journey'
  const [shareToken, setShareToken] = useState(() => initialRoute.trackingId || generateTrackingId());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Saves a live tracking session with real user identity & coordinates
  const saveTrackingSession = (token, duration = '30m') => {
    const sessionData = {
      trackingId: token,
      userName: userProfile.name || 'Nivarya Member',
      coords: locationState.coords,
      address: locationState.address || userProfile.location || (locationState.coords ? 'GPS Location' : 'Location Not Set'),
      city: userProfile.city || locationState.city || '',
      accuracy: locationState.coords ? `GPS (±${locationState.coords.accuracy}m)` : (locationState.status === 'denied' ? 'Permission Denied' : 'Manual Location'),
      status: locationState.status,
      source: locationState.source,
      batteryLevel: batteryLevel,
      duration: duration,
      startedAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`nivarya_track_${token}`, JSON.stringify(sessionData));
    } catch (e) { /* ignore */ }
    databaseService.saveTrackingSession(sessionData).catch(() => {});
    return sessionData;
  };

  const startLocationSharing = (duration = '30m') => {
    const newToken = generateTrackingId();
    setIsSharingLocation(true);
    setSharingDuration(duration);
    setShareToken(newToken);
    setCurrentTrackingId(newToken);
    saveTrackingSession(newToken, duration);
    showToast(`Live GPS sharing active for ${duration === 'journey' ? 'journey duration' : duration}`, 'safe');
    addSafetyHistory({
      type: 'location',
      title: `Live Location Sharing Initiated (${duration})`,
      details: `Encrypted live broadcast active with ${selectedContactsForJourney.length} trusted contacts.`,
      status: 'Active Sharing'
    });
  };

  const stopLocationSharing = () => {
    setIsSharingLocation(false);
    showToast('Live location sharing ended.', 'info');
  };

  // Community Incidents
  const [incidents, setIncidents] = useState(() => {
    const saved = localStorage.getItem('nivarya_incidents');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialCommunityIncidents;
  });

  useEffect(() => {
    // Initial fetch of real safety reports from database architecture
    databaseService.getSafetyReports().then(reps => {
      if (Array.isArray(reps)) {
        setIncidents(reps);
        localStorage.setItem('nivarya_incidents', JSON.stringify(reps));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('nivarya_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addIncident = async (newIncident) => {
    try {
      const saved = await databaseService.submitSafetyReport({
        ...newIncident,
        userId: userProfile?.id || null,
        coords: locationState?.coords || null
      });
      setIncidents(prev => [saved, ...prev]);
      showToast('Report submitted and shared with community radar!', 'safe');
      addSafetyHistory({
        type: 'incident',
        title: `Incident Reported: ${newIncident.category}`,
        details: `Logged at ${newIncident.location}. Community alert active.`,
        status: 'Under Review'
      });
      refreshPlatformStats();
    } catch (e) {
      console.warn('Database incident submit failed:', e);
    }
  };

  const upvoteIncident = async (id) => {
    await databaseService.upvoteSafetyReport(id);
    setIncidents(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, upvotes: (item.upvotes || 0) + 1 };
      }
      return item;
    }));
    showToast('Marked as helpful. Thank you for keeping others safe.', 'info');
  };

  const flagIncident = async (id) => {
    await databaseService.flagSafetyReport(id);
    setIncidents(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, flagged: true };
      }
      return item;
    }));
    showToast('Report flagged for review by community moderators', 'info');
    refreshPlatformStats();
  };

  // Safe Journey State (Real GPS-based movement only, zero timers or fake increments)
  const defaultJourneyState = {
    id: null,
    status: 'NOT_STARTED', // 'NOT_STARTED' | 'ACTIVE' | 'PAUSED/NO_MOVEMENT' | 'ARRIVED' | 'CANCELLED'
    isActive: false,
    startPoint: '',
    destination: '',
    mode: 'cab',
    progress: 0,
    startTime: null,
    etaMinutes: null,
    etaDisplay: 'ETA calculating...',
    initialEtaMinutes: 25,
    checkinsCount: 0,
    lastCheckinTime: null,
    isPaused: false,
    startCoords: null, // { lat, lng, accuracy, timestamp }
    currentCoords: null, // { lat, lng, accuracy, timestamp }
    destCoords: null, // { lat, lng, displayName }
    distanceTraveledKm: 0,
    remainingDistanceKm: null,
    currentSpeedKmh: 0,
    movementState: 'INITIALIZING', // 'INITIALIZING' | 'MOVING' | 'STATIONARY'
    trackingType: 'Real GPS Straight-Line Tracking (Route API not connected)',
    lastMovementTimestamp: null
  };

  const [activeJourney, setActiveJourney] = useState(() => {
    if (typeof window === 'undefined') return defaultJourneyState;
    const saved = localStorage.getItem('nivarya_journey');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const isAct = parsed.status === 'ACTIVE' || parsed.status === 'PAUSED/NO_MOVEMENT';
          return {
            ...defaultJourneyState,
            ...parsed,
            isActive: isAct,
            status: isAct ? parsed.status : (parsed.status || 'NOT_STARTED')
          };
        }
      } catch (e) { /* ignore */ }
    }
    return defaultJourneyState;
  });

  useEffect(() => {
    localStorage.setItem('nivarya_journey', JSON.stringify(activeJourney));
  }, [activeJourney]);

  const journeyWatchIdRef = useRef(null);
  const journeyMovementHistoryRef = useRef([]);

  // Refs to hold latest values for use inside watchPosition callback
  // without needing to re-register the watcher on every state change (stale closure fix)
  const locationStateRef = useRef(null);
  const batteryLevelRef = useRef(null);
  const currentTrackingIdRef = useRef(null);

  // Keep refs in sync with latest state
  useEffect(() => { locationStateRef.current = locationState; }, [locationState]);
  useEffect(() => { batteryLevelRef.current = batteryLevel; }, [batteryLevel]);
  useEffect(() => { currentTrackingIdRef.current = currentTrackingId; }, [currentTrackingId]);

  // Continuously watch user's real location with geolocation.watchPosition() when journey is active
  useEffect(() => {
    if (!activeJourney.isActive) {
      if (journeyWatchIdRef.current != null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(journeyWatchIdRef.current);
        journeyWatchIdRef.current = null;
      }
      return;
    }

    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'danger');
      return;
    }

    const onWatchSuccess = (pos) => {
      const { latitude, longitude, accuracy, speed } = pos.coords;
      const now = Date.now();
      const newCoords = {
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy || 10),
        timestamp: now
      };

      // 1. Sync global location state with real device GPS readings
      setLocationState(prev => ({
        ...prev,
        coords: newCoords,
        status: 'granted',
        statusMessage: `GPS Active (±${newCoords.accuracy}m)`,
        source: 'gps',
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      // 2. Persist real live location to database
      try {
        const sessionRaw = localStorage.getItem('nivarya_auth_session');
        const u = sessionRaw ? JSON.parse(sessionRaw) : null;
        // Read latest values via refs to avoid stale closures
        const latestLocState = locationStateRef.current;
        const latestBattery = batteryLevelRef.current;
        const latestTrackId = currentTrackingIdRef.current;
        const locationPayload = {
          userId: u?.id || null,
          journeyId: activeJourney?.id || null,
          coords: newCoords,
          source: 'gps',
          address: latestLocState?.address || 'Real-time GPS Location',
          city: latestLocState?.city || '',
          batteryLevel: latestBattery,
          trackingToken: latestTrackId
        };
        // Always write to localStorage immediately (databaseService fallback handles this)
        databaseService.recordLiveLocation(locationPayload);

        // Bug 2 fix: If offline, queue the latest location for Supabase sync on reconnect.
        // navigator.onLine is always real-time — safe to read directly inside GPS callback.
        // We replace any existing pending location item (not append) to prevent queue bloat
        // from high-frequency GPS pings. Only the latest position matters on reconnect.
        if (!navigator.onLine) {
          setOfflineQueue(prev => {
            const withoutPrevLocation = prev.filter(q => q.type !== 'location');
            return [{
              id: `q-loc-${Date.now()}`,
              type: 'location',
              data: locationPayload,
              timestamp: new Date().toISOString()
            }, ...withoutPrevLocation];
          });
        }
      } catch (e) { /* ignore */ }

      // 3. Process movement detection against GPS jitter threshold
      setActiveJourney(prev => {
        if (!prev.isActive || prev.isPaused) return prev;

        const effectiveStartCoords = prev.startCoords || newCoords;
        const lastPosition = prev.currentCoords || newCoords;

        // Calculate distance moved from last known position in meters
        const distanceDeltaMeters = calculateHaversineDistanceMeters(
          lastPosition.lat,
          lastPosition.lng,
          newCoords.lat,
          newCoords.lng
        );

        const timeDeltaSeconds = Math.max(1, (now - (lastPosition.timestamp || (now - 3000))) / 1000);

        // Instantaneous speed calculation
        let speedKmh = 0;
        if (speed != null && speed >= 0) {
          speedKmh = speed * 3.6;
        } else if (timeDeltaSeconds > 0 && distanceDeltaMeters > 0) {
          speedKmh = (distanceDeltaMeters / 1000) / (timeDeltaSeconds / 3600);
        }
        // Cap any GPS teleportation anomalies
        speedKmh = Math.min(160, Math.max(0, speedKmh));

        // JITTER / MOVEMENT THRESHOLD:
        // Do NOT treat normal GPS jitter / stationary noise as actual movement
        const hasMoved = isSignificantMovement(distanceDeltaMeters, newCoords.accuracy) && speedKmh > 1.2;

        if (!hasMoved) {
          // USER IS STATIONARY / AT SAME LOCATION
          // Journey progress must remain unchanged
          // ETA must NOT artificially decrease
          // Milestones must NOT advance
          const stationaryEta = prev.etaMinutes != null
            ? `~${prev.etaMinutes} mins (Stationary — ETA paused)`
            : (prev.etaDisplay || 'ETA calculating...');

          return {
            ...prev,
            status: 'PAUSED/NO_MOVEMENT',
            movementState: 'STATIONARY',
            currentCoords: newCoords,
            currentSpeedKmh: 0,
            etaDisplay: stationaryEta
            // progress, distanceTraveledKm, and milestones are untouched!
          };
        }

        // REAL PHYSICAL MOVEMENT DETECTED
        const addedKm = distanceDeltaMeters / 1000;
        const newDistanceTraveledKm = Number(((prev.distanceTraveledKm || 0) + addedKm).toFixed(3));

        // Record valid movement point in history
        const history = journeyMovementHistoryRef.current;
        history.push({
          lat: newCoords.lat,
          lng: newCoords.lng,
          timestamp: now,
          distanceDeltaMeters,
          speedKmh
        });
        if (history.length > 8) history.shift();

        // Calculate smoothed average speed over valid movement points
        const recentSpeeds = history.map(h => h.speedKmh).filter(s => s > 1);
        const avgSpeedKmh = recentSpeeds.length > 0
          ? recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length
          : speedKmh;

        // REAL PROGRESS CALCULATION:
        let updatedProgress = prev.progress || 0;
        let remainingKm = prev.remainingDistanceKm;
        let isArrivedNow = false;

        if (prev.destCoords && prev.destCoords.lat != null && prev.destCoords.lng != null) {
          // Straight-line distance relative to geocoded destination
          const totalDistanceKm = calculateHaversineDistanceKm(
            effectiveStartCoords.lat,
            effectiveStartCoords.lng,
            prev.destCoords.lat,
            prev.destCoords.lng
          );
          const currentDistanceToDestKm = calculateHaversineDistanceKm(
            newCoords.lat,
            newCoords.lng,
            prev.destCoords.lat,
            prev.destCoords.lng
          );
          remainingKm = Number(currentDistanceToDestKm.toFixed(2));

          if (currentDistanceToDestKm <= 0.06) {
            // Within 60m of destination: arrived!
            updatedProgress = 100;
            isArrivedNow = true;
          } else if (totalDistanceKm > 0) {
            const rawProgress = Math.round(((totalDistanceKm - currentDistanceToDestKm) / totalDistanceKm) * 100);
            updatedProgress = Math.max(prev.progress || 0, Math.min(99, Math.max(0, rawProgress)));
          }
        } else {
          // If destination coordinates unavailable, calculate progress relative to expected trip distance
          const modeSpeed = MODE_SPEEDS_KMH[prev.mode] || 25;
          const expectedDistanceKm = Math.max(0.5, (modeSpeed * (prev.initialEtaMinutes || 25)) / 60);
          remainingKm = Number(Math.max(0, expectedDistanceKm - newDistanceTraveledKm).toFixed(2));
          const rawProgress = Math.round((newDistanceTraveledKm / expectedDistanceKm) * 100);
          updatedProgress = Math.max(prev.progress || 0, Math.min(99, Math.max(0, rawProgress)));
        }

        // HONEST REAL-MOVEMENT ETA CALCULATION:
        let updatedEtaMinutes = prev.etaMinutes;
        let updatedEtaDisplay = prev.etaDisplay;

        const totalTraveledMeters = newDistanceTraveledKm * 1000;
        // Require at least 2 movements and > 40m distance before calculating ETA from actual speed
        if (history.length >= 2 && totalTraveledMeters >= 40 && avgSpeedKmh >= 1.5) {
          if (remainingKm != null && remainingKm > 0) {
            const calculatedMinutes = Math.max(1, Math.round((remainingKm / avgSpeedKmh) * 60));
            updatedEtaMinutes = calculatedMinutes;
            updatedEtaDisplay = `~${calculatedMinutes} mins remaining`;
          } else {
            updatedEtaDisplay = '~1 min remaining';
          }
        } else {
          updatedEtaDisplay = 'ETA calculating...';
        }

        const nextStatus = isArrivedNow ? 'ARRIVED' : 'ACTIVE';
        const nextIsActive = !isArrivedNow;

        // Persist update to database
        if (prev.id) {
          databaseService.updateJourney(prev.id, {
            status: nextStatus.toLowerCase(),
            progress: updatedProgress,
            eta_minutes: updatedEtaMinutes,
            eta_display: updatedEtaDisplay,
            distance_traveled_km: newDistanceTraveledKm,
            current_coords: newCoords
          }).catch(() => {});
        }

        const activeTrackToken = prev.trackingId || currentTrackingIdRef.current;
        if (activeTrackToken) {
          databaseService.updateTrackingLocation(activeTrackToken, newCoords, {
            progress: updatedProgress,
            etaMinutes: updatedEtaMinutes,
            etaDisplay: updatedEtaDisplay,
            distanceTraveledKm: newDistanceTraveledKm,
            remainingDistanceKm: remainingKm,
            currentSpeedKmh: Number(avgSpeedKmh.toFixed(1)),
            batteryLevel: batteryLevelRef.current
          }).catch(() => {});
          if (isArrivedNow) {
            databaseService.endTrackingSession(activeTrackToken, 'ARRIVED').catch(() => {});
          }
        }

        return {
          ...prev,
          status: nextStatus,
          isActive: nextIsActive,
          movementState: 'MOVING',
          startCoords: effectiveStartCoords,
          currentCoords: newCoords,
          distanceTraveledKm: newDistanceTraveledKm,
          remainingDistanceKm: remainingKm,
          currentSpeedKmh: Number(avgSpeedKmh.toFixed(1)),
          progress: updatedProgress,
          etaMinutes: updatedEtaMinutes,
          etaDisplay: updatedEtaDisplay,
          lastMovementTimestamp: now
        };
      });
    };

    const onWatchError = (err) => {
      console.warn('Geolocation watchPosition error:', err);
      if (err.code === 1) { // PERMISSION_DENIED
        setLocationState(prev => ({
          ...prev,
          status: 'denied',
          statusMessage: 'Location permission denied'
        }));
      }
    };

    journeyWatchIdRef.current = navigator.geolocation.watchPosition(
      onWatchSuccess,
      onWatchError,
      {
        enableHighAccuracy: true,
        maximumAge: 4000,
        timeout: 15000
      }
    );

    return () => {
      if (journeyWatchIdRef.current != null && typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(journeyWatchIdRef.current);
        journeyWatchIdRef.current = null;
      }
    };
  }, [activeJourney.isActive, activeJourney.isPaused]);

  const startJourney = async (routeDetails) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      showToast('Geolocation is not supported by your device', 'danger');
      return;
    }

    // Require real GPS permission
    let realCoords = locationState.coords;
    if (!realCoords || locationState.status !== 'granted') {
      try {
        const gpsResult = await requestGpsLocation();
        realCoords = gpsResult.coords;
      } catch (err) {
        showToast('Location permission is required for live journey tracking.', 'danger');
        return;
      }
    }

    if (!realCoords || realCoords.lat == null) {
      showToast('Location permission is required for live journey tracking.', 'danger');
      return;
    }

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const journeyToken = generateTrackingId();
    setShareToken(journeyToken);
    setCurrentTrackingId(journeyToken);

    const journeyId = `jrn-${Date.now()}`;
    journeyMovementHistoryRef.current = [];

    // Attempt real destination geocoding
    let destCoords = null;
    if (routeDetails.destination) {
      try {
        destCoords = await geocodeDestination(routeDetails.destination);
      } catch (e) { /* ignore */ }
    }

    const initialEta = Number(routeDetails.etaMinutes) || 25;
    const startObj = {
      lat: realCoords.lat,
      lng: realCoords.lng,
      accuracy: realCoords.accuracy || 10,
      timestamp: Date.now()
    };

    let initialRemainingKm = null;
    if (destCoords && destCoords.lat != null) {
      initialRemainingKm = Number(
        calculateHaversineDistanceKm(startObj.lat, startObj.lng, destCoords.lat, destCoords.lng).toFixed(2)
      );
    }

    const journeyObj = {
      id: journeyId,
      trackingId: journeyToken,
      status: 'ACTIVE',
      isActive: true,
      startPoint: routeDetails.startPoint || 'Current Location',
      destination: routeDetails.destination || 'Destination',
      mode: routeDetails.mode || 'cab',
      progress: 0,
      startTime: new Date().toISOString(),
      etaMinutes: null,
      etaDisplay: 'ETA calculating...',
      initialEtaMinutes: initialEta,
      checkinsCount: 0,
      lastCheckinTime: nowTime,
      isPaused: false,
      startCoords: startObj,
      currentCoords: startObj,
      destCoords: destCoords,
      distanceTraveledKm: 0,
      remainingDistanceKm: initialRemainingKm,
      currentSpeedKmh: 0,
      movementState: 'INITIALIZING',
      trackingType: 'Real GPS Straight-Line Tracking (Route API not connected)',
      lastMovementTimestamp: Date.now()
    };

    setActiveJourney(journeyObj);
    setIsSharingLocation(true);
    setSharingDuration('journey');

    try {
      await databaseService.createJourney({
        id: journeyId,
        userId: userProfile?.id || null,
        startPoint: journeyObj.startPoint,
        destination: journeyObj.destination,
        mode: journeyObj.mode,
        status: 'active',
        progress: 0,
        etaMinutes: initialEta,
        etaDisplay: 'ETA calculating...',
        startCoords: startObj,
        currentCoords: startObj,
        destCoords: destCoords,
        distanceTraveledKm: 0
      });

      await databaseService.saveTrackingSession({
        trackingId: journeyToken,
        journeyId: journeyId,
        userId: userProfile?.id || null,
        userName: userProfile.name || 'Nivarya Member',
        userPhone: userProfile.phone || '',
        status: 'ACTIVE',
        isActive: true,
        startPoint: journeyObj.startPoint,
        destination: journeyObj.destination,
        mode: journeyObj.mode,
        progress: 0,
        etaMinutes: initialEta,
        etaDisplay: 'ETA calculating...',
        startCoords: startObj,
        currentCoords: startObj,
        destCoords: destCoords,
        distanceTraveledKm: 0,
        remainingDistanceKm: initialRemainingKm,
        currentSpeedKmh: 0,
        batteryLevel: batteryLevel,
        accuracy: startObj.accuracy ? `GPS (±${startObj.accuracy}m)` : 'Real GPS Lock Active',
        source: locationState.source || 'gps',
        startedAt: journeyObj.startTime,
        lastUpdated: new Date().toISOString()
      });

      refreshPlatformStats();
    } catch (e) {
      console.warn('Failed to record journey in database:', e);
    }

    showToast('Safe Journey activated with real GPS tracking. Share your live link with contacts.', 'safe');
    addSafetyHistory({
      type: 'journey',
      title: `Journey Started: ${journeyObj.startPoint} → ${journeyObj.destination}`,
      details: `Mode: ${journeyObj.mode} • Real GPS tracking engaged.`,
      status: 'In Transit'
    });
  };

  const performCheckin = () => {
    const checkinTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentLocDesc = locationState.coords 
      ? `GPS (${locationState.coords.lat.toFixed(4)}° N, ${locationState.coords.lng.toFixed(4)}° E)`
      : (currentCoordinates.address || 'Current Location');

    setActiveJourney(prev => {
      const nextCount = (prev.checkinsCount || 0) + 1;
      if (prev.id) {
        databaseService.updateJourney(prev.id, {
          checkins_count: nextCount,
          last_checkin_time: new Date().toISOString(),
          progress: prev.progress,
          current_coords: prev.currentCoords
        }).catch(() => {});
      }
      return {
        ...prev,
        checkinsCount: nextCount,
        lastCheckinTime: checkinTime
      };
    });

    // Record real check-in in database activity trail
    databaseService.recordUserActivity({
      userId: userProfile?.id || null,
      activityType: 'checkin',
      title: 'Manual Safe Check-in',
      details: `User confirmed safe status at ${currentLocDesc}.`,
      location: currentLocDesc,
      status: 'Verified'
    }).catch(() => {});

    showToast(t.journey.checkinSuccess || "Safe check-in logged and recorded!", 'safe');
    addSafetyHistory({
      type: 'checkin',
      title: 'Manual Safe Check-in',
      details: `Confirmed safe status at ${currentLocDesc} (${checkinTime}).`,
      status: 'Verified'
    });
  };

  const pauseJourney = () => {
    setActiveJourney(prev => {
      if (!prev.isActive) return prev;
      if (prev.id) {
        databaseService.updateJourney(prev.id, { status: 'paused' }).catch(() => {});
      }
      return {
        ...prev,
        status: 'PAUSED/NO_MOVEMENT',
        isPaused: true,
        movementState: 'STATIONARY',
        etaDisplay: prev.etaMinutes ? `~${prev.etaMinutes} mins (Paused)` : 'ETA paused'
      };
    });
    showToast('Journey tracking paused.', 'info');
  };

  const resumeJourney = () => {
    setActiveJourney(prev => {
      if (!prev.isActive) return prev;
      if (prev.id) {
        databaseService.updateJourney(prev.id, { status: 'active' }).catch(() => {});
      }
      return {
        ...prev,
        status: 'ACTIVE',
        isPaused: false,
        movementState: 'INITIALIZING'
      };
    });
    showToast('Journey tracking resumed.', 'safe');
  };

  const cancelJourney = async () => {
    const jId = activeJourney.id;
    if (journeyWatchIdRef.current != null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(journeyWatchIdRef.current);
      journeyWatchIdRef.current = null;
    }
    setActiveJourney(prev => ({
      ...prev,
      isActive: false,
      status: 'CANCELLED',
      isPaused: false,
      etaDisplay: 'Journey cancelled'
    }));
    setIsSharingLocation(false);

    try {
      if (jId) await databaseService.cancelJourney(jId);
      const trackToken = activeJourney.trackingId || currentTrackingId;
      if (trackToken) await databaseService.endTrackingSession(trackToken, 'CANCELLED');
      refreshPlatformStats();
    } catch (e) {
      console.warn('Failed to cancel journey in database:', e);
    }

    showToast('Journey cancelled.', 'info');
    addSafetyHistory({
      type: 'journey',
      title: 'Journey Cancelled',
      details: `Journey towards ${activeJourney.destination || 'Destination'} was cancelled by user.`,
      status: 'Cancelled'
    });
  };

  const endJourney = async () => {
    const jId = activeJourney.id;
    if (journeyWatchIdRef.current != null && typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(journeyWatchIdRef.current);
      journeyWatchIdRef.current = null;
    }
    setActiveJourney(prev => ({
      ...prev,
      isActive: false,
      status: 'ARRIVED',
      progress: 100,
      isPaused: false,
      etaDisplay: 'Arrived at destination'
    }));
    setIsSharingLocation(false);

    try {
      if (jId) await databaseService.completeJourney(jId);
      const trackToken = activeJourney.trackingId || currentTrackingId;
      if (trackToken) await databaseService.endTrackingSession(trackToken, 'ARRIVED');
      refreshPlatformStats();
    } catch (e) {
      console.warn('Failed to complete journey in database:', e);
    }

    showToast('Journey ended safely. Well done!', 'safe');
    addSafetyHistory({
      type: 'journey',
      title: 'Journey Completed Safely',
      details: `Arrived safely at ${activeJourney.destination || 'Destination'}. Automated tracking disengaged.`,
      status: 'Completed Safely'
    });
  };

  /**
   * Generates or retrieves the real tracking URL and session for the active journey.
   * If a journey is already active, binds its tracking token.
   * If no journey is active, initializes an active live tracking session from current GPS coordinates.
   */
  const getOrCreateActiveJourneyTracking = async (contactName = 'Guardian') => {
    let effectiveJourney = activeJourney;

    if (!effectiveJourney || !effectiveJourney.isActive) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const journeyToken = generateTrackingId();
      const journeyId = `jrn-${Date.now()}`;

      const userCoords = locationState?.coords || currentCoordinates;
      const startAddress = locationState?.address || currentCoordinates?.address || (userProfile?.location ? `${userProfile.location}, ${userProfile.city}` : 'Current GPS Location');
      const startObj = {
        lat: userCoords?.lat || null,
        lng: userCoords?.lng || null,
        accuracy: userCoords?.accuracy || 10,
        address: startAddress,
        timestamp: Date.now()
      };

      const newJourney = {
        id: journeyId,
        trackingId: journeyToken,
        status: 'ACTIVE',
        isActive: true,
        startPoint: startAddress,
        destination: `Safe Check with ${contactName}`,
        mode: 'walk',
        progress: 0,
        startTime: new Date().toISOString(),
        etaMinutes: 20,
        etaDisplay: '~20 mins',
        checkinsCount: 0,
        lastCheckinTime: nowTime,
        isPaused: false,
        startCoords: startObj,
        currentCoords: startObj,
        destCoords: null,
        distanceTraveledKm: 0,
        remainingDistanceKm: null,
        currentSpeedKmh: 0,
        movementState: 'INITIALIZING',
        trackingType: 'Real GPS Live Tracking',
        lastMovementTimestamp: Date.now()
      };

      setActiveJourney(newJourney);
      setCurrentTrackingId(journeyToken);
      setShareToken(journeyToken);
      setIsSharingLocation(true);
      setSharingDuration('journey');

      const sessionData = {
        trackingId: journeyToken,
        journeyId: journeyId,
        userId: userProfile?.id || null,
        userName: userProfile.name || 'Nivarya Member',
        contactName: contactName,
        userPhone: userProfile.phone || '',
        status: 'ACTIVE',
        isActive: true,
        startPoint: newJourney.startPoint,
        destination: newJourney.destination,
        mode: newJourney.mode,
        progress: 0,
        etaMinutes: 20,
        etaDisplay: '~20 mins',
        startCoords: startObj,
        currentCoords: startObj,
        destCoords: null,
        distanceTraveledKm: 0,
        remainingDistanceKm: null,
        currentSpeedKmh: 0,
        batteryLevel: batteryLevel,
        accuracy: startObj.lat != null ? `GPS (±${startObj.accuracy}m)` : 'Real GPS Lock Active',
        source: locationState.source || 'gps',
        startedAt: newJourney.startTime,
        lastUpdated: new Date().toISOString()
      };

      await databaseService.saveTrackingSession(sessionData);

      if (typeof navigator !== 'undefined' && navigator.geolocation && !locationState?.coords) {
        requestGpsLocation().catch(() => {});
      }

      effectiveJourney = newJourney;
    } else {
      const trackingId = effectiveJourney.trackingId || currentTrackingId || generateTrackingId();
      if (!effectiveJourney.trackingId) {
        effectiveJourney = { ...effectiveJourney, trackingId };
        setActiveJourney(effectiveJourney);
      }
      setCurrentTrackingId(trackingId);
      setShareToken(trackingId);

      const sessionData = {
        trackingId: trackingId,
        journeyId: effectiveJourney.id,
        userId: userProfile?.id || null,
        userName: userProfile.name || 'Nivarya Member',
        contactName: contactName,
        userPhone: userProfile.phone || '',
        status: effectiveJourney.status || 'ACTIVE',
        isActive: true,
        startPoint: effectiveJourney.startPoint,
        destination: effectiveJourney.destination,
        mode: effectiveJourney.mode,
        progress: effectiveJourney.progress || 0,
        etaMinutes: effectiveJourney.etaMinutes,
        etaDisplay: effectiveJourney.etaDisplay || 'ETA calculating...',
        startCoords: effectiveJourney.startCoords || currentCoordinates,
        currentCoords: effectiveJourney.currentCoords || currentCoordinates,
        destCoords: effectiveJourney.destCoords,
        distanceTraveledKm: effectiveJourney.distanceTraveledKm || 0,
        remainingDistanceKm: effectiveJourney.remainingDistanceKm,
        currentSpeedKmh: effectiveJourney.currentSpeedKmh || 0,
        batteryLevel: batteryLevel,
        accuracy: locationState.coords ? `GPS (±${locationState.coords.accuracy}m)` : (currentCoordinates?.accuracy || 'Active GPS'),
        source: locationState.source || 'gps',
        startedAt: effectiveJourney.startTime || new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await databaseService.saveTrackingSession(sessionData);
    }

    const finalTrackingId = effectiveJourney.trackingId || currentTrackingId;
    const trackingUrl = buildTrackingUrl(finalTrackingId);
    return {
      trackingId: finalTrackingId,
      trackingUrl,
      journey: effectiveJourney
    };
  };

  // SOS Emergency Modal & Protocol
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosPhase, setSosPhase] = useState('idle'); // 'idle' | 'countdown' | 'active'
  const [sosCountdown, setSosCountdown] = useState(3);
  const [isSirenOn, setIsSirenOn] = useState(true);
  const [emergencyTimeline, setEmergencyTimeline] = useState([]);

  const countdownTimerRef = useRef(null);

  const addTimelineEvent = (eventTitle, status = 'Dispatched') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setEmergencyTimeline(prev => [
      { id: `evt-${Date.now()}`, time: timeStr, title: eventTitle, status },
      ...prev
    ]);
  };

  // Trigger SOS flow
  const triggerSos = () => {
    setIsSosModalOpen(true);
    setSosPhase('countdown');
    setSosCountdown(userProfile.sosDelay || 3);
    playCountdownBeep(880, 0.2);
    setEmergencyTimeline([
      { id: `evt-${Date.now()}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), title: 'One-Tap SOS button triggered by user', status: 'Pending Confirmation' }
    ]);
  };

  // Countdown effect
  useEffect(() => {
    if (sosPhase !== 'countdown') return;

    if (sosCountdown <= 0) {
      setSosPhase('active');
      if (isSirenOn) {
        startEmergencySiren();
      }
      // ─── SOS Event: Write-Local-First, Never Drop ─────────────────────────────
      // Strategy:
      //   1. Build event record with a stable ID immediately.
      //   2. Persist to localStorage right away — regardless of network state.
      //   3. If online: attempt backend sync. On success, mark local record synced.
      //   4. If offline OR backend fails: push to offlineQueue for auto-retry.
      //   5. Never show "sent to backend" unless the backend actually confirmed it.
      const sosEventId = `sos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const sosEventPayload = {
        id: sosEventId,
        userId: userProfile?.id || null,
        triggerType: 'button',
        coords: currentCoordinates,
        address: currentCoordinates?.address || '',
        journeyId: activeJourney?.id || null,
        timeline: [
          { time: new Date().toLocaleTimeString(), title: 'One-Tap SOS Emergency Broadcast Activated', status: 'High Alert' },
          { time: new Date().toLocaleTimeString(), title: `GPS transmitted to ${selectedContactsForSos.length} guardians`, status: 'Queued' }
        ]
      };

      // Step 1: Persist locally immediately — never depends on network
      try {
        const existingEvents = JSON.parse(localStorage.getItem('nivarya_db_sos_events') || '[]');
        existingEvents.unshift({
          ...sosEventPayload,
          user_id: sosEventPayload.userId,
          latitude: currentCoordinates?.lat || null,
          longitude: currentCoordinates?.lng || null,
          triggered_at: new Date().toISOString(),
          status: 'active',
          sync_status: 'pending_sync',   // honest: not yet confirmed by backend
          disarmed_at: null
        });
        localStorage.setItem('nivarya_db_sos_events', JSON.stringify(existingEvents));
      } catch (_e) { /* storage full — ignore, queue still works */ }

      // Step 2: Try backend sync if online
      const isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : false;
      if (isCurrentlyOnline) {
        databaseService.createSosEvent(sosEventPayload)
          .then(() => {
            // Backend confirmed — update local record to synced
            try {
              const evts = JSON.parse(localStorage.getItem('nivarya_db_sos_events') || '[]');
              const idx = evts.findIndex(e => e.id === sosEventId);
              if (idx !== -1) { evts[idx].sync_status = 'synced'; }
              localStorage.setItem('nivarya_db_sos_events', JSON.stringify(evts));
            } catch (_e) { /* ignore */ }
            refreshPlatformStats();
          })
          .catch(() => {
            // Online but sync failed — queue for retry
            setOfflineQueue(prev => {
              const alreadyQueued = prev.some(q => q.data?.id === sosEventId);
              if (alreadyQueued) return prev;  // deduplication guard
              return [{
                id: `q-${sosEventId}`,
                type: 'sos',
                data: sosEventPayload,
                timestamp: new Date().toISOString()
              }, ...prev];
            });
          });
      } else {
        // Step 3: Offline — queue immediately, no need to attempt backend
        setOfflineQueue(prev => {
          const alreadyQueued = prev.some(q => q.data?.id === sosEventId);
          if (alreadyQueued) return prev;  // deduplication guard
          return [{
            id: `q-${sosEventId}`,
            type: 'sos',
            data: sosEventPayload,
            timestamp: new Date().toISOString()
          }, ...prev];
        });
      }

      // Log emergency steps in timeline
      addTimelineEvent('Emergency Protocol ACTIVATED', 'High Alert');
      addTimelineEvent(`GPS Broadcast (${currentCoordinates.lat}, ${currentCoordinates.lng}) transmitted to ${selectedContactsForSos.length} trusted contacts`, 'Delivered');
      addTimelineEvent('Simulated Police Control Room 112 webhook queued', 'Handshake Ready');
      addTimelineEvent('Nearby verified responders pinged within 1.5 km', '4 Responders Notified');
      
      // Auto evidence record if enabled
      if (userProfile.autoAudioRecord) {
        startEvidenceRecording('audio');
      }

      addSafetyHistory({
        type: 'sos',
        title: 'Emergency SOS Broadcast Triggered',
        details: `High-alert protocol engaged at ${currentCoordinates.address}.`,
        status: 'SOS Active'
      });
      return;
    }

    countdownTimerRef.current = setTimeout(() => {
      playCountdownBeep(700 + (3 - sosCountdown) * 150, 0.15);
      setSosCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [sosPhase, sosCountdown, isSirenOn]);

  const cancelSosCountdown = () => {
    if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    setSosPhase('idle');
    setIsSosModalOpen(false);
    stopEmergencySiren();
    showToast('Emergency SOS cancelled. You are safe.', 'info');
  };

  const disarmSos = (enteredPin) => {
    const activePin = userProfile.safetyPin;

    // If the user has not set a Safety PIN, block disarm and prompt them to set one
    if (!activePin || activePin.trim() === '') {
      showToast('No Safety PIN set. Please go to your Profile and set a Safety PIN to disarm SOS.', 'danger');
      return false;
    }

    if (enteredPin === activePin) {
      stopEmergencySiren();
      setSosPhase('idle');
      setIsSosModalOpen(false);

      // Disarm event in database
      databaseService.disarmSosEvent().then(() => refreshPlatformStats()).catch(() => {});

      showToast('Emergency SOS disarmed successfully. Safe status restored.', 'safe');
      addSafetyHistory({
        type: 'sos',
        title: 'SOS Disarmed via Security PIN',
        details: 'User authenticated with Safety PIN. All emergency services notified of stand-down.',
        status: 'Disarmed'
      });
      return true;
    } else {
      showToast('Incorrect Safety PIN. Please enter the PIN you set in your profile.', 'danger');
      return false;
    }
  };

  const toggleSirenAudio = () => {
    if (isSirenOn) {
      stopEmergencySiren();
      setIsSirenOn(false);
    } else {
      startEmergencySiren();
      setIsSirenOn(true);
    }
  };

  // Voice & Shake SOS
  const [voiceSosEnabled, setVoiceSosEnabled] = useState(() => {
    return localStorage.getItem('nivarya_voice_sos') === 'true';
  });
  const [voiceTriggerPhrase, setVoiceTriggerPhrase] = useState(() => {
    return localStorage.getItem('nivarya_trigger_phrase') || 'HELP NIVARYA';
  });
  const [voiceSensitivity, setVoiceSensitivity] = useState('normal'); // 'normal' | 'high'
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  useEffect(() => {
    localStorage.setItem('nivarya_voice_sos', voiceSosEnabled ? 'true' : 'false');
  }, [voiceSosEnabled]);

  useEffect(() => {
    localStorage.setItem('nivarya_trigger_phrase', voiceTriggerPhrase);
  }, [voiceTriggerPhrase]);

  const toggleVoiceListening = () => {
    if (isListeningVoice) {
      setIsListeningVoice(false);
      showToast('Voice SOS listening paused', 'info');
    } else {
      setIsListeningVoice(true);
      showToast(`Voice listener active. Say "${voiceTriggerPhrase}" to trigger SOS.`, 'safe');
    }
  };

  const triggerSimulatedVoiceSos = () => {
    showToast(`Voice trigger "${voiceTriggerPhrase}" matched with 98% confidence!`, 'danger');
    triggerSos();
    addSafetyHistory({
      type: 'voice',
      title: `Voice-Activated SOS Triggered ("${voiceTriggerPhrase}")`,
      details: 'Acoustic keyword detector identified emergency phrase with high confidence.',
      status: 'Triggered'
    });
  };

  // Gesture / Shake SOS
  const [gestureSosEnabled, setGestureSosEnabled] = useState(() => {
    return localStorage.getItem('nivarya_gesture_sos') === 'true';
  });
  const [gestureSensitivity, setGestureSensitivity] = useState(18);

  useEffect(() => {
    localStorage.setItem('nivarya_gesture_sos', gestureSosEnabled ? 'true' : 'false');
  }, [gestureSosEnabled]);

  const triggerSimulatedGestureSos = () => {
    showToast('Rapid shake pattern (3 vigorous shakes) detected!', 'danger');
    triggerSos();
    addSafetyHistory({
      type: 'gesture',
      title: 'Shake / Gesture SOS Triggered',
      details: 'Device accelerometer detected repetitive high-acceleration oscillation.',
      status: 'Triggered'
    });
  };

  // Offline Mode & Queue
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem('nivarya_offline_queue');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  // Ref to always access the latest offlineQueue inside event listeners (avoids stale closure)
  const offlineQueueRef = useRef([]);
  useEffect(() => { offlineQueueRef.current = offlineQueue; }, [offlineQueue]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (offlineQueueRef.current.length > 0) {
        showToast('Internet restored! Syncing offline emergency queue...', 'safe');
        syncOfflineQueue();
      } else {
        showToast('Internet connection restored.', 'safe');
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode detected. SMS & direct offline dialer protocols active.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('nivarya_offline_queue', JSON.stringify(offlineQueue));
  }, [offlineQueue]);

  const toggleOfflineSimulation = () => {
    setIsOnline(prev => {
      const next = !prev;
      showToast(next ? 'Switched to Online Protocol' : 'Switched to Simulated Offline Protocol (No Internet)', 'info');
      return next;
    });
  };

  const queueOfflineSos = (data) => {
    const queueItem = {
      id: `q-${Date.now()}`,
      type: 'sos',
      data,
      timestamp: new Date().toISOString()
    };
    setOfflineQueue(prev => [queueItem, ...prev]);
    showToast('SOS cached locally in offline queue. Will auto-sync once connected.', 'info');
  };

  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;

    const total = offlineQueue.length;
    let successCount = 0;
    const failedItems = [];

    for (const item of offlineQueue) {
      try {
        if (item.type === 'sos') {
          await databaseService.createSosEvent(item.data);
          successCount++;
        } else if (item.type === 'report') {
          await databaseService.submitSafetyReport(item.data);
          successCount++;
        } else if (item.type === 'location') {
          await databaseService.recordLiveLocation(item.data);
          successCount++;
        } else {
          // Unknown type — drop it silently
          successCount++;
        }
      } catch (err) {
        console.warn(`Failed to sync offline queue item [${item.type}]:`, err);
        failedItems.push(item);
      }
    }

    setOfflineQueue(failedItems);

    if (successCount > 0) {
      showToast(
        failedItems.length > 0
          ? `Synced ${successCount}/${total} offline alert(s). ${failedItems.length} will retry.`
          : `Successfully dispatched all ${successCount} offline alert(s)!`,
        failedItems.length > 0 ? 'info' : 'safe'
      );
      refreshPlatformStats();
    }
  };

  // Automatic Evidence Recording
  const [isRecordingEvidence, setIsRecordingEvidence] = useState(false);
  const [evidenceType, setEvidenceType] = useState(null); // 'audio' | 'video'
  const [recordedEvidenceList, setRecordedEvidenceList] = useState(() => {
    const saved = localStorage.getItem('nivarya_evidence');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'ev-101',
        type: 'audio',
        title: 'Emergency Audio Buffer #101',
        duration: '01:45',
        timestamp: '2026-09-05 22:15',
        size: '1.8 MB',
        location: 'Sector 4, University Circle',
        status: 'Encrypted & Stored Locally'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('nivarya_evidence', JSON.stringify(recordedEvidenceList));
  }, [recordedEvidenceList]);

  const startEvidenceRecording = (type = 'audio') => {
    setIsRecordingEvidence(true);
    setEvidenceType(type);
    showToast(`Discreet evidence recording started (${type.toUpperCase()})...`, 'danger');
  };

  const stopEvidenceRecording = () => {
    if (!isRecordingEvidence) return;
    const newRecord = {
      id: `ev-${Date.now()}`,
      type: evidenceType || 'audio',
      title: `Emergency ${evidenceType === 'video' ? 'Video' : 'Audio'} Recording #${Math.floor(100 + Math.random() * 900)}`,
      duration: '00:30',
      timestamp: new Date().toLocaleString(),
      size: evidenceType === 'video' ? '8.4 MB' : '1.2 MB',
      location: currentCoordinates.address,
      status: 'Tamper-Evident Encrypted'
    };
    setRecordedEvidenceList(prev => [newRecord, ...prev]);
    setIsRecordingEvidence(false);
    setEvidenceType(null);
    showToast('Evidence recording safely archived and encrypted locally.', 'safe');
    addSafetyHistory({
      type: 'evidence',
      title: `Evidence ${newRecord.type.toUpperCase()} Captured`,
      details: `${newRecord.duration} snippet recorded at ${newRecord.location}.`,
      status: 'Encrypted'
    });
  };

  const deleteEvidence = (id) => {
    setRecordedEvidenceList(prev => prev.filter(e => e.id !== id));
    showToast('Evidence file removed from local cache', 'info');
  };

  // Cab Route Deviation & Unusual Behaviour Detection
  const [cabDetails, setCabDetails] = useState({
    cabNumber: 'MH 12 QX 4042',
    driverName: 'Suresh More',
    cabCompany: 'Uber Premier (White Swift Dzire)',
    otp: '4821',
    destination: 'Sector 14 Residential Hostel',
    routePolyline: 'Standard Metro Arterial Road'
  });

  const [isCabMonitoringActive, setIsCabMonitoringActive] = useState(false);
  const [cabDeviationDetected, setCabDeviationDetected] = useState(false);
  const [unusualActivityDetected, setUnusualActivityDetected] = useState(false);
  const [isSafeCheckModalOpen, setIsSafeCheckModalOpen] = useState(false);
  const [safeCheckReason, setSafeCheckReason] = useState('');

  const startCabMonitoring = () => {
    setIsCabMonitoringActive(true);
    setCabDeviationDetected(false);
    showToast('Cab Route Deviation Monitoring active. We will alert you if driver strays.', 'safe');
    addSafetyHistory({
      type: 'cab',
      title: `Cab Safety Monitoring Started (${cabDetails.cabNumber})`,
      details: `Driver: ${cabDetails.driverName} • Route tracking active.`,
      status: 'Active Monitoring'
    });
  };

  const stopCabMonitoring = () => {
    setIsCabMonitoringActive(false);
    setCabDeviationDetected(false);
    showToast('Cab monitoring deactivated.', 'info');
  };

  const triggerCabDeviation = () => {
    setCabDeviationDetected(true);
    setSafeCheckReason('Cab vehicle has deviated more than 450 meters from approved destination route!');
    setIsSafeCheckModalOpen(true);
    playCountdownBeep(700, 0.3);
    addSafetyHistory({
      type: 'deviation',
      title: 'Cab Route Deviation Detected',
      details: `Vehicle ${cabDetails.cabNumber} deviated toward unpaved industrial bypass.`,
      status: 'Deviation Alert'
    });
  };

  const triggerUnusualStop = () => {
    setUnusualActivityDetected(true);
    setSafeCheckReason('Prolonged unexpected stop (>10 mins) detected in unverified zone.');
    setIsSafeCheckModalOpen(true);
    playCountdownBeep(650, 0.3);
    addSafetyHistory({
      type: 'deviation',
      title: 'Unusual Prolonged Stop Detected',
      details: `Vehicle halted for >10 mins at isolated intersection.`,
      status: 'Unusual Behavior'
    });
  };

  const resolveSafeCheck = (isSafe) => {
    setIsSafeCheckModalOpen(false);
    if (isSafe) {
      setCabDeviationDetected(false);
      setUnusualActivityDetected(false);
      showToast('Safe status confirmed. Thank you for checking in.', 'safe');
      addSafetyHistory({
        type: 'checkin',
        title: 'Safety Check Resolved: User Confirmed Safe',
        details: 'User dismissed deviation inquiry with safe status.',
        status: 'Resolved'
      });
    } else {
      triggerSos();
    }
  };

  // Personal Safety History Log
  const [safetyHistory, setSafetyHistory] = useState(() => {
    const saved = localStorage.getItem('nivarya_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialSafetyHistory;
  });

  useEffect(() => {
    localStorage.setItem('nivarya_history', JSON.stringify(safetyHistory));
  }, [safetyHistory]);

  const addSafetyHistory = (item) => {
    const newEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: currentCoordinates.address,
      ...item
    };
    setSafetyHistory(prev => [newEntry, ...prev]);

    // Record to database architecture audit log
    databaseService.recordUserActivity({
      userId: userProfile?.id || null,
      activityType: item.type || 'audit',
      title: item.title,
      details: item.details,
      location: newEntry.location,
      status: item.status
    }).catch(() => {});
  };

  const clearSafetyHistory = () => {
    setSafetyHistory([]);
    databaseService.clearUserActivityHistory(userProfile?.id || null).catch(() => {});
    showToast('Safety history cleared.', 'info');
  };

  // Privacy & Data Purge Controls
  const [privacySettings, setPrivacySettings] = useState(() => {
    const saved = localStorage.getItem('nivarya_privacy');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      locationTracking: true,
      backgroundAudio: true,
      biometricLock: false,
      telemetrySharing: false,
      autoPurgeDays: 30,
      anonymousReporting: true
    };
  });

  useEffect(() => {
    localStorage.setItem('nivarya_privacy', JSON.stringify(privacySettings));
  }, [privacySettings]);

  const updatePrivacySettings = (patch) => {
    setPrivacySettings(prev => ({ ...prev, ...patch }));
    showToast('Privacy permissions updated', 'safe');
  };

  const exportPersonalData = () => {
    const exportData = {
      userProfile,
      contacts,
      safetyHistory,
      recordedEvidenceList: recordedEvidenceList.map(({ blobUrl, ...rest }) => rest),
      incidents,
      privacySettings,
      exportedAt: new Date().toISOString(),
      platform: 'NIVARYA Women Safety Platform (Prototype)'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nivarya-personal-safety-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Personal safety archive downloaded as JSON.', 'safe');
  };

  const purgeAllUserData = () => {
    // Only remove Nivarya-specific keys — do NOT nuke all localStorage
    // (other apps/tabs sharing the same origin would also be affected by clear())
    const nivarya_keys = [
      'nivarya_auth_session',
      'nivarya_auth_users',
      'nivarya_profile',
      'nivarya_contacts',
      'nivarya_db_trusted_contacts',
      'nivarya_db_emergency_contacts',
      'nivarya_db_profiles',
      'nivarya_db_journeys',
      'nivarya_db_live_locations',
      'nivarya_db_sos_events',
      'nivarya_db_safety_reports',
      'nivarya_db_safety_locations',
      'nivarya_db_user_activity',
      'nivarya_db_tracking_sessions',
      'nivarya_location_state',
      'nivarya_journey',
      'nivarya_incidents',
      'nivarya_evidence',
      'nivarya_history',
      'nivarya_offline_queue',
      'nivarya_privacy',
      'nivarya_lang',
      'nivarya_safety_mode',
      'nivarya_voice_sos',
      'nivarya_trigger_phrase',
      'nivarya_gesture_sos'
    ];
    nivarya_keys.forEach(key => {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    });
    // Also purge any dynamic tracking session keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('nivarya_track_')) {
        try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
      }
    });
    showToast('All personal safety data purged securely. Restoring default profile...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  // Responders Modal State
  const [isRespondersModalOpen, setIsRespondersModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        // Navigation & i18n
        currentPage,
        setCurrentPage,
        language,
        changeLanguage,
        t,

        // Real Dynamic Platform Statistics
        platformStats,
        refreshPlatformStats,

        // Safety Mode
        safetyMode,
        changeSafetyMode,

        // Profile & Settings
        userProfile,
        setUserProfile,
        saveProfile,
        syncUserProfileFromSession,

        // Trusted Contacts / Safety Circle
        contacts,
        setContacts,
        addContact,
        updateContact,
        deleteContact,
        getTrustedContacts: (userId) => databaseService.getTrustedContacts(userId || authService.getCurrentUser()?.id),
        loadUserContacts,
        isLoadingContacts,
        selectedContactsForSos,
        toggleContactSosSelection,
        selectedContactsForJourney,
        toggleContactJourneySelection,

        // Location & GPS Tracking
        currentCoordinates,
        locationState,
        requestGpsLocation,
        setManualLocation,
        isSharingLocation,
        sharingDuration,
        shareToken,
        currentTrackingId,
        setCurrentTrackingId,
        startLocationSharing,
        stopLocationSharing,
        saveTrackingSession,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isLocationConsentModalOpen,
        setIsLocationConsentModalOpen,

        // Community Incidents
        incidents,
        addIncident,
        upvoteIncident,
        flagIncident,

        // Safe Journey
        activeJourney,
        startJourney,
        performCheckin,
        pauseJourney,
        resumeJourney,
        cancelJourney,
        endJourney,
        getOrCreateActiveJourneyTracking,

        // SOS & Emergency
        isSosModalOpen,
        sosPhase,
        sosCountdown,
        isSirenOn,
        triggerSos,
        cancelSosCountdown,
        disarmSos,
        toggleSirenAudio,
        emergencyTimeline,
        addTimelineEvent,

        // Voice & Shake SOS
        voiceSosEnabled,
        setVoiceSosEnabled,
        voiceTriggerPhrase,
        setVoiceTriggerPhrase,
        voiceSensitivity,
        setVoiceSensitivity,
        isListeningVoice,
        toggleVoiceListening,
        triggerSimulatedVoiceSos,
        gestureSosEnabled,
        setGestureSosEnabled,
        gestureSensitivity,
        setGestureSensitivity,
        triggerSimulatedGestureSos,

        // Offline Mode
        isOnline,
        toggleOfflineSimulation,
        offlineQueue,
        queueOfflineSos,
        syncOfflineQueue,

        // Evidence Recording
        isRecordingEvidence,
        evidenceType,
        recordedEvidenceList,
        startEvidenceRecording,
        stopEvidenceRecording,
        deleteEvidence,

        // Battery Aware Mode
        batteryLevel,
        setBatteryLevel,
        isLowBatteryMode,
        toggleLowBatteryMode,

        // Cab Safety & Deviation
        cabDetails,
        setCabDetails,
        isCabMonitoringActive,
        startCabMonitoring,
        stopCabMonitoring,
        cabDeviationDetected,
        unusualActivityDetected,
        isSafeCheckModalOpen,
        safeCheckReason,
        triggerCabDeviation,
        triggerUnusualStop,
        resolveSafeCheck,

        // Safety History
        safetyHistory,
        addSafetyHistory,
        clearSafetyHistory,

        // Privacy & Purge
        privacySettings,
        updatePrivacySettings,
        exportPersonalData,
        purgeAllUserData,

        // Responders Modal
        isRespondersModalOpen,
        setIsRespondersModalOpen,

        // Toasts
        toasts,
        showToast,
        dismissToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
