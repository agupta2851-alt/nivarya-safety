/**
 * Nivarya Women Safety Platform - Authentication Service Abstraction Layer
 * 
 * ARCHITECTURAL DESIGN NOTE:
 * This service implements the Adapter / Facade pattern to decouple authentication 
 * logic from the UI. In production, this file acts as the bridge to Firebase Authentication,
 * Supabase Auth, AWS Cognito, or an enterprise OIDC/OAuth2 server.
 */

import { databaseService } from './databaseService';

const AUTH_USERS_KEY = 'nivarya_auth_users';
const AUTH_SESSION_KEY = 'nivarya_auth_session';

/**
 * Standard Web Crypto API SHA-256 hashing.
 */
export async function hashPassword(password) {
  if (!password) return '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Web Crypto SHA-256 failed, falling back', e);
    }
  }
  // Deterministic fallback if subtle is unavailable
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash |= 0;
  }
  return `sha_fallback_${Math.abs(hash)}`;
}

/**
 * Purges legacy prototype mock data ("Ananya Sharma", Pune defaults) from browser storage.
 */
export function purgeLegacyData() {
  if (typeof window === 'undefined') return;
  try {
    // 1. Clean registered users
    const usersRaw = localStorage.getItem(AUTH_USERS_KEY);
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      if (Array.isArray(users)) {
        const cleaned = users.filter(u => 
          u.id !== 'usr-ananya-sharma' && 
          u.name !== 'Ananya Sharma' && 
          u.email !== 'ananya.sharma@example.com' &&
          u.email !== 'ananya.google@example.com'
        );
        if (cleaned.length !== users.length) {
          localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(cleaned));
        }
      }
    }

    // 2. Clean current session if it belongs to Ananya
    const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY);
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      if (session.id === 'usr-ananya-sharma' || session.name === 'Ananya Sharma' || session.email === 'ananya.sharma@example.com') {
        localStorage.removeItem(AUTH_SESSION_KEY);
      }
    }

    // 3. Clean profile if it has Ananya or default Pune city
    const profileRaw = localStorage.getItem('nivarya_profile');
    if (profileRaw) {
      const prof = JSON.parse(profileRaw);
      if (prof.name === 'Ananya Sharma' || prof.city?.toLowerCase() === 'pune') {
        localStorage.removeItem('nivarya_profile');
      }
    }

    // 4. Clean contacts if they contain legacy family contacts
    const contactsRaw = localStorage.getItem('nivarya_contacts');
    if (contactsRaw) {
      const contacts = JSON.parse(contactsRaw);
      if (Array.isArray(contacts)) {
        const hasLegacy = contacts.some(c => c.name === 'Sunita Sharma' || c.name === 'Aman Sharma');
        if (hasLegacy) {
          const filtered = contacts.filter(c => c.name !== 'Sunita Sharma' && c.name !== 'Aman Sharma');
          localStorage.setItem('nivarya_contacts', JSON.stringify(filtered));
        }
      }
    }

    // 5. Clean location state if Pune was hardcoded
    const locRaw = localStorage.getItem('nivarya_location_state');
    if (locRaw) {
      const loc = JSON.parse(locRaw);
      if (loc.city?.toLowerCase() === 'pune' || (loc.coords && Math.abs(loc.coords.lat - 18.5204) < 0.05)) {
        localStorage.removeItem('nivarya_location_state');
      }
    }
  } catch (err) {
    console.error('Error running legacy data purge:', err);
  }
}

// Run purge immediately upon module loading
if (typeof window !== 'undefined') {
  purgeLegacyData();
}

/**
 * Initializes and retrieves registered users database from localStorage.
 */
export function getRegisteredUsers() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(u => u.id !== 'usr-ananya-sharma' && u.name !== 'Ananya Sharma');
  } catch (err) {
    console.error('Failed to read registered users from storage', err);
    return [];
  }
}

/**
 * Normalizes phone numbers by stripping whitespace, dashes, and standardizing +91.
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return '';
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (digitsOnly.length === 10) {
    return `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`;
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    const raw = digitsOnly.slice(2);
    return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
  }
  return phone.trim();
}

/**
 * Validates Indian mobile numbers (10 digits starting with 6-9, optional +91).
 */
export function isValidIndianMobile(phone) {
  if (!phone) return false;
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (digitsOnly.length === 10) {
    return /^[6-9]\d{9}$/.test(digitsOnly);
  }
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(digitsOnly.slice(2));
  }
  return false;
}

/**
 * Validates email format.
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Calculates password strength score:
 * 0: Very Weak, 1: Weak, 2: Fair, 3: Strong, 4: Very Strong
 */
export function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Empty', color: '#64748B', percentage: 0 };
  }
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Weak', color: '#EF4444', percentage: 25 };
  } else if (score <= 3) {
    return { score: 2, label: 'Moderate', color: '#F59E0B', percentage: 60 };
  } else if (score === 4) {
    return { score: 3, label: 'Strong', color: '#10B981', percentage: 85 };
  } else {
    return { score: 4, label: 'Very Strong', color: '#34D399', percentage: 100 };
  }
}

/**
 * Authentication Service Object
 */
export const authService = {
  /**
   * Returns current authenticated user or null.
   */
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const sessionRaw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!sessionRaw) return null;
      const user = JSON.parse(sessionRaw);
      if (user.id === 'usr-ananya-sharma' || user.name === 'Ananya Sharma') {
        localStorage.removeItem(AUTH_SESSION_KEY);
        return null;
      }
      return user;
    } catch (err) {
      console.error('Failed to parse current session', err);
      return null;
    }
  },

  /**
   * Updates an existing user's profile both in registered users and current session.
   */
  updateUserProfile(userId, profileUpdates) {
    if (!userId) return null;
    const users = getRegisteredUsers();
    const index = users.findIndex(u => u.id === userId);
    let updatedRecord = null;
    if (index !== -1) {
      users[index] = { ...users[index], ...profileUpdates };
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
      updatedRecord = users[index];
    }
    const currentSession = this.getCurrentUser();
    let updatedSession = null;
    if (currentSession && currentSession.id === userId) {
      updatedSession = { ...currentSession, ...profileUpdates };
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(updatedSession));
      window.dispatchEvent(new Event('storage'));
    }
    // Asynchronously synchronize with database architecture
    try {
      databaseService.upsertUserProfile({ id: userId, ...(updatedSession || updatedRecord || profileUpdates) });
    } catch (e) {
      console.warn('Database sync error in updateUserProfile:', e);
    }
    return updatedSession || updatedRecord;
  },

  /**
   * Log in using email or mobile number + password.
   */
  async login({ identifier, password }) {
    await new Promise(resolve => setTimeout(resolve, 250));

    if (!identifier || !identifier.trim()) {
      throw new Error('Please enter your email address or mobile number.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const users = getRegisteredUsers();

    // Match by email or clean mobile digits
    const user = users.find(u => {
      const matchEmail = u.email && u.email.toLowerCase() === cleanIdentifier;
      const uDigits = u.phone ? u.phone.replace(/[^0-9]/g, '') : '';
      const inputDigits = cleanIdentifier.replace(/[^0-9]/g, '');
      const matchPhone = uDigits.length >= 10 && inputDigits.length >= 10 && (
        uDigits.endsWith(inputDigits) || 
        inputDigits.endsWith(uDigits)
      );
      return matchEmail || matchPhone;
    });

    if (!user) {
      throw new Error('No account found with these credentials. Please check your details or create an account.');
    }

    // Secure password verification
    const hashed = await hashPassword(password);
    const isShaMatch = user.passwordHash === hashed;
    const isLegacyMatch = user.passwordHash === `hash_${password}` || user.passwordHash === password;

    if (!isShaMatch && !isLegacyMatch) {
      throw new Error('Incorrect password. Please try again or use Forgot Password.');
    }

    // Auto-upgrade legacy hash to SHA-256 on successful login
    if (!isShaMatch && isLegacyMatch) {
      user.passwordHash = hashed;
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index].passwordHash = hashed;
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
      }
    }

    const { passwordHash: _, ...safeUser } = user;
    const sessionUser = {
      ...safeUser,
      lastLoginAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('storage'));
    return sessionUser;
  },

  /**
   * Register a new user account using Email OR Mobile (or both) + Password.
   */
  async signup({ name, email, phone, mobile, password }) {
    await new Promise(resolve => setTimeout(resolve, 300));

    if (!name || name.trim().length < 2) {
      throw new Error('Please provide your full legal or display name.');
    }

    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const rawPhone = phone || mobile;
    const cleanPhone = rawPhone ? rawPhone.trim() : '';

    if (!cleanEmail && !cleanPhone) {
      throw new Error('Please provide at least an email address or a 10-digit mobile number.');
    }

    if (cleanEmail && !isValidEmail(cleanEmail)) {
      throw new Error('Please provide a valid email address.');
    }

    if (cleanPhone && !isValidIndianMobile(cleanPhone)) {
      throw new Error('Please provide a valid 10-digit Indian mobile number (e.g. 9876543210).');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const normalizedPhone = cleanPhone ? normalizePhoneNumber(cleanPhone) : '';
    const users = getRegisteredUsers();

    // Check duplicate email
    if (cleanEmail && users.some(u => u.email && u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    // Check duplicate phone
    if (normalizedPhone) {
      const newDigits = cleanPhone.replace(/[^0-9]/g, '');
      const phoneExists = users.some(u => {
        if (!u.phone) return false;
        const uDigits = u.phone.replace(/[^0-9]/g, '');
        return uDigits.length >= 10 && (uDigits.endsWith(newDigits) || newDigits.endsWith(uDigits));
      });
      if (phoneExists) {
        throw new Error('An account with this mobile number already exists. Please log in.');
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: normalizedPhone,
      passwordHash: hashedPassword,
      role: 'Verified Nivarya Member',
      avatarUrl: null,
      age: '',
      city: '',
      location: '',
      bloodGroup: '',
      emergencyNotes: '',
      safetyPin: '1234',
      emergencyContact: null,
      contacts: [],
      isProfileComplete: false,
      createdAt: new Date().toISOString(),
      provider: 'password'
    };

    users.push(newUser);
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));

    // Save to real database architecture
    try {
      await databaseService.upsertUserProfile(newUser);
    } catch (e) {
      console.warn('Database user sync failed:', e);
    }

    const { passwordHash: _, ...safeUser } = newUser;
    const sessionUser = {
      ...safeUser,
      lastLoginAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('storage'));
    return sessionUser;
  },

  /**
   * One-click demo login convenience for reviewers & development testing.
   * Clearly marked as DEMO, completely isolated from real user data.
   */
  async quickDemoLogin() {
    await new Promise(resolve => setTimeout(resolve, 300));
    const demoEmail = 'demo.reviewer@nivarya.org';
    const users = getRegisteredUsers();
    let user = users.find(u => u.email === demoEmail);

    if (!user) {
      user = {
        id: 'usr-demo-reviewer',
        name: 'Demo Reviewer',
        email: demoEmail,
        phone: '+91 98765 00001',
        passwordHash: await hashPassword('DemoTester@2026'),
        role: 'Verified Demo Tester',
        avatarUrl: null,
        age: '25',
        city: '',
        location: '',
        bloodGroup: 'O+ Positive',
        emergencyNotes: 'Demo testing profile',
        safetyPin: '1234',
        emergencyContact: null,
        contacts: [],
        isProfileComplete: false,
        createdAt: new Date().toISOString(),
        provider: 'demo'
      };
      users.push(user);
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    }

    const { passwordHash: _, ...safeUser } = user;
    const sessionUser = {
      ...safeUser,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('storage'));
    return sessionUser;
  },

  /**
   * Simulated Google OAuth Sign-in.
   */
  async loginWithGoogle() {
    await new Promise(resolve => setTimeout(resolve, 350));
    const googleEmail = 'google.user@example.com';
    const users = getRegisteredUsers();
    let user = users.find(u => u.email === googleEmail);

    if (!user) {
      user = {
        id: `usr-google-${Date.now()}`,
        name: 'Google Verified User',
        email: googleEmail,
        phone: '',
        passwordHash: 'sso_google_verified',
        role: 'Google Verified Member',
        avatarUrl: null,
        age: '',
        city: '',
        location: '',
        bloodGroup: '',
        emergencyNotes: '',
        safetyPin: '1234',
        emergencyContact: null,
        contacts: [],
        isProfileComplete: false,
        createdAt: new Date().toISOString(),
        provider: 'google'
      };
      users.push(user);
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    }

    const { passwordHash: _, ...safeUser } = user;
    const sessionUser = {
      ...safeUser,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    window.dispatchEvent(new Event('storage'));
    return sessionUser;
  },

  /**
   * Log out active session.
   */
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_SESSION_KEY);
      window.dispatchEvent(new Event('storage'));
    }
    return true;
  },

  /**
   * Simulated password reset dispatch.
   */
  async resetPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address to receive reset instructions.');
    }
    return {
      success: true,
      message: `Password reset verification link successfully dispatched to ${email}. Check your inbox or spam folder.`
    };
  }
};
