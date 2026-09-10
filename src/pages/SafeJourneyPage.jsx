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
  RotateCcw, 
  ShieldCheck,
  Radio,
  ArrowRight,
  Info,
  Compass,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function SafeJourneyPage() {
  const { 
    activeJourney, 
    startJourney, 
    performCheckin, 
    endJourney, 
    setJourneyProgress, 
    triggerSos,
    showToast,
    currentCoordinates,
    contacts,
    selectedContactsForJourney,
    toggleContactJourneySelection,
    setIsLocationModalOpen,
    setCurrentPage,
    t 
  } = useApp();

  // Form states when setting up journey
  const [startPoint, setStartPoint] = useState(activeJourney.startPoint || 'University North Campus');
  const [destination, setDestination] = useState(activeJourney.destination || 'Sector 14 Residential Hostel');
  const [selectedMode, setSelectedMode] = useState(activeJourney.mode || 'metro');
  const [etaInput, setEtaInput] = useState(25);
  const [checkinInterval, setCheckinInterval] = useState(10);
  const [enableCabMonitor, setEnableCabMonitor] = useState(true);

  const modes = [
    { id: 'cab', label: t.journey.modes.cab, icon: Car },
    { id: 'metro', label: t.journey.modes.metro, icon: Train },
    { id: 'bus', label: t.journey.modes.bus, icon: Bus },
    { id: 'auto', label: t.journey.modes.auto, icon: Car },
    { id: 'walk', label: t.journey.modes.walk, icon: Footprints },
    { id: 'twoWheeler', label: t.journey.modes.twoWheeler, icon: Bike }
  ];

  const handleStart = (e) => {
    e.preventDefault();
    if (!startPoint.trim() || !destination.trim()) {
      showToast('Please specify both starting location and destination', 'danger');
      return;
    }
    startJourney({
      startPoint,
      destination,
      mode: selectedMode,
      etaMinutes: Number(etaInput)
    });
  };

  const checkpoints = [
    { progress: 0, label: 'Departed' },
    { progress: 25, label: 'Campus Gate' },
    { progress: 50, label: 'Mid Transit' },
    { progress: 75, label: 'Sector Ring' },
    { progress: 100, label: 'Arrived' }
  ];

  const ModeIcon = modes.find(m => m.id === (activeJourney.isActive ? activeJourney.mode : selectedMode))?.icon || Navigation;

  return (
    <div className="journey-container container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
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

      {/* Prototype Simulated Label */}
      <div style={{
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '12px',
        padding: '12px 18px',
        marginBottom: '28px',
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
            <strong>Simulated GPS & Route Monitoring: </strong> 
            Live tracking link generates encrypted real-time coordinate broadcasts to selected trusted contacts.
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
            Share your live route checkpoints with your trusted contacts network.
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
                  placeholder="e.g. University Library, Connaught Place"
                  required
                />
              </div>
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
                <label className="form-label">Estimated Duration (Mins)</label>
                <input 
                  type="number"
                  min="5"
                  max="180"
                  className="input-field"
                  value={etaInput}
                  onChange={(e) => setEtaInput(e.target.value)}
                />
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

            {/* Selected Trusted Contacts for Journey */}
            <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Notify Selected Trusted Contacts on Launch:
              </label>
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
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              <Navigation size={20} />
              <span>{t.journey.startBtn}</span>
            </button>
          </form>
        </div>
      ) : (
        /* ACTIVE JOURNEY LIVE MONITORING VIEW */
        <div className="animate-fade-in">
          <div className="journey-progress-box">
            {/* Active Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="badge badge-safe" style={{ marginBottom: '8px' }}>
                  <span className="demo-banner-dot"></span>
                  {t.journey.inProgress}
                </span>
                <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{activeJourney.startPoint}</span>
                  <ArrowRight size={20} color="#818CF8" />
                  <span>{activeJourney.destination}</span>
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', color: '#94A3B8', fontSize: '0.85rem', marginTop: '6px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ModeIcon size={16} color="#34D399" />
                    <span>Mode: {modes.find(m => m.id === activeJourney.mode)?.label || activeJourney.mode}</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={16} color="#818CF8" />
                    <span>ETA: ~{Math.max(1, Math.round(activeJourney.etaMinutes * (1 - activeJourney.progress / 100)))} mins remaining</span>
                  </span>
                  <span>•</span>
                  <span style={{ color: 'var(--safe-light)' }}>
                    GPS: {currentCoordinates.lat}° N, {currentCoordinates.lng}° E
                  </span>
                </div>
              </div>

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
                    <span>Cab Safety Radar</span>
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

            {/* Visual Timeline Progress Bar */}
            <div className="progress-track-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#CBD5E1' }}>
                  {t.journey.progress}
                </span>
                <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', fontWeight: 800, color: '#10B981' }}>
                  {activeJourney.progress}%
                </span>
              </div>

              <div className="progress-track-bg">
                <div 
                  className="progress-track-fill" 
                  style={{ width: `${activeJourney.progress}%` }}
                ></div>
              </div>

              {/* Checkpoint nodes */}
              <div className="timeline-checkpoints">
                {checkpoints.map(cp => {
                  const isCompleted = activeJourney.progress >= cp.progress;
                  return (
                    <div 
                      key={cp.progress} 
                      className={`checkpoint-node ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="checkpoint-dot"></div>
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
                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>AUTOMATED CHECK-IN STATUS</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
                  Last Checked-in: {activeJourney.lastCheckinTime || 'At departure'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#34D399', marginTop: '4px' }}>
                  ✓ {activeJourney.checkinsCount} Safe check-ins logged for {selectedContactsForJourney.length} contacts
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

            {/* Simulation Playback & Adjuster Controls */}
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
              <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                SIMULATION CONTROLS:
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setJourneyProgress(activeJourney.progress + 20)}
                  disabled={activeJourney.progress >= 100}
                >
                  <span>+20% Progress</span>
                </button>

                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => setJourneyProgress(0)}
                >
                  <RotateCcw size={14} />
                  <span>Restart</span>
                </button>
              </div>

              <button 
                className="btn btn-outline btn-sm"
                onClick={endJourney}
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#F87171' }}
              >
                <span>{t.journey.endBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
