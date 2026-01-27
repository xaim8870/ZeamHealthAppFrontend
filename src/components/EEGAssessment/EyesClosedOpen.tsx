import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playBeep } from "../../utils/playBeep";

interface Props {
  onComplete: () => void;
}

/* ================= CONFIG ================= */
const STAGE_DURATION = 60;
const INSTRUCTION_DURATION = 5;

/*
  🎵 EEG CALM MUSIC (WAV)
  Files must be inside:
  public/assets/music/
*/
const MUSIC_TRACKS = [
  "/assets/music/1.wav",
  "/assets/music/2.wav",
  "/assets/music/3.wav",
];

/*
  🔊 MUSIC VOLUME (0.0 – 1.0)
  👉 Uncomment to tune
*/
const MUSIC_VOLUME = 0.1;

type Stage = "closed" | "open";
type Phase = "instruction" | "running";

const EyesClosedOpen: React.FC<Props> = ({ onComplete }) => {
  const [stage, setStage] = useState<Stage>("closed");
  const [phase, setPhase] = useState<Phase>("instruction");
  const [timeLeft, setTimeLeft] = useState(STAGE_DURATION);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ================= AUDIO SETUP ================= */
  useEffect(() => {
    // 🎲 pick random WAV
    const track =
      MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];

    const audio = new Audio(track);
    audio.loop = true;
    audio.preload = "auto"; // IMPORTANT for WAV

    // 🔊 safe EEG volume
    audio.volume = 0.35;
    // audio.volume = MUSIC_VOLUME; // ← optional

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  /* ================= INSTRUCTION PHASE ================= */
  useEffect(() => {
    if (phase !== "instruction") return;

    const t = setTimeout(() => {
      setPhase("running");
      setTimeLeft(STAGE_DURATION);

      // ▶ play only during eyes-closed
      if (stage === "closed") {
        audioRef.current?.play().catch(() => {});
      }
    }, INSTRUCTION_DURATION * 1000);

    return () => clearTimeout(t);
  }, [phase, stage]);

  /* ================= RUNNING TIMER ================= */
  useEffect(() => {
    if (phase !== "running") return;

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  /* ================= STAGE TRANSITION ================= */
  useEffect(() => {
    if (phase !== "running" || timeLeft > 0) return;

    playBeep();
    audioRef.current?.pause();

    if (stage === "closed") {
      setStage("open");
      setPhase("instruction");
    } else {
      onComplete();
    }
  }, [timeLeft, phase, stage, onComplete]);

  /* ================= PROGRESS RING ================= */
  const progress = 1 - timeLeft / STAGE_DURATION;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const instruction =
    stage === "closed" ? "Close your eyes" : "Open your eyes";

  const subText =
    stage === "closed"
      ? "Relax. Breathe slowly. Stay still."
      : "Remain still and focused.";

  const ringColor = stage === "closed" ? "#38bdf8" : "#facc15";

  /* ================= UI ================= */
  return (
    <div
      className="
        relative w-full max-w-md h-[420px]
        rounded-3xl p-6
        bg-gradient-to-br from-[#0b1220] to-[#05070b]
        border border-cyan-900/40
        shadow-[0_0_80px_rgba(56,189,248,0.08)]
        flex flex-col justify-center items-center
      "
    >
      {/* TEXT */}
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 px-6">
        <AnimatePresence mode="wait">
          {phase === "instruction" && (
            <motion.div
              key={`instruction-${stage}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="text-center space-y-3"
            >
              <h3 className="text-2xl font-semibold text-cyan-300">
                {instruction}
              </h3>
              <p className="text-sm text-cyan-200/70">{subText}</p>
              <p className="text-xs text-cyan-400/60">
                Starting in {INSTRUCTION_DURATION} seconds
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WHEEL */}
      <AnimatePresence>
        {phase === "running" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <svg
              width="160"
              height="160"
              viewBox="0 0 120 120"
              className="-rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke="#1f2937"
                strokeWidth="6"
                fill="none"
              />
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={ringColor}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EyesClosedOpen;
