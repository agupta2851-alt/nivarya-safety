import test from 'node:test';
import assert from 'node:assert/strict';

// Data model test for Digital Evidence Preservation Checklist and Next Steps
const INITIAL_CHECKLIST_STATE = {
  timestampScreenshot: false,
  urlAndHeader: false,
  phoneAndProfile: false,
  chatExport: false,
  doNotDelete: false,
  fileReport1930: false
};

const ACTION_CARDS = [
  {
    id: 'save_evidence',
    title: 'Save Evidence Securely',
    focus: 'local offline private storage without unverified cloud uploads'
  },
  {
    id: 'incident_summary',
    title: 'Prepare an Incident Summary',
    focus: 'factual chronological timeline'
  },
  {
    id: 'report_portal',
    title: 'Report to Cyber Crime Portal',
    link: 'https://cybercrime.gov.in/'
  },
  {
    id: 'improve_safety',
    title: 'Improve Account Safety',
    focus: 'unique passphrases and multi-factor authentication'
  }
];

const COMPLETION_MESSAGE = 'Evidence preservation checklist reviewed. You can now choose your next step.';

test('Checklist Logic - initializes with all items false (0 completed)', () => {
  const keys = Object.keys(INITIAL_CHECKLIST_STATE);
  const reviewedCount = keys.filter(k => INITIAL_CHECKLIST_STATE[k]).length;
  assert.equal(reviewedCount, 0);
  assert.equal(keys.length, 6);
  assert.equal(`${reviewedCount} of ${keys.length} reviewed`, '0 of 6 reviewed');
});

test('Checklist Logic - tracks progress accurately when toggling items', () => {
  let state = { ...INITIAL_CHECKLIST_STATE };
  
  // Check 1 item
  state.timestampScreenshot = true;
  let count = Object.values(state).filter(Boolean).length;
  assert.equal(`${count} of 6 reviewed`, '1 of 6 reviewed');
  assert.equal(count === 6, false);

  // Check 4 items
  state.urlAndHeader = true;
  state.phoneAndProfile = true;
  state.chatExport = true;
  count = Object.values(state).filter(Boolean).length;
  assert.equal(`${count} of 6 reviewed`, '4 of 6 reviewed');
  assert.equal(count === 6, false);

  // Check remaining 2 items
  state.doNotDelete = true;
  state.fileReport1930 = true;
  count = Object.values(state).filter(Boolean).length;
  assert.equal(`${count} of 6 reviewed`, '6 of 6 reviewed');
  assert.equal(count === 6, true);
});

test('Checklist Logic - verifies exact completion message', () => {
  let state = { ...INITIAL_CHECKLIST_STATE };
  Object.keys(state).forEach(k => { state[k] = true; });
  const isComplete = Object.values(state).every(Boolean);
  assert.equal(isComplete, true);
  assert.equal(COMPLETION_MESSAGE, 'Evidence preservation checklist reviewed. You can now choose your next step.');
});

test('Action Cards - verifies all 4 action cards exist with correct portal link', () => {
  assert.equal(ACTION_CARDS.length, 4);
  const titles = ACTION_CARDS.map(c => c.title);
  assert.ok(titles.includes('Save Evidence Securely'));
  assert.ok(titles.includes('Prepare an Incident Summary'));
  assert.ok(titles.includes('Report to Cyber Crime Portal'));
  assert.ok(titles.includes('Improve Account Safety'));

  const portalCard = ACTION_CARDS.find(c => c.id === 'report_portal');
  assert.equal(portalCard.link, 'https://cybercrime.gov.in/');
});
