import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { extendedMapHotspots } from '../data/initialData';
import { buildTrackingUrl, generateTrackingId, shareOrCopyTrackingLink } from '../utils/tracking';
import { databaseService } from '../services/databaseService';
import { 
  Navigation, 
  MapPin, 
  PhoneCall, 
  MessageSquare, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Battery, 
  ExternalLink, 
  Copy, 
  Crosshair, 
  ArrowLeft, 
  Radio, 
  HeartPulse, 
  Building2, 
  ShieldAlert,
  Share2,
  RefreshCw,
  Car,
  Footprints,
  Train,
  Bike,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function LiveTrackPage({ trackingId: propTrackingId }) {
  const { 
    currentCoordinates, 
    userProfile, 
    shareToken, 
    currentTrackingId, 
    sharingDuration, 
    activeJourney, 
    batteryLevel, 
    setCurrentPage, 
    showToast 
  } = useApp();

  const getPathTrackingId = () => {
    if (typeof window !== 'undefined') {
      const m = (window.location.pathname || '').match(/^\/track(?:\/([^/?#]+))?/i);
      if (m && m[1]) return decodeURIComponent(m[1].replace(/\/+$/, ''));
    }
    return null;
  };

  const activeId = propTrackingId || getPathTrackingId() || currentTrackingId || shareToken || generateTrackingId();

  const [session, setSession] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);

  // Fetch tracking session from database / dev server / localStorage
  const loadTrackingSession = async () => {
    try {
      const data = await databaseService.getTrackingSession(activeId);
      if (data) {
        setSession(data);
      } else if (activeJourney && activeJourney.isActive && (activeJourney.trackingId === activeId || currentTrackingId === activeId)) {
        // Fallback for creator tab before database sync completes
        const fallbackSession = {
          trackingId: activeId,
          userName: userProfile?.name || 'Nivarya Member',
          status: activeJourney.status || 'ACTIVE',
          isActive: true,
          startPoint: activeJourney.startPoint || 'Current Location',
          destination: activeJourney.destination || 'Destination',
          mode: activeJourney.mode || 'cab',
          progress: activeJourney.progress || 0,
          etaMinutes: activeJourney.etaMinutes,
          etaDisplay: activeJourney.etaDisplay || 'ETA calculating...',
          startCoords: activeJourney.startCoords || currentCoordinates,
          currentCoords: activeJourney.currentCoords || currentCoordinates,
          distanceTraveledKm: activeJourney.distanceTraveledKm || 0,
          remainingDistanceKm: activeJourney.remainingDistanceKm,
          currentSpeedKmh: activeJourney.currentSpeedKmh || 0,
          batteryLevel: batteryLevel,
          accuracy: currentCoordinates?.accuracy || 'Active GPS',
          startedAt: activeJourney.startTime,
          lastUpdated: new Date().toISOString()
        };
        setSession(fallbackSession);
      } else {
        // Check direct localStorage key as secondary check
        const directRaw = typeof window !== 'undefined' ? localStorage.getItem(`nivarya_track_${activeId}`) : null;
        if (directRaw) {
          try {
            setSession(JSON.parse(directRaw));
          } catch (e) { /* ignore */ }
        }
      }
    } catch (err) {
      console.warn('Error loading tracking session:', err);
    } finally {
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    loadTrackingSession();

    // Poll every 3 seconds while active
    const pollInterval = setInterval(() => {
      loadTrackingSession();
    }, 3000);

    const unsub = databaseService.subscribeToRealtimeUpdates((evt) => {
      if (evt?.table === 'tracking_sessions' || evt?.table === 'journeys') {
        loadTrackingSession();
      }
    });

    const handleStorage = (e) => {
      if (e.key === `nivarya_track_${activeId}` || e.key === 'nivarya_db_tracking_sessions') {
        loadTrackingSession();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(pollInterval);
      if (typeof unsub === 'function') unsub();
      window.removeEventListener('storage', handleStorage);
    };
  }, [activeId]);

  // Determine active tracking status
  const isSessionActive = Boolean(
    session && 
    session.isActive !== false && 
    session.status !== 'ARRIVED' && 
    session.status !== 'CANCELLED' && 
    session.status !== 'completed' && 
    session.status !== 'cancelled'
  );

  const userName = session?.userName || userProfile?.name || 'Nivarya Member';
  const userPhone = session?.userPhone || userProfile?.phone || '';
  const cleanPhone = userPhone.replace(/[^0-9]/g, '');
  const firstName = userName.split(' ')[0] || 'Member';

  // Coordinate resolution (real GPS data from active session or device)
  const currentGpsCoords = session?.currentCoords?.lat != null 
    ? session.currentCoords 
    : (isSessionActive && currentCoordinates?.lat != null ? currentCoordinates : null);

  const hasGps = Boolean(currentGpsCoords && currentGpsCoords.lat != null);
  const coords = hasGps ? {
    lat: currentGpsCoords.lat,
    lng: currentGpsCoords.lng,
    address: currentGpsCoords.address || session?.startPoint || 'Real-time GPS Beacon',
    accuracy: currentGpsCoords.accuracy ? `±${Math.round(currentGpsCoords.accuracy)}m` : (session?.accuracy || 'GPS Lock Active'),
    lastUpdated: lastRefreshed
  } : {
    lat: null,
    lng: null,
    address: session?.startPoint || 'Area not specified',
    accuracy: 'Location Pending',
    lastUpdated: lastRefreshed
  };

  const handleShareLink = async () => {
    const url = buildTrackingUrl(activeId);
    await shareOrCopyTrackingLink({
      contactName: session?.contactName || 'Guardian',
      trackingUrl: url,
      onSheetOpened: () => {
        showToast('Share sheet opened', 'safe');
      },
      onCopied: () => {
        setCopied(true);
        showToast('Tracking link copied. You can paste it into WhatsApp or Messages.', 'safe');
        setTimeout(() => setCopied(false), 2500);
      },
      onError: () => {
        showToast('Failed to share tracking link.', 'danger');
      }
    });
  };

  const copyCoordinates = () => {
    if (coords.lat != null) {
      navigator.clipboard.writeText(`${coords.lat}, ${coords.lng}`);
      showToast('GPS coordinates copied!', 'safe');
    }
  };

  const handleRefresh = async () => {
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    await loadTrackingSession();
    if (mapInstanceRef.current && coords.lat != null && coords.lng != null) {
      mapInstanceRef.current.setView([coords.lat, coords.lng], 15);
    }
    showToast('Telemetry refreshed from live GPS beacon', 'safe');
  };

  // Leaflet Map Initialization and Synchronization
  useEffect(() => {
    if (!mapContainerRef.current || coords.lat == null || coords.lng == null) return;

    if (!mapInstanceRef.current) {
      if (mapContainerRef.current._leaflet_id) {
        mapContainerRef.current._leaflet_id = null;
      }
      try {
        const map = L.map(mapContainerRef.current, {
          center: [coords.lat, coords.lng],
          zoom: 15,
          zoomControl: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
      } catch (err) {
        console.warn('Map initialization error:', err);
      }
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Update center
    map.setView([coords.lat, coords.lng], map.getZoom());

    // Update accuracy circle
    if (accuracyCircleRef.current) {
      map.removeLayer(accuracyCircleRef.current);
    }
    if (isSessionActive) {
      accuracyCircleRef.current = L.circle([coords.lat, coords.lng], {
        radius: 40,
        color: '#10B981',
        fillColor: '#10B981',
        fillOpacity: 0.15,
        weight: 1.5
      }).addTo(map);
    }

    // Update user marker
    if (userMarkerRef.current) {
      map.removeLayer(userMarkerRef.current);
    }

    const markerHtml = isSessionActive ? `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.35);
          animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        "></div>
        <div style="
          position: relative;
          background: #10B981;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 14px rgba(16, 185, 129, 0.9);
          color: #FFFFFF;
          font-size: 11px;
          font-weight: bold;
        ">
          📍
        </div>
      </div>
    ` : `
      <div style="
        background: #64748B;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        color: #FFFFFF;
        font-size: 13px;
      ">
        🏁
      </div>
    `;

    const userMarkerIcon = L.divIcon({
      className: 'live-radar-user-icon',
      html: markerHtml,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    userMarkerRef.current = L.marker([coords.lat, coords.lng], { icon: userMarkerIcon })
      .addTo(map)
      .bindPopup(`
        <div style="padding: 6px; font-family: sans-serif;">
          <strong style="color: ${isSessionActive ? '#10B981' : '#64748B'}; font-size: 13px;">
            ${userName} ${isSessionActive ? '(Live)' : '(Ended)'}
          </strong>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">${coords.address}</div>
          <div style="font-size: 10px; color: ${isSessionActive ? '#10B981' : '#EF4444'}; margin-top: 4px; font-weight: bold;">
            ${isSessionActive ? '● Active GPS Beacon' : '● Tracking Concluded'}
          </div>
        </div>
      `);

    // Nearby safety emergency hubs (police / hospital)
    const emergencySpots = (extendedMapHotspots || []).filter(
      spot => spot.type === 'police' || spot.type === 'hospital' || spot.layer === 'police' || spot.layer === 'hospitals'
    ).slice(0, 4);

    emergencySpots.forEach(spot => {
      const isPolice = spot.type === 'police' || spot.layer === 'police';
      const spotIcon = L.divIcon({
        className: 'nearby-emergency-icon',
        html: `
          <div style="
            background: ${isPolice ? '#6366F1' : '#EC4899'};
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #FFFFFF;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            font-size: 11px;
          ">
            ${isPolice ? '👮' : '🏥'}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });

      L.marker([spot.lat, spot.lng], { icon: spotIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <strong style="font-size: 12px; color: #1E293B;">${spot.name}</strong>
            <div style="font-size: 11px; color: #64748B;">${spot.details || ''}</div>
            ${spot.phone ? `<a href="tel:${spot.phone}" style="display:inline-block; margin-top:4px; font-size:11px; color:#4F46E5; font-weight:bold;">Call: ${spot.phone}</a>` : ''}
          </div>
        `);
    });

  }, [coords.lat, coords.lng, coords.address, userName, isSessionActive]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const getModeIcon = (modeId) => {
    switch (modeId) {
      case 'walk': return Footprints;
      case 'metro': return Train;
      case 'twoWheeler': return Bike;
      default: return Car;
    }
  };

  const JourneyModeIcon = getModeIcon(session?.mode);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '20px', paddingBottom: '60px', maxWidth: '980px', margin: '0 auto' }}>
      {/* Top Navigation & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button 
          onClick={() => setCurrentPage('home')} 
          className="btn btn-outline btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>Open Nivarya App</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleRefresh}
            className="btn btn-ghost btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}
            title="Refresh GPS Telemetry"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={handleShareLink}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Share2 size={14} />
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoadingSession && !session && (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px', marginBottom: '24px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Connecting to encrypted GPS tracking beacon...</p>
        </div>
      )}

      {/* CASE 1: Active Journey In Progress */}
      {isSessionActive && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--safe-light)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }}></span>
                <span>LIVE GPS BROADCAST ACTIVE</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                Tracking {userName}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                Live real-time satellite telemetry shared via encrypted private channel with trusted network.
              </p>
            </div>

            <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                Session Token
              </div>
              <code style={{ fontSize: '0.88rem', color: 'var(--primary-light)', fontWeight: 700 }}>
                {activeId}
              </code>
            </div>
          </div>

          {/* Telemetry Quick Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Clock size={15} color="var(--safe-light)" />
              <span>Sharing: <strong>Active Safe Journey</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Battery size={15} color="var(--safe-light)" />
              <span>Battery: <strong>{session?.batteryLevel || batteryLevel}%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Radio size={15} color="var(--info)" />
              <span>Accuracy: <strong>{coords.accuracy}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              <ShieldCheck size={15} color="var(--safe)" />
              <span>Encrypted Broadcast</span>
            </div>
          </div>
        </div>
      )}

      {/* CASE 2: Journey Ended / Inactive Session (Requirement 8) */}
      {!isLoadingSession && !isSessionActive && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(148, 163, 184, 0.18)', color: '#CBD5E1', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px' }}>
                <CheckCircle2 size={13} color="#94A3B8" />
                <span>LIVE LOCATION SHARING ENDED</span>
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                {session?.status === 'CANCELLED' ? `Tracking Concluded • ${userName}` : `Journey Ended Safely • ${userName}`}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, maxWidth: '600px', lineHeight: 1.5 }}>
                This live tracking session is no longer active. Real-time GPS location broadcasting has terminated because the journey reached its destination or was concluded by the user.
              </p>
            </div>

            <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '10px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>
                Status
              </div>
              <span style={{ fontSize: '0.88rem', color: '#94A3B8', fontWeight: 700 }}>
                {session?.status === 'CANCELLED' ? 'Concluded' : 'Completed Safely'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Active Journey Route Card */}
      {session && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isSessionActive ? 'var(--primary-light)' : '#94A3B8', fontWeight: 700, fontSize: '0.88rem' }}>
              <JourneyModeIcon size={18} />
              <span>{isSessionActive ? 'SAFE JOURNEY IN TRANSIT' : 'JOURNEY SUMMARY'}</span>
            </div>
            <span style={{ 
              fontSize: '0.8rem', 
              color: isSessionActive ? 'var(--safe-light)' : '#94A3B8', 
              background: isSessionActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)', 
              padding: '3px 10px', 
              borderRadius: '20px', 
              fontWeight: 600 
            }}>
              {isSessionActive ? (session.etaDisplay || 'ETA calculating...') : 'Journey Completed'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 600, marginBottom: '10px' }}>
            <span>{session.startPoint || 'Origin Point'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>➔</span>
            <span>{session.destination || 'Destination'}</span>
          </div>

          <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              width: `${isSessionActive ? (session.progress || 0) : 100}%`, 
              background: isSessionActive ? 'linear-gradient(90deg, #6366F1, #10B981)' : '#64748B', 
              transition: 'width 0.5s ease-out' 
            }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Departed</span>
            <span>{isSessionActive ? `Progress: ${session.progress || 0}%` : 'Arrived at Destination'}</span>
            <span>{session.destination || 'Destination'}</span>
          </div>
        </div>
      )}

      {/* Map Section */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
      }}>
        <div style={{
          padding: '16px 20px',
          background: 'rgba(7, 11, 20, 0.7)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color={isSessionActive ? 'var(--safe-light)' : '#94A3B8'} />
            <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem' }}>
              {isSessionActive ? 'Live Telemetry Map View' : 'Final Known Location'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {coords.lat != null && (
              <>
                <button 
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.setView([coords.lat, coords.lng], 16);
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                >
                  <Crosshair size={14} />
                  <span>Center on {firstName}</span>
                </button>
                <a 
                  href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
                >
                  <ExternalLink size={14} />
                  <span>Google Maps</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Map Container or Fallback */}
        {coords.lat != null ? (
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '420px', background: '#070B14' }}
          />
        ) : (
          <div style={{
            height: '320px',
            background: 'rgba(7, 11, 20, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center'
          }}>
            <MapPin size={42} color="var(--primary-light)" style={{ marginBottom: '12px' }} />
            <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', marginBottom: '6px' }}>
              GPS Satellite Beacon Not Active
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.88rem', margin: '0 auto 12px auto' }}>
              Coordinates are pending or were not transmitted for this session.
            </p>
          </div>
        )}
      </div>

      {/* Grid: Coordinates & Emergency Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Exact Location Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--safe-light)" />
            <span>Pinpoint Location Telemetry</span>
          </h3>

          <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
              Street Address / Reference Landmark
            </div>
            <div style={{ color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 600, lineHeight: 1.4 }}>
              {coords.address}
            </div>
          </div>

          {coords.lat != null && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Latitude</div>
                <div style={{ fontFamily: 'monospace', color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem' }}>{coords.lat.toFixed(5)}° N</div>
              </div>
              <div style={{ background: 'rgba(7, 11, 20, 0.6)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Longitude</div>
                <div style={{ fontFamily: 'monospace', color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem' }}>{coords.lng.toFixed(5)}° E</div>
              </div>
            </div>
          )}

          {coords.lat != null && (
            <button 
              onClick={copyCoordinates}
              className="btn btn-outline btn-sm"
              style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Copy size={14} />
              <span>Copy GPS Coordinates</span>
            </button>
          )}
        </div>

        {/* Emergency Quick Dial Card */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhoneCall size={18} color="var(--primary-light)" />
            <span>Direct Emergency Contact</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {userPhone ? (
              <a 
                href={`tel:${userPhone}`}
                className="btn btn-safe"
                style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px' }}
              >
                <PhoneCall size={16} />
                <span>Call {userName} ({userPhone})</span>
              </a>
            ) : null}

            {cleanPhone ? (
              <a 
                href={`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`Hi ${userName}, I am tracking your live location on Nivarya. Please let me know you are safe!`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#FFFFFF', borderColor: '#25D366', padding: '12px' }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp Message</span>
              </a>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
                Direct contact phone is private for this traveler.
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>
              National Emergency Helplines
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <a 
                href="tel:112" 
                className="btn btn-danger btn-sm"
                style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldAlert size={14} />
                <span>Police (112)</span>
              </a>
              <a 
                href="tel:1091" 
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#EC4899', borderColor: 'rgba(236, 72, 153, 0.4)' }}
              >
                <HeartPulse size={14} />
                <span>Women (1091)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Security Assurance Banner (Requirement 7: Privacy Preserving) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={24} color="var(--safe-light)" />
          <div>
            <div style={{ color: '#FFFFFF', fontSize: '0.88rem', fontWeight: 600 }}>
              Nivarya Encrypted Safety Channel
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Real-time GPS telemetry is shared only during the active journey and terminates automatically upon arrival.
            </div>
          </div>
        </div>

        <button 
          onClick={() => setCurrentPage('home')}
          className="btn btn-ghost btn-sm"
          style={{ color: 'var(--primary-light)', fontSize: '0.82rem' }}
        >
          Explore All Nivarya Safety Tools ➔
        </button>
      </div>
    </div>
  );
}
