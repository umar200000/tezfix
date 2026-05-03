// Tiny notification beep via Web Audio API. No assets, lazily creates the AudioContext.
// Mobile browsers (and Telegram WebApp) require a prior user gesture before audio plays —
// since the user has already interacted with the app by the time leads come in, this
// is reliable in practice. If the AudioContext is suspended, we try to resume it.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/**
 * Plays a short two-tone notification chirp.
 */
export function playNotificationBeep() {
  const c = getCtx();
  if (!c) return;
  try {
    const now = c.currentTime;
    const tone = (freq: number, start: number, duration: number) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain).connect(c.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.05);
    };
    tone(880, 0, 0.18);
    tone(1320, 0.12, 0.22);
  } catch {
    /* no-op */
  }
}
