/**
 * Real GPS Geolocation & Movement Utilities for Safe Journey
 * 
 * Strictly uses real GPS coordinates and Haversine distance calculations.
 * ZERO synthetic coordinates, timers, or fake increments.
 */

// Average baseline transit speeds in km/h for distance estimation when road routing API is offline
export const MODE_SPEEDS_KMH = {
  cab: 25,
  metro: 35,
  bus: 20,
  auto: 22,
  walk: 4.5,
  twoWheeler: 25
};

/**
 * Calculates straight-line distance between two GPS coordinates using Haversine formula (in kilometers).
 */
export function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  if (lat1 === lat2 && lon1 === lon2) return 0;
  
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates distance in meters between two GPS coordinates.
 */
export function calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2) {
  return calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) * 1000;
}

/**
 * Determines whether a GPS coordinate change represents actual physical movement
 * rather than stationary device GPS jitter / noise.
 * 
 * Normal mobile / browser GPS exhibits 10m - 25m stationary jitter.
 * 
 * @param {number} distanceMeters - Distance moved from previous fix
 * @param {number} accuracy - Current GPS fix accuracy in meters
 * @returns {boolean} True if movement is above the noise floor
 */
export function isSignificantMovement(distanceMeters, accuracy = 15) {
  if (distanceMeters == null || isNaN(distanceMeters)) return false;
  // Dynamic threshold: at least 20 meters, or scaled to accuracy radius (up to 45m max)
  const threshold = Math.max(20, Math.min(accuracy || 20, 45));
  return distanceMeters >= threshold;
}

/**
 * Attempts real geocoding of an address query using OpenStreetMap Nominatim.
 * Has strict timeout and error handling. Returns null if offline or not found.
 */
export async function geocodeDestination(address) {
  if (!address || typeof address !== 'string' || !address.trim()) return null;
  const query = address.trim();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' }
      }
    );
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (err) {
    // Offline, rate-limited, or aborted
  }
  return null;
}

/**
 * Milestones for real journey progression.
 * Milestones only advance when real GPS movement or distance actually satisfies the criteria.
 */
export const JOURNEY_MILESTONES = [
  { id: 'm-departed', label: 'Departed', thresholdProgress: 0, minMetersFromOrigin: 30 },
  { id: 'm-25', label: 'Quarter Transit (25%)', thresholdProgress: 25 },
  { id: 'm-50', label: 'Mid Transit (50%)', thresholdProgress: 50 },
  { id: 'm-75', label: 'Approaching (75%)', thresholdProgress: 75 },
  { id: 'm-arrived', label: 'Arrived (Destination)', thresholdProgress: 100 }
];

/**
 * Evaluates which milestones are completed based on real GPS metrics.
 */
export function evaluateMilestones({ progress, distanceTraveledKm, isArrived }) {
  const distanceMeters = (distanceTraveledKm || 0) * 1000;
  return JOURNEY_MILESTONES.map(m => {
    let completed = false;
    if (isArrived) {
      completed = true;
    } else if (m.id === 'm-departed') {
      // Departed is only completed if the user has physically moved away from origin (>30m)
      // or journey progress is > 0
      completed = distanceMeters >= (m.minMetersFromOrigin || 30) || (progress || 0) > 0;
    } else {
      completed = (progress || 0) >= m.thresholdProgress;
    }
    return {
      ...m,
      completed
    };
  });
}
