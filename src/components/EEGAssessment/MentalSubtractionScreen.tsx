import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator } from "lucide-react";
import { playBeep } from "../../utils/playBeep";
import BreathingOrb from "../eeg/BreathingOrb";

interface Props {
  onComplete: () => void;
}

type Phase = "instruction" | "subtract" | "breathing";

/* Subtraction difficulty pool */
const SUBTRACTION_VALUES = [7, 9, 11, 13];

const INSTRUCTION_DURATION = 5; // seconds
const SUBTRACTION_DURATION = 30; // seconds
const BREATHING_DURATION = 15; // seconds

/* Breathing rhythm */
const BREATH_PHASES = [
  { label: "Inhale" as const, duration: 4 },
  { label: "Exhale" as const, duration: 6 },
];

const MentalSubtractionScreen: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<Phase>("instruction");
  //const [timeLeft, setTimeLeft] = useState(INSTRUCTION_DURATION);

  const completedRef = useRef(false);

  // ✅ Hooks must be inside component
  const phaseStartRef = useRef<number | null>(null);

  // ✅ Stable random values (never change)
  const subtractBy = useMemo(() => {
    return SUBTRACTION_VALUES[Math.floor(Math.random() * SUBTRACTION_VALUES.length)];
  }, []);

  const startNumber = useMemo(() => {
    return Math.floor(Math.random() * 21) + 100;
  }, []);

  // Breathing label state (separate from phase timer)
  const [breathLabel, setBreathLabel] = useState<"Inhale" | "Exhale">("Inhale");

  const safeComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  /* ================= HARD FAILSAFE ================= */
  useEffect(() => {
    const hardStopMs =
      (INSTRUCTION_DURATION + SUBTRACTION_DURATION + BREATHING_DURATION + 8) * 1000;

    const t = window.setTimeout(() => safeComplete(), hardStopMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ================= PHASE TIMER ENGINE =================
     Uses "start timestamp" to avoid drift + avoid stuck intervals
  ======================================================= */
  useEffect(() => {
    // set correct duration per phase
    const durationSec =
      phase === "instruction"
        ? INSTRUCTION_DURATION
        : phase === "subtract"
        ? SUBTRACTION_DURATION
        : BREATHING_DURATION;

    // reset start time each phase
    phaseStartRef.current = Date.now();
   // setTimeLeft(durationSec);

    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - (phaseStartRef.current as number)) / 1000);
      const remaining = Math.max(0, durationSec - elapsed);

     // setTimeLeft(remaining);

      if (remaining <= 0) {
        window.clearInterval(id);
        playBeep();

        if (phase === "instruction") {
          setPhase("subtract");
        } else if (phase === "subtract") {
          setBreathLabel("Inhale");
          setPhase("breathing");
        } else {
          safeComplete();
        }
      }
    }, 250); // smoother + more reliable than 1000ms

    return () => window.clearInterval(id);
  }, [phase]);

  /* ================= BREATHING LABEL LOOP ================= */
  useEffect(() => {
    if (phase !== "breathing") return;

    let cancelled = false;
    let i = 0;
    setBreathLabel("Inhale");

    const loop = () => {
      if (cancelled) return;

      const p = BREATH_PHASES[i % BREATH_PHASES.length];
      setBreathLabel(p.label);

      i += 1;
      window.setTimeout(loop, p.duration * 1000);
    };

    const t = window.setTimeout(loop, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [phase]);

  /* ================= UI ================= */
  return (
    <div
      className="
        relative w-full max-w-md h-[380px]
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        rounded-b-3xl
        flex items-center justify-center
        px-6 text-center
      "
    >
      <AnimatePresence mode="wait">
        {/* INSTRUCTION */}
        {phase === "instruction" && (
          <motion.div
            key="instruction"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Calculator className="w-8 h-8 mx-auto text-red-400" />
            <h3 className="text-xl font-semibold">Mental Subtraction Task</h3>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Subtract {subtractBy} repeatedly in your mind. Remain still and focused.
            </p>

           {/* <p className="text-xs text-gray-500">Starting in {timeLeft}s</p> */}

            <div className="flex justify-center gap-2 mt-2">
              {[0, 1, 2].map((k) => (
                <motion.span
                  key={k}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: k * 0.2,
                  }}
                  className="w-2 h-2 rounded-full bg-red-400"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* SUBTRACTION */}
        {phase === "subtract" && (
          <motion.div
            key="subtract"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="space-y-6"
          >
            <p className="text-sm text-gray-300">
              Subtract {subtractBy} repeatedly in your mind
            </p>

            <div className="flex justify-center">
              <div className="w-28 h-28 rounded-2xl flex items-center justify-center border border-red-400/40">
                <span className="text-4xl font-semibold text-gray-100">{startNumber}</span>
              </div>
            </div>

          {/*   <p className="text-xs text-gray-500">Time left: {timeLeft}s</p> */}
          </motion.div>
        )}

        {/* BREATHING */}
        {phase === "breathing" && (
          <motion.div
            key="breathing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center space-y-6"
          >
            <motion.p className="text-xl text-cyan-300">{breathLabel}</motion.p>

            <BreathingOrb inhale={breathLabel === "Inhale"} duration={breathLabel === "Inhale" ? 4 : 6} />

        {/**    <p className="text-xs text-gray-500">Time left: {timeLeft}s</p>  */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentalSubtractionScreen;
