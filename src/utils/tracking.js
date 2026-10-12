/**
 * Canonical Live Tracking and Location Sharing Utilities for Nivarya
 * 
 * Production Domain: https://nivarya-safety.vercel.app
 * Live URL Format: https://nivarya-safety.vercel.app/track/{trackingId}
 */

export const PRODUCTION_TRACKING_BASE_URL = 'https://nivarya-safety.vercel.app';

/**
 * Generates a dynamic, non-hardcoded tracking ID.
 * Example output: nivarya-live-7x9q2m4k2a
 */
export function generateTrackingId() {
  const rand = Math.random().toString(36).substring(2, 8);
  const timeHex = Date.now().toString(36).slice(-4);
  return `nivarya-live-${rand}${timeHex}`;
}

/**
 * Resolves current tracking base URL.
 * Automatically adapts to the active browser environment (localhost / LAN IP in dev,
 * or production domain when deployed).
 */
export function getTrackingBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin;
    const pathname = window.location.pathname || '';
    if (pathname.startsWith('/nivarya-safety')) {
      return `${origin}/nivarya-safety`;
    }
    return origin;
  }
  return PRODUCTION_TRACKING_BASE_URL;
}

/**
 * Builds the canonical tracking URL for the active journey/session.
 * Format: [origin]/track/{trackingId}
 * 
 * @param {string} [trackingId] - Active tracking ID.
 * @returns {string} The tracking URL.
 */
export function buildTrackingUrl(trackingId) {
  const cleanId = (typeof trackingId === 'string' && trackingId.trim()) 
    ? trackingId.trim().replace(/^\/+|\/+$/g, '') 
    : generateTrackingId();

  return `${getTrackingBaseUrl()}/track/${cleanId}`;
}

/**
 * Extracts and normalizes the tracking ID from the active browser URL.
 * Inspects pathname (/track/:id, /nivarya-safety/track/:id),
 * query parameters (?track=:id, ?id=:id, ?trackingId=:id),
 * and hash fragments (#/track/:id).
 *
 * @returns {string|null} The resolved tracking ID, or null if not found.
 */
export function extractTrackingIdFromUrl(customUrl) {
  let pathname = '';
  let search = '';
  let hash = '';

  if (typeof customUrl === 'string' && customUrl.trim()) {
    try {
      const parsed = new URL(customUrl, 'https://nivarya-safety.vercel.app');
      pathname = parsed.pathname || '';
      search = parsed.search || '';
      hash = parsed.hash || '';
    } catch (e) {
      pathname = customUrl;
    }
  } else if (typeof window !== 'undefined' && window.location) {
    pathname = window.location.pathname || '';
    search = window.location.search || '';
    hash = window.location.hash || '';
  } else {
    return null;
  }

  // 1. Pathname
  const pathMatch = pathname.match(/(?:^|\/)track(?:\/([^/?#]+))?/i);
  if (pathMatch && pathMatch[1]) {
    const raw = decodeURIComponent(pathMatch[1].replace(/\/+$/, '')).trim();
    if (raw && raw.toLowerCase() !== 'undefined' && raw.toLowerCase() !== 'null') {
      return raw;
    }
  }

  // 2. Query parameters
  try {
    const params = new URLSearchParams(search);
    const qVal = params.get('track') || params.get('trackingId') || params.get('id');
    if (qVal && qVal.trim() && qVal.toLowerCase() !== 'undefined' && qVal.toLowerCase() !== 'null') {
      return qVal.trim();
    }
  } catch (e) { /* ignore */ }

  // 3. Hash routing
  if (hash) {
    const hashMatch = hash.match(/track[=/]([^/?#&]+)/i);
    if (hashMatch && hashMatch[1]) {
      const hVal = decodeURIComponent(hashMatch[1]).trim();
      if (hVal && hVal.toLowerCase() !== 'undefined' && hVal.toLowerCase() !== 'null') {
        return hVal;
      }
    }
  }

  return null;
}


/**
 * Formats the standard Nivarya journey sharing message.
 * Strictly adheres to requirement:
 * "Hi [Name], I'm sharing my live Nivarya journey with you. You can use this link to view my current journey/location while it is active:
 * [REAL TRACKING LINK]"
 * 
 * @param {string} contactName - The actual selected trusted contact's name.
 * @param {string} trackingUrl - Real tracking URL for active journey.
 * @returns {string} The message text.
 */
export function formatTrackingShareMessage(contactName, trackingUrl) {
  const name = (contactName && contactName.trim()) ? contactName.trim() : 'Guardian';
  return `Hi ${name}, I'm sharing my live Nivarya journey with you. You can use this link to view my current journey/location while it is active:\n${trackingUrl}`;
}

/**
 * Executes the real sharing flow:
 * 1. Checks if the Web Share API (navigator.share) is supported.
 * 2. If supported, triggers the native share sheet with the formatted message and tracking URL.
 * 3. If unsupported or error occurs, falls back to copying the real tracking URL to clipboard.
 * 
 * @param {Object} options
 * @param {string} options.contactName - Selected trusted contact's name.
 * @param {string} options.trackingUrl - Real active journey tracking URL.
 * @param {Function} [options.onSheetOpened] - Called when native share sheet opened.
 * @param {Function} [options.onCopied] - Called when clipboard fallback was used.
 * @param {Function} [options.onError] - Called if sharing and clipboard both fail.
 * @returns {Promise<{ method: 'share' | 'clipboard' | 'none', success: boolean, dismissed?: boolean }>}
 */
export async function shareOrCopyTrackingLink({
  contactName,
  trackingUrl,
  onSheetOpened,
  onCopied,
  onError
}) {
  const message = formatTrackingShareMessage(contactName, trackingUrl);
  const shareData = {
    title: 'Nivarya Live Journey Tracking',
    text: message,
    url: trackingUrl
  };

  const isShareSupported = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  if (isShareSupported) {
    try {
      if (typeof onSheetOpened === 'function') {
        onSheetOpened();
      }
      await navigator.share(shareData);
      return { method: 'share', success: true };
    } catch (err) {
      // AbortError means user dismissed the native share sheet - this is normal interaction
      if (err?.name === 'AbortError') {
        return { method: 'share', success: true, dismissed: true };
      }
      console.warn('navigator.share failed, falling back to clipboard copy:', err);
    }
  }

  // Fallback to clipboard copy
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(trackingUrl);
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = trackingUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    if (typeof onCopied === 'function') {
      onCopied();
    }
    return { method: 'clipboard', success: true };
  } catch (clipErr) {
    console.error('Clipboard copy failed:', clipErr);
    if (typeof onError === 'function') {
      onError(clipErr);
    }
    return { method: 'none', success: false, error: clipErr };
  }
}
