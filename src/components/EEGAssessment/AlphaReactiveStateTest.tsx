import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Wind } from "lucide-react";
import BreathingOrb from "../eeg/BreathingOrb";
import ProgressWheel from "@/components/ui/ProgressWheel";

interface Props {
  phase: "eyesClosed" | "eyesOpen" | "imageBreathing";
  mode: "instruction" | "running";
  progress: number;
  breathLabel?: "Inhale" | "Exhale";
}

/* 🎵 Calm EEG background music */
const MUSIC_TRACKS = [
  "/assets/music/Calm.wav",
  "/assets/music/Depth.wav",
];

const MUSIC_VOLUME = 0.12;

/* instruction text MUST stay exactly same */
const INSTRUCTION_TEXT =
  "You will alternate between eyes closed and eyes open. Each time you hear a tone, switch. Begin with your eyes closed.";

const AlphaReactiveStateTest: React.FC<Props> = ({
  phase,
  mode,
  progress,
  breathLabel,
}) => {
  const isBreathing = phase === "imageBreathing";
  const isEyesClosed = phase === "eyesClosed";

  const Icon = isBreathing ? Wind : isEyesClosed ? EyeOff : Eye;

  /* ================= MUSIC CONTROL ================= */

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      const track =
        MUSIC_TRACKS[Math.floor(Math.random() * MUSIC_TRACKS.length)];

      const audio = new Audio(track);
      audio.loop = true;
      audio.volume = MUSIC_VOLUME;
      audio.preload = "auto";

      audioRef.current = audio;
    }

    if (mode === "running" && !isBreathing) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [mode, isBreathing]);

  /* ================= UI ================= */

  return (
    <div
      className="
        relative w-full max-w-md h-[380px]
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        rounded-b-3xl
        flex flex-col items-center justify-center
        px-6 text-center
      "
    >
      <motion.div
        key={`${mode}-${phase}`}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center space-y-6"
      >
        {/* ===== INSTRUCTION ===== */}
        {mode === "instruction" && (
  <>
    {phase === "eyesClosed" ? (
      <EyeOff className="w-8 h-8 text-cyan-400" />
    ) : (
      <Eye className="w-8 h-8 text-cyan-400" />
    )}

    <h2 className="text-xl font-semibold text-white">
      {phase === "eyesClosed" ? "Close your eyes" : "Open your eyes"}
    </h2>

    <p className="text-gray-400 text-sm max-w-xs">
      {INSTRUCTION_TEXT}
    </p>
  </>
)}
        {/* ===== RUNNING PHASE ===== */}
        {mode === "running" &&
          (isBreathing ? (
            <>
              <p className="text-xl text-cyan-300">{breathLabel}</p>

              <BreathingOrb
                inhale={breathLabel === "Inhale"}
                duration={4}
              />
            </>
          ) : (
            <>
              <Icon className="w-8 h-8 text-cyan-400" />

              <h2 className="text-xl font-semibold text-white">
                {isEyesClosed ? "Eyes Closed" : "Eyes Open"}
              </h2>

              <ProgressWheel
                timeLeft={1 - progress}
                totalTime={1}
                color={isEyesClosed ? "#8b5cf6" : "#facc15"}
              />
            </>
          ))}
      </motion.div>
    </div>
  );
};

export default AlphaReactiveStateTest;