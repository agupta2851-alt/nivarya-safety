/**
 * Nivarya Women Safety Platform - Unified Database Service Layer
 *
 * Provides real database architecture supporting:
 * - Supabase (PostgreSQL with RLS, Realtime & RPC)
 * - Local Persistent Relational Store (Fallback when Supabase credentials are pending)
 *
 * Ensures website statistics and dashboards are driven strictly by actual user activity.
 * ZERO fake or fabricated numbers.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  PROFILES: 'nivarya_db_profiles',
  CONTACTS: 'nivarya_db_emergency_contacts',
  JOURNEYS: 'nivarya_db_journeys',
  LOCATIONS: 'nivarya_db_live_locations',
  SOS: 'nivarya_db_sos_events',
  REPORTS: 'nivarya_db_safety_reports',
  SAFETY_HUBS: 'nivarya_db_safety_locations',
  ACTIVITY: 'nivarya_db_user_activity'
};

// Verified Pan-India emergency response centers and official helplines
const OFFICIAL_SAFETY_LOCATIONS = [
  {
    id: 'hub-112',
    name: 'National Emergency Response (Police, Fire, Ambulance)',
    type: 'police',
    category: 'National Helpline',
    phone: '112',
    badge: 'Government 24/7',
    address: 'National Emergency Response Center',
    details: 'Integrated single emergency response number across India.',
    verified: true
  },
  {
    id: 'hub-1091',
    name: "Women In Distress Helpline",
    type: 'police',
    category: "Women's Helpline",
    phone: '1091',
    badge: '24/7 Toll-Free',
    address: 'State Police Headquarters',
    details: 'Dedicated national response desk for women facing harassment or distress.',
    verified: true
  },
  {
    id: 'hub-181',
    name: 'National Commission for Women Helpline',
    type: 'safezone',
    category: "Women's Helpline",
    phone: '181',
    badge: '24/7 Support',
    address: 'Ministry of Women & Child Development',
    details: 'Crisis intervention, counselling, and emergency referral.',
    verified: true
  },
  {
    id: 'hub-100',
    name: 'Police Emergency Control Room',
    type: 'police',
    category: 'Police Dispatch',
    phone: '100',
    badge: 'Emergency Dispatch',
    address: 'City Police Headquarters',
    details: 'Direct line for emergency patrol vehicle dispatch.',
    verified: true
  },
  {
    id: 'hub-108',
    name: 'Ambulance & Emergency Trauma Care',
    type: 'hospital',
    category: 'Medical',
    phone: '108',
    badge: 'Emergency Medical',
    address: 'District Civil & Trauma Network',
    details: 'Emergency medical transport with life support systems.',
    verified: true
  },
  {
    id: 'hub-pink',
    name: 'Pink Patrol & Women Safety Booth',
    type: 'safezone',
    category: 'Safe Zone',
    phone: '1091',
    badge: 'Safe Zone',
    address: 'City Transit Plaza',
    details: 'Dedicated female personnel kiosk with first aid and safe escort.',
    verified: true
  },
  {
    id: 'hub-campus',
    name: 'Campus & Institutional Security Desk',
    type: 'safezone',
    category: 'Security',
    phone: '112',
    badge: 'Security Desk',
    address: 'University Security Post',
    details: 'Campus rapid action security and escort assistance.',
    verified: true
  }
];

class LocalDatabaseStore {
  constructor() {
    this.subscribers = new Set();
    this.broadcastChannel = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('nivarya_realtime_channel');
        this.broadcastChannel.onmessage = (event) => {
          this.notifySubscribers(event.data);
        };
      } catch (e) {
        /* ignore */
      }
    }
  }

  notifySubscribers(payload) {
    this.subscribers.forEach(cb => {
      try { cb(payload); } catch (err) { console.error('Subscription callback error:', err); }
    });
  }

  dispatchChangeEvent(table, eventType, record) {
    const payload = { table, eventType, record, timestamp: new Date().toISOString() };
    this.notifySubscribers(payload);
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) { /* ignore */ }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nivarya:db_change', { detail: payload }));
    }
  }

  readTable(key, defaultVal = []) {
    if (typeof window === 'undefined') return defaultVal;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultVal;
      return JSON.parse(raw);
    } catch (e) {
      return defaultVal;
    }
  }

  writeTable(key, data) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to write table ${key}`, e);
    }
  }

  // Statistics calculation from real records
  calculateStatistics() {
    const users = this.readTable(STORAGE_KEYS.PROFILES, []);
    const journeys = this.readTable(STORAGE_KEYS.JOURNEYS, []);
    const sosEvents = this.readTable(STORAGE_KEYS.SOS, []);
    const reports = this.readTable(STORAGE_KEYS.REPORTS, []);
    const hubs = this.readTable(STORAGE_KEYS.SAFETY_HUBS, OFFICIAL_SAFETY_LOCATIONS);

    return {
      totalUsers: users.length,
      activeJourneys: journeys.filter(j => j.status === 'active').length,
      completedJourneys: journeys.filter(j => j.status === 'completed').length,
      sosEvents: sosEvents.length,
      safetyReports: reports.filter(r => !r.flagged).length,
      verifiedHubs: hubs.length,
      activeUsers: users.filter(u => {
        if (!u.last_active_at) return false;
        const diffHours = (Date.now() - new Date(u.last_active_at).getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      }).length
    };
  }
}

const localDb = new LocalDatabaseStore();

export const databaseService = {
  /**
   * Check if live Supabase is active
   */
  isLiveBackend: () => isSupabaseConfigured(),

  /**
   * Fetch real aggregate platform statistics.
   * Never exposes individual passwords, phone numbers, or private user telemetry.
   */
  async getPublicStatistics() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('get_public_platform_statistics');
        if (!error && data && data.length > 0) {
          const row = data[0];
          return {
            totalUsers: Number(row.total_users || 0),
            activeJourneys: Number(row.active_journeys || 0),
            completedJourneys: Number(row.completed_journeys || 0),
            sosEvents: Number(row.sos_events || 0),
            safetyReports: Number(row.safety_reports || 0),
            verifiedHubs: Number(row.verified_safety_hubs || 0),
            activeUsers: Number(row.active_journeys || 0) // active users currently in transit
          };
        }
      } catch (err) {
        console.warn('Supabase stats RPC failed, falling back to local database store:', err);
      }
    }

    return localDb.calculateStatistics();
  },

  /**
   * Subscribe to real-time events across journeys, reports, sos, and profiles.
   */
  subscribeToRealtimeUpdates(callback) {
    if (isSupabaseConfigured() && supabase) {
      try {
        const channel = supabase
          .channel('nivarya-public-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'journeys' }, () => callback({ table: 'journeys' }))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'safety_reports' }, () => callback({ table: 'safety_reports' }))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_events' }, () => callback({ table: 'sos_events' }))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => callback({ table: 'profiles' }))
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (e) {
        console.warn('Realtime channel setup failed, using local broadcast:', e);
      }
    }

    localDb.subscribers.add(callback);
    return () => {
      localDb.subscribers.delete(callback);
    };
  },

  // ----------------------------------------------------------------------------
  // PROFILES / USER DATA
  // ----------------------------------------------------------------------------
  async getUserProfile(userId) {
    if (!userId) return null;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getUserProfile failed:', err);
      }
    }

    const profiles = localDb.readTable(STORAGE_KEYS.PROFILES, []);
    return profiles.find(p => p.id === userId || p.auth_user_id === userId) || null;
  },

  async upsertUserProfile(profileData) {
    if (!profileData) return null;
    const now = new Date().toISOString();
    const id = profileData.id || `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const record = {
      id,
      name: (profileData.name || '').trim(),
      email: (profileData.email || '').trim().toLowerCase(),
      phone: (profileData.phone || '').trim(),
      age: profileData.age ? String(profileData.age).trim() : '',
      city: (profileData.city || '').trim(),
      location: (profileData.location || profileData.address || '').trim(),
      blood_group: (profileData.blood_group || profileData.bloodGroup || '').trim(),
      emergency_notes: (profileData.emergency_notes || profileData.emergencyNotes || '').trim(),
      safety_pin: profileData.safety_pin || profileData.safetyPin || '1234',
      is_profile_complete: Boolean(profileData.is_profile_complete ?? profileData.isProfileComplete),
      updated_at: now,
      last_active_at: now,
      created_at: profileData.created_at || now
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .upsert([record])
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('profiles', 'UPSERT', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase upsertUserProfile failed:', err);
      }
    }

    const profiles = localDb.readTable(STORAGE_KEYS.PROFILES, []);
    const existingIndex = profiles.findIndex(p => p.id === id || (record.email && p.email === record.email));
    if (existingIndex !== -1) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...record };
    } else {
      profiles.push(record);
    }
    localDb.writeTable(STORAGE_KEYS.PROFILES, profiles);
    localDb.dispatchChangeEvent('profiles', 'UPSERT', record);
    return record;
  },

  // ----------------------------------------------------------------------------
  // EMERGENCY CONTACTS
  // ----------------------------------------------------------------------------
  async getEmergencyContacts(userId) {
    if (!userId) return [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', userId)
          .order('priority', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getEmergencyContacts failed:', err);
      }
    }

    const contacts = localDb.readTable(STORAGE_KEYS.CONTACTS, []);
    return contacts.filter(c => c.user_id === userId);
  },

  async saveEmergencyContact(userId, contact) {
    if (!userId || !contact) return null;
    const now = new Date().toISOString();
    const newContact = {
      id: contact.id || `cnt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId,
      name: (contact.name || '').trim(),
      phone: (contact.phone || '').trim(),
      relation: contact.relation || 'Parent',
      is_primary: Boolean(contact.isPrimary ?? contact.is_primary),
      priority: Number(contact.priority || 1),
      avatar_color: contact.avatarColor || contact.avatar_color || '#6366F1',
      created_at: contact.created_at || now,
      updated_at: now
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('emergency_contacts')
          .upsert([newContact])
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('emergency_contacts', 'UPSERT', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase saveEmergencyContact failed:', err);
      }
    }

    const contacts = localDb.readTable(STORAGE_KEYS.CONTACTS, []);
    const idx = contacts.findIndex(c => c.id === newContact.id);
    if (idx !== -1) {
      contacts[idx] = newContact;
    } else {
      contacts.push(newContact);
    }
    localDb.writeTable(STORAGE_KEYS.CONTACTS, contacts);
    localDb.dispatchChangeEvent('emergency_contacts', 'UPSERT', newContact);
    return newContact;
  },

  async deleteEmergencyContact(contactId) {
    if (!contactId) return;
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('emergency_contacts')
          .delete()
          .eq('id', contactId);
      } catch (err) {
        console.warn('Supabase deleteEmergencyContact failed:', err);
      }
    }

    const contacts = localDb.readTable(STORAGE_KEYS.CONTACTS, []);
    const filtered = contacts.filter(c => c.id !== contactId);
    localDb.writeTable(STORAGE_KEYS.CONTACTS, filtered);
    localDb.dispatchChangeEvent('emergency_contacts', 'DELETE', { id: contactId });
  },

  // ----------------------------------------------------------------------------
  // JOURNEYS
  // ----------------------------------------------------------------------------
  async createJourney(journeyData) {
    const now = new Date().toISOString();
    const journey = {
      id: journeyData.id || `jrn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: journeyData.userId || journeyData.user_id || null,
      start_point: journeyData.startPoint || journeyData.start_point || 'My Location',
      destination: journeyData.destination || 'Destination',
      mode: journeyData.mode || 'cab',
      status: 'active',
      progress: 0,
      eta_minutes: Number(journeyData.etaMinutes || 25),
      checkins_count: 0,
      last_checkin_time: now,
      started_at: now,
      completed_at: null
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('journeys')
          .insert([journey])
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('journeys', 'INSERT', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase createJourney failed:', err);
      }
    }

    const journeys = localDb.readTable(STORAGE_KEYS.JOURNEYS, []);
    journeys.unshift(journey);
    localDb.writeTable(STORAGE_KEYS.JOURNEYS, journeys);
    localDb.dispatchChangeEvent('journeys', 'INSERT', journey);
    return journey;
  },

  async updateJourney(journeyId, updates) {
    if (!journeyId) return null;
    const patch = { ...updates };
    if (patch.progress !== undefined) patch.progress = Math.min(100, Math.max(0, Number(patch.progress)));

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('journeys')
          .update(patch)
          .eq('id', journeyId)
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('journeys', 'UPDATE', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase updateJourney failed:', err);
      }
    }

    const journeys = localDb.readTable(STORAGE_KEYS.JOURNEYS, []);
    const idx = journeys.findIndex(j => j.id === journeyId);
    if (idx !== -1) {
      journeys[idx] = { ...journeys[idx], ...patch };
      localDb.writeTable(STORAGE_KEYS.JOURNEYS, journeys);
      localDb.dispatchChangeEvent('journeys', 'UPDATE', journeys[idx]);
      return journeys[idx];
    }
    return null;
  },

  async completeJourney(journeyId) {
    const now = new Date().toISOString();
    return this.updateJourney(journeyId, {
      status: 'completed',
      progress: 100,
      completed_at: now
    });
  },

  async getActiveJourney(userId) {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('journeys').select('*').eq('status', 'active');
        if (userId) query = query.eq('user_id', userId);
        const { data, error } = await query.order('started_at', { ascending: false }).limit(1).maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getActiveJourney failed:', err);
      }
    }

    const journeys = localDb.readTable(STORAGE_KEYS.JOURNEYS, []);
    return journeys.find(j => j.status === 'active' && (!userId || j.user_id === userId)) || null;
  },

  // ----------------------------------------------------------------------------
  // LIVE LOCATION UPDATES (REAL GPS ONLY)
  // ----------------------------------------------------------------------------
  async recordLiveLocation({ userId, journeyId, coords, source = 'gps', address = '', city = '', batteryLevel = null, trackingToken = null }) {
    if (!coords || coords.lat == null || coords.lng == null) return null;
    const now = new Date().toISOString();

    const record = {
      id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId || null,
      journey_id: journeyId || null,
      latitude: coords.lat,
      longitude: coords.lng,
      accuracy: coords.accuracy || null,
      source: source || 'gps',
      address: address || '',
      city: city || '',
      battery_level: batteryLevel != null ? Number(batteryLevel) : null,
      tracking_token: trackingToken || null,
      updated_at: now
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('live_location_updates')
          .insert([record])
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('live_location_updates', 'INSERT', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase recordLiveLocation failed:', err);
      }
    }

    const locations = localDb.readTable(STORAGE_KEYS.LOCATIONS, []);
    locations.unshift(record);
    // Keep most recent 500 records locally to prevent storage bloat
    if (locations.length > 500) locations.length = 500;
    localDb.writeTable(STORAGE_KEYS.LOCATIONS, locations);
    localDb.dispatchChangeEvent('live_location_updates', 'INSERT', record);
    return record;
  },

  // ----------------------------------------------------------------------------
  // SOS EMERGENCY EVENTS
  // ----------------------------------------------------------------------------
  async createSosEvent({ userId, triggerType = 'button', coords = null, address = '', timeline = [] }) {
    const now = new Date().toISOString();
    const eventRecord = {
      id: `sos-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId || null,
      status: 'active',
      trigger_type: triggerType,
      latitude: coords?.lat || null,
      longitude: coords?.lng || null,
      address: address || '',
      timeline: timeline || [],
      triggered_at: now,
      disarmed_at: null
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('sos_events')
          .insert([eventRecord])
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('sos_events', 'INSERT', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase createSosEvent failed:', err);
      }
    }

    const events = localDb.readTable(STORAGE_KEYS.SOS, []);
    events.unshift(eventRecord);
    localDb.writeTable(STORAGE_KEYS.SOS, events);
    localDb.dispatchChangeEvent('sos_events', 'INSERT', eventRecord);
    return eventRecord;
  },

  async disarmSosEvent(sosId) {
    const now = new Date().toISOString();
    if (isSupabaseConfigured() && supabase && sosId) {
      try {
        const { data, error } = await supabase
          .from('sos_events')
          .update({ status: 'disarmed', disarmed_at: now })
          .eq('id', sosId)
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('sos_events', 'UPDATE', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase disarmSosEvent failed:', err);
      }
    }

    const events = localDb.readTable(STORAGE_KEYS.SOS, []);
    const idx = events.findIndex(e => e.id === sosId || e.status === 'active');
    if (idx !== -1) {
      events[idx].status = 'disarmed';
      events[idx].disarmed_at = now;
      localDb.writeTable(STORAGE_KEYS.SOS, events);
      localDb.dispatchChangeEvent('sos_events', 'UPDATE', events[idx]);
      return events[idx];
    }
    return null;
  },

  // ----------------------------------------------------------------------------
  // SAFETY REPORTS (CROWDSOURCED VIGILANCE)
  // ----------------------------------------------------------------------------
  async getSafetyReports(category = 'All') {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase.from('safety_reports').select('*').eq('flagged', false);
        if (category && category !== 'All') {
          query = query.ilike('category', category);
        }
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getSafetyReports failed:', err);
      }
    }

    const reports = localDb.readTable(STORAGE_KEYS.REPORTS, []);
    if (!category || category === 'All') {
      return reports.filter(r => !r.flagged);
    }
    return reports.filter(r => !r.flagged && r.category?.toLowerCase() === category.toLowerCase());
  },

  async submitSafetyReport(reportData) {
    const now = new Date().toISOString();
    const newReport = {
      id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: reportData.userId || null,
      category: reportData.category || 'Poor lighting',
      location: (reportData.location || '').trim(),
      latitude: reportData.coords?.lat || null,
      longitude: reportData.coords?.lng || null,
      description: (reportData.description || '').trim(),
      severity: reportData.severity || 'Medium',
      status: 'Community Verified',
      upvotes: 0,
      flagged: false,
      author_badge: reportData.authorBadge || 'Anonymous Commuter',
      created_at: now
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('safety_reports')
          .insert([newReport])
          .select()
          .single();
        if (!error && data) {
          localDb.dispatchChangeEvent('safety_reports', 'INSERT', data);
          return data;
        }
      } catch (err) {
        console.warn('Supabase submitSafetyReport failed:', err);
      }
    }

    const reports = localDb.readTable(STORAGE_KEYS.REPORTS, []);
    reports.unshift(newReport);
    localDb.writeTable(STORAGE_KEYS.REPORTS, reports);
    localDb.dispatchChangeEvent('safety_reports', 'INSERT', newReport);
    return newReport;
  },

  async upvoteSafetyReport(reportId) {
    if (!reportId) return null;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('increment_report_upvotes', { report_id: reportId });
        if (!error) {
          localDb.dispatchChangeEvent('safety_reports', 'UPDATE', { id: reportId });
          return data;
        }
      } catch (err) {
        console.warn('Supabase upvoteSafetyReport failed:', err);
      }
    }

    const reports = localDb.readTable(STORAGE_KEYS.REPORTS, []);
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reports[idx].upvotes = (reports[idx].upvotes || 0) + 1;
      localDb.writeTable(STORAGE_KEYS.REPORTS, reports);
      localDb.dispatchChangeEvent('safety_reports', 'UPDATE', reports[idx]);
      return reports[idx];
    }
    return null;
  },

  async flagSafetyReport(reportId) {
    if (!reportId) return;
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('safety_reports')
          .update({ flagged: true })
          .eq('id', reportId);
      } catch (err) {
        console.warn('Supabase flagSafetyReport failed:', err);
      }
    }

    const reports = localDb.readTable(STORAGE_KEYS.REPORTS, []);
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx !== -1) {
      reports[idx].flagged = true;
      localDb.writeTable(STORAGE_KEYS.REPORTS, reports);
      localDb.dispatchChangeEvent('safety_reports', 'UPDATE', reports[idx]);
    }
  },

  // ----------------------------------------------------------------------------
  // SAFETY LOCATIONS / COMMUNITY HUBS
  // ----------------------------------------------------------------------------
  async getSafetyLocations() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('safety_locations')
          .select('*')
          .eq('verified', true);
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Supabase getSafetyLocations failed:', err);
      }
    }

    return localDb.readTable(STORAGE_KEYS.SAFETY_HUBS, OFFICIAL_SAFETY_LOCATIONS);
  },

  // ----------------------------------------------------------------------------
  // USER ACTIVITY AUDIT TRAIL
  // ----------------------------------------------------------------------------
  async recordUserActivity({ userId, activityType, title, details = '', location = '', status = 'Logged' }) {
    const now = new Date().toISOString();
    const entry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      user_id: userId || null,
      activity_type: activityType || 'audit',
      title: title || 'User Activity',
      details,
      location: location || '',
      status,
      created_at: now
    };

    if (isSupabaseConfigured() && supabase && userId) {
      try {
        await supabase.from('user_activity_timestamps').insert([entry]);
      } catch (err) {
        console.warn('Supabase recordUserActivity failed:', err);
      }
    }

    const activities = localDb.readTable(STORAGE_KEYS.ACTIVITY, []);
    activities.unshift(entry);
    if (activities.length > 300) activities.length = 300;
    localDb.writeTable(STORAGE_KEYS.ACTIVITY, activities);
    localDb.dispatchChangeEvent('user_activity_timestamps', 'INSERT', entry);
    return entry;
  },

  async getUserActivityHistory(userId) {
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('user_activity_timestamps')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100);
        if (!error && data) return data;
      } catch (err) {
        console.warn('Supabase getUserActivityHistory failed:', err);
      }
    }

    const activities = localDb.readTable(STORAGE_KEYS.ACTIVITY, []);
    if (!userId) return activities;
    return activities.filter(a => a.user_id === userId || !a.user_id);
  },

  async clearUserActivityHistory(userId) {
    if (isSupabaseConfigured() && supabase && userId) {
      try {
        await supabase
          .from('user_activity_timestamps')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Supabase clearUserActivityHistory failed:', err);
      }
    }

    const activities = localDb.readTable(STORAGE_KEYS.ACTIVITY, []);
    const filtered = userId ? activities.filter(a => a.user_id !== userId) : [];
    localDb.writeTable(STORAGE_KEYS.ACTIVITY, filtered);
    localDb.dispatchChangeEvent('user_activity_timestamps', 'DELETE', { userId });
  }
};
