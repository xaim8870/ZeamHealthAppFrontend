import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Wind } from "lucide-react";
import BreathingOrb from "../eeg/BreathingOrb";
import ProgressWheel from "@/components/ui/ProgressWheel";

interface Props {
  phase: "eyesClosed" | "eyesOpen" | "imageBreathing";
  mode: "instruction" | "running";
  progress: number; // 0 → 1
  breathLabel?: "Inhale" | "Exhale";
}

/* 🎵 Calm EEG background music */
const MUSIC_TRACKS = [
  "/assets/music/1.wav",
  "/assets/music/2.wav",
  "/assets/music/3.wav",
];

const MUSIC_VOLUME = 0.12;

const instructionText: Record<Props["phase"], string> = {
  eyesClosed: "You will alternate between eyes closed and eyes open. Each time you hear a tone, switch. Begin with your eyes closed.",
  eyesOpen: "Please keep your eyes open and focus on a fixed point",
  imageBreathing: "Now take slow, deep breaths. Breathe on your own or follow the image on the screen until you hear the tone.",
};

const AlphaReactiveStateTest: React.FC<Props> = ({
  phase,
  mode,
  progress,
  breathLabel,
}) => {
  const isBreathing = phase === "imageBreathing";
  const isEyesClosed = phase === "eyesClosed";

  const Icon = isBreathing
    ? Wind
    : isEyesClosed
    ? EyeOff
    : Eye;

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

    // ▶ Music ONLY during running wheel phases
    if (mode === "running" && !isBreathing) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [mode, isBreathing, phase]);

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
      <AnimatePresence mode="wait">
        {mode === "instruction" && (
          <motion.div
            key={`instruction-${phase}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Icon className="w-8 h-8 mx-auto text-cyan-400" />
            <h3 className="text-xl font-semibold">
              {instructionText[phase]}
            </h3>
          </motion.div>
        )}

        {mode === "running" && (
          <motion.div
            key={`running-${phase}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            {isBreathing ? (
              <>
                <p className="text-xl text-cyan-300">
                  {breathLabel}
                </p>
                <BreathingOrb
                  inhale={breathLabel === "Inhale"}
                  duration={4}
                />
              </>
            ) : (
              <ProgressWheel
                timeLeft={1 - progress}
                totalTime={1}
                color={isEyesClosed ? "#8b5cf6" : "#facc15"}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlphaReactiveStateTest;
