import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Target, 
  Eye, 
  Users, 
  Cpu, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Heart
} from 'lucide-react';

export default function AboutPage() {
  const { setCurrentPage, t } = useApp();

  const targetUsers = [
    { title: 'College & University Students', desc: 'Heading home from evening lectures, library sessions, or campus labs.' },
    { title: 'Working Women & Shift Commuters', desc: 'Commuting in late-night cabs, suburban trains, or empty metro corridors.' },
    { title: 'Solo Travelers', desc: 'Navigating unfamiliar cities, bus terminals, and transit hubs with confidence.' },
    { title: 'Public Transport Users', desc: 'Relying on buses, auto-rickshaws, and shared transit with proactive route tracking.' },
    { title: 'Hostel & PG Residents', desc: 'Managing curfew check-ins, local area awareness, and campus security contacts.' }
  ];

  const roadmapPhases = [
    {
      phase: 'Phase 1 (Current)',
      title: 'Responsive Web MVP & Simulation Engine',
      desc: 'High-fidelity prototype featuring Safe Journey tracking, 3s cancel window SOS, community incident radar, and multilingual support.'
    },
    {
      phase: 'Phase 2',
      title: 'Wearable Hardware & Bluetooth Panic Trigger',
      desc: 'Discreet smart jewelry / keychain physical trigger paired via BLE for instant SOS dispatch without touching the smartphone.'
    },
    {
      phase: 'Phase 3',
      title: 'Municipal Police CAD & Pink Patrol API Integration',
      desc: 'Direct digital tie-in with State Emergency Response Support Systems (ERSS 112) for automated distress packet dispatch.'
    }
  ];

  return (
    <div className="about-page container animate-fade-in" style={{ paddingTop: '24px', maxWidth: '960px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '36px' }}>
        <span className="section-tag">
          <Shield size={14} />
          <span>Our Foundation</span>
        </span>
        <h1 className="section-title">
          About NIVARYA
        </h1>
        <p className="section-desc">
          Engineering a future where every woman can move freely, confidently, and without fear.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <div className="card" style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)', borderColor: 'rgba(99, 102, 241, 0.35)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-subtle)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Target size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '10px' }}>
            {t.about.missionTitle}
          </h2>
          <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: '1.65' }}>
            "{t.about.missionText}"
          </p>
        </div>

        <div className="card" style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--safe-bg)', color: 'var(--safe-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Eye size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '10px' }}>
            {t.about.visionTitle}
          </h2>
          <p style={{ fontSize: '1rem', color: '#CBD5E1', lineHeight: '1.65' }}>
            "{t.about.visionText}"
          </p>
        </div>
      </div>

      {/* Proactive vs Reactive Philosophy */}
      <div className="card" style={{ marginBottom: '40px', padding: '36px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '12px' }}>
          The Philosophy: Proactive Safety Architecture
        </h2>
        <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '20px' }}>
          For decades, personal safety technology has relied almost exclusively on a single premise: pressing an emergency button when an attack occurs. However, real-world studies show that in genuine physical danger, victims often have neither the time nor the physical freedom to unlock a smartphone, navigate to an app, and trigger an alert.
        </p>
        <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.7' }}>
          Nivarya re-imagines safety as a proactive lifecycle:
          <br /><strong style={{ color: '#818CF8' }}>1. Pre-Journey:</strong> Crowd-sourced safety maps highlight unlit or risky zones so you can plan well-lit routes.
          <br /><strong style={{ color: '#34D399' }}>2. Mid-Journey:</strong> Scheduled milestone check-ins notify your guardians automatically if an expected check-in is missed.
          <br /><strong style={{ color: '#F87171' }}>3. Escalation:</strong> Deterrent sirens, simulated GPS broadcasts, and 1-tap connects to official authorities if an active threat is encountered.
        </p>
      </div>

      {/* Target Users */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '20px' }}>
          Who Nivarya Is Built For
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {targetUsers.map((u, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <h3 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '6px' }}>{u.title}</h3>
              <p style={{ fontSize: '0.84rem', color: '#94A3B8', lineHeight: '1.5' }}>{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Startup Technology Roadmap */}
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#FFFFFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={22} color="#6366F1" />
          <span>Technology & Scaling Roadmap</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {roadmapPhases.map((r, idx) => (
            <div key={idx} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <span className="badge badge-primary">{r.phase}</span>
                <h3 style={{ fontSize: '1.1rem', color: '#FFFFFF' }}>{r.title}</h3>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#CBD5E1', lineHeight: '1.6' }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Honesty Rules */}
      <div className="card" style={{
        background: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.35)',
        padding: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F87171', marginBottom: '14px' }}>
          <AlertTriangle size={24} />
          <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF' }}>Ethics, Honesty & Transparency Policy</h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: '1.65', marginBottom: '16px' }}>
          Safety applications carry life-critical responsibility. Nivarya upholds strict technological honesty:
        </p>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#CBD5E1' }}>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#F87171', fontWeight: 800 }}>•</span>
            <span><strong>Zero False Claims:</strong> We never claim that police or ambulances are dispatched in prototype mode.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#F87171', fontWeight: 800 }}>•</span>
            <span><strong>Clear Demarcation:</strong> All simulated features are clearly tagged with prototype indicators.</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#10B981', fontWeight: 800 }}>•</span>
            <span><strong>Data Sovereignty:</strong> No tracking telemetry or private user locations are sold or harvested.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
