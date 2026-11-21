// Tiny WebAudio sound effects, generated on the fly. No audio files,
// no network. Everything is guarded so the game stays silent (but
// playable) when audio is unavailable or the browser blocks it.
let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  muted = !muted;
  return muted;
}

function ensureContext() {
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, start, dur, type, gain, slideTo) {
  const ac = ensureContext();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    const t0 = ac.currentTime + start;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  } catch {
    /* silent */
  }
}

// Bright rising arpeggio when a difference is found.
export function playChime() {
  tone(659.25, 0, 0.16, 'sine', 0.16);
  tone(830.61, 0.09, 0.16, 'sine', 0.16);
  tone(987.77, 0.18, 0.28, 'sine', 0.18);
}

// Dull low thud for a wrong mark.
export function playThud() {
  tone(140, 0, 0.18, 'triangle', 0.2, 70);
}

// Soft sparkle when a hint is used.
export function playHint() {
  tone(1046.5, 0, 0.12, 'sine', 0.1);
  tone(1318.5, 0.08, 0.2, 'sine', 0.1);
}

// Little fanfare for clearing a round / winning.
export function playFanfare() {
  tone(523.25, 0, 0.14, 'triangle', 0.14);
  tone(659.25, 0.12, 0.14, 'triangle', 0.14);
  tone(783.99, 0.24, 0.14, 'triangle', 0.14);
  tone(1046.5, 0.36, 0.34, 'triangle', 0.16);
}
