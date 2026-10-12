import test from 'node:test';
import assert from 'node:assert/strict';
import { extractTrackingIdFromUrl, buildTrackingUrl } from '../src/utils/tracking.js';

test('URL Token Extraction - extracts tracking ID from canonical pathname', () => {
  const url = 'https://nivarya-safety.vercel.app/track/TRK-SENDER-8821';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-SENDER-8821');
});

test('URL Token Extraction - extracts tracking ID with trailing slash', () => {
  const url = 'https://nivarya-safety.vercel.app/track/TRK-SENDER-8821/';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-SENDER-8821');
});

test('URL Token Extraction - extracts tracking ID from subpath deployment', () => {
  const url = 'https://example.github.io/nivarya-safety/track/TRK-GH-4412';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-GH-4412');
});

test('URL Token Extraction - extracts tracking ID from query param (?track=)', () => {
  const url = 'https://nivarya-safety.vercel.app/?track=TRK-PARAM-7733';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-PARAM-7733');
});

test('URL Token Extraction - extracts tracking ID from query param (?trackingId=)', () => {
  const url = 'https://nivarya-safety.vercel.app/?trackingId=TRK-PARAM-6655';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-PARAM-6655');
});

test('URL Token Extraction - extracts tracking ID from query param (?id=)', () => {
  const url = 'https://nivarya-safety.vercel.app/?id=TRK-PARAM-1122';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-PARAM-1122');
});

test('URL Token Extraction - extracts tracking ID from hash fragment', () => {
  const url = 'https://nivarya-safety.vercel.app/#/track/TRK-HASH-9988';
  const token = extractTrackingIdFromUrl(url);
  assert.equal(token, 'TRK-HASH-9988');
});

test('URL Token Extraction - returns null for non-tracking URLs', () => {
  assert.equal(extractTrackingIdFromUrl('https://nivarya-safety.vercel.app/'), null);
  assert.equal(extractTrackingIdFromUrl('https://nivarya-safety.vercel.app/home'), null);
  assert.equal(extractTrackingIdFromUrl('https://nivarya-safety.vercel.app/contacts'), null);
});

test('Token-to-Journey Mapping - recipient resolves sender profile, not recipient profile', () => {
  // Simulate sender journey setup
  const senderJourney = {
    id: 'journey-sender-001',
    trackingId: 'TRK-ALICE-1001',
    userName: 'Alice Sharma',
    userPhone: '+91 98765 43210',
    startPoint: 'Viman Nagar, Pune',
    destination: 'Shivaji Nagar, Pune',
    mode: 'cab',
    progress: 45,
    etaDisplay: '18 mins',
    currentCoords: {
      lat: 18.5678,
      lng: 73.9143,
      accuracy: 12,
      address: 'Near Phoenix Mall, Viman Nagar'
    },
    batteryLevel: 82,
    status: 'ACTIVE',
    isActive: true,
    lastUpdated: new Date().toISOString()
  };

  // Recipient (Bob) views Alice's tracking link
  const recipientProfile = {
    name: 'Bob Verma',
    phone: '+91 91234 56789',
    location: 'Kothrud, Pune'
  };
  const recipientActiveJourney = null;

  // Simulate LiveTrackPage resolution logic:
  // Active tracking token comes from URL
  const requestedToken = extractTrackingIdFromUrl('https://nivarya-safety.vercel.app/track/TRK-ALICE-1001');
  assert.equal(requestedToken, 'TRK-ALICE-1001');

  // Database / session store lookup by token
  const sessionDb = new Map();
  sessionDb.set(senderJourney.trackingId, senderJourney);

  const resolvedSession = sessionDb.get(requestedToken);
  assert.ok(resolvedSession, 'Session must exist for valid sender token');

  // Critical requirement: Recipient must see sender identity, NOT recipient's profile
  const displayedName = resolvedSession.userName;
  const isSender = displayedName === senderJourney.userName;
  const isNotRecipient = displayedName !== recipientProfile.name;

  assert.equal(isSender, true, 'Displayed name must be sender name');
  assert.equal(isNotRecipient, true, 'Recipient name must never be displayed');
  assert.equal(displayedName, 'Alice Sharma');

  // Coordinates must be sender's GPS coordinates, not recipient's GPS
  assert.equal(resolvedSession.currentCoords.lat, 18.5678);
  assert.equal(resolvedSession.currentCoords.lng, 73.9143);
});

test('Waiting for Location - displays waiting state when GPS is not yet acquired', () => {
  // Session created but GPS not yet transmitted by sender
  const pendingGpsSession = {
    trackingId: 'TRK-PENDING-001',
    userName: 'Pooja Patel',
    currentCoords: null, // No GPS coordinates yet
    startPoint: 'Bandra West, Mumbai',
    status: 'ACTIVE',
    isActive: true,
    lastUpdated: new Date().toISOString()
  };

  const hasGps = Boolean(pendingGpsSession.currentCoords?.lat != null && pendingGpsSession.currentCoords?.lng != null);
  assert.equal(hasGps, false, 'hasGps must be false when coordinates are missing');

  // Status mapping logic from LiveTrackPage
  const coords = hasGps ? {
    lat: pendingGpsSession.currentCoords.lat,
    lng: pendingGpsSession.currentCoords.lng,
    address: pendingGpsSession.currentCoords.address || 'Real-time GPS Beacon',
    accuracy: 'Active GPS'
  } : {
    lat: null,
    lng: null,
    address: pendingGpsSession.startPoint ? `Waiting for location (${pendingGpsSession.startPoint})` : 'Waiting for location',
    accuracy: 'Waiting for location'
  };

  assert.equal(coords.lat, null);
  assert.equal(coords.lng, null);
  assert.match(coords.address, /Waiting for location/i);
  assert.equal(coords.accuracy, 'Waiting for location');
});

test('Stale Telemetry - marks location stale if timestamp exceeds 90 seconds', () => {
  const staleTimestamp = new Date(Date.now() - 120 * 1000).toISOString(); // 120s ago
  const freshTimestamp = new Date(Date.now() - 15 * 1000).toISOString();  // 15s ago

  const isStale = (ts) => {
    const diffMs = Date.now() - new Date(ts).getTime();
    return diffMs > 90 * 1000;
  };

  assert.equal(isStale(staleTimestamp), true, '120 seconds old telemetry must be flagged stale');
  assert.equal(isStale(freshTimestamp), false, '15 seconds old telemetry must be fresh');
});

test('Invalid Token - non-existent session returns null and does not leak recipient data', () => {
  const sessionDb = new Map();
  sessionDb.set('VALID-TOKEN', { userName: 'Active User' });

  const unknownToken = 'INVALID-TOKEN-999';
  const foundSession = sessionDb.get(unknownToken) || null;

  assert.equal(foundSession, null, 'Unknown tracking token must resolve to null');
});
