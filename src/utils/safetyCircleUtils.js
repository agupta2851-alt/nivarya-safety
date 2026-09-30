/**
 * Safety Circle & Trusted Contacts Utilities
 */

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

/**
 * Masks phone numbers to protect user privacy in UI cards.
 * E.g. "+91 98765 00001" -> "+91 ••••• ••001"
 */
export function maskPhoneNumber(phone) {
  if (!phone) return '••••••••••';
  const clean = phone.trim();
  const digitsOnly = clean.replace(/[^0-9]/g, '');
  if (digitsOnly.length >= 10) {
    const last3 = digitsOnly.slice(-3);
    const prefix = clean.startsWith('+') ? clean.slice(0, 3) : '+91';
    return `${prefix} ••••• ••${last3}`;
  }
  return '••••••••••';
}
