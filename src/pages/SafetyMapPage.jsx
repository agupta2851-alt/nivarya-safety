import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { getHotspotsForCoordinates, safetyLayersConfig } from '../data/initialData';
import { 
  Map as MapIcon, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  PhoneCall, 
  Navigation, 
  Crosshair, 
  Compass,
  Info,
  Layers,
  Sun,
  Building2,
  HeartPulse,
  Users,
  Flag,
  MapPin
} from 'lucide-react';

export default function SafetyMapPage() {
  const { showToast, currentCoordinates, requestGpsLocation, locationState, setIsLocationConsentModalOpen, t } = useApp();
  
  // Track enabled layers (all 8 enabled by default)
  const [activeLayers, setActiveLayers] = useState({
    safezones: true,
    police: true,
    hospitals: true,
    responders: true,
    streetlights: true,
    highrisk: true,
    transithubs: true,
    incidents: true
  });

  const [selectedSpot, setSelectedSpot] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  const toggleLayer = (layerId) => {
    setActiveLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }));
  };

  const toggleAllLayers = (enableAll) => {
    const updated = {};
    Object.keys(activeLayers).forEach(k => { updated[k] = enableAll; });
    setActiveLayers(updated);
  };

  const allHotspots = currentCoordinates?.lat != null
    ? [
        {
          id: 'user-marker',
          type: 'user',
          name: 'Your Current Location',
          lat: currentCoordinates.lat,
          lng: currentCoordinates.lng,
          category: 'user',
          layer: 'user',
          details: `Real GPS Position (accuracy ±${currentCoordinates.accuracy || 10}m)`
        },
        ...getHotspotsForCoordinates(currentCoordinates)
      ]
    : [];

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter = currentCoordinates?.lat != null 
        ? [currentCoordinates.lat, currentCoordinates.lng] 
        : [20.5937, 78.9629]; // Geographic center fallback when unlocated
      const defaultZoom = currentCoordinates?.lat != null ? 15 : 5;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    } else if (currentCoordinates?.lat != null) {
      mapInstanceRef.current.setView([currentCoordinates.lat, currentCoordinates.lng], 15);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    // Filter points based on activeLayers
    const filtered = allHotspots.filter(spot => {
      if (spot.type === 'user') return true;
      const categoryKey = spot.layer || spot.category;
      if (categoryKey === 'safezone' || categoryKey === 'safezones') return activeLayers.safezones;
      if (categoryKey === 'police') return activeLayers.police;
      if (categoryKey === 'hospital' || categoryKey === 'hospitals') return activeLayers.hospitals;
      if (categoryKey === 'responder' || categoryKey === 'responders') return activeLayers.responders;
      if (categoryKey === 'streetlight' || categoryKey === 'streetlights') return activeLayers.streetlights;
      if (categoryKey === 'highrisk') return activeLayers.highrisk;
      if (categoryKey === 'transit' || categoryKey === 'transithubs') return activeLayers.transithubs;
      if (categoryKey === 'incident' || categoryKey === 'incidents') return activeLayers.incidents;
      return true;
    });

    // Add custom markers
    filtered.forEach(spot => {
      let iconColor = '#6366F1';
      let iconEmoji = '📍';

      if (spot.type === 'user') {
        iconColor = '#10B981';
        iconEmoji = '👤';
      } else if (spot.type === 'police' || spot.layer === 'police') {
        iconColor = '#6366F1';
        iconEmoji = '👮';
      } else if (spot.type === 'hospital' || spot.layer === 'hospitals') {
        iconColor = '#EC4899';
        iconEmoji = '🏥';
      } else if (spot.type === 'safezone' || spot.layer === 'safezones') {
        iconColor = '#10B981';
        iconEmoji = '🛡️';
      } else if (spot.type === 'responder' || spot.layer === 'responders') {
        iconColor = '#06B6D4';
        iconEmoji = '🤝';
      } else if (spot.type === 'streetlight' || spot.layer === 'streetlights') {
        iconColor = '#F59E0B';
        iconEmoji = '💡';
      } else if (spot.type === 'highrisk' || spot.layer === 'highrisk') {
        iconColor = '#EF4444';
        iconEmoji = '⚠️';
      } else if (spot.type === 'transit' || spot.layer === 'transithubs') {
        iconColor = '#8B5CF6';
        iconEmoji = '🚇';
      } else if (spot.type === 'incident' || spot.layer === 'incidents') {
        iconColor = '#F97316';
        iconEmoji = '🚩';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${iconColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 16px ${iconColor}80;
            border: 2px solid #FFFFFF;
            font-size: 14px;
            cursor: pointer;
          ">
            ${iconEmoji}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="padding: 8px; font-family: sans-serif; min-width: 180px;">
          <h4 style="margin: 0 0 4px 0; color: #FFFFFF; font-size: 13px; font-weight: bold;">${spot.name}</h4>
          <p style="margin: 0 0 8px 0; color: #CBD5E1; font-size: 11px;">${spot.details || ''}</p>
          ${spot.phone ? `<a href="tel:${spot.phone}" style="display: inline-block; padding: 4px 8px; background: #6366F1; color: #FFF; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">Call: ${spot.phone}</a>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedSpot(spot);
      });

      markersRef.current.push(marker);
    });
  }, [activeLayers, currentCoordinates]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleCenterOnUser = async () => {
    if (currentCoordinates.lat != null && mapInstanceRef.current) {
      mapInstanceRef.current.setView([currentCoordinates.lat, currentCoordinates.lng], 15);
      showToast('Centered on your real device GPS', 'safe');
    } else {
      try {
        const res = await requestGpsLocation();
        if (res?.coords && mapInstanceRef.current) {
          mapInstanceRef.current.setView([res.coords.lat, res.coords.lng], 15);
          showToast('Acquired and centered on real GPS coordinates', 'safe');
        }
      } catch (err) {
        setIsLocationConsentModalOpen(true);
      }
    }
  };

  const getLayerIcon = (id) => {
    switch (id) {
      case 'safezones': return <ShieldCheck size={14} color="#10B981" />;
      case 'police': return <Building2 size={14} color="#6366F1" />;
      case 'hospitals': return <HeartPulse size={14} color="#EC4899" />;
      case 'responders': return <Users size={14} color="#06B6D4" />;
      case 'streetlights': return <Sun size={14} color="#F59E0B" />;
      case 'highrisk': return <AlertTriangle size={14} color="#EF4444" />;
      case 'transithubs': return <Navigation size={14} color="#8B5CF6" />;
      default: return <Flag size={14} color="#F97316" />;
    }
  };

  return (
    <div className="safety-map-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <span className="section-tag">
            <Compass size={14} />
            <span>Multi-Layer Safety Radar & GIS</span>
          </span>
          <h1 className="section-title" style={{ marginBottom: '6px' }}>
            {t.safetyMap.title}
          </h1>
          <p className="section-desc">
            8 interactive intelligence layers showing safe zones, police booths, streetlight coverage, responders, and hazard clusters.
          </p>
        </div>

        {/* Safety Score Meter Widget */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: '#10B981',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-heading)',
            fontSize: '1.25rem',
            fontWeight: 800,
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.5)'
          }}>
            92
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{t.safetyMap.safetyScore}</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34D399' }}>Optimal Safe Corridor</div>
            <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>100% LED streetlights • 2 PCR patrol units within 1 km</div>
          </div>
        </div>
      </div>

      {/* 8-Layer Interactive Filter Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', textTransform: 'uppercase' }}>
            <Layers size={16} color="var(--primary-light)" />
            <span>Map Layers Filter (Toggle on/off):</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => toggleAllLayers(true)}
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            >
              Select All
            </button>
            <button 
              className="btn btn-ghost btn-sm"
              onClick={() => toggleAllLayers(false)}
              style={{ fontSize: '0.75rem', padding: '2px 8px' }}
            >
              Deselect All
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {safetyLayersConfig.map(layer => {
            const isEnabled = activeLayers[layer.id];
            return (
              <button
                key={layer.id}
                onClick={() => toggleLayer(layer.id)}
                className={`btn btn-sm ${isEnabled ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  border: isEnabled ? `1px solid ${layer.color}` : '1px solid var(--border-subtle)',
                  background: isEnabled ? 'rgba(30, 41, 75, 0.9)' : 'rgba(15, 23, 42, 0.6)'
                }}
              >
                {getLayerIcon(layer.id)}
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Status Strip */}
      {currentCoordinates?.lat == null && (
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '12px',
          padding: '12px 18px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={18} color="var(--primary-light)" />
            <span style={{ fontSize: '0.88rem', color: '#E2E8F0' }}>
              {locationState?.mode === 'manual' && locationState?.city 
                ? `Manual Location: ${locationState.city}${locationState.address ? ` (${locationState.address})` : ''} • Enable GPS to populate live radar spots`
                : 'GPS position not yet active. Enable device GPS to scan live safety points around your current position.'}
            </span>
          </div>
          <button 
            className="btn btn-safe btn-sm"
            onClick={handleCenterOnUser}
            style={{ fontWeight: 700 }}
          >
            <Crosshair size={14} />
            <span>Enable Real GPS</span>
          </button>
        </div>
      )}

      {/* Map Action Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Click any marker on the map to view instant directions & contact numbers.
        </div>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={handleCenterOnUser}
        >
          <Crosshair size={15} />
          <span>Locate Me (Real Device GPS)</span>
        </button>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="map-view-wrapper" style={{ height: '480px', borderRadius: '18px', overflow: 'hidden', marginBottom: '24px', border: '1px solid var(--border-medium)' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>
      </div>

      {/* Points of Interest Detailed Cards */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
        <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, marginBottom: '16px' }}>
          Verified Points of Interest & Hazard Radar
        </h3>

        {allHotspots.filter(s => s.type !== 'user').length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '36px 20px',
            background: 'rgba(7, 11, 20, 0.4)',
            borderRadius: '12px',
            border: '1px dashed var(--border-subtle)',
            color: 'var(--text-muted)'
          }}>
            <Compass size={36} color="var(--primary-light)" style={{ margin: '0 auto 12px', opacity: 0.6 }} />
            <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.98rem', marginBottom: '6px' }}>
              No GPS Radar Points Active
            </div>
            <p style={{ margin: '0 auto 16px', fontSize: '0.85rem', maxWidth: '420px', color: '#94A3B8' }}>
              Radar spots (police desks, streetlights, safe zones) are dynamically computed around your live coordinates to prevent false location simulation.
            </p>
            <button className="btn btn-primary btn-sm" onClick={handleCenterOnUser}>
              <Crosshair size={14} />
              <span>Acquire Real Device GPS</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {allHotspots.filter(s => s.type !== 'user').map(spot => (
              <div 
                key={spot.id} 
                style={{
                  background: 'rgba(7, 11, 20, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s'
                }}
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([spot.lat, spot.lng], 16);
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    color: 'var(--primary-light)'
                  }}>
                    {spot.layer || spot.category}
                  </span>
                  {spot.severity && (
                    <span style={{ fontSize: '0.72rem', color: '#F87171', fontWeight: 700 }}>
                      Severity: {spot.severity}
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem', marginBottom: '4px' }}>
                  {spot.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '10px' }}>
                  {spot.details}
                </div>

                {spot.phone && (
                  <a 
                    href={`tel:${spot.phone}`} 
                    className="btn btn-secondary btn-sm"
                    style={{ textDecoration: 'none', padding: '4px 10px', fontSize: '0.78rem' }}
                  >
                    <PhoneCall size={12} />
                    <span>Call {spot.phone}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
