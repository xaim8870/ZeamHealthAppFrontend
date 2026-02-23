// src/utils/playBeep.ts
let beepAudio: HTMLAudioElement | null = null;
let stopTimer: number | null = null;

const BEEP_VOLUME = 0.2;       // increase/decrease (0.0 to 1.0)
const BEEP_DURATION_MS = 1000;   // 0.1s
const BEEP_START_AT = 0;     // IMPORTANT: skip initial silence (tune 0.00–0.08)

const getBeep = () => {
  if (!beepAudio) {
    beepAudio = new Audio("/assets/beep.mp3");
    beepAudio.preload = "auto";
    beepAudio.volume = BEEP_VOLUME;
  }
  return beepAudio;
};

export const unlockAudio = async () => {
  const a = getBeep();
  try {
    a.muted = true;
    await a.play();
    a.pause();
    a.currentTime = 0;
    a.muted = false;
  } catch {
    // ignore
  }
};

export const playBeep = async () => {
  const a = getBeep();

  // cancel previous stop
  if (stopTimer) {
    window.clearTimeout(stopTimer);
    stopTimer = null;
  }

  // stop any currently playing beep
  a.pause();

  // apply volume every time
  a.volume = BEEP_VOLUME;

  try {
    // skip mp3 leading silence so 0.1s actually contains sound
    a.currentTime = BEEP_START_AT;

    await a.play();

    // hard stop at 0.1s
    stopTimer = window.setTimeout(() => {
      a.pause();
      a.currentTime = 0;
      stopTimer = null;
    }, BEEP_DURATION_MS);
  } catch (e) {
    // usually autoplay restriction
    // console.warn("beep blocked:", e);
  }
};
