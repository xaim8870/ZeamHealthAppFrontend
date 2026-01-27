import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playBeep } from "../../utils/playBeep";

interface AlphaReactiveProps {
  onComplete: () => void;
}

type Phase =
  | "eyesClosed"
  | "eyesOpen"
  | "eyesClosed2"
  | "eyesOpen2"
  | "imageBreathing";

type ScreenPhase = "instruction" | "running";

const PHASE_DURATION = 30; // seconds (hidden)
const INSTRUCTION_DURATION = 5;

// 🎵 Calm music (WAV)
const MUSIC_TRACKS = [
  "/assets/music/1.wav",
  "/assets/music/2.wav",
  "/assets/music/3.wav",
];

// const MUSIC_VOLUME = 0.35; // ← uncomment to tune

const phaseOrder: Phase[] = [
  "eyesClosed",
  "eyesOpen",
  "eyesClosed2",
  "eyesOpen2",
  "imageBreathing",
];

const phaseInstruction: Record<Phase, string> = {
  eyesClosed: "Keep your eyes closed",
  eyesOpen: "Keep your eyes open",
  eyesClosed2: "Keep your eyes closed",
  eyesOpen2: "Keep your eyes open",
  imageBreathing: "Focus on the image and breathe slowly",
};

const AlphaReactiveStateTest: React.FC<AlphaReactiveProps> = ({
  onComplete,
}) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [screenPhase, setScreenPhase] =
    useState<ScreenPhase>("instruction");
  const [timeLeft, setTimeLeft] = useState(PHASE_DURATION);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPhase = phaseOrder[phaseIndex];
  const isBreathing = currentPhase === "imageBreathing";
  const isEyesClosed = currentPhase.includes("Closed");

  /* ================= AUDIO SETUP ================= */
  useEffect(() => {
    const track =
      MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];

    const audio = new Audio(track);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.35;
    // audio.volume = MUSIC_VOLUME;

    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  /* ================= INSTRUCTION PHASE ================= */
  useEffect(() => {
    if (screenPhase !== "instruction") return;

    const t = setTimeout(() => {
      setScreenPhase("running");
      setTimeLeft(PHASE_DURATION);

      if (isEyesClosed) {
        audioRef.current?.play().catch(() => {});
      }
    }, INSTRUCTION_DURATION * 1000);

    return () => clearTimeout(t);
  }, [screenPhase, isEyesClosed]);

  /* ================= RUNNING TIMER ================= */
  useEffect(() => {
    if (screenPhase !== "running") return;

    if (timeLeft <= 0) {
      playBeep();
      audioRef.current?.pause();

      if (phaseIndex < phaseOrder.length - 1) {
        setPhaseIndex((i) => i + 1);
        setScreenPhase("instruction");
      } else {
        onComplete();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, screenPhase, phaseIndex, onComplete]);

  /* ================= PROGRESS RING ================= */
  const progress = 1 - timeLeft / PHASE_DURATION;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const ringColor = isBreathing
    ? "#22d3ee"
    : isEyesClosed
    ? "#8b5cf6"
    : "#facc15";

  /* ================= UI ================= */
  return (
    <div
      className="
        relative w-full max-w-md h-[420px]
        rounded-3xl p-6
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        shadow-[0_0_60px_rgba(139,92,246,0.08)]
        flex flex-col items-center justify-center
        space-y-8
      "
    >
      <AnimatePresence mode="wait">
        {/* ================= INSTRUCTION ================= */}
        {screenPhase === "instruction" && (
          <motion.div
            key={`instruction-${currentPhase}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-3"
          >
            <h3 className="text-xl font-medium tracking-wide text-purple-300">
              {phaseInstruction[currentPhase]}
            </h3>

            <p className="text-xs text-purple-400/60">
              Starting in {INSTRUCTION_DURATION} seconds
            </p>
          </motion.div>
        )}

        {/* ================= RUNNING ================= */}
        {screenPhase === "running" && (
          <motion.div
            key={`running-${currentPhase}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center space-y-6"
          >
            {/* Image breathing */}
            {isBreathing && (
              <motion.img
                src="/assets/images/calm.jpg"
                alt="Calming visual stimulus"
                className="w-44 h-44 rounded-xl object-cover
                  border border-gray-700 shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              />
            )}

            {/* Progress ring */}
            {!isBreathing && (
              <svg
                width="140"
                height="140"
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlphaReactiveStateTest;
