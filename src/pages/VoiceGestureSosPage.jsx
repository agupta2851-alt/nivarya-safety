import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Mic, 
  MicOff, 
  Smartphone, 
  Volume2, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Settings, 
  Sparkles, 
  HelpCircle,
  Radio
} from 'lucide-react';

export default function VoiceGestureSosPage() {
  const { 
    voiceSosEnabled, 
    setVoiceSosEnabled, 
    voiceTriggerPhrase, 
    setVoiceTriggerPhrase, 
    voiceSensitivity, 
    setVoiceSensitivity, 
    isListeningVoice, 
    toggleVoiceListening, 
    triggerSimulatedVoiceSos, 
    gestureSosEnabled, 
    setGestureSosEnabled, 
    gestureSensitivity, 
    setGestureSensitivity, 
    triggerSimulatedGestureSos,
    showToast 
  } = useApp();

  const [phraseInput, setPhraseInput] = useState(voiceTriggerPhrase);
  const [accelData, setAccelData] = useState({ x: 0.2, y: 9.8, z: 1.1 });
  const [isShakeSimulating, setIsShakeSimulating] = useState(false);

  // Web Speech API / Simulated listener
  useEffect(() => {
    if (!isListeningVoice) return;

    let recognition = null;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.trim().toUpperCase();
            if (transcript.includes(voiceTriggerPhrase.toUpperCase())) {
              triggerSimulatedVoiceSos();
              break;
            }
          }
        };

        recognition.onerror = () => {
          // Graceful fallback to background simulation
        };

        recognition.start();
      } catch (err) {
        // Fallback simulation mode
      }
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch (e) { /* ignore */ }
      }
    };
  }, [isListeningVoice, voiceTriggerPhrase]);

  // Motion simulation
  useEffect(() => {
    if (!isShakeSimulating) return;

    const interval = setInterval(() => {
      setAccelData({
        x: (Math.random() * 24 - 12).toFixed(1),
        y: (Math.random() * 24 - 12).toFixed(1),
        z: (Math.random() * 24 - 12).toFixed(1)
      });
    }, 100);

    const timeout = setTimeout(() => {
      setIsShakeSimulating(false);
      triggerSimulatedGestureSos();
    }, 900);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isShakeSimulating]);

  const handleSavePhrase = (e) => {
    e.preventDefault();
    if (!phraseInput.trim()) return;
    setVoiceTriggerPhrase(phraseInput.trim().toUpperCase());
    showToast(`Emergency trigger phrase set to: "${phraseInput.trim().toUpperCase()}"`, 'safe');
  };

  const handleTestShake = () => {
    setIsShakeSimulating(true);
    showToast('Simulating rapid 3-axis violent shake...', 'info');
  };

  return (
    <div className="container" style={{ padding: '36px 16px 80px 16px' }}>
      {/* Header */}
      <div className="section-header text-center" style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '9999px',
          padding: '6px 16px',
          color: 'var(--primary-light)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '12px'
        }}>
          <Sparkles size={16} />
          <span>HANDS-FREE SENSOR EMERGENCY ACTIVATION</span>
        </div>
        <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '10px' }}>
          Voice & Gesture-Activated SOS
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', fontSize: '1.02rem', lineHeight: 1.6 }}>
          Trigger emergency broadcasts discreetly without unlocking your phone — by speaking your secret phrase or vigorously shaking your device.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '28px', marginBottom: '32px' }}>
        {/* Feature 7: Voice Activated SOS Card */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-light)' }}>
                <Mic size={22} />
              </div>
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                  Voice-Activated SOS
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Acoustic Keyword Recognizer
                </span>
              </div>
            </div>

            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={voiceSosEnabled}
                onChange={(e) => setVoiceSosEnabled(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Listens continuously in low-power mode for your designated distress phrase. When detected with high confidence, triggers instant emergency broadcast.
          </p>

          {/* Trigger Phrase Input Form */}
          <form onSubmit={handleSavePhrase} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              Secret Distress Trigger Phrase
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text"
                className="input-field"
                value={phraseInput}
                onChange={(e) => setPhraseInput(e.target.value)}
                placeholder="e.g. HELP NIVARYA or BACHAO"
                style={{ flex: 1, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Save
              </button>
            </div>
          </form>

          {/* Sensitivity Setting */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
              Acoustic Sensitivity Level
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <button 
                type="button"
                className={`btn btn-sm ${voiceSensitivity === 'normal' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setVoiceSensitivity('normal')}
              >
                Normal (Balanced)
              </button>
              <button 
                type="button"
                className={`btn btn-sm ${voiceSensitivity === 'high' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setVoiceSensitivity('high')}
              >
                High (Noisy Ambient)
              </button>
            </div>
          </div>

          {/* Active Audio Wave Visualizer & Test */}
          <div style={{
            background: isListeningVoice ? 'rgba(99, 102, 241, 0.12)' : 'rgba(7, 11, 20, 0.5)',
            border: `1px solid ${isListeningVoice ? 'var(--primary)' : 'var(--border-subtle)'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: isListeningVoice ? 'var(--primary-light)' : 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>
              {isListeningVoice ? <Radio size={16} className="animate-pulse" /> : <MicOff size={16} />}
              <span>{isListeningVoice ? `LISTENING FOR "${voiceTriggerPhrase}"` : 'MIC STANDBY'}</span>
            </div>

            {isListeningVoice && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '24px', marginBottom: '12px' }}>
                <span style={{ width: '4px', height: '14px', background: 'var(--primary-light)', borderRadius: '2px', animation: 'pulse 0.8s infinite' }}></span>
                <span style={{ width: '4px', height: '22px', background: 'var(--primary-light)', borderRadius: '2px', animation: 'pulse 0.6s infinite 0.1s' }}></span>
                <span style={{ width: '4px', height: '18px', background: 'var(--primary-light)', borderRadius: '2px', animation: 'pulse 0.9s infinite 0.2s' }}></span>
                <span style={{ width: '4px', height: '10px', background: 'var(--primary-light)', borderRadius: '2px', animation: 'pulse 0.7s infinite 0.3s' }}></span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className={`btn btn-sm ${isListeningVoice ? 'btn-secondary' : 'btn-safe'}`}
                onClick={toggleVoiceListening}
                style={{ flex: 1 }}
              >
                {isListeningVoice ? 'Pause Listening' : 'Start Mic Listener'}
              </button>
              <button 
                className="btn btn-sm btn-danger"
                onClick={triggerSimulatedVoiceSos}
                style={{ flex: 1 }}
              >
                Simulate Phrase Match
              </button>
            </div>
          </div>
        </div>

        {/* Feature 8: Shake / Gesture SOS Card */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F87171' }}>
                <Smartphone size={22} />
              </div>
              <div>
                <h3 style={{ color: '#FFFFFF', fontSize: '1.2rem', fontWeight: 700 }}>
                  Shake / Gesture SOS
                </h3>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Hardware Accelerometer Sensor
                </span>
              </div>
            </div>

            <label className="toggle-switch">
              <input 
                type="checkbox"
                checked={gestureSosEnabled}
                onChange={(e) => setGestureSosEnabled(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <p style={{ color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
            Trigger emergency response by shaking your phone rapidly 3 times, even when the screen is locked or in your pocket.
          </p>

          {/* Accelerometer Sensitivity Slider */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
              <span>Shake Sensitivity Threshold</span>
              <span style={{ color: '#F87171', fontWeight: 700 }}>{gestureSensitivity} m/s²</span>
            </div>
            <input 
              type="range"
              min="12"
              max="28"
              value={gestureSensitivity}
              onChange={(e) => setGestureSensitivity(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#EF4444', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>High Sensitivity (Gentle)</span>
              <span>Medium</span>
              <span>Low (Violent Only)</span>
            </div>
          </div>

          {/* Live Accelerometer HUD */}
          <div style={{
            background: isShakeSimulating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(7, 11, 20, 0.5)',
            border: `1px solid ${isShakeSimulating ? '#EF4444' : 'var(--border-subtle)'}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase' }}>
              Simulated 3-Axis Accelerometer Telemetry
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>X-Axis</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {accelData.x}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Y-Axis</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {accelData.y}
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '8px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Z-Axis</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'monospace' }}>
                  {accelData.z}
                </div>
              </div>
            </div>

            <button 
              className="btn btn-danger btn-block"
              onClick={handleTestShake}
              disabled={isShakeSimulating}
            >
              <Activity size={18} />
              <span>{isShakeSimulating ? 'Detecting 3 Rapid Shakes...' : 'Test Shake Gesture Trigger'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Protocol Advisory */}
      <div className="glass-card" style={{ padding: '24px', borderRadius: '18px' }}>
        <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="var(--primary-light)" />
          <span>Accidental Activation Safeguard</span>
        </h4>
        <p style={{ color: '#94A3B8', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
          Both Voice and Shake triggers launch Nivarya's <strong>3-Second Emergency Confirmation Window</strong> with audible beep alerts. If triggered accidentally while running or adjusting your phone, simply tap <strong>"Cancel Alert"</strong> before the timer reaches zero.
        </p>
      </div>
    </div>
  );
}
