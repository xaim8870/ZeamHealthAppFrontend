let musicAudio: HTMLAudioElement | null = null;

const TRACKS = [
  "/assets/music/Calm.wav",
  "/assets/music/Depth.wav",
];

const MUSIC_VOLUME = 0.12;

const pickTrack = () => TRACKS[Math.floor(Math.random() * TRACKS.length)];

const getMusic = () => {
  if (!musicAudio) {
    const audio = new Audio(pickTrack());
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = MUSIC_VOLUME;

    // helpful for mobile Safari
    (audio as any).playsInline = true;

    audio.addEventListener("error", (e) => console.warn("❌ music error", e));
    audio.addEventListener("play", () => console.log("▶️ music play"));
    audio.addEventListener("pause", () => console.log("⏸️ music pause"));

    musicAudio = audio;
  }
  return musicAudio;
};

// ✅ Must be called from a USER GESTURE (button click)
export const unlockMusic = async () => {
  const m = getMusic();
  try {
    m.muted = true;
    // load first to reduce race conditions
    m.load();
    await m.play();     // “unlock” play
    m.pause();
    m.currentTime = 0;
    m.muted = false;
    console.log("🔓 music unlocked");
  } catch (err) {
    console.warn("🔇 unlockMusic blocked:", err);
  }
};

const waitCanPlay = (m: HTMLAudioElement) =>
  new Promise<void>((resolve, reject) => {
    if (m.readyState >= 2) return resolve(); // HAVE_CURRENT_DATA
    const onOk = () => { cleanup(); resolve(); };
    const onErr = () => { cleanup(); reject(new Error("music load error")); };
    const cleanup = () => {
      m.removeEventListener("canplay", onOk);
      m.removeEventListener("error", onErr);
    };
    m.addEventListener("canplay", onOk, { once: true });
    m.addEventListener("error", onErr, { once: true });
    m.load();
  });

export const startMusic = async (opts?: { restart?: boolean; randomise?: boolean }) => {
  const m = getMusic();

  if (opts?.randomise) {
    m.src = pickTrack();
    m.load();
  }

  if (opts?.restart) m.currentTime = 0;

  try {
    await waitCanPlay(m);
    await m.play();
  } catch (err) {
    console.warn("🔇 startMusic blocked/failed:", err, {
      readyState: m.readyState,
      paused: m.paused,
      src: m.src,
    });
  }
};
export const stopMusic = () => {
  const m = getMusic();
  m.pause();
  m.currentTime = 0;
};

export const setMusicVolume = (v: number) => {
  const m = getMusic();
  m.volume = Math.max(0, Math.min(1, v));
};