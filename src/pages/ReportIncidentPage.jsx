import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileWarning, 
  MapPin, 
  Calendar, 
  Clock, 
  Upload, 
  CheckCircle2, 
  Shield, 
  EyeOff, 
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';

export default function ReportIncidentPage() {
  const { addIncident, setCurrentPage, showToast, t } = useApp();

  const categories = [
    'Harassment',
    'Unsafe area',
    'Poor lighting',
    'Suspicious activity',
    'Public transport issue',
    'Stalking concern',
    'Other'
  ];

  const [category, setCategory] = useState('Poor lighting');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [severity, setSeverity] = useState('Medium');
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setSelectedImage({ file, previewUrl });
    }
  };

  const handleUseCurrentLocation = () => {
    setLocation('Near University North Circle, Sector 4');
    showToast('Applied simulated GPS location', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) {
      showToast('Please provide location and description', 'danger');
      return;
    }

    addIncident({
      category,
      location: location.trim(),
      date,
      time,
      description: description.trim(),
      authorBadge: isAnonymous ? 'Anonymous Commuter' : 'Verified Community Member',
      severity
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container animate-fade-in" style={{ paddingTop: '64px', maxWidth: '640px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '48px 32px' }}>
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10B981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <CheckCircle2 size={40} />
          </div>

          <h2 style={{ fontSize: '1.8rem', color: '#FFFFFF', marginBottom: '12px' }}>
            Report Successfully Submitted
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '32px' }}>
            Thank you for being a proactive guardian of our community. Your report has been verified and added to the Nivarya Community Safety Radar.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => { setCurrentPage('community'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <span>View Community Feed</span>
              <ArrowRight size={16} />
            </button>

            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSubmitted(false);
                setLocation('');
                setDescription('');
                setSelectedImage(null);
              }}
            >
              <span>Submit Another Report</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="report-incident-page container animate-fade-in" style={{ paddingTop: '24px', maxWidth: '760px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '28px' }}>
        <span className="section-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#FCD34D' }}>
          <FileWarning size={14} />
          <span>Community Shield</span>
        </span>
        <h1 className="section-title">
          {t.report.title}
        </h1>
        <p className="section-desc">
          {t.report.subtitle}
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Category */}
          <div className="form-group">
            <label className="form-label">{t.report.category}</label>
            <select 
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Location with Auto-fill */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>{t.report.location}</label>
              <button 
                type="button" 
                onClick={handleUseCurrentLocation}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.78rem', padding: 0, color: '#818CF8' }}
              >
                <MapPin size={13} />
                <span>Use Current Location</span>
              </button>
            </div>
            <input 
              type="text"
              className="form-control"
              placeholder="e.g. Metro Station Gate 4 walkway, Sector 7 overbridge"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          {/* Date and Time Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date of Incident</label>
              <input 
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Approximate Time</label>
              <input 
                type="text"
                className="form-control"
                placeholder="e.g. 09:30 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Severity */}
          <div className="form-group">
            <label className="form-label">Observed Severity Level</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {['Low', 'Medium', 'High'].map(lvl => (
                <button
                  type="button"
                  key={lvl}
                  className={`btn btn-sm ${severity === lvl ? (lvl === 'High' ? 'btn-danger' : lvl === 'Medium' ? 'btn-primary' : 'btn-safe') : 'btn-secondary'}`}
                  onClick={() => setSeverity(lvl)}
                >
                  {lvl} Risk
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">{t.report.description}</label>
            <textarea 
              className="form-control"
              placeholder="Please describe what happened, specific hazards (e.g. non-working streetlights, loitering groups, isolated road), and any recommendations for other commuters..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Optional Image Upload Simulation */}
          <div className="form-group">
            <label className="form-label">Attach Photo or Evidence (Optional)</label>
            {selectedImage ? (
              <div style={{ position: 'relative', width: '100%', height: '140px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-medium)' }}>
                <img src={selectedImage.previewUrl} alt="Uploaded preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  type="button" 
                  onClick={() => setSelectedImage(null)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: '#FFF', borderRadius: '50%', padding: '4px' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '24px',
                background: 'var(--bg-surface)',
                border: '2px dashed var(--border-medium)',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#94A3B8',
                fontSize: '0.85rem'
              }}>
                <Upload size={22} color="#818CF8" />
                <span>Click or drag image of the location (JPG, PNG)</span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Anonymous Toggle */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <EyeOff size={20} color="#10B981" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF' }}>{t.report.anonymous}</div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Your personal name, phone and email will remain completely confidential.</div>
              </div>
            </div>

            <input 
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: '#10B981', cursor: 'pointer' }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block">
            <Shield size={18} />
            <span>{t.report.submitBtn}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
