// Native Web Audio API Synthesizer for SOS Alarm & Beeps
let audioCtx = null;
let sirenOsc = null;
let sirenGain = null;
let sirenLfo = null;
let isSirenPlaying = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playCountdownBeep(freq = 880, duration = 0.15) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Audio beep error (non-fatal):', err);
  }
}

export function startEmergencySiren() {
  if (isSirenPlaying) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Main carrier oscillator
    sirenOsc = ctx.createOscillator();
    sirenGain = ctx.createGain();

    sirenOsc.type = 'sawtooth';
    sirenOsc.frequency.setValueAtTime(800, ctx.currentTime);

    // LFO to modulate frequency between ~700Hz and ~1200Hz
    sirenLfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    sirenLfo.frequency.setValueAtTime(1.5, ctx.currentTime); // 1.5 Hz cycle
    lfoGain.gain.setValueAtTime(300, ctx.currentTime); // sweep depth

    sirenLfo.connect(lfoGain);
    lfoGain.connect(sirenOsc.frequency);

    // Master volume for safety (comfortable hearing level)
    sirenGain.gain.setValueAtTime(0.18, ctx.currentTime);

    sirenOsc.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    sirenOsc.start();
    sirenLfo.start();
    isSirenPlaying = true;
  } catch (err) {
    console.warn('Siren audio error (non-fatal):', err);
  }
}

export function stopEmergencySiren() {
  try {
    if (sirenOsc) {
      sirenOsc.stop();
      sirenOsc.disconnect();
      sirenOsc = null;
    }
    if (sirenLfo) {
      sirenLfo.stop();
      sirenLfo.disconnect();
      sirenLfo = null;
    }
    if (sirenGain) {
      sirenGain.disconnect();
      sirenGain = null;
    }
    isSirenPlaying = false;
  } catch (err) {
    console.warn('Error stopping siren:', err);
    isSirenPlaying = false;
  }
}

export function isSirenActive() {
  return isSirenPlaying;
}
