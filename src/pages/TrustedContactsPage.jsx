import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { contactCategories } from '../data/initialData';
import { buildTrackingUrl } from '../utils/tracking';
import { 
  Users, 
  UserPlus, 
  PhoneCall, 
  Share2, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Check, 
  X, 
  AlertCircle,
  Radio,
  CheckCircle2
} from 'lucide-react';

export default function TrustedContactsPage() {
  const { 
    contacts, 
    addContact, 
    updateContact, 
    deleteContact, 
    selectedContactsForSos,
    toggleContactSosSelection,
    selectedContactsForJourney,
    toggleContactJourneySelection,
    showToast,
    currentCoordinates,
    currentTrackingId,
    t 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('Parent');
  const [formPhone, setFormPhone] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(false);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormRelation('Parent');
    setFormPhone('');
    setFormIsPrimary(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingId(contact.id);
    setFormName(contact.name);
    setFormRelation(contact.relation);
    setFormPhone(contact.phone);
    setFormIsPrimary(contact.isPrimary || false);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      showToast('Please enter both name and contact number', 'danger');
      return;
    }

    if (editingId) {
      updateContact(editingId, {
        name: formName.trim(),
        relation: formRelation,
        phone: formPhone.trim(),
        isPrimary: formIsPrimary
      });
    } else {
      addContact({
        name: formName.trim(),
        relation: formRelation,
        phone: formPhone.trim(),
        isPrimary: formIsPrimary
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickCall = (phone, name) => {
    window.location.href = `tel:${phone}`;
    showToast(`Quick dialing ${name} (${phone})`, 'info');
  };

  const handleShareLocation = (name) => {
    const trackingUrl = buildTrackingUrl(currentTrackingId);
    const locationUrl = currentCoordinates?.lat != null 
      ? `https://maps.google.com/?q=${currentCoordinates.lat},${currentCoordinates.lng}` 
      : trackingUrl;
    navigator.clipboard.writeText(locationUrl);
    showToast(`Live tracking link copied to share with ${name}!`, 'safe');
  };

  return (
    <div className="trusted-contacts-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
        <div>
          <span className="section-tag">
            <Users size={14} />
            <span>Guardian Network (Priority Order)</span>
          </span>
          <h1 className="section-title" style={{ marginBottom: '8px' }}>
            {t.contactsPage.title}
          </h1>
          <p className="section-desc">
            Organized by priority order. Configure who receives instant emergency SOS cascades and live Safe Journey check-ins.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-lg"
          onClick={handleOpenAdd}
        >
          <UserPlus size={18} />
          <span>{t.contactsPage.addBtn}</span>
        </button>
      </div>

      {/* Contacts Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {contacts.map((contact, index) => {
          const isSosSelected = selectedContactsForSos.includes(contact.id);
          const isJourneySelected = selectedContactsForJourney.includes(contact.id);

          return (
            <div key={contact.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: contact.avatarColor || '#6366F1',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.2rem',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      position: 'relative'
                    }}>
                      {contact.name.charAt(0)}
                      <span style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        width: '18px',
                        height: '18px',
                        background: '#0F172A',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '50%',
                        fontSize: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)'
                      }}>
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700 }}>{contact.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                          {contact.relation}
                        </span>
                        {contact.isPrimary && (
                          <span className="badge badge-safe" style={{ fontSize: '0.72rem' }}>
                            <ShieldCheck size={12} />
                            Primary SOS
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleOpenEdit(contact)}
                      title="Edit Contact"
                      style={{ padding: '6px' }}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => deleteContact(contact.id)}
                      title="Delete Contact"
                      style={{ padding: '6px', color: '#F87171' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  marginBottom: '14px',
                  fontSize: '0.88rem',
                  color: '#CBD5E1',
                  fontFamily: 'monospace'
                }}>
                  📞 {contact.phone}
                </div>

                {/* Subscriptions Pills: SOS Alert vs Safe Journey */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => toggleContactSosSelection(contact.id)}
                    className={`btn btn-sm ${isSosSelected ? 'btn-danger' : 'btn-ghost'}`}
                    style={{ fontSize: '0.72rem', padding: '4px 8px', flex: 1, justifyContent: 'center' }}
                  >
                    <span>{isSosSelected ? '✓ SOS Receiver' : '+ Add to SOS'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleContactJourneySelection(contact.id)}
                    className={`btn btn-sm ${isJourneySelected ? 'btn-safe' : 'btn-ghost'}`}
                    style={{ fontSize: '0.72rem', padding: '4px 8px', flex: 1, justifyContent: 'center' }}
                  >
                    <span>{isJourneySelected ? '✓ Journey Ping' : '+ Journey Ping'}</span>
                  </button>
                </div>
              </div>

              {/* Actions: Quick Call & Share Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleQuickCall(contact.phone, contact.name)}
                >
                  <PhoneCall size={14} />
                  <span>{t.contactsPage.quickCall}</span>
                </button>

                <button 
                  className="btn btn-safe btn-sm"
                  onClick={() => handleShareLocation(contact.name)}
                >
                  <Share2 size={14} />
                  <span>Share Loc</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="sos-overlay">
          <div className="card" style={{ width: '100%', maxWidth: '480px', background: '#0F172A', border: '1px solid var(--border-medium)', borderRadius: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700 }}>
                {editingId ? 'Edit Trusted Contact' : 'Add New Trusted Contact'}
              </h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="e.g. Guardian / Contact Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Relationship Category (8 Types)</label>
                <select 
                  className="input-field"
                  value={formRelation}
                  onChange={(e) => setFormRelation(e.target.value)}
                >
                  {contactCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (with country code)</label>
                <input 
                  type="tel"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <input 
                  type="checkbox"
                  id="primaryContactCheckbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#6366F1', cursor: 'pointer' }}
                />
                <label htmlFor="primaryContactCheckbox" style={{ fontSize: '0.88rem', color: '#CBD5E1', cursor: 'pointer' }}>
                  Mark as Primary SOS Contact (first to be notified)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
