/**
 * Nivarya CyberShield - Modular Suspicious URL Checker Utility
 * 
 * DESIGN PRINCIPLES:
 * 1. Zero-Knowledge & Local-Only: Runs 100% in-browser. Never sends submitted URLs to external APIs.
 * 2. Transparent & Explainable: Every indicator is backed by clear, understandable rationale.
 * 3. Honest Verdicts: Never claims a URL is "100% safe" or "definitively malicious".
 * 4. Extensible: Modular architecture allowing future opt-in threat intelligence providers.
 */

export const URL_STATUS = {
  WARNING_SIGNS_FOUND: 'Potential Warning Signs Found',
  NO_WARNINGS_DETECTED: 'No Warning Signs Detected by Basic Checks',
  UNABLE_TO_ASSESS: 'Unable to Assess'
};

export const URL_CHECKER_DISCLAIMER = 'Basic checks cannot detect every phishing website. A URL with no detected warning signs is not guaranteed to be safe. Do not enter passwords, OTPs, or financial information on suspicious websites.';

// High-abuse TLDs frequently utilized in automated phishing and disposable scam infrastructure
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'buzz', 'click', 'work', 'gq', 'tk', 'ml', 'cf', 
  'country', 'stream', 'loan', 'cam', 'fit', 'surf', 'gdn', 'rest', 
  'icu', 'hair', 'beauty', 'quest', 'monster', 'boats', 'cyou'
]);

// Trusted legitimate root domains for high-value targets frequently targeted by Indian phishing scams
const TRUSTED_BRAND_DOMAINS = {
  sbi: ['onlinesbi.sbi', 'sbi.co.in', 'statebankofindia.com', 'bank.sbi'],
  hdfc: ['hdfcbank.com', 'hdfc.com', 'hdfcsec.com'],
  icici: ['icicibank.com', 'icicidirect.com', 'icicilombard.com'],
  axis: ['axisbank.com', 'axisdirect.in'],
  pnb: ['pnbindia.in', 'netpnb.com'],
  paytm: ['paytm.com', 'paytmbank.com'],
  phonepe: ['phonepe.com'],
  google: ['google.com', 'google.co.in', 'google.org', 'google.net', 'accounts.google.com'],
  apple: ['apple.com', 'icloud.com'],
  microsoft: ['microsoft.com', 'live.com', 'office.com', 'outlook.com', 'msn.com'],
  amazon: ['amazon.com', 'amazon.in', 'media-amazon.com', 'ssl-images-amazon.com'],
  netflix: ['netflix.com'],
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  whatsapp: ['whatsapp.com', 'wa.me'],
  telegram: ['telegram.org', 't.me'],
  uidai: ['uidai.gov.in', 'myaadhaar.uidai.gov.in'],
  aadhaar: ['uidai.gov.in', 'myaadhaar.uidai.gov.in'],
  cybercrime: ['cybercrime.gov.in'],
  incometax: ['incometax.gov.in'],
  digilocker: ['digilocker.gov.in']
};

// Social engineering keywords indicative of banking, credential theft, and reward baiting
const SUSPICIOUS_PATH_PATTERNS = [
  { pattern: /(?:update|verify|submit|link)[-_]?(?:kyc|pan|aadhaar|card)/i, label: 'Urgent KYC / Aadhaar / PAN update bait' },
  { pattern: /(?:claim|redeem|free|reward|cashback|lottery|prize)[-_]?(?:gift|money|bonus|offer)?/i, label: 'Unsolicited financial reward or prize bait' },
  { pattern: /(?:account|profile|security|login|sign-in)[-_]?(?:suspend|lock|verify|alert|unblock)/i, label: 'Urgent account suspension or lockdown threat' },
  { pattern: /(?:otp|two-factor|passcode|token)[-_]?(?:verify|enter|confirm)/i, label: 'Direct OTP/Passcode entry solicitation' },
  { pattern: /(?:netbanking|ebanking|secure-banking)/i, label: 'Generic banking keyword in path' }
];

// Common typosquatting substitutions (lookalikes)
const TYPOSQUATTING_PATTERNS = [
  { regex: /amaz[0o]n/i, target: 'amazon' },
  { regex: /paypa[l1]/i, target: 'paypal' },
  { regex: /g[0o]{2}gle/i, target: 'google' },
  { regex: /micr[0o]s[0o]ft/i, target: 'microsoft' },
  { regex: /sb[i1][-_]?bank/i, target: 'sbi' },
  { regex: /wha[t7]s[a@]pp/i, target: 'whatsapp' }
];

/**
 * Safely parses input into a URL object, handling leading/trailing spaces and scheme inference.
 * Rejects dangerous or malformed schemes safely.
 */
export function safelyParseUrl(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') {
    return { error: 'Please enter a web address (URL) to evaluate.', parsed: null };
  }

  const trimmed = rawInput.trim();
  if (trimmed.length === 0) {
    return { error: 'URL input cannot be blank.', parsed: null };
  }

  // Reject unsupported dangerous schemes immediately
  const dangerousSchemeMatch = trimmed.match(/^([a-z0-9+.-]+):/i);
  if (dangerousSchemeMatch) {
    const scheme = dangerousSchemeMatch[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') {
      return { 
        error: `Unsupported scheme "${scheme}:". Only standard web protocols (HTTP/HTTPS) are evaluated.`, 
        parsed: null,
        isUnsupportedScheme: true,
        scheme 
      };
    }
  }

  // If no scheme provided, safely prepend https:// to assess syntax
  let candidate = trimmed;
  if (!/^https?:\/\//i.test(candidate)) {
    // If it contains spaces or invalid characters, reject
    if (/\s/.test(candidate)) {
      return { error: 'Invalid URL format: addresses cannot contain unencoded spaces.', parsed: null };
    }
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    // Extra hostname check: must have valid structure
    if (!parsed.hostname || !parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
      // Could be invalid domain like "htt://something"
      return { error: 'Invalid hostname format. Please enter a complete domain name (e.g. example.com).', parsed: null };
    }
    return { error: null, parsed, normalizedCandidate: candidate };
  } catch (err) {
    return { error: 'Unable to parse URL. Please check the spelling and web address format.', parsed: null };
  }
}

/**
 * Checks if a hostname is an IPv4 or IPv6 address.
 */
function isIpAddress(hostname) {
  if (!hostname) return false;
  // Strip IPv6 brackets if present
  const cleanHost = hostname.replace(/^\[|\]$/g, '');
  // IPv4 regex
  const ipv4Regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  // IPv6 regex check
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::$|^::1$/;
  return ipv4Regex.test(cleanHost) || ipv6Regex.test(cleanHost) || cleanHost.includes(':');
}

/**
 * Extracts the base domain and TLD from a hostname.
 */
function extractDomainComponents(hostname) {
  if (!hostname) return { tld: '', domainName: '', subdomains: [] };
  const parts = hostname.toLowerCase().split('.').filter(Boolean);
  if (parts.length === 0) return { tld: '', domainName: '', subdomains: [] };
  const tld = parts[parts.length - 1];
  const secondLevel = parts.length > 1 ? parts[parts.length - 2] : '';
  const subdomains = parts.length > 2 ? parts.slice(0, parts.length - 2) : [];
  return { tld, secondLevel, domainName: `${secondLevel}.${tld}`, subdomains, allParts: parts };
}

/**
 * Runs transparent heuristic security checks on a URL.
 * Runs completely locally. Never contacts third-party servers.
 */
export function checkUrl(rawInput, options = {}) {
  const parseResult = safelyParseUrl(rawInput);

  if (parseResult.error || !parseResult.parsed) {
    // If it was a dangerous non-web scheme (e.g., javascript:, data:), provide honest assessment
    if (parseResult.isUnsupportedScheme) {
      return {
        url: rawInput ? String(rawInput).slice(0, 150) : '',
        originalInput: rawInput || '',
        isValid: false,
        status: URL_STATUS.WARNING_SIGNS_FOUND,
        statusClass: 'warning',
        warningCount: 1,
        indicators: [
          {
            id: 'unsupported_dangerous_scheme',
            title: `Dangerous or Unsupported Scheme (${parseResult.scheme}:)`,
            severity: 'high',
            description: `The URL uses "${parseResult.scheme}:" instead of standard HTTP or HTTPS.`,
            whyItMatters: 'Schemes like javascript:, data:, and file: can execute scripts directly or compromise browser sandboxing when clicked.'
          }
        ],
        parsedDetails: null,
        disclaimer: URL_CHECKER_DISCLAIMER,
        scanTimestamp: new Date().toISOString(),
        engine: 'Nivarya Local Heuristic Engine v1.0 (Zero-Knowledge, Client-Side)'
      };
    }

    return {
      url: rawInput ? String(rawInput).slice(0, 150) : '',
      originalInput: rawInput || '',
      isValid: false,
      status: URL_STATUS.UNABLE_TO_ASSESS,
      statusClass: 'neutral',
      warningCount: 0,
      indicators: [],
      errorDetails: parseResult.error,
      parsedDetails: null,
      disclaimer: URL_CHECKER_DISCLAIMER,
      scanTimestamp: new Date().toISOString(),
      engine: 'Nivarya Local Heuristic Engine v1.0 (Zero-Knowledge, Client-Side)'
    };
  }

  const parsed = parseResult.parsed;
  const rawLower = String(rawInput || '').toLowerCase().trim();
  const hostname = parsed.hostname.toLowerCase();
  const indicators = [];

  // 1. Check for unencrypted HTTP
  if (parsed.protocol === 'http:') {
    indicators.push({
      id: 'unencrypted_http',
      title: 'Unencrypted Connection (Plain HTTP)',
      severity: 'medium',
      description: 'The link does not use SSL/TLS encryption (HTTPS).',
      whyItMatters: 'Any information submitted over plain HTTP, such as passwords, addresses, or card details, travels unencrypted across the network and can be intercepted by anyone on the same Wi-Fi or local network.'
    });
  }

  // 2. Direct IP Address Host
  if (isIpAddress(hostname)) {
    indicators.push({
      id: 'ip_address_host',
      title: 'Raw IP Address Instead of Domain Name',
      severity: 'high',
      description: `The URL connects directly to an IP address (${hostname}) rather than a registered domain name.`,
      whyItMatters: 'Legitimate banks, government portals, and e-commerce platforms use verified registered domain names. Raw IP addresses are commonly used in phishing campaigns and command-and-control servers to bypass domain reputation blocklists.'
    });
  }

  // 3. Userinfo / Embedded Credentials in Authority (@ symbol)
  if (parsed.username || parsed.password || rawLower.includes('@')) {
    indicators.push({
      id: 'userinfo_in_url',
      title: 'Embedded Credentials / Misleading "@" Symbol',
      severity: 'high',
      description: 'The URL authority contains an "@" symbol.',
      whyItMatters: 'Web browsers treat everything before an "@" symbol as username credentials and actually connect to the host AFTER the "@". Phishing attackers exploit this trick (e.g. "https://trusted-bank.com@malicious-site.com") to trick victims into thinking they are visiting the legitimate brand.'
    });
  }

  // Extract domain structure
  const { tld, allParts, subdomains } = extractDomainComponents(hostname);

  // 4. Excessive Subdomain Depth
  if (subdomains.length > 3) {
    indicators.push({
      id: 'excessive_subdomains',
      title: 'Excessive Subdomain Nesting',
      severity: 'medium',
      description: `The URL contains ${subdomains.length} subdomain levels (${hostname}).`,
      whyItMatters: 'Threat actors frequently stack multiple subdomains (e.g., "login.bank.verify.secure.xyz") to camouflage the real destination domain and push the actual domain off-screen on mobile browsers.'
    });
  }

  // 5. Suspicious / High-Abuse TLD
  if (SUSPICIOUS_TLDS.has(tld)) {
    indicators.push({
      id: 'suspicious_tld',
      title: `High-Risk Top-Level Domain (.${tld})`,
      severity: 'medium',
      description: `The domain uses the ".${tld}" extension, which is frequently associated with disposable phishing sites.`,
      whyItMatters: 'Certain low-cost or unverified TLD registries are disproportionately exploited by automated phishing kits and mass scam distribution networks.'
    });
  }

  // 6. Brand Name Impersonation / Misleading Domain Text
  for (const [brand, trustedDomains] of Object.entries(TRUSTED_BRAND_DOMAINS)) {
    // Check if brand keyword appears in hostname (e.g. sbi-kyc.com or paytm-cashback.xyz)
    const brandRegex = new RegExp(`(^|[-._])${brand}([-._]|$)`, 'i');
    if (brandRegex.test(hostname)) {
      // Check if hostname actually ends with one of the trusted domains
      const isOfficial = trustedDomains.some(official => 
        hostname === official || hostname.endsWith(`.${official}`)
      );

      if (!isOfficial) {
        indicators.push({
          id: `brand_impersonation_${brand}`,
          title: `Potential Impersonation of "${brand.toUpperCase()}"`,
          severity: 'high',
          description: `The web address contains "${brand}" in its domain name, but does not match any recognized official domains for this organization.`,
          whyItMatters: `Legitimate communications from ${brand.toUpperCase()} only use authorized domain names (${trustedDomains.slice(0, 2).join(', ')}). Attackers register deceptive domains containing familiar brand names to gain unearned trust.`
        });
        break; // Avoid duplicate brand flags on same URL
      }
    }
  }

  // 7. Lookalike / Typosquatting Patterns in Domain
  for (const { regex, target } of TYPOSQUATTING_PATTERNS) {
    if (regex.test(hostname)) {
      const isOfficial = (TRUSTED_BRAND_DOMAINS[target] || []).some(official => 
        hostname === official || hostname.endsWith(`.${official}`)
      );
      if (!isOfficial) {
        indicators.push({
          id: `typosquatting_${target}`,
          title: `Lookalike Typosquatting Pattern (${target})`,
          severity: 'high',
          description: `The domain name appears to use character substitutions (like 0 for O or 1 for L) resembling "${target}".`,
          whyItMatters: 'Typosquatting visually mimics well-known brand names to deceive users who quickly glance at the address bar.'
        });
        break;
      }
    }
  }

  // 8. Social Engineering / Suspicious Path & Domain Keywords
  const fullUrlToCheck = `${hostname}${parsed.pathname}${parsed.search}`;
  for (const { pattern, label } of SUSPICIOUS_PATH_PATTERNS) {
    if (pattern.test(fullUrlToCheck)) {
      indicators.push({
        id: 'suspicious_path_pattern',
        title: 'Sensitive Scam Bait Keyword Detected',
        severity: 'medium',
        description: `The address contains suspicious social engineering triggers: "${label}".`,
        whyItMatters: 'Phishing URLs frequently use urgent triggers like mandatory KYC renewal, PAN card linking, prize claims, or free rewards to create synthetic urgency and bypass critical judgment.'
      });
      break;
    }
  }

  // 9. Non-Standard Port
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    indicators.push({
      id: 'non_standard_port',
      title: `Unusual Network Port (Port ${parsed.port})`,
      severity: 'medium',
      description: `The link specifies custom network port :${parsed.port} instead of standard web ports 80 or 443.`,
      whyItMatters: 'Standard consumer websites rarely require specific custom ports. Phishing landing pages or unauthorized servers often run on non-standard ports to evade standard perimeter monitoring.'
    });
  }

  // 10. Excessive URL Length
  if (rawLower.length > 120) {
    indicators.push({
      id: 'excessive_url_length',
      title: 'Excessive URL Length',
      severity: 'low',
      description: `The URL is unusually long (${rawLower.length} characters).`,
      whyItMatters: 'Extremely long URLs with redundant tokens are often used in SMS and messaging apps to push suspicious domains out of view on mobile screens.'
    });
  }

  // 11. Multiple consecutive hyphens in domain
  if (/--+/.test(hostname)) {
    indicators.push({
      id: 'multiple_hyphens',
      title: 'Unusual Consecutive Hyphens in Domain',
      severity: 'low',
      description: 'The domain name contains multiple consecutive hyphens ("--").',
      whyItMatters: 'Consecutive hyphens are common in dynamically generated domain names created by automated phishing kits.'
    });
  }

  // 12. Double slashes in path
  if (/\/\//.test(parsed.pathname)) {
    indicators.push({
      id: 'double_slashes_in_path',
      title: 'Malformed Path with Double Slashes',
      severity: 'medium',
      description: 'The URL path contains double slashes ("//").',
      whyItMatters: 'Double slashes in URL paths are sometimes employed to confuse reverse proxies, web application firewalls, or open redirect validators.'
    });
  }

  // Determine honest verdict
  const warningCount = indicators.length;
  let status = URL_STATUS.NO_WARNINGS_DETECTED;
  let statusClass = 'clean';

  if (warningCount > 0) {
    status = URL_STATUS.WARNING_SIGNS_FOUND;
    statusClass = 'warning';
  }

  return {
    url: parsed.href,
    originalInput: rawInput,
    isValid: true,
    status,
    statusClass,
    warningCount,
    indicators,
    parsedDetails: {
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      pathname: parsed.pathname,
      port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
      searchParamsCount: Array.from(parsed.searchParams.keys()).length
    },
    disclaimer: URL_CHECKER_DISCLAIMER,
    scanTimestamp: new Date().toISOString(),
    engine: 'Nivarya Local Heuristic Engine v1.0 (Zero-Knowledge, Client-Side)'
  };
}
