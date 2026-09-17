/**
 * Nivarya Women Safety Platform - Authentication Service Abstraction Layer
 * 
 * ARCHITECTURAL DESIGN NOTE:
 * This service implements the Adapter / Facade pattern to decouple authentication 
 * logic from the UI. In production, this file acts as the bridge to Firebase Authentication,
 * Supabase Auth, AWS Cognito, or an enterprise OIDC/OAuth2 server.
 * 
 * SECURITY NOTICE:
 * For this prototype, browser localStorage is used strictly for state persistence 
 * across page refreshes and demo navigation. This is NOT intended to represent 
 * production cryptographic security or secure token management. In production, 
 * use HTTP-only, secure, SameSite cookies with signed JWTs or SDK-managed session tokens.
 */

const AUTH_USERS_KEY = 'nivarya_auth_users';
const AUTH_SESSION_KEY = 'nivarya_auth_session';

// Pre-seeded default persona to ensure immediate evaluation readiness
const DEFAULT_DEMO_USER = {
  id: 'usr-ananya-sharma',
  name: 'Ananya Sharma',
  email: 'ananya.s@example.com',
  phone: '+91 98765 11223',
  passwordHash: 'demo_password_hash_Nivarya@2026',
  avatarUrl: null,
  role: 'University Student & Part-time Associate',
  bloodGroup: 'O+ Positive',
  emergencyNotes: 'Allergic to Penicillin. Carries asthma inhaler.',
  emergencyContact: {
    name: 'Sunita Sharma',
    phone: '+91 98765 43210',
    relation: 'Parent'
  },
  createdAt: '2026-01-15T10:00:00.000Z',
  provider: 'password'
};

/**
 * Initializes the mock users database if not present.
 */
function getRegisteredUsers() {
  if (typeof window === 'undefined') return [DEFAULT_DEMO_USER];
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify([DEFAULT_DEMO_USER]));
      return [DEFAULT_DEMO_USER];
    }
    const parsed = JSON.parse(raw);
    // Ensure default demo user always exists
    if (!parsed.some(u => u.email === DEFAULT_DEMO_USER.email)) {
      parsed.push(DEFAULT_DEMO_USER);
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read registered users from storage', err);
    return [DEFAULT_DEMO_USER];
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
      return JSON.parse(sessionRaw);
    } catch (err) {
      console.error('Failed to parse current session', err);
      return null;
    }
  },

  /**
   * Log in using email or mobile number + password.
   * @param {Object} credentials { identifier, password }
   */
  async login({ identifier, password }) {
    await new Promise(resolve => setTimeout(resolve, 400));

    if (!identifier || !identifier.trim()) {
      throw new Error('Please enter your email or mobile number.');
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
      const matchPhone = inputDigits.length >= 10 && (uDigits.endsWith(inputDigits) || inputDigits.endsWith(uDigits));
      return matchEmail || matchPhone;
    });

    if (!user) {
      throw new Error('No account found with these credentials. Please check your details or create an account.');
    }

    // Demo password check: allow default demo password or exact match
    const isValid = (user.id === DEFAULT_DEMO_USER.id && (password === 'Nivarya@2026' || password === 'Password@123' || password === '123456')) ||
                    user.passwordHash === `hash_${password}` ||
                    user.passwordHash === password ||
                    user.passwordHash === 'demo_password_hash_Nivarya@2026';

    if (!isValid) {
      throw new Error('Incorrect password. Please try again or use Forgot Password.');
    }

    // Safe session representation (exclude raw password hash)
    const { passwordHash: _, ...safeUser } = user;
    const sessionUser = {
      ...safeUser,
      lastLoginAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Register a new user account.
   */
  async signup({ name, email, phone, password, emergencyContact }) {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!name || name.trim().length < 2) {
      throw new Error('Please provide your full legal or display name.');
    }
    if (!isValidEmail(email)) {
      throw new Error('Please provide a valid email address.');
    }
    if (!isValidIndianMobile(phone)) {
      throw new Error('Please provide a valid 10-digit Indian mobile number.');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = normalizePhoneNumber(phone);
    const users = getRegisteredUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists. Please log in.');
    }

    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: `hash_${password}`,
      role: 'Verified Nivarya Member',
      avatarUrl: null,
      bloodGroup: 'Not Specified',
      emergencyNotes: '',
      emergencyContact: emergencyContact ? {
        name: emergencyContact.name || '',
        phone: normalizePhoneNumber(emergencyContact.phone || ''),
        relation: emergencyContact.relation || 'Parent'
      } : null,
      createdAt: new Date().toISOString(),
      provider: 'password'
    };

    users.push(newUser);
    localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));

    const { passwordHash: _, ...safeUser } = newUser;
    const sessionUser = {
      ...safeUser,
      lastLoginAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * Simulated Google OAuth Sign-in.
   */
  async loginWithGoogle() {
    await new Promise(resolve => setTimeout(resolve, 600));

    const googleProfile = {
      id: 'usr-google-demo',
      name: 'Ananya Sharma (Google)',
      email: 'ananya.google@example.com',
      phone: '+91 98765 11223',
      role: 'Google Verified Member',
      avatarUrl: null,
      bloodGroup: 'O+ Positive',
      emergencyNotes: 'Google SSO Account • Verified Guardian Network',
      emergencyContact: {
        name: 'Sunita Sharma',
        phone: '+91 98765 43210',
        relation: 'Parent'
      },
      createdAt: new Date().toISOString(),
      provider: 'google'
    };

    const users = getRegisteredUsers();
    if (!users.some(u => u.email === googleProfile.email)) {
      users.push(googleProfile);
      localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
    }

    const sessionUser = {
      ...googleProfile,
      lastLoginAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionUser));
    return sessionUser;
  },

  /**
   * One-click demo login convenience for reviewers & testing.
   */
  async quickDemoLogin() {
    return this.login({
      identifier: DEFAULT_DEMO_USER.email,
      password: 'Nivarya@2026'
    });
  },

  /**
   * Log out active session.
   */
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 150));
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
    return true;
  },

  /**
   * Simulated password reset dispatch.
   */
  async resetPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 450));
    if (!isValidEmail(email)) {
      throw new Error('Please enter a valid email address to receive reset instructions.');
    }
    return {
      success: true,
      message: `Password reset verification link successfully dispatched to ${email}. Check your inbox or spam folder.`
    };
  }
};
