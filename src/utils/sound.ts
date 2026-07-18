// Cyberpunk Sound FX Engine utilizing Web Audio API
// Lazy initialization to conform with browser autoplay policies

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playClick(enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function playSuccess(enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;

  // Sound 1: Sub Bass drop
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();
  subOsc.type = 'sine';
  subOsc.frequency.setValueAtTime(90, now);
  subOsc.frequency.linearRampToValueAtTime(45, now + 0.3);
  subGain.gain.setValueAtTime(0.15, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  subOsc.connect(subGain);
  subGain.connect(ctx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.35);

  // Sound 2: Cyberspace register beep sequence (glowing arpeggio)
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
  notes.forEach((freq, idx) => {
    const noteOsc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    noteOsc.type = 'triangle';
    noteOsc.frequency.setValueAtTime(freq, now + idx * 0.06);
    
    noteGain.gain.setValueAtTime(0.06, now + idx * 0.06);
    noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.15);
    
    noteOsc.connect(noteGain);
    noteGain.connect(ctx.destination);
    
    noteOsc.start(now + idx * 0.06);
    noteOsc.stop(now + idx * 0.06 + 0.16);
  });
}

export function playChime(enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  
  // Double futuristic chime
  [587.33, 880.00].forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.08);
    
    gain.gain.setValueAtTime(0.05, now + idx * 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now + idx * 0.08);
    osc.stop(now + idx * 0.08 + 0.26);
  });
}

// Low humming ambient soundscape
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

export function toggleAmbientHum(active: boolean) {
  if (typeof window === 'undefined') return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!active) {
    if (ambientOsc1) { try { ambientOsc1.stop(); } catch(e){} ambientOsc1 = null; }
    if (ambientOsc2) { try { ambientOsc2.stop(); } catch(e){} ambientOsc2 = null; }
    if (ambientGain) { try { ambientGain.disconnect(); } catch(e){} ambientGain = null; }
    return;
  }

  if (ambientOsc1) return; // already running

  if (ctx.state === 'suspended') ctx.resume();

  const now = ctx.currentTime;
  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(0.0, now);
  ambientGain.gain.linearRampToValueAtTime(0.03, now + 1.5); // slow fade-in

  // 55Hz Low-C power hum
  ambientOsc1 = ctx.createOscillator();
  ambientOsc1.type = 'sine';
  ambientOsc1.frequency.setValueAtTime(55, now);

  // 110Hz harmonic overlay
  ambientOsc2 = ctx.createOscillator();
  ambientOsc2.type = 'triangle';
  ambientOsc2.frequency.setValueAtTime(110, now);

  // Lowpass filter to keep it extremely warm and subby
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(90, now);

  ambientOsc1.connect(filter);
  ambientOsc2.connect(filter);
  filter.connect(ambientGain);
  ambientGain.connect(ctx.destination);

  ambientOsc1.start();
  ambientOsc2.start();
}
