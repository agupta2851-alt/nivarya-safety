import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { buildTrackingUrl, shareOrCopyTrackingLink } from '../utils/tracking';
import { isValidEmail, isValidIndianMobile, normalizePhoneNumber } from '../services/authService';
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
  Eye,
  EyeOff,
  Mail,
  Phone,
  Heart,
  Shield,
  Bell,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';

export const RELATIONSHIP_OPTIONS = [
  { value: 'Mother', label: 'Mother', icon: '❤️' },
  { value: 'Father', label: 'Father', icon: '🛡️' },
  { value: 'Sister', label: 'Sister', icon: '🌸' },
  { value: 'Brother', label: 'Brother', icon: '⚡' },
  { value: 'Friend', label: 'Friend', icon: '🤝' },
  { value: 'Partner', label: 'Partner', icon: '💜' },
  { value: 'Hostel Warden', label: 'Hostel Warden', icon: '🏢' },
  { value: 'Other', label: 'Other', icon: '👤' }
];

export const ALERT_STATUS_OPTIONS = [
  { value: 'active', label: 'Full Protection (Instant SOS + Live Journey)' },
  { value: 'sos_only', label: 'Emergency SOS Alerts Only' },
  { value: 'journey_only', label: 'Safe Journey Check-ins Only' },
  { value: 'muted', label: 'Standby / Manual Dial Only' }
];

export function getRelationshipMeta(relation) {
  const found = RELATIONSHIP_OPTIONS.find(r => r.value.toLowerCase() === (relation || '').toLowerCase());
  return found || { value: relation || 'Other', label: relation || 'Other', icon: '👤' };
}

export function maskPhoneNumber(phone) {
  if (!phone) return '••••••••••';
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 10) {
    const last3 = digitsOnly.slice(-3);
    const prefix = phone.startsWith('+') ? phone.slice(0, 3) : '+91';
    return `${prefix} ••••• ••${last3}`;
  }
  return '••••••••••';
}

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
    isLoadingContacts,
    showToast,
    currentCoordinates,
    currentTrackingId,
    getOrCreateActiveJourneyTracking,
    t 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedPhones, setRevealedPhones] = useState({});

  // Form fields
  const [formName, setFormName] = useState('');
  const [formRelation, setFormRelation] = useState('Mother');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAlertStatus, setFormAlertStatus] = useState('active');
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const togglePhoneVisibility = (contactId) => {
    setRevealedPhones(prev => ({
      ...prev,
      [contactId]: !prev[contactId]
    }));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormRelation('Mother');
    setFormPhone('');
    setFormEmail('');
    setFormAlertStatus('active');
    setFormIsPrimary(contacts.length === 0); // Default to primary if first contact
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingId(contact.id);
    setFormName(contact.name || '');
    setFormRelation(contact.relationship || contact.relation || 'Mother');
    setFormPhone(contact.phone || '');
    setFormEmail(contact.email || '');
    setFormAlertStatus(contact.alert_status || contact.alertStatus || 'active');
    setFormIsPrimary(Boolean(contact.is_primary ?? contact.isPrimary));
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    const trimmedName = formName.trim();
    const cleanPhone = formPhone.trim();
    const cleanEmail = formEmail.trim();

    if (!trimmedName) {
      errors.name = 'Full name is required';
    } else if (trimmedName.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formRelation) {
      errors.relation = 'Please select a relationship category';
    }

    if (!cleanPhone) {
      errors.phone = 'Mobile number is required';
    } else {
      const digitsOnly = cleanPhone.replace(/[^0-9]/g, '');
      if (digitsOnly.length < 10) {
        errors.phone = 'Please enter a valid 10-digit mobile number';
      }
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Please fix the validation errors in the form.', 'danger');
      return;
    }

    setIsSubmitting(true);
    try {
      const normalizedPhone = normalizePhoneNumber(formPhone.trim());
      const contactPayload = {
        name: formName.trim(),
        relationship: formRelation,
        relation: formRelation,
        phone: normalizedPhone,
        email: formEmail.trim() ? formEmail.trim().toLowerCase() : '',
        alert_status: formAlertStatus,
        alertStatus: formAlertStatus,
        is_primary: formIsPrimary,
        isPrimary: formIsPrimary
      };

      if (editingId) {
        await updateContact(editingId, contactPayload);
      } else {
        await addContact(contactPayload);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Contact submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (contactId) => {
    try {
      await deleteContact(contactId);
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleQuickCall = (phone, name) => {
    window.location.href = `tel:${phone}`;
    showToast(`Initiating quick call to ${name} (${phone})`, 'info');
  };

  const handleShareLiveTracking = async (contact) => {
    try {
      const contactName = contact?.name || 'Guardian';
      const { trackingUrl } = await getOrCreateActiveJourneyTracking(contactName);

      await shareOrCopyTrackingLink({
        contactName,
        trackingUrl,
        onSheetOpened: () => {
          showToast('Share sheet opened', 'safe');
        },
        onCopied: () => {
          showToast('Tracking link copied. You can paste it into WhatsApp or Messages.', 'safe');
        },
        onError: () => {
          showToast('Failed to share tracking link.', 'danger');
        }
      });
    } catch (err) {
      console.error('Error sharing live tracking:', err);
      showToast('Could not initialize live tracking session.', 'danger');
    }
  };

  return (
    <div className="trusted-contacts-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '70px', minHeight: '80vh' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px' }}>
        <div>
          <span className="section-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color="#6366F1" />
            <span>Safety Circle • Trusted Guardian Network</span>
          </span>
          <h1 className="section-title" style={{ marginBottom: '8px', fontSize: '1.85rem', fontWeight: 800 }}>
            Safety Circle
          </h1>
          <p className="section-desc" style={{ maxWidth: '640px', color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5 }}>
            People you trust who are notified during distress events, emergency SOS cascades, and automated Safe Journey check-ins.
          </p>
        </div>

        <button 
          id="add-trusted-contact-btn"
          className="btn btn-primary btn-lg"
          onClick={handleOpenAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)' }}
        >
          <UserPlus size={18} />
          <span>+ Add Trusted Contact</span>
        </button>
      </div>

      {/* Loading state indicator */}
      {isLoadingContacts && (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 12px auto' }} />
          <span>Synchronizing your Safety Circle from secure database...</span>
        </div>
      )}

      {/* Empty State (Requirement 9) */}
      {!isLoadingContacts && contacts.length === 0 && (
        <div 
          className="card animate-fade-in" 
          style={{
            textAlign: 'center',
            padding: '52px 24px',
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 29, 0.9) 100%)',
            border: '1px dashed rgba(99, 102, 241, 0.35)',
            borderRadius: '22px',
            maxWidth: '560px',
            margin: '40px auto'
          }}
        >
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            color: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto'
          }}>
            <Users size={32} />
          </div>

          <h2 style={{ fontSize: '1.45rem', color: '#FFFFFF', fontWeight: 800, marginBottom: '10px' }}>
            Your Safety Circle is empty.
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 26px auto', lineHeight: 1.55 }}>
            Add people you trust so Nivarya can notify them during supported safety events.
          </p>

          <button 
            id="empty-state-add-btn"
            className="btn btn-primary btn-lg"
            onClick={handleOpenAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 28px' }}
          >
            <UserPlus size={18} />
            <span>+ Add Trusted Contact</span>
          </button>
        </div>
      )}

      {/* Contacts Cards Grid (Requirement 8) */}
      {!isLoadingContacts && contacts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {contacts.map((contact, index) => {
            const relMeta = getRelationshipMeta(contact.relationship || contact.relation);
            const isSosSelected = selectedContactsForSos.includes(contact.id);
            const isJourneySelected = selectedContactsForJourney.includes(contact.id);
            const isRevealed = Boolean(revealedPhones[contact.id]);
            const isPrimary = Boolean(contact.is_primary || contact.isPrimary);
            const alertStatus = contact.alert_status || contact.alertStatus || 'active';

            return (
              <div 
                key={contact.id} 
                className="card animate-fade-in" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  borderRadius: '18px',
                  background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(10, 15, 29, 0.95) 100%)',
                  border: isPrimary ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid var(--border-subtle)',
                  boxShadow: isPrimary ? '0 10px 30px rgba(16, 185, 129, 0.12)' : '0 6px 20px rgba(0, 0, 0, 0.3)',
                  padding: '20px'
                }}
              >
                <div>
                  {/* Top Row: Avatar, Relationship, Name & Action Menu */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: contact.avatar_color || contact.avatarColor || '#6366F1',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.25rem',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                        position: 'relative',
                        flexShrink: 0
                      }}>
                        {contact.name?.charAt(0)?.toUpperCase() || 'U'}
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
                        {/* Requirement 8 format: ❤️ Mom / Archana's Mother */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.9rem' }}>{relMeta.icon}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {relMeta.label}
                          </span>
                          {isPrimary && (
                            <span className="badge badge-safe" style={{ fontSize: '0.7rem', padding: '2px 6px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <ShieldCheck size={11} />
                              Primary SOS
                            </span>
                          )}
                        </div>
                        <h3 style={{ fontSize: '1.18rem', color: '#FFFFFF', fontWeight: 700, margin: 0 }}>
                          {contact.name}
                        </h3>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenEdit(contact)}
                        title="Edit Contact"
                        style={{ padding: '6px', color: '#94A3B8' }}
                        aria-label={`Edit ${contact.name}`}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteConfirmId(contact.id)}
                        title="Delete Contact"
                        style={{ padding: '6px', color: '#F87171' }}
                        aria-label={`Delete ${contact.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Masked Private Phone Number (Requirement 8 & 10) */}
                  <div style={{
                    background: 'rgba(7, 11, 20, 0.7)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.88rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="var(--primary-light)" />
                      <span style={{ fontFamily: 'monospace', color: '#E2E8F0', letterSpacing: '0.5px', fontWeight: 600 }}>
                        {isRevealed ? contact.phone : maskPhoneNumber(contact.phone)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePhoneVisibility(contact.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ padding: '3px 6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}
                      title={isRevealed ? 'Hide phone number' : 'Show phone number'}
                      aria-label="Toggle phone masking"
                    >
                      {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>

                  {/* Optional Email Badge */}
                  {contact.email && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginBottom: '14px',
                      paddingLeft: '4px'
                    }}>
                      <Mail size={13} color="#94A3B8" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {contact.email}
                      </span>
                    </div>
                  )}

                  {/* Alert Subscription Configuration */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => toggleContactSosSelection(contact.id)}
                      className={`btn btn-sm ${isSosSelected ? 'btn-danger' : 'btn-ghost'}`}
                      style={{ fontSize: '0.72rem', padding: '5px 8px', flex: 1, justifyContent: 'center' }}
                      title="Toggle emergency SOS broadcasts"
                    >
                      <Bell size={12} style={{ marginRight: '4px' }} />
                      <span>{isSosSelected ? '✓ SOS Receiver' : '+ Add to SOS'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleContactJourneySelection(contact.id)}
                      className={`btn btn-sm ${isJourneySelected ? 'btn-safe' : 'btn-ghost'}`}
                      style={{ fontSize: '0.72rem', padding: '5px 8px', flex: 1, justifyContent: 'center' }}
                      title="Toggle Safe Journey route check-in updates"
                    >
                      <Share2 size={12} style={{ marginRight: '4px' }} />
                      <span>{isJourneySelected ? '✓ Journey Ping' : '+ Journey Ping'}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action Grid: Quick Call & Share Loc */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleQuickCall(contact.phone, contact.name)}
                    style={{ justifyContent: 'center' }}
                  >
                    <PhoneCall size={14} />
                    <span>Quick Call</span>
                  </button>

                  <button 
                    id={`share-live-tracking-btn-${contact.id}`}
                    className="btn btn-safe btn-sm"
                    onClick={() => handleShareLiveTracking(contact)}
                    style={{ justifyContent: 'center', whiteSpace: 'nowrap' }}
                    title={`Share Live Tracking with ${contact.name}`}
                  >
                    <Share2 size={14} />
                    <span>Share Live Tracking</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="sos-overlay animate-fade-in" style={{ zIndex: 9999 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', background: '#0F172A', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '18px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#FFFFFF', fontWeight: 700, margin: 0 }}>Remove Contact?</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Safety Circle Removal</span>
              </div>
            </div>

            <p style={{ color: '#CBD5E1', fontSize: '0.88rem', marginBottom: '22px', lineHeight: 1.5 }}>
              Are you sure you want to remove this contact from your Safety Circle? They will no longer receive emergency alerts or journey updates.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => handleDeleteConfirm(deleteConfirmId)}
              >
                Yes, Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="sos-overlay animate-fade-in" style={{ zIndex: 9998, padding: '16px' }}>
          <div 
            className="card" 
            style={{ 
              width: '100%', 
              maxWidth: '500px', 
              background: '#0F172A', 
              border: '1px solid var(--border-medium)', 
              borderRadius: '20px',
              padding: '26px 24px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(99, 102, 241, 0.2)',
              maxHeight: '92vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#FFFFFF', fontWeight: 800, margin: 0 }}>
                  {editingId ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {editingId ? 'Update details in your private Safety Circle' : 'Add a verified person to your private Safety Circle'}
                </span>
              </div>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setIsModalOpen(false)}
                style={{ padding: '6px', color: '#94A3B8' }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Field 1: Full Name */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: '#E2E8F0', marginBottom: '6px', display: 'block' }}>
                  Full Name <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input 
                  id="contact-form-name"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Archana Sharma, Mother"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formErrors.name) setFormErrors(prev => ({ ...prev, name: null }));
                  }}
                  style={{ borderColor: formErrors.name ? '#EF4444' : undefined }}
                />
                {formErrors.name && (
                  <div style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{formErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Field 2: Relationship Category (8 Required Options) */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: '#E2E8F0', marginBottom: '6px', display: 'block' }}>
                  Relationship <span style={{ color: '#F87171' }}>*</span>
                </label>
                <select 
                  id="contact-form-relationship"
                  className="input-field"
                  value={formRelation}
                  onChange={(e) => {
                    setFormRelation(e.target.value);
                    if (formErrors.relation) setFormErrors(prev => ({ ...prev, relation: null }));
                  }}
                  style={{ borderColor: formErrors.relation ? '#EF4444' : undefined }}
                >
                  {RELATIONSHIP_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
                {formErrors.relation && (
                  <div style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px' }}>
                    {formErrors.relation}
                  </div>
                )}
              </div>

              {/* Field 3: Mobile Number */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: '#E2E8F0', marginBottom: '6px', display: 'block' }}>
                  Mobile Number <span style={{ color: '#F87171' }}>*</span>
                </label>
                <input 
                  id="contact-form-phone"
                  type="tel"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={formPhone}
                  onChange={(e) => {
                    setFormPhone(e.target.value);
                    if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: null }));
                  }}
                  style={{ borderColor: formErrors.phone ? '#EF4444' : undefined }}
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Indian numbers or international format. Kept strictly private to your account.
                </span>
                {formErrors.phone && (
                  <div style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{formErrors.phone}</span>
                  </div>
                )}
              </div>

              {/* Field 4: Optional Email */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: '#E2E8F0', marginBottom: '6px', display: 'block' }}>
                  Email Address <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
                </label>
                <input 
                  id="contact-form-email"
                  type="email"
                  className="input-field"
                  placeholder="contact@example.com"
                  value={formEmail}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }));
                  }}
                  style={{ borderColor: formErrors.email ? '#EF4444' : undefined }}
                />
                {formErrors.email && (
                  <div style={{ color: '#F87171', fontSize: '0.78rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={12} />
                    <span>{formErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Field 5: Alert Permission / Status */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: '#E2E8F0', marginBottom: '6px', display: 'block' }}>
                  Alert Permissions & Status
                </label>
                <select 
                  id="contact-form-alert-status"
                  className="input-field"
                  value={formAlertStatus}
                  onChange={(e) => setFormAlertStatus(e.target.value)}
                >
                  {ALERT_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Contact Checkbox */}
              <div style={{
                background: 'rgba(7, 11, 20, 0.65)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px 14px',
                marginBottom: '26px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <input 
                  type="checkbox"
                  id="primaryContactCheckbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
                />
                <label htmlFor="primaryContactCheckbox" style={{ fontSize: '0.86rem', color: '#CBD5E1', cursor: 'pointer', lineHeight: 1.4 }}>
                  <strong style={{ color: '#FFFFFF', display: 'block' }}>Set as Primary Emergency Guardian</strong>
                  First person automatically dialed and prioritized during emergency alerts.
                </label>
              </div>

              {/* Modal Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  id="submit-contact-btn"
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Safety Circle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
