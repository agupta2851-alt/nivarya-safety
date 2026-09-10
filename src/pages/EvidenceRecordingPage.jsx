import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Camera, 
  Mic, 
  Square, 
  Play, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Download, 
  Clock, 
  HardDrive, 
  MapPin, 
  AlertCircle,
  Video,
  FileText
} from 'lucide-react';

export default function EvidenceRecordingPage() {
  const { 
    isRecordingEvidence, 
    evidenceType, 
    recordedEvidenceList, 
    startEvidenceRecording, 
    stopEvidenceRecording, 
    deleteEvidence,
    currentCoordinates,
    showToast 
  } = useApp();

  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activePlaybackId, setActivePlaybackId] = useState(null);

  useEffect(() => {
    let timer = null;
    if (isRecordingEvidence) {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingEvidence]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const handleSimulatePlayback = (item) => {
    setActivePlaybackId(item.id);
    showToast(`Playing encrypted evidence buffer [${item.title}]`, 'info');
    setTimeout(() => {
      setActivePlaybackId(null);
    }, 4000);
  };

  return (
    <div className="container" style={{ padding: '36px 16px 80px 16px' }}>
      {/* Header */}
      <div className="section-header text-center" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '9999px',
          padding: '6px 16px',
          color: '#F87171',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <Lock size={16} />
          <span>TAMPER-EVIDENT EVIDENCE VAULT • LOCAL AES-256</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Automatic & Discreet Evidence Recorder
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Automatically archives discreet audio & video buffers upon SOS trigger or on-demand. Stored locally with cryptographic timestamps for legal admissibility.
        </p>
      </div>

      {/* Live Recording HUD Card */}
      <div className="glass-card" style={{
        padding: '32px',
        borderRadius: '18px',
        marginBottom: '36px',
        border: isRecordingEvidence ? '2px solid #EF4444' : '1px solid var(--border-subtle)',
        background: isRecordingEvidence ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isRecordingEvidence ? '#EF4444' : '#10B981',
                animation: isRecordingEvidence ? 'pulse 1s infinite' : 'none'
              }}></span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isRecordingEvidence ? '#F87171' : 'var(--safe-light)', textTransform: 'uppercase' }}>
                {isRecordingEvidence ? `DISCREET ${evidenceType?.toUpperCase()} CAPTURE ACTIVE` : 'RECORDER STANDBY'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#FFFFFF', fontWeight: 700 }}>
              {isRecordingEvidence ? `Recording Buffer: ${formatTime(recordingSeconds)}` : 'On-Demand Evidence Capture'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              Geotagged Location: {currentCoordinates.address}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {!isRecordingEvidence ? (
              <>
                <button 
                  className="btn btn-danger"
                  onClick={() => startEvidenceRecording('audio')}
                >
                  <Mic size={18} />
                  <span>Start Discreet Audio (Mic)</span>
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => startEvidenceRecording('video')}
                >
                  <Camera size={18} />
                  <span>Start Video Buffer</span>
                </button>
              </>
            ) : (
              <button 
                className="btn btn-danger btn-lg"
                onClick={stopEvidenceRecording}
                style={{ background: '#DC2626', animation: 'pulse 1.5s infinite' }}
              >
                <Square size={18} />
                <span>Stop & Encrypt Recording</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Evidence History Table / Vault */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', fontWeight: 700 }}>
              Encrypted Local Evidence Archive ({recordedEvidenceList.length})
            </h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              Files stay encrypted on your device. Only you can view or download.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--safe-light)', fontSize: '0.82rem', fontWeight: 600 }}>
            <ShieldCheck size={16} />
            <span>Encrypted with User Safety PIN</span>
          </div>
        </div>

        {recordedEvidenceList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <FileText size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
            <p>No evidence files recorded yet. Automatic capture triggers on SOS.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recordedEvidenceList.map((item) => {
              const isPlaying = activePlaybackId === item.id;

              return (
                <div 
                  key={item.id}
                  style={{
                    background: 'rgba(7, 11, 20, 0.6)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: item.type === 'video' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: item.type === 'video' ? 'var(--primary-light)' : '#F87171',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.type === 'video' ? <Video size={20} /> : <Mic size={20} />}
                    </div>

                    <div>
                      <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{item.title}</span>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.status}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
                        <span><Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />{item.duration}</span>
                        <span><HardDrive size={12} style={{ display: 'inline', marginRight: '3px' }} />{item.size}</span>
                        <span><MapPin size={12} style={{ display: 'inline', marginRight: '3px' }} />{item.location}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button 
                      className={`btn btn-sm ${isPlaying ? 'btn-safe' : 'btn-secondary'}`}
                      onClick={() => handleSimulatePlayback(item)}
                    >
                      <Play size={14} />
                      <span>{isPlaying ? 'Playing...' : 'Play Buffer'}</span>
                    </button>

                    <button 
                      className="btn btn-sm btn-ghost"
                      onClick={() => showToast(`Encrypted ${item.type} archive packaged for download.`, 'safe')}
                      title="Download Evidence"
                    >
                      <Download size={14} />
                    </button>

                    <button 
                      className="btn btn-sm btn-ghost text-danger"
                      onClick={() => deleteEvidence(item.id)}
                      title="Delete Evidence"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
