// src/utils/playBeep.ts
let beepAudio: HTMLAudioElement | null = null;

/** Create/reuse the beep element */
const getBeep = () => {
  if (!beepAudio) {
    beepAudio = new Audio("/assets/beep.mp3");
    beepAudio.preload = "auto";
    beepAudio.volume = 0.5; // adjust
  }
  return beepAudio;
};

/** Call once on a user interaction (Start button etc.) */
export const unlockAudio = async () => {
  const a = getBeep();
  try {
    // try to "prime" playback to satisfy autoplay restrictions
    a.muted = true;
    await a.play();
    a.pause();
    a.currentTime = 0;
    a.muted = false;
  } catch {
    // ignore (some browsers still block until another gesture)
  }
};

export const playBeep = async () => {
  const a = getBeep();
  try {
    a.currentTime = 0; // replay instantly
    await a.play();
  } catch {
    // blocked by autoplay policy (means unlockAudio wasn't triggered by a gesture)
  }
};
// this function unlocks music playback on user gesture
let musicUnlockEl: HTMLAudioElement | null = null;

export const unlockMusic = async () => {
  try {
    // pick ANY one of your music tracks (doesn't matter which for unlocking)
    musicUnlockEl ??= new Audio("/assets/music/AXIS1173_17_Calm_Full.wav");
    musicUnlockEl.loop = true;
    musicUnlockEl.volume = 0;     // silent
    musicUnlockEl.preload = "auto";

    await musicUnlockEl.play();   // ✅ this is the key (must happen on user gesture)
    musicUnlockEl.pause();
    musicUnlockEl.currentTime = 0;
  } catch (e) {
    console.warn("unlockMusic failed:", e);
  }
};
