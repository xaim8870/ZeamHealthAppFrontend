let audioContext: AudioContext | null = null;

const getCtx = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

/** Optional: call once on a user click to unlock audio */
export const unlockAudio = async () => {
  const ctx = getCtx();
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      // ignore
    }
  }
};

export const playBeep = async () => {
  const ctx = getCtx();

  // ✅ CRITICAL: resume if suspended (otherwise silent on many devices)
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return; // blocked by autoplay policy
    }
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, ctx.currentTime);

  // smooth envelope (prevents click + increases audibility)
  gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.10, ctx.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.16);
};
