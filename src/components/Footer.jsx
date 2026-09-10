import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, ExternalLink, Heart, Lock, AlertTriangle } from 'lucide-react';

export default function Footer() {
  const { setCurrentPage, t } = useApp();

  const handleLink = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div>
            <div className="brand-link" onClick={() => handleLink('home')}>
              <div className="brand-logo-wrap">
                <img src="/shield.svg" alt="Nivarya Shield" className="brand-logo-img" />
              </div>
              <div className="brand-text-block">
                <span className="brand-title">{t.brandName}</span>
                <span className="brand-tagline">{t.tagline}</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              Next-generation proactive women safety architecture. Combining route monitoring, rapid community hazard alerts, and instant emergency response.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
              <Lock size={14} />
              <span>Zero data harvesting • Privacy-first architecture</span>
            </div>
          </div>

          {/* Features Col */}
          <div>
            <h4 className="footer-col-title">Platform Features</h4>
            <ul className="footer-links">
              <li><span className="footer-link" onClick={() => handleLink('dashboard')}>User Dashboard</span></li>
              <li><span className="footer-link" onClick={() => handleLink('journey')}>Safe Journey Tracking</span></li>
              <li><span className="footer-link" onClick={() => handleLink('map')}>Interactive Safety Map</span></li>
              <li><span className="footer-link" onClick={() => handleLink('report')}>Report an Incident</span></li>
              <li><span className="footer-link" onClick={() => handleLink('community')}>Community Safety Feed</span></li>
              <li><span className="footer-link" onClick={() => handleLink('safebot')}>SafeBot AI Advisor</span></li>
            </ul>
          </div>

          {/* Quick Support Col */}
          <div>
            <h4 className="footer-col-title">Safety Directory</h4>
            <ul className="footer-links">
              <li><span className="footer-link" onClick={() => handleLink('resources')}>National Helplines (112)</span></li>
              <li><span className="footer-link" onClick={() => handleLink('resources')}>Women Helpline (1091)</span></li>
              <li><span className="footer-link" onClick={() => handleLink('resources')}>Police Control (100)</span></li>
              <li><span className="footer-link" onClick={() => handleLink('resources')}>Medical Trauma (108)</span></li>
              <li><span className="footer-link" onClick={() => handleLink('contacts')}>Manage Trusted Contacts</span></li>
              <li><span className="footer-link" onClick={() => handleLink('profile')}>Emergency Profile & PIN</span></li>
            </ul>
          </div>

          {/* Company & Ethics Col */}
          <div>
            <h4 className="footer-col-title">About & Transparency</h4>
            <ul className="footer-links">
              <li><span className="footer-link" onClick={() => handleLink('about')}>Mission & Vision</span></li>
              <li><span className="footer-link" onClick={() => handleLink('about')}>Proactive Safety Philosophy</span></li>
              <li><span className="footer-link" onClick={() => handleLink('about')}>Technology Roadmap</span></li>
              <li><span className="footer-link" onClick={() => handleLink('about')}>Honesty & Ethics Policy</span></li>
            </ul>
          </div>
        </div>

        {/* Prototype Transparency Notice Box */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <AlertTriangle size={20} color="#F87171" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.5' }}>
            <strong style={{ color: '#F87171' }}>Honest Prototype Notice: </strong>
            Nivarya is currently demonstrated as a functional prototype MVP. Emergency triggers, live simulated GPS tracking, automated check-ins, and mock contact pings operate within this application environment. In an active, life-threatening emergency, always contact official national authorities directly via <strong>112</strong> or <strong>1091</strong>.
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} NIVARYA Technologies. Move Without Fear. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => handleLink('about')}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }} onClick={() => handleLink('about')}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }} onClick={() => handleLink('about')}>Community Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
