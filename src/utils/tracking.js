/**
 * Canonical Live Tracking and Location Sharing Utilities for Nivarya
 * 
 * Production Domain: https://nivarya-safety.vercel.app
 * Live URL Format: https://nivarya-safety.vercel.app/track/{trackingId}
 */

export const PRODUCTION_TRACKING_BASE_URL = 'https://nivarya-safety.vercel.app';

/**
 * Generates a dynamic, non-hardcoded tracking ID.
 * Avoids any static fallbacks such as 'nivarya-live-8923a1'.
 * Example output: nivarya-live-7x9q2m4k2a
 */
export function generateTrackingId() {
  const rand = Math.random().toString(36).substring(2, 8);
  const timeHex = Date.now().toString(36).slice(-4);
  return `nivarya-live-${rand}${timeHex}`;
}

/**
 * Builds the canonical sharing URL using the production domain.
 * Strictly adheres to: https://nivarya-safety.vercel.app/track/{trackingId}
 * Does NOT use window.location.origin to avoid NXDOMAIN or local routing issues in shared links.
 * 
 * @param {string} [trackingId] - Optional tracking ID. If missing, a dynamic ID is generated.
 * @returns {string} The canonical production tracking URL.
 */
export function buildTrackingUrl(trackingId) {
  const cleanId = (typeof trackingId === 'string' && trackingId.trim()) 
    ? trackingId.trim().replace(/^\/+|\/+$/g, '') 
    : generateTrackingId();

  return `${PRODUCTION_TRACKING_BASE_URL}/track/${cleanId}`;
}
