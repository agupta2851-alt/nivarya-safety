import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  checkUrl, 
  safelyParseUrl, 
  URL_STATUS, 
  URL_CHECKER_DISCLAIMER 
} from '../src/utils/urlChecker.js';

test('URL Checker - returns UNABLE_TO_ASSESS on empty input', () => {
  const result = checkUrl('');
  assert.equal(result.status, URL_STATUS.UNABLE_TO_ASSESS);
  assert.equal(result.isValid, false);
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
  assert.notEqual(result.status, '100% safe');
});

test('URL Checker - returns UNABLE_TO_ASSESS on whitespace or invalid non-URL string', () => {
  const result = checkUrl('   ');
  assert.equal(result.status, URL_STATUS.UNABLE_TO_ASSESS);
  assert.equal(result.isValid, false);
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
});

test('URL Checker - flags dangerous or unsupported schemes (e.g. javascript:)', () => {
  const result = checkUrl('javascript:alert(1)');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.equal(result.isValid, false);
  assert.ok(result.indicators.some(i => i.id === 'unsupported_dangerous_scheme'));
  assert.ok(result.indicators.length > 0);
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
});

test('URL Checker - flags unencrypted plain HTTP URLs', () => {
  const result = checkUrl('http://example.com/portal');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id === 'unencrypted_http'));
  assert.notEqual(result.status, '100% safe');
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
});

test('URL Checker - detects raw IP address in host', () => {
  const result = checkUrl('http://192.168.1.100/login');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id === 'ip_address_host'));
  assert.ok(result.indicators.some(i => i.id === 'unencrypted_http'));
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
});

test('URL Checker - detects misleading brand names in untrusted domains', () => {
  const result = checkUrl('https://sbi-kyc-verification.com/update');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id.startsWith('brand_impersonation')));
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
});

test('URL Checker - recognizes legitimate official brand domains without false impersonation alert', () => {
  const result = checkUrl('https://onlinesbi.sbi/portal');
  // Official domain should not have brand impersonation flag
  const hasImpersonation = result.indicators.some(i => i.id.startsWith('brand_impersonation'));
  assert.equal(hasImpersonation, false);
  // Verdict never says "100% safe"
  assert.notEqual(result.status, '100% safe');
  assert.equal(result.status, URL_STATUS.NO_WARNINGS_DETECTED);
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
});

test('URL Checker - detects suspicious high-abuse TLDs (.xyz, .top)', () => {
  const result = checkUrl('https://freereward-claim.xyz/offer');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id === 'suspicious_tld'));
  assert.ok(result.indicators.some(i => i.id === 'suspicious_path_pattern'));
});

test('URL Checker - detects embedded credentials with @ symbol', () => {
  const result = checkUrl('https://google.com@phishing-target.com/login');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id === 'userinfo_in_url'));
});

test('URL Checker - detects excessive URL length (> 120 characters)', () => {
  const longToken = 'a'.repeat(130);
  const result = checkUrl(`https://example.com/verify?token=${longToken}`);
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id === 'excessive_url_length'));
});

test('URL Checker - detects non-standard port numbers', () => {
  const result = checkUrl('https://example.com:8443/login');
  assert.equal(result.status, URL_STATUS.WARNING_SIGNS_FOUND);
  assert.ok(result.indicators.some(i => i.id === 'non_standard_port'));
});

test('URL Checker - standard clean HTTPS link returns NO_WARNINGS_DETECTED and disclaimer', () => {
  const result = checkUrl('https://cybercrime.gov.in/');
  assert.equal(result.isValid, true);
  assert.equal(result.status, URL_STATUS.NO_WARNINGS_DETECTED);
  assert.equal(result.warningCount, 0);
  assert.equal(result.disclaimer, URL_CHECKER_DISCLAIMER);
  // Critical requirement: must never claim 100% safe
  assert.notEqual(result.status, '100% safe');
  assert.notEqual(result.status, 'Safe');
});
