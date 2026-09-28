import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Car, 
  Train, 
  Bus, 
  Footprints, 
  Bike, 
  CheckCircle2, 
  Share2, 
  AlertTriangle, 
  Play, 
  Pause, 
  XCircle, 
  ShieldCheck,
  Radio,
  ArrowRight,
  Info,
  Compass,
  Users,
  ShieldAlert,
  Activity,
  Check,
  RefreshCw
} from 'lucide-react';
import { evaluateMilestones } from '../utils/geoUtils';

export default function SafeJourneyPage() {
  const { 
    activeJourney, 
    startJourney, 
    performCheckin, 
    pauseJourney,
    resumeJourney,
    cancelJourney,
    endJourney, 
    triggerSos,
    showToast,
    currentCoordinates,
    locationState,
    requestGpsLocation,
    contacts,
    selectedContactsForJourney,
    toggleContactJourneySelection,
    setIsLocationModalOpen,
    setCurrentPage,
    t 
  } = useApp();

  // Form states when setting up journey
  const defaultStart = locationState?.coords
    ? (locationState.address || 'Current GPS Location')
    : (activeJourney.startPoint || '');
  const [startPoint, setStartPoint] = useState(defaultStart);
  const [destination, setDestination] = useState(activeJourney.destination || '');
  const [selectedMode, setSelectedMode] = useState(activeJourney.mode || 'cab');
  const [etaInput, setEtaInput] = useState(25);
  const [checkinInterval, setCheckinInterval] = useState(10);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const modes = [
    { id: 'cab', label: t.journey.modes.cab, icon: Car },
    { id: 'metro', label: t.journey.modes.metro, icon: Train },
    { id: 'bus', label: t.journey.modes.bus, icon: Bus },
    { id: 'auto', label: t.journey.modes.auto, icon: Car },
    { id: 'walk', label: t.journey.modes.walk, icon: Footprints },
    { id: 'twoWheeler', label: t.journey.modes.twoWheeler, icon: Bike }
  ];

  const handleStart = async (e) => {
    e.preventDefault();
    if (!startPoint.trim() || !destination.trim()) {
      showToast('Please specify both starting location and destination', 'danger');
      return;
    }

    // Require real GPS permission
    if (!locationState.coords || locationState.status !== 'granted') {
      setIsRequestingLocation(true);
      try {
        await requestGpsLocation();
      } catch (err) {
        setIsRequestingLocation(false);
        showToast('Location permission is required for live journey tracking.', 'danger');
        return;
      }
      setIsRequestingLocation(false);
    }

    startJourney({
      startPoint,
      destination,
      mode: selectedMode,
      etaMinutes: Number(etaInput)
    });
  };

  const handleEnableGps = async () => {
    setIsRequestingLocation(true);
    try {
      await requestGpsLocation();
      showToast('Real satellite GPS fix established.', 'safe');
    } catch (err) {
      showToast('Location permission is required for live journey tracking.', 'danger');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  // Evaluate real milestones strictly from GPS metrics
  const milestones = evaluateMilestones({
    progress: activeJourney.progress || 0,
    distanceTraveledKm: activeJourney.distanceTraveledKm || 0,
    isArrived: activeJourney.status === 'ARRIVED'
  });

  const ModeIcon = modes.find(m => m.id === (activeJourney.isActive ? activeJourney.mode : selectedMode))?.icon || Navigation;

  return (
    <div className="journey-container container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <span className="section-tag">
          <Navigation size={14} />
          <span>Active Journey Guard & Live GPS</span>
        </span>
        <h1 className="section-title">
          {t.journey.title}
        </h1>
        <p className="section-desc">
          {t.journey.subtitle}
        </p>
      </div>

      {/* GPS Permission Warning Banner if Denied */}
      {locationState.status === 'denied' && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="#EF4444" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                Location permission is required for live journey tracking.
              </div>
              <div style={{ color: '#FCA5A5', fontSize: '0.82rem', marginTop: '3px' }}>
                Real device GPS is mandatory to measure physical movement and calculate travel progress honestly. No simulated coordinates are ever substituted.
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={handleEnableGps}
            disabled={isRequestingLocation}
          >
            <RefreshCw size={14} className={isRequestingLocation ? 'spin' : ''} />
            <span>{isRequestingLocation ? 'Requesting GPS...' : 'Enable Device GPS'}</span>
          </button>
        </div>
      )}

      {/* Live GPS Route Monitoring Status */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.82rem',
        color: '#CBD5E1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={18} color="#818CF8" style={{ flexShrink: 0 }} />
          <span>
            <strong>Real GPS Movement Guard: </strong> 
            Progress updates solely on actual satellite physical movement. Share your live tracking link with trusted contacts so they can view your live route.
          </span>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => setCurrentPage('routes')}
          style={{ fontSize: '0.78rem' }}
        >
          <Compass size={14} />
          <span>View Safest Routes</span>
        </button>
      </div>

      {!activeJourney.isActive ? (
        /* SETUP / LAUNCH NEW JOURNEY VIEW */
        <div className="card" style={{ maxWidth: '720px', margin: '0 auto', borderRadius: '18px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '6px', color: '#FFFFFF' }}>
            Plan & Guard Your Route
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', marginBottom: '24px' }}>
            Real GPS tracking starts when you depart. Share your secure live tracking link with trusted contacts.
          </p>

          <form onSubmit={handleStart}>
            <div className="form-group">
              <label className="form-label">{t.journey.startPoint}</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  className="input-field"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  placeholder="e.g. Current Location, University Library, Connaught Place"
                  required
                />
              </div>
              {locationState.coords && (
                <div style={{ fontSize: '0.76rem', color: 'var(--safe-light)', marginTop: '4px' }}>
                  ✓ Real GPS fix ready: {locationState.coords.lat.toFixed(4)}° N, {locationState.coords.lng.toFixed(4)}° E (±{locationState.coords.accuracy}m)
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">{t.journey.destination}</label>
              <input 
                type="text"
                className="input-field"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Hostel Gate 2, Metro Station Sector 14"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.journey.selectMode}</label>
              <div className="mode-selector-grid">
                {modes.map(mode => {
                  const Icon = mode.icon;
                  const isActive = selectedMode === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      className={`mode-btn ${isActive ? 'active' : ''}`}
                      onClick={() => setSelectedMode(mode.id)}
                    >
                      <Icon size={20} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Estimated Baseline Duration (Mins)</label>
                <input 
                  type="number"
                  min="5"
                  max="180"
                  className="input-field"
                  value={etaInput}
                  onChange={(e) => setEtaInput(e.target.value)}
                />
                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>Used as reference until real movement speed is detected</span>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Check-in Frequency</label>
                <select 
                  className="input-field"
                  value={checkinInterval}
                  onChange={(e) => setCheckinInterval(Number(e.target.value))}
                >
                  <option value={5}>Every 5 minutes</option>
                  <option value={10}>Every 10 minutes</option>
                  <option value={15}>Every 15 minutes</option>
                  <option value={20}>Every 20 minutes</option>
                </select>
              </div>
            </div>

            {/* Select Trusted Contacts for Journey Sharing */}
            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Select Trusted Contacts to Share Live Link With:
                </label>
                {contacts.length === 0 && (
                  <button 
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => setCurrentPage('contacts')}
                    style={{ color: 'var(--primary-light)', fontSize: '0.78rem' }}
                  >
                    + Add Contacts
                  </button>
                )}
              </div>
              
              {contacts.length === 0 ? (
                <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  No emergency contacts saved yet. You can still track your journey with real GPS and generate a shareable link.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {contacts.map(c => {
                    const isChecked = selectedContactsForJourney.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleContactJourneySelection(c.id)}
                        className={`btn btn-sm ${isChecked ? 'btn-safe' : 'btn-outline'}`}
                        style={{ fontSize: '0.78rem' }}
                      >
                        <span>{isChecked ? '✓' : '+'}</span>
                        <span>{c.name} ({c.relation})</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block"
              disabled={isRequestingLocation}
            >
              <Navigation size={20} />
              <span>{isRequestingLocation ? 'Acquiring GPS...' : t.journey.startBtn}</span>
            </button>
          </form>
        </div>
      ) : (
        /* ACTIVE JOURNEY LIVE MONITORING VIEW */
        <div className="animate-fade-in">
          <div className="journey-progress-box">
            {/* Active Header & Telemetry */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                {/* State Badge */}
                <div style={{ marginBottom: '8px' }}>
                  {activeJourney.status === 'ARRIVED' ? (
                    <span className="badge badge-safe">
                      <CheckCircle2 size={13} />
                      <span>ARRIVED AT DESTINATION</span>
                    </span>
                  ) : activeJourney.isPaused ? (
                    <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <Pause size={13} />
                      <span>TRACKING PAUSED BY USER</span>
                    </span>
                  ) : activeJourney.movementState === 'STATIONARY' || activeJourney.status === 'PAUSED/NO_MOVEMENT' ? (
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                      <span className="demo-banner-dot" style={{ background: '#F59E0B' }}></span>
                      <span>ACTIVE • STATIONARY (NO MOVEMENT DETECTED)</span>
                    </span>
                  ) : (
                    <span className="badge badge-safe">
                      <span className="demo-banner-dot"></span>
                      <span>ACTIVE • IN MOTION (LIVE GPS TRACKING)</span>
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{activeJourney.startPoint}</span>
                  <ArrowRight size={20} color="#818CF8" />
                  <span>{activeJourney.destination}</span>
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', color: '#94A3B8', fontSize: '0.85rem', marginTop: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ModeIcon size={16} color="#34D399" />
                    <span>Mode: {modes.find(m => m.id === activeJourney.mode)?.label || activeJourney.mode}</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: activeJourney.movementState === 'STATIONARY' ? '#F59E0B' : '#818CF8' }}>
                    <Clock size={16} />
                    <span>ETA: {activeJourney.etaDisplay || 'ETA calculating...'}</span>
                  </span>
                  <span>•</span>
                  <span style={{ color: currentCoordinates?.lat != null ? 'var(--safe-light)' : '#F59E0B' }}>
                    {currentCoordinates?.lat != null ? (
                      `GPS: ${currentCoordinates.lat.toFixed(5)}° N, ${currentCoordinates.lng.toFixed(5)}° E (±${locationState?.coords?.accuracy || 10}m)`
                    ) : (
                      'GPS: Signal searching / Permission required'
                    )}
                  </span>
                </div>

                {/* Real Physical Metrics Row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', color: '#CBD5E1', fontSize: '0.82rem', marginTop: '10px' }}>
                  <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3px 10px', borderRadius: '6px' }}>
                    Speed: <strong>{activeJourney.currentSpeedKmh || 0} km/h</strong>
                  </span>
                  <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3px 10px', borderRadius: '6px' }}>
                    Traveled: <strong>{(activeJourney.distanceTraveledKm || 0).toFixed(2)} km</strong>
                  </span>
                  {activeJourney.remainingDistanceKm != null && (
                    <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3px 10px', borderRadius: '6px' }}>
                      Remaining: <strong>~{activeJourney.remainingDistanceKm.toFixed(2)} km</strong>
                    </span>
                  )}
                  <span style={{ color: '#818CF8', fontSize: '0.78rem' }}>
                    {activeJourney.trackingType || 'Real GPS Straight-Line Displacement (Route API not connected)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn btn-safe btn-sm"
                  onClick={() => setIsLocationModalOpen(true)}
                >
                  <Share2 size={16} />
                  <span>Share Live GPS</span>
                </button>

                {activeJourney.mode === 'cab' && (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setCurrentPage('cab')}
                  >
                    <Car size={16} />
                    <span>Cab Radar</span>
                  </button>
                )}

                <button 
                  className="btn btn-danger btn-sm"
                  onClick={triggerSos}
                >
                  <AlertTriangle size={16} />
                  <span>SOS</span>
                </button>
              </div>
            </div>

            {/* Visual Timeline Progress Bar & Real Milestones */}
            <div className="progress-track-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                  {t.journey.progress} (Physical Distance Progress)
                </span>
                <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#10B981' }}>
                  {activeJourney.progress || 0}%
                </span>
              </div>

              <div className="progress-track-bg">
                <div 
                  className="progress-track-fill" 
                  style={{ width: `${activeJourney.progress || 0}%` }}
                ></div>
              </div>

              {/* Real Checkpoint Nodes */}
              <div className="timeline-checkpoints">
                {milestones.map(cp => {
                  return (
                    <div 
                      key={cp.id} 
                      className={`checkpoint-node ${cp.completed ? 'completed' : ''}`}
                    >
                      <div className="checkpoint-dot">
                        {cp.completed && <Check size={10} color="#FFFFFF" />}
                      </div>
                      <span>{cp.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Check-in & Status Strip */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              margin: '28px 0'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>REAL SAFE CHECK-IN TRAIL</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  Last Checked-in: {activeJourney.lastCheckinTime || 'At departure'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34D399', marginTop: '4px' }}>
                  {selectedContactsForJourney.length > 0 ? (
                    `✓ ${activeJourney.checkinsCount || 0} Safe check-in(s) logged • ${selectedContactsForJourney.length} trusted contact(s) selected for share updates`
                  ) : (
                    `✓ ${activeJourney.checkinsCount || 0} Safe check-in(s) logged (No trusted contacts currently selected)`
                  )}
                </div>
              </div>

              <button 
                className="btn btn-safe btn-lg"
                onClick={performCheckin}
                style={{ padding: '14px 28px' }}
              >
                <CheckCircle2 size={20} />
                <span>{t.journey.checkinBtn}</span>
              </button>
            </div>

            {/* Real Journey Controls */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="var(--primary-light)" />
                <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                  JOURNEY STATUS: {activeJourney.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeJourney.isPaused ? (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={resumeJourney}
                  >
                    <Play size={14} />
                    <span>Resume Tracking</span>
                  </button>
                ) : (
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={pauseJourney}
                  >
                    <Pause size={14} />
                    <span>Pause Tracking</span>
                  </button>
                )}

                <button 
                  className="btn btn-safe btn-sm"
                  onClick={endJourney}
                >
                  <CheckCircle2 size={14} />
                  <span>I Have Arrived Safely</span>
                </button>

                <button 
                  className="btn btn-outline btn-sm"
                  onClick={cancelJourney}
                  style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}
                >
                  <XCircle size={14} />
                  <span>Cancel Journey</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
