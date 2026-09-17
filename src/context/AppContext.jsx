import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { translations } from '../data/translations';
import { 
  initialContacts, 
  initialCommunityIncidents, 
  initialSafetyHistory,
  safetyModesData 
} from '../data/initialData';
import { playCountdownBeep, startEmergencySiren, stopEmergencySiren } from '../utils/audio';
import { generateTrackingId } from '../utils/tracking';

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
      'login', 'signup',
      'dashboard', 'journey', 'sos', 'contacts', 'map', 'report',
      'community', 'safebot', 'resources', 'profile', 'about',
      'routes', 'cab', 'intel', 'voice-gesture', 'evidence',
      'privacy', 'history', 'track'
    ];
    if (validPages.includes(cleanPath)) {
      return { page: cleanPath, trackingId: null };
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

  // User Profile & Settings
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('nivarya_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      name: 'Ananya Sharma',
      role: 'University Student & Part-time Associate',
      phone: '+91 98765 11223',
      email: 'ananya.s@example.com',
      bloodGroup: 'O+ Positive',
      emergencyNotes: 'Allergic to Penicillin. Carries asthma inhaler.',
      safetyPin: '1234',
      sosDelay: 3,
      autoAudioRecord: true,
      highAccuracyGps: true
    };
  });

  useEffect(() => {
    localStorage.setItem('nivarya_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Trusted Contacts
  const [contacts, setContacts] = useState(() => {
    const saved = localStorage.getItem('nivarya_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return initialContacts;
  });

  useEffect(() => {
    localStorage.setItem('nivarya_contacts', JSON.stringify(contacts));
  }, [contacts]);

  // Selected Contacts for SOS and Journey
  const [selectedContactsForSos, setSelectedContactsForSos] = useState(() => {
    return initialContacts.map(c => c.id);
  });

  const toggleContactSosSelection = (id) => {
    setSelectedContactsForSos(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(cId => cId !== id) : prev) : [...prev, id]
    );
  };

  const [selectedContactsForJourney, setSelectedContactsForJourney] = useState(() => {
    return initialContacts.filter(c => c.isPrimary || c.relation === 'Parent').map(c => c.id);
  });

  const toggleContactJourneySelection = (id) => {
    setSelectedContactsForJourney(prev => 
      prev.includes(id) ? (prev.length > 1 ? prev.filter(cId => cId !== id) : prev) : [...prev, id]
    );
  };

  const addContact = (newContact) => {
    const contactWithId = {
      ...newContact,
      id: `cnt-${Date.now()}`,
      priority: contacts.length + 1,
      avatarColor: ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][Math.floor(Math.random() * 5)]
    };
    setContacts(prev => [contactWithId, ...prev]);
    setSelectedContactsForSos(prev => [...prev, contactWithId.id]);
    showToast('New trusted contact added successfully', 'safe');
  };

  const updateContact = (id, updatedFields) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    showToast('Contact details updated', 'info');
  };

  const deleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
    setSelectedContactsForSos(prev => prev.filter(cId => cId !== id));
    setSelectedContactsForJourney(prev => prev.filter(cId => cId !== id));
    showToast('Contact removed', 'info');
  };

  // Live Location & Sharing
  const [currentCoordinates, setCurrentCoordinates] = useState({
    lat: 18.5204,
    lng: 73.8567,
    address: 'Near University North Circle, Sector 4, Pune',
    accuracy: 'High Accuracy (±3m)',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [sharingDuration, setSharingDuration] = useState('30m'); // '15m' | '30m' | '1h' | 'journey'
  const [shareToken, setShareToken] = useState(() => initialRoute.trackingId || generateTrackingId());
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const startLocationSharing = (duration = '30m') => {
    const newToken = generateTrackingId();
    setIsSharingLocation(true);
    setSharingDuration(duration);
    setShareToken(newToken);
    setCurrentTrackingId(newToken);
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
    localStorage.setItem('nivarya_incidents', JSON.stringify(incidents));
  }, [incidents]);

  const addIncident = (newIncident) => {
    const incidentWithId = {
      ...newIncident,
      id: `inc-${Date.now()}`,
      upvotes: 1,
      flagged: false,
      status: 'Community Verified',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setIncidents(prev => [incidentWithId, ...prev]);
    showToast('Report submitted and shared with community radar!', 'safe');
    addSafetyHistory({
      type: 'incident',
      title: `Incident Reported: ${newIncident.category}`,
      details: `Logged at ${newIncident.location}. Community alert active.`,
      status: 'Under Review'
    });
  };

  const upvoteIncident = (id) => {
    setIncidents(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, upvotes: item.upvotes + 1 };
      }
      return item;
    }));
    showToast('Marked as helpful. Thank you for keeping others safe.', 'info');
  };

  const flagIncident = (id) => {
    setIncidents(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, flagged: true };
      }
      return item;
    }));
    showToast('Report flagged for review by community moderators', 'info');
  };

  // Safe Journey State
  const [activeJourney, setActiveJourney] = useState(() => {
    const saved = localStorage.getItem('nivarya_journey');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      isActive: false,
      startPoint: 'University North Campus',
      destination: 'Sector 14 Residential Hostel',
      mode: 'metro',
      progress: 0,
      startTime: null,
      etaMinutes: 28,
      checkinsCount: 0,
      lastCheckinTime: null,
      isPaused: false
    };
  });

  useEffect(() => {
    localStorage.setItem('nivarya_journey', JSON.stringify(activeJourney));
  }, [activeJourney]);

  // Automated journey progress ticker when active
  useEffect(() => {
    if (!activeJourney.isActive || activeJourney.isPaused || activeJourney.progress >= 100) return;

    const interval = setInterval(() => {
      setActiveJourney(prev => {
        if (!prev.isActive || prev.isPaused) return prev;
        const nextProgress = Math.min(100, prev.progress + 2);
        return { ...prev, progress: nextProgress };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [activeJourney.isActive, activeJourney.isPaused]);

  const startJourney = (routeDetails) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const journeyToken = generateTrackingId();
    setShareToken(journeyToken);
    setCurrentTrackingId(journeyToken);
    setActiveJourney({
      isActive: true,
      startPoint: routeDetails.startPoint || 'University Campus Gate',
      destination: routeDetails.destination || 'Hostel Sector 14',
      mode: routeDetails.mode || 'cab',
      progress: 0,
      startTime: new Date().toISOString(),
      etaMinutes: routeDetails.etaMinutes || 25,
      checkinsCount: 0,
      lastCheckinTime: nowTime,
      isPaused: false
    });
    setIsSharingLocation(true);
    setSharingDuration('journey');
    showToast('Safe Journey activated! Contacts notified of live route.', 'safe');
    addSafetyHistory({
      type: 'journey',
      title: `Journey Started: ${routeDetails.startPoint || 'Campus'} → ${routeDetails.destination || 'Hostel'}`,
      details: `Mode: ${routeDetails.mode || 'Cab'} • ETA: ${routeDetails.etaMinutes || 25} mins. Live GPS active.`,
      status: 'In Transit'
    });
  };

  const performCheckin = () => {
    const checkinTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActiveJourney(prev => ({
      ...prev,
      checkinsCount: prev.checkinsCount + 1,
      lastCheckinTime: checkinTime
    }));
    showToast(t.journey.checkinSuccess || "Safe check-in logged and sent to trusted contacts!", 'safe');
    addSafetyHistory({
      type: 'checkin',
      title: 'Manual Safe Check-in',
      details: `Confirmed safe status at ${currentCoordinates.address} (${checkinTime}).`,
      status: 'Verified'
    });
  };

  const endJourney = () => {
    setActiveJourney(prev => ({
      ...prev,
      isActive: false,
      progress: 100,
      isPaused: false
    }));
    setIsSharingLocation(false);
    showToast('Journey ended safely. Well done!', 'safe');
    addSafetyHistory({
      type: 'journey',
      title: 'Journey Completed Safely',
      details: `Arrived safely at ${activeJourney.destination}. Automated tracking disengaged.`,
      status: 'Completed Safely'
    });
  };

  const setJourneyProgress = (val) => {
    setActiveJourney(prev => ({ ...prev, progress: Math.min(100, Math.max(0, val)) }));
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
        details: `Simulated high-alert protocol engaged at ${currentCoordinates.address}.`,
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
    if (enteredPin === userProfile.safetyPin || enteredPin === '1234') {
      stopEmergencySiren();
      setSosPhase('idle');
      setIsSosModalOpen(false);
      showToast('Emergency SOS disarmed successfully. Safe status restored.', 'safe');
      addSafetyHistory({
        type: 'sos',
        title: 'SOS Disarmed via Security PIN',
        details: 'User authenticated with Safety PIN. All emergency services notified of stand-down.',
        status: 'Disarmed'
      });
      return true;
    } else {
      showToast('Incorrect Safety PIN. Default PIN is 1234.', 'danger');
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
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem('nivarya_offline_queue');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Internet connection restored! Syncing offline emergency queue...', 'safe');
      syncOfflineQueue();
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
  }, [offlineQueue]);

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

  const syncOfflineQueue = () => {
    if (offlineQueue.length === 0) return;
    showToast(`Successfully dispatched ${offlineQueue.length} pending offline alert(s)!`, 'safe');
    setOfflineQueue([]);
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

  // Battery-Aware Emergency Mode
  const [batteryLevel, setBatteryLevel] = useState(72);
  const [isLowBatteryMode, setIsLowBatteryMode] = useState(false);

  useEffect(() => {
    if (batteryLevel < 20) {
      if (!isLowBatteryMode) {
        setIsLowBatteryMode(true);
        showToast('Low battery detected (<20%). Battery-Aware Emergency Mode auto-activated!', 'danger');
      }
    }
  }, [batteryLevel, isLowBatteryMode]);

  const toggleLowBatteryMode = () => {
    setIsLowBatteryMode(prev => {
      const next = !prev;
      showToast(next ? 'Battery-Aware Emergency Mode enabled: Minimal UI, maximum GPS preservation' : 'Standard power profile restored', 'info');
      return next;
    });
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
  };

  const clearSafetyHistory = () => {
    setSafetyHistory([]);
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
    localStorage.clear();
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

        // Safety Mode
        safetyMode,
        changeSafetyMode,

        // Profile & Settings
        userProfile,
        setUserProfile,

        // Trusted Contacts
        contacts,
        addContact,
        updateContact,
        deleteContact,
        selectedContactsForSos,
        toggleContactSosSelection,
        selectedContactsForJourney,
        toggleContactJourneySelection,

        // Location & GPS Tracking
        currentCoordinates,
        setCurrentCoordinates,
        isSharingLocation,
        sharingDuration,
        shareToken,
        currentTrackingId,
        setCurrentTrackingId,
        startLocationSharing,
        stopLocationSharing,
        isLocationModalOpen,
        setIsLocationModalOpen,

        // Community Incidents
        incidents,
        addIncident,
        upvoteIncident,
        flagIncident,

        // Safe Journey
        activeJourney,
        startJourney,
        performCheckin,
        endJourney,
        setJourneyProgress,

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
