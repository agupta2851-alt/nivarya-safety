import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { 
  checkUrl, 
  URL_STATUS 
} from '../utils/urlChecker';
import { evaluatePasswordStrength } from '../services/authService';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Key, 
  AlertTriangle, 
  ExternalLink, 
  Globe, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Info, 
  RefreshCw, 
  Copy, 
  Check, 
  Phone, 
  HelpCircle, 
  BookOpen, 
  Fingerprint, 
  Sparkles, 
  Laptop, 
  CheckSquare, 
  Square 
} from 'lucide-react';

export default function CyberShieldPage() {
  const { setCurrentPage, showToast } = useApp();
  const { currentUser, isAuthenticated, logout } = useAuth();

  // Tab Navigation: 'url-checker' | 'safety-guide' | 'account-security' | 'harassment'
  const [activeTab, setActiveTab] = useState('url-checker');

  // Feature 2: URL Checker State
  const [inputUrl, setInputUrl] = useState('');
  const [urlScanResult, setUrlScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Feature 4: Password Analyzer State
  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(false);

  // Feature 3: Cyber Guide Search & Category State
  const [guideFilter, setGuideFilter] = useState('all');
  const [guideSearch, setGuideSearch] = useState('');

  // Feature 1 / 4: Harassment Evidence Checklist State
  const [evidenceChecklist, setEvidenceChecklist] = useState({
    urlAndHeader: false,
    timestampScreenshot: false,
    phoneAndProfile: false,
    chatExport: false,
    doNotDelete: true,
    fileReport1930: false
  });

  // Toggle checklist item
  const toggleChecklistItem = (key) => {
    setEvidenceChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // URL Checker Handlers
  const handleScanUrl = (targetUrl = inputUrl) => {
    const urlToEvaluate = (targetUrl || '').trim();
    if (!urlToEvaluate) {
      setUrlScanResult(checkUrl(''));
      return;
    }

    setIsScanning(true);
    // Brief realistic processing feedback (purely client-side UI transition)
    setTimeout(() => {
      const evaluation = checkUrl(urlToEvaluate);
      setUrlScanResult(evaluation);
      setIsScanning(false);
      if (evaluation.status === URL_STATUS.WARNING_SIGNS_FOUND) {
        showToast('Potential warning indicators found. Please review findings carefully.', 'warning');
      } else if (evaluation.status === URL_STATUS.NO_WARNINGS_DETECTED) {
        showToast('No common warning signs detected by basic heuristics.', 'safe');
      }
    }, 200);
  };

  const handleClearUrl = () => {
    setInputUrl('');
    setUrlScanResult(null);
  };

  const handleSampleClick = (sampleUrl) => {
    setInputUrl(sampleUrl);
    handleScanUrl(sampleUrl);
  };

  const handleCopyHelpline = (num = '1930') => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(num);
      setCopiedLink(true);
      showToast(`Helpline ${num} copied to clipboard!`, 'info');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Safe Sample URLs for transparent user testing
  const sampleUrls = [
    {
      label: 'Official Government Portal (Clean)',
      url: 'https://cybercrime.gov.in/',
      type: 'clean'
    },
    {
      label: 'Deceptive Bank KYC Link (Phishing Bait)',
      url: 'https://sbi-kyc-verification.com/update-pan',
      type: 'warning'
    },
    {
      label: 'Unencrypted Direct IP Address',
      url: 'http://192.168.1.1/login',
      type: 'warning'
    },
    {
      label: 'Suspicious TLD & Prize Bait',
      url: 'https://paytm-cashback-reward.xyz/claim',
      type: 'warning'
    }
  ];

  // Feature 3: Cyber Safety Guide Data
  const cyberGuides = [
    {
      id: 'phishing',
      category: 'scams',
      title: 'Phishing Messages & Malicious Links',
      subtitle: 'Deceptive SMS (Smishing), WhatsApp links & spear-phishing emails',
      redFlags: [
        'Urgent threats saying your SIM card, bank account, or electricity will be blocked within 24 hours.',
        'Links that resemble legitimate portals but have misspelled domains (e.g., sbi-kyc-portal.xyz instead of onlinesbi.sbi).',
        'Requests to enter your netbanking password, ATM PIN, or Aadhaar number on an unfamiliar webpage.'
      ],
      prevention: [
        'Never click on links sent via unsolicited SMS or WhatsApp from unknown numbers.',
        'Directly type the official website address into your browser address bar instead of clicking message links.',
        'Always check the sender ID. Official Indian banks use verified sender codes like "VK-HDFCBK" or "AX-SBINB".'
      ],
      nextSteps: [
        'If you already clicked a link, disconnect from Wi-Fi / mobile data immediately.',
        'Do not submit any form fields or download any APK files.',
        'Forward fraudulent SMS to 1909 (TRAI spam reporting) and report the sender on WhatsApp.'
      ]
    },
    {
      id: 'job-scams',
      category: 'scams',
      title: 'Fake Job & Work-From-Home Scams',
      subtitle: 'Telegram task frauds, YouTube review scams & fraudulent hiring offers',
      redFlags: [
        'Unrealistic daily earnings (e.g., "Earn ₹3,000 to ₹10,000/day just by liking YouTube videos or rating hotels").',
        'Recruiter insists on communicating exclusively through Telegram or WhatsApp without an official corporate email (@company.com).',
        'Demanding an upfront "registration fee", "security deposit", or "laptop dispatch processing fee".'
      ],
      prevention: [
        'Legitimate companies never ask job candidates to pay money for interviews, onboarding, or training.',
        'Verify open positions directly on the official careers page of the company or on verified LinkedIn company profiles.',
        'Never send photos of your PAN card, Aadhaar, or bank passbook to unverified recruiters on messaging apps.'
      ],
      nextSteps: [
        'Stop all communications immediately and do not pay any "withdrawal tax" or "penalty fee".',
        'Preserve transaction receipts, UTR numbers, and chat screenshots for official cybercrime reporting.',
        'Report the fraudulent recruiter profile and Telegram channel immediately.'
      ]
    },
    {
      id: 'otp-scams',
      category: 'financial',
      title: 'OTP & Financial Payment Frauds',
      subtitle: 'Fake UPI QR codes, remote access apps (AnyDesk/TeamViewer) & loan traps',
      redFlags: [
        'Caller asks you to scan a QR code to "receive money" or "refund your payment" (Scanning a QR code ONLY sends money, never receives it).',
        'Caller asks you to install remote support apps like AnyDesk, TeamViewer QuickSupport, or RustDesk to "fix a technical error".',
        'Caller claims to be a bank manager or customer support executive requesting your 6-digit OTP or UPI PIN.'
      ],
      prevention: [
        'Remember the cardinal rule of UPI: You NEVER need to enter your UPI PIN or scan a QR code to receive money.',
        'Never share any OTP received on your phone. Banks and payment apps explicitly state they will never ask for your OTP.',
        'Never download screen-sharing apps at the request of an unknown caller.'
      ],
      nextSteps: [
        'Call the National Financial Cyber Fraud Helpline at 1930 immediately (within the first 2 hours "Golden Period") to freeze stolen funds.',
        'Contact your bank immediately to block your debit/credit card and freeze netbanking credentials.',
        'File an official complaint on the National Cyber Crime Portal (https://cybercrime.gov.in/).'
      ]
    },
    {
      id: 'impersonation',
      category: 'harassment',
      title: 'Social Media Impersonation & Clones',
      subtitle: 'Fake profiles, voice cloning, deepfakes & emergency impersonation scams',
      redFlags: [
        'A second account created using your photos and bio messaging your friends requesting urgent financial help or medical funds.',
        'Distress calls using AI voice cloning pretending to be a family member arrested or stranded abroad.',
        'Unsolicited DMs offering cryptocurrency investments or paid brand collaborations from accounts with generic usernames.'
      ],
      prevention: [
        'Keep your social media accounts private and restrict visibility of your friend list and contact info.',
        'Establish a secret "family verbal safeword" to verify genuine identity if you ever receive an emergency distress call.',
        'Watermark or avoid uploading extremely high-resolution, uncompressed portraits on public accounts.'
      ],
      nextSteps: [
        'Report the fake account directly on the platform (Instagram, Facebook, X, LinkedIn) under "Impersonation / Pretending to be me".',
        'Post a temporary public story/status from your genuine account warning friends not to send money to the imposter.',
        'File an impersonation and identity theft complaint under Section 66C of the IT Act at cybercrime.gov.in.'
      ]
    },
    {
      id: 'online-harassment',
      category: 'harassment',
      title: 'Online Harassment & Cyberbullying',
      subtitle: 'Trolling, abusive DMs, cyberstalking, non-consensual image sharing & doxxing',
      redFlags: [
        'Persistent unwanted messages, threats, or vulgar comments across multiple social platforms or burner numbers.',
        'Threats to leak private photos, morphed images, or intimate media unless money or favors are provided (sextortion).',
        'Doxxing: Publicly sharing your residential address, workplace, phone number, or personal details to incite harassment.'
      ],
      prevention: [
        'Do not engage, negotiate, or retaliate with harassers; engagement often escalates their behavior.',
        'Audit privacy settings on WhatsApp (disable "About", "Profile Photo", and "Last Seen" for unknown numbers).',
        'Use StopNCII.org (supported globally and in India) to create cryptographic hashes of private images so platforms can block them proactively.'
      ],
      nextSteps: [
        'Preserve all evidence (un-cropped screenshots with timestamps, URLs, sender handles) before blocking.',
        'Call the National Commission for Women (NCW) 24/7 Helpline at 7827170170 or Women Helpline 1091.',
        'Report image-based abuse to law enforcement under Sections 66E, 67, and 67A of the IT Act and Section 78 of BNS (Stalking).'
      ]
    },
    {
      id: 'account-recovery',
      category: 'account',
      title: 'Account Recovery & Password Safety',
      subtitle: 'SIM swap prevention, brute-force mitigation & secondary email hygiene',
      redFlags: [
        'Your mobile phone suddenly displays "No Service" or "Emergency Calls Only" in an area with normally good signal (potential SIM Swap).',
        'Receiving unprompted password reset emails or two-factor authorization SMS prompts when you were not logging in.',
        'Notifications of logins from unfamiliar browsers, operating systems, or foreign IP addresses.'
      ],
      prevention: [
        'Contact your telecom provider immediately if your SIM unexpectedly loses network connectivity.',
        'Use an Authenticator App (Google Authenticator, Microsoft Authenticator) instead of SMS-based OTPs wherever supported.',
        'Never use predictable security questions (such as mother’s maiden name or pet name) whose answers can be found on your social media.'
      ],
      nextSteps: [
        'Immediately change master passwords using another secure device and terminate active sessions.',
        'Notify your bank immediately if you suspect an unauthorized SIM swap has occurred on your registered mobile number.',
        'Review authorized third-party OAuth apps connected to your Google or Apple accounts and revoke unknown tokens.'
      ]
    }
  ];

  // Filtered Cyber Guides
  const filteredGuides = cyberguides => {
    return cyberguides.filter(item => {
      const matchesCategory = guideFilter === 'all' || item.category === guideFilter;
      const matchesSearch = !guideSearch.trim() || 
        item.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(guideSearch.toLowerCase()) ||
        item.prevention.some(p => p.toLowerCase().includes(guideSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  };

  // Password Analyzer Evaluation
  const passwordStrength = evaluatePasswordStrength(testPassword);

  return (
    <div className="cybershield-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '70px' }}>
      
      {/* 1. Header & Proactive Defense Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px',
        padding: '28px 24px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} />
                <span>NIVARYA CYBERSHIELD</span>
              </span>
              <span className="badge badge-safe">v1.2 Zero-Knowledge Defense</span>
            </div>
            
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 10px 0', lineHeight: 1.2 }}>
              Proactive Digital Threat & Cyber Safety Guard
            </h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.5, margin: 0 }}>
              Physical security and digital security go hand in hand. Nivarya CyberShield empowers women and families with real-time heuristic phishing detection, cyber safety guides, and actionable defense against digital harassment and financial fraud.
            </p>
          </div>

          {/* Quick Emergency Assistance Card */}
          <div style={{
            background: 'rgba(7, 11, 20, 0.85)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '16px 20px',
            minWidth: '280px',
            flex: '1 1 280px',
            maxWidth: '360px'
          }}>
            <div style={{ fontSize: '0.78rem', color: '#F87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} />
              <span>India Cyber Crime Emergency</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF' }}>Helpline 1930</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Financial Cyber Fraud Toll-Free</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <a 
                  href="tel:1930" 
                  className="btn btn-danger btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                  title="Call 1930 directly"
                >
                  <Phone size={14} />
                  <span>Call</span>
                </a>
                <button 
                  onClick={() => handleCopyHelpline('1930')} 
                  className="btn btn-secondary btn-sm"
                  title="Copy 1930"
                >
                  {copiedLink ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <a 
              href="https://cybercrime.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                borderRadius: '10px',
                color: 'var(--primary-light)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <span>National Cyber Crime Portal</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <button
          onClick={() => setActiveTab('url-checker')}
          className={`btn ${activeTab === 'url-checker' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '10px 18px', whiteSpace: 'nowrap' }}
        >
          <Search size={16} />
          <span>Scam & Phishing Checker</span>
        </button>

        <button
          onClick={() => setActiveTab('safety-guide')}
          className={`btn ${activeTab === 'safety-guide' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '10px 18px', whiteSpace: 'nowrap' }}
        >
          <BookOpen size={16} />
          <span>Cyber Safety Guide</span>
        </button>

        <button
          onClick={() => setActiveTab('account-security')}
          className={`btn ${activeTab === 'account-security' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '10px 18px', whiteSpace: 'nowrap' }}
        >
          <Key size={16} />
          <span>Account Security</span>
        </button>

        <button
          onClick={() => setActiveTab('harassment')}
          className={`btn ${activeTab === 'harassment' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '12px', padding: '10px 18px', whiteSpace: 'nowrap' }}
        >
          <ShieldAlert size={16} />
          <span>Online Harassment Awareness</span>
        </button>
      </div>

      {/* 3. TAB 1: SUSPICIOUS URL & PHISHING CHECKER */}
      {activeTab === 'url-checker' && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <Search size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, margin: 0 }}>
                  Interactive Suspicious URL & Phishing Checker
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Evaluates structural anomalies, misleading brand names, and deceptive phishing patterns in real-time.
                </div>
              </div>
            </div>

            {/* Input Box */}
            <div style={{ marginTop: '20px' }}>
              <label htmlFor="url-input-field" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Enter or paste a web address to inspect:
              </label>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 320px' }}>
                  <input
                    id="url-input-field"
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScanUrl()}
                    placeholder="https://example.com/verify-account or suspicious domain..."
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      fontSize: '0.95rem',
                      fontFamily: 'monospace'
                    }}
                  />
                  {inputUrl && (
                    <button
                      onClick={handleClearUrl}
                      aria-label="Clear URL"
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <XCircle size={18} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleScanUrl()}
                  disabled={isScanning}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 24px',
                    fontWeight: 700,
                    minWidth: '140px',
                    justifyContent: 'center'
                  }}
                >
                  {isScanning ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>Check URL</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample Presets */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '8px' }}>
                  Quick demonstration samples (safe to test):
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {sampleUrls.map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSampleClick(sample.url)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        background: sample.type === 'clean' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        border: sample.type === 'clean' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: sample.type === 'clean' ? 'var(--safe-light)' : 'var(--danger-light)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Scan Results Card */}
          {urlScanResult && (
            <div className="card animate-fade-in" style={{ marginBottom: '24px', border: urlScanResult.statusClass === 'warning' ? '1px solid rgba(239, 68, 68, 0.4)' : urlScanResult.statusClass === 'clean' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-medium)' }}>
              {/* Verdict Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: urlScanResult.statusClass === 'warning' ? 'rgba(239, 68, 68, 0.15)' : urlScanResult.statusClass === 'clean' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)',
                    color: urlScanResult.statusClass === 'warning' ? '#F87171' : urlScanResult.statusClass === 'clean' ? '#34D399' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {urlScanResult.statusClass === 'warning' ? <AlertTriangle size={22} /> : urlScanResult.statusClass === 'clean' ? <CheckCircle2 size={22} /> : <Info size={22} />}
                  </div>

                  <div>
                    <div style={{
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      color: urlScanResult.statusClass === 'warning' ? '#F87171' : urlScanResult.statusClass === 'clean' ? '#34D399' : '#CBD5E1'
                    }}>
                      {urlScanResult.status}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Evaluated via {urlScanResult.engine}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: urlScanResult.statusClass === 'warning' ? 'rgba(239, 68, 68, 0.2)' : urlScanResult.statusClass === 'clean' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                    color: urlScanResult.statusClass === 'warning' ? '#F87171' : urlScanResult.statusClass === 'clean' ? '#34D399' : '#CBD5E1'
                  }}>
                    {urlScanResult.warningCount} {urlScanResult.warningCount === 1 ? 'Indicator' : 'Indicators'} Flagged
                  </span>
                </div>
              </div>

              {/* Evaluated URL info */}
              <div style={{
                background: 'var(--bg-surface-elevated)',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto'
              }}>
                <Globe size={16} color="var(--primary-light)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Inspected Target:</span>
                <span style={{ fontSize: '0.88rem', color: '#FFFFFF', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {urlScanResult.url || urlScanResult.originalInput}
                </span>
              </div>

              {/* Technical Breakdown Attributes */}
              {urlScanResult.parsedDetails && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '10px',
                  marginBottom: '20px'
                }}>
                  <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Protocol</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: urlScanResult.parsedDetails.protocol === 'https:' ? 'var(--safe-light)' : 'var(--danger-light)' }}>
                      {urlScanResult.parsedDetails.protocol}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Host</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', wordBreak: 'break-all' }}>
                      {urlScanResult.parsedDetails.hostname}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Port</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#CBD5E1' }}>
                      {urlScanResult.parsedDetails.port}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Privacy Policy</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                      Local Sandbox
                    </div>
                  </div>
                </div>
              )}

              {/* Indicators Detail List */}
              {urlScanResult.indicators.length > 0 ? (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
                    Detected Warning Indicators & Rationale:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {urlScanResult.indicators.map((indicator, i) => (
                      <div 
                        key={i}
                        style={{
                          background: 'rgba(15, 23, 42, 0.7)',
                          borderLeft: indicator.severity === 'high' ? '4px solid #EF4444' : indicator.severity === 'medium' ? '4px solid #F59E0B' : '4px solid #6366F1',
                          borderTop: '1px solid var(--border-subtle)',
                          borderRight: '1px solid var(--border-subtle)',
                          borderBottom: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                            {indicator.title}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: indicator.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' : indicator.severity === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                            color: indicator.severity === 'high' ? '#F87171' : indicator.severity === 'medium' ? '#FBBF24' : '#818CF8'
                          }}>
                            {indicator.severity.toUpperCase()} RISK
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: '#CBD5E1', marginBottom: '6px', lineHeight: 1.4 }}>
                          {indicator.description}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'rgba(7, 11, 20, 0.5)', padding: '6px 10px', borderRadius: '6px', lineHeight: 1.4 }}>
                          <strong style={{ color: '#E2E8F0' }}>Why this matters: </strong>
                          {indicator.whyItMatters}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : urlScanResult.status === URL_STATUS.NO_WARNINGS_DETECTED ? (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 700, marginBottom: '4px' }}>
                    <CheckCircle2 size={16} />
                    <span>No Basic Red Flags Detected</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                    Standard heuristic checks did not find indicators like unencrypted plain HTTP, direct raw IP hosting, brand name typosquatting, or high-risk disposable TLD extensions.
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(148, 163, 184, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '16px',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '0.85rem', color: '#E2E8F0', marginBottom: '4px', fontWeight: 600 }}>
                    Assessment Notice
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {urlScanResult.errorDetails || 'The provided input could not be evaluated as a valid web address.'}
                  </div>
                </div>
              )}

              {/* Mandatory Honest Security Disclaimer */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <AlertTriangle size={18} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FBBF24', marginBottom: '3px' }}>
                    Important Safety Disclaimer
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                    {urlScanResult.disclaimer}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Safe Browsing Architectural Note */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--border-medium)',
            borderRadius: '14px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Lock size={20} color="var(--primary-light)" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Privacy & Data Sovereignty Guarantee
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Submitted URLs are evaluated strictly within your browser's runtime memory. Nivarya never logs, records, or transmits URLs to third-party ad networks or unapproved servers.
                </div>
              </div>
            </div>

            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              Zero External Network Requests
            </span>
          </div>
        </div>
      )}

      {/* 4. TAB 2: CYBER SAFETY GUIDE */}
      {activeTab === 'safety-guide' && (
        <div className="animate-fade-in">
          {/* Guide Filters & Search */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Modules' },
                { id: 'scams', label: 'Scams & Phishing' },
                { id: 'financial', label: 'OTP & Financial' },
                { id: 'harassment', label: 'Harassment & Impersonation' },
                { id: 'account', label: 'Account Safety' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setGuideFilter(cat.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    background: guideFilter === cat.id ? 'var(--primary)' : 'var(--bg-surface-elevated)',
                    color: guideFilter === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                    transition: 'all 0.15s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '360px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                placeholder="Search safety tips or red flags..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {/* Guide Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {filteredGuides(cyberGuides).map(guide => (
              <div 
                key={guide.id}
                className="glass-card"
                style={{
                  padding: '24px',
                  borderRadius: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--primary-light)'
                    }}>
                      {guide.category}
                    </span>
                    <HelpCircle size={16} color="var(--text-muted)" />
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px 0' }}>
                    {guide.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                    {guide.subtitle}
                  </div>

                  {/* Red Flags Block */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={13} />
                      <span>Key Red Flags</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                      {guide.redFlags.map((flag, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{flag}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention Tips Block */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={13} />
                      <span>Practical Prevention</span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                      {guide.prevention.map((prev, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}>{prev}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Next Steps / Immediate Action */}
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  background: 'rgba(7, 11, 20, 0.4)',
                  padding: '10px 12px',
                  borderRadius: '10px'
                }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Immediate Next Steps If Targeted:
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#E2E8F0', lineHeight: 1.4 }}>
                    {guide.nextSteps[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* National Cyber Crime Helpline & Official Reporting Banner */}
          <div style={{
            background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(26, 38, 70, 0.95) 100%)',
            border: '1px solid var(--border-medium)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-danger">Official Govt. of India Portal</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ministry of Home Affairs (MHA)</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0' }}>
                National Cyber Crime Reporting Portal (cybercrime.gov.in)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#CBD5E1', margin: 0, lineHeight: 1.5 }}>
                Dedicated national platform for reporting cyber crimes against women and children, financial online frauds, ransomware, and identity theft. For immediate financial fraud freezes, call <strong>1930</strong> within the first 2 hours of unauthorized debit.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href="https://cybercrime.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <span>Visit cybercrime.gov.in</span>
                <ExternalLink size={16} />
              </a>

              <a
                href="tel:1930"
                className="btn btn-danger"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <Phone size={16} />
                <span>Call 1930</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: ACCOUNT SECURITY */}
      {activeTab === 'account-security' && (
        <div className="animate-fade-in">
          {/* Section Description */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              Account Security & Defense Architecture
            </div>
            <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45 }}>
              This section transparently separates <strong>Active Functional Controls</strong> available on this device from <strong>Educational Security Recommendations & Architectural Roadmap</strong>.
            </div>
          </div>

          {/* ACTIVE FUNCTIONAL CONTROLS SECTION */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="badge badge-safe">ACTIVE FUNCTIONAL CONTROLS</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Operates locally on your current device</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* 1. Current Session Status & Local Logout Control */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--safe-light)' }}>
                    <Laptop size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      Current Active Browser Session
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Local device identity & session controls
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Authentication Status:</span>
                    <span style={{ fontWeight: 700, color: isAuthenticated ? 'var(--safe-light)' : '#F59E0B' }}>
                      {isAuthenticated ? 'Authenticated Account' : 'Guest / Local Session'}
                    </span>
                  </div>

                  {isAuthenticated && currentUser && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Account User:</span>
                        <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{currentUser.name}</span>
                      </div>
                      {currentUser.email && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Registered Email:</span>
                          <span style={{ color: '#FFFFFF' }}>{currentUser.email}</span>
                        </div>
                      )}
                      {currentUser.lastLoginAt && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Session Started:</span>
                          <span style={{ color: '#CBD5E1' }}>{new Date(currentUser.lastLoginAt).toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Storage Layer:</span>
                    <span style={{ color: '#CBD5E1' }}>Secure Browser LocalStorage + Memory</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      showToast('Logged out of local browser session.', 'info');
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#F87171' }}
                  >
                    <span>End Current Device Session</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentPage('login')}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <span>Log In to Nivarya</span>
                  </button>
                )}
              </div>

              {/* 2. Interactive Client-Side Password Entropy Analyzer */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                    <Fingerprint size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                      Password Strength & Entropy Analyzer
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Interactive client-side evaluation (never saved or sent)
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <input
                    type={showTestPassword ? 'text' : 'password'}
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    placeholder="Test password strength here..."
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 14px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-medium)',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '0.9rem'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTestPassword(!showTestPassword)}
                    aria-label="Toggle password visibility"
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showTestPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {testPassword && (
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Evaluation:</span>
                      <span style={{ fontWeight: 700, color: passwordStrength.color }}>{passwordStrength.label}</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${passwordStrength.percentage}%`,
                        background: passwordStrength.color,
                        transition: 'width 0.25s ease'
                      }} />
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, background: 'rgba(7, 11, 20, 0.4)', padding: '8px 10px', borderRadius: '8px' }}>
                  <strong style={{ color: '#E2E8F0' }}>Zero-Knowledge Guarantee: </strong>
                  Characters typed above remain strictly in transient browser RAM and are never cached in localStorage or transmitted over network.
                </div>
              </div>
            </div>
          </div>

          {/* EDUCATIONAL RECOMMENDATIONS & ROADMAP */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="badge badge-primary">EDUCATIONAL RECOMMENDATIONS & ROADMAP</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Best practices for your digital security perimeter</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
              {/* Card 1: Strong Passwords */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Key size={18} color="var(--primary-light)" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    1. Strong & Unique Passwords
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                  Never reuse passwords across banking, email, and social networks. If one website suffers a data breach, hackers deploy automated "credential stuffing" to compromise all your matching accounts. Use passphrases with 4+ unrelated words (e.g., <em>velvet-monsoon-granite-signal</em>).
                </p>
              </div>

              {/* Card 2: Multi-Factor Authentication */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Smartphone size={18} color="#10B981" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    2. Multi-Factor Authentication (MFA)
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                  Enable 2FA on Google, Apple ID, WhatsApp, and banking portals. Prefer software authenticator apps (TOTP like Google Authenticator or Microsoft Authenticator) over SMS-based OTPs, as SMS can be hijacked via SIM swap attacks.
                </p>
              </div>

              {/* Card 3: Session Review & Remote Logouts */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Laptop size={18} color="#06B6D4" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    3. Reviewing Active Device Sessions
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                  Regularly inspect "Logged in Devices" or "Active Sessions" in your Google, WhatsApp, and social media settings. Immediately select "Sign Out of All Other Sessions" if you notice any device, city, or browser you do not recognize.
                </p>
              </div>

              {/* Card 4: Recognizing Suspicious Login Attempts */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <AlertTriangle size={18} color="#FBBF24" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    4. Recognizing Suspicious Logins
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                  If you receive an unprompted "Allow Login?" prompt or a 6-digit verification code when you did not initiate sign-in, an attacker has guessed your password. Change your password immediately from a secure secondary device.
                </p>
              </div>

              {/* Card 5: Account Recovery Hygiene */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={18} color="#A5B4FC" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    5. Securing Account Recovery Channels
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                  Ensure your recovery email and phone number are up to date. Avoid answering standard security questions truthfully (e.g., your high school name); attackers can find those answers on your public Facebook or Instagram profiles.
                </p>
              </div>

              {/* Card 6: Architecture Roadmap */}
              <div className="card" style={{ border: '1px dashed var(--border-medium)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={18} color="var(--primary-light)" />
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                    Enterprise MFA & Remote Revocation Roadmap
                  </h4>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.45, margin: 0 }}>
                  Full multi-device remote token revocation and hardware WebAuthn / Passkeys require active Supabase / PostgreSQL backend endpoints. This architectural module will connect seamlessly once server infrastructure is verified and approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: ONLINE HARASSMENT AWARENESS */}
      {activeTab === 'harassment' && (
        <div className="animate-fade-in">
          {/* Main Hero Card */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F87171' }}>
                <ShieldAlert size={20} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#FFFFFF', fontWeight: 700, margin: 0 }}>
                  Digital Harassment, Cyberstalking & Deepfake Defense
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Practical legal guidance, evidence collection standards, and emergency helplines for women in India.
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              Online abuse—including cyberstalking, non-consensual image sharing (NCII), morphed images, and doxxing—are punishable criminal offenses under Indian law. Understanding your rights and properly collecting evidence gives you legal recourse.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Pillar 1: Evidence Collection Checklist */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <CheckSquare size={18} color="var(--primary-light)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Digital Evidence Preservation Checklist
                </h3>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                Before blocking an abuser or reporting them to the platform, preserve legally admissible evidence:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'timestampScreenshot', label: 'Take full, uncropped screenshots showing date, timestamp & device status bar' },
                  { key: 'urlAndHeader', label: 'Copy the abuser\'s full profile URL, handle name, and user ID number' },
                  { key: 'phoneAndProfile', label: 'Record the phone number or originating email headers' },
                  { key: 'chatExport', label: 'Export complete chat history (e.g. WhatsApp "Export Chat Without Media")' },
                  { key: 'doNotDelete', label: 'DO NOT delete the chat thread or message requests prematurely' },
                  { key: 'fileReport1930', label: 'File report on cybercrime.gov.in / dial 1930' }
                ].map(item => (
                  <div
                    key={item.key}
                    onClick={() => toggleChecklistItem(item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      background: 'var(--bg-surface-elevated)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {evidenceChecklist[item.key] ? (
                      <CheckCircle2 size={16} color="var(--safe-light)" style={{ flexShrink: 0 }} />
                    ) : (
                      <Square size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '0.8rem', color: evidenceChecklist[item.key] ? '#FFFFFF' : '#CBD5E1', textDecoration: evidenceChecklist[item.key] ? 'line-through' : 'none' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar 2: Non-Consensual Image Sharing & Deepfakes */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <EyeOff size={18} color="#EC4899" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Non-Consensual Image Sharing & Deepfakes
                </h3>
              </div>

              <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: 1.45, marginBottom: '14px' }}>
                If someone threatens to leak private photos or has created morphed/AI-generated deepfakes:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                    1. Never Pay Blackmail Demands
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Paying money will never stop extortion; it proves you will pay and invites further demands.
                  </div>
                </div>

                <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                    2. Use StopNCII.org
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Creates a unique cryptographic hash on your device without uploading the photo, stopping it from being shared on Facebook, Instagram, TikTok, and Reddit.
                  </div>
                </div>

                <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '3px' }}>
                    3. Report to National Cyber Crime Portal
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Select the specialized category: <em>"Report Crime Related to Women / Child"</em>. You can report anonymously if desired.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Framework in India */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '14px' }}>
              Indian Legal Protections Under IT Act & BNS (IPC)
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '4px' }}>
                  Section 66E - IT Act, 2000
                </div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Penalizes violation of privacy by intentionally capturing, publishing, or transmitting images of private body parts without consent.
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '4px' }}>
                  Section 67 & 67A - IT Act
                </div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Punishes publishing or transmitting sexually explicit or obscene material in electronic form with imprisonment up to 5 years.
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '4px' }}>
                  Section 78 BNS (IPC 354D)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Explicitly criminalizes electronic stalking: monitoring a woman's internet, email, or any other electronic communication without consent.
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '14px', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '4px' }}>
                  Section 79 BNS (IPC 509)
                </div>
                <div style={{ fontSize: '0.8rem', color: '#CBD5E1', lineHeight: 1.4 }}>
                  Penalizes words, gestures, electronic messages, or acts intended to insult the modesty of a woman.
                </div>
              </div>
            </div>
          </div>

          {/* Dedicated Women Safety Emergency Helplines */}
          <div style={{
            background: 'rgba(7, 11, 20, 0.7)',
            border: '1px solid var(--border-medium)',
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
                National Commission for Women (NCW) Support
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Dedicated 24/7 helplines for women facing violence, cyberstalking, and digital abuse across India.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="tel:7827170170"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Phone size={14} color="#10B981" />
                <span>NCW Helpline: 7827170170</span>
              </a>

              <a
                href="tel:1091"
                className="btn btn-secondary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Phone size={14} color="#818CF8" />
                <span>Women Helpline: 1091</span>
              </a>

              <a
                href="tel:112"
                className="btn btn-danger btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <Phone size={14} />
                <span>National Emergency: 112</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
