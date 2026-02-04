import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import ProgressWheel from "@/components/ui/ProgressWheel";
import { playBeep } from "../../utils/playBeep";

interface Props {
  stage: "closed" | "open";
  phase: "instruction" | "running";
  timeLeft: number;
  totalTime: number;
}

/* 🎵 Calm EEG background music */
const MUSIC_TRACKS = [
  "/assets/music/AXIS1173_17_Calm_Full.wav",
  "/assets/music/AXIS1173_18_Calm_Alt.wav",
  "/assets/music/AXIS1173_19_Calm_60.wav", // ✅ fixed
  "/assets/music/AXIS1173_19_Calm_30.wav", // ✅ fixed
];

const MUSIC_VOLUME = 0.12;

const EyesClosedOpen: React.FC<Props> = ({
  stage,
  phase,
  timeLeft,
  totalTime,
}) => {
  const Icon = stage === "closed" ? EyeOff : Eye;

  /* ================= INSTRUCTION TEXT ================= */
  const instructionTitle =
    stage === "closed" ? "Close your eyes" : "Open your eyes";

  const instructionText =
    stage === "closed"
      ? "Please keep your eyes closed until the music stops."
      : "Please keep your eyes open and find a point to focus on.";

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

    // ▶ Play music during BOTH eyes-closed + eyes-open when running
    if (phase === "running") {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [phase]);

  /* ================= BEEP WHEN EYES-CLOSED COMPLETES ONLY ================= */
  const prevTimeLeftRef = useRef<number>(timeLeft);
  const beepedForClosedRunRef = useRef(false);

  // Reset beep flag when a NEW eyes-closed running segment begins
  useEffect(() => {
    if (phase === "running" && stage === "closed") {
      beepedForClosedRunRef.current = false;
    }
  }, [phase, stage]);

  useEffect(() => {
    const prev = prevTimeLeftRef.current;

    if (
      stage === "closed" &&
      phase === "running" &&
      prev > 0 &&
      timeLeft <= 0 &&
      !beepedForClosedRunRef.current
    ) {
      beepedForClosedRunRef.current = true;
      playBeep(); // ✅ now resumes AudioContext internally
    }

    prevTimeLeftRef.current = timeLeft;
  }, [stage, phase, timeLeft]);

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
        {phase === "instruction" ? (
          <motion.div
            key={`instruction-${stage}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            <Icon className="w-9 h-9 mx-auto text-cyan-400" />
            <h3 className="text-xl font-semibold text-white">
              {instructionTitle}
            </h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              {instructionText}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`running-${stage}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center"
          >
            <ProgressWheel
              timeLeft={timeLeft}
              totalTime={totalTime}
              color={stage === "closed" ? "#38bdf8" : "#facc15"}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EyesClosedOpen;
