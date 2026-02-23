import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { unlockAudio,  playBeep } from "@/utils/playBeep";
import { unlockMusic } from "@/utils/bgMusic";

import EEGQuestionnaire from "./EEGQuestionnaire";
import GetReady from "./GetReady";
import EyesClosedOpen from "./EyesClosedOpen";
import AlphaRestingStateTest from "./AlphaRestingStateTest";
import BreathingScreen from "./BreathingScreen";
import AlphaReactiveStateTest from "./AlphaReactiveStateTest";
import MentalSubtractionScreen from "./MentalSubtractionScreen";
import PostEEGQuestionnaire from "./PostEEGQuestionnaire";

import EEGHeader from "@/components/eeg/EEGHeader";
import ProgressBar from "@/components/ui/ProgressBar";
import DeveloperMenu from "@/components/dev/DeveloperMenu";
import { useDevice } from "../../context/DeviceContext";

import { EEGStep, STEP_ORDER } from "@/types/eegFlow";

/* =========================================================
   ✅ CHANGE TIMES HERE (easy knobs)
   - instructionMs: “get ready / instruction” time per screen segment
   - eyesClosedMs / eyesOpenMs
   - alphaRestTaskMs
   - breathingTaskMs
   - alphaReactiveClosedMs / alphaReactiveOpenMs / alphaReactiveBreathingMs
   ========================================================= */
const instructionMs = 5000;

const getReadyMs = 5000;

const eyesClosedMs = 60_000; // 1 min
const eyesOpenMs = 60_000; // 1 min

const alphaRestTaskMs = 30_000; // your math grid duration
const breathingTaskMs = 30_000; // breathing guidance duration

const alphaReactiveClosedMs = 30_000;
const alphaReactiveOpenMs = 30_000;
/** Optional. If you want breathing phase, keep 30s; if not, set to 0 */
const alphaReactiveBreathingMs = 30_000;

const mentalSubtractionMs = 50_000;


const HARD_FAILSAFE_EXTRA_MS = 4000; // prevents “stuck” no matter what

type EyesStage = "closed" | "open";
type UIPhase = "instruction" | "running";

type AlphaRestPhase = "instruction" | "questions";
type BreathingMode = "instruction" | "breathing";

type AlphaReactivePhase = "eyesClosed" | "eyesOpen" | "imageBreathing";
type AlphaReactiveMode = "instruction" | "running";

const EEGAssessmentFlow: React.FC<{
  onBack: () => void;
  onComplete: (data: any) => void;
}> = ({ onBack, onComplete }) => {
  const { recorder, selectedDevice, neurosity, museRecorder } = useDevice();

  const [step, setStep] = useState<EEGStep>("questionnaire");

  /* ================= EEG STATUS (UI only) ================= */
  const [frameCount, setFrameCount] = useState(0);
  const [eegStatus, setEegStatus] = useState<"idle" | "active">("idle");
  const frameRef = useRef(0);
  const startedRef = useRef(false);

  const startRecordingOnce = async () => {
  if (startedRef.current) return;
  startedRef.current = true;

  if (!selectedDevice) throw new Error("No device selected");
  if (selectedDevice === "neurosity" && !neurosity)
    throw new Error("Neurosity not connected");
  if (selectedDevice === "muse" && !museRecorder)
    throw new Error("Muse not connected");
     // useEffect(() => {
     //   const t = setInterval(() => {
     //     // if no new frames in last 2s, set idle
     //   }, 2000);
     //   return () => clearInterval(t);
     //  }, []);
  // inside startRecordingOnce(), before recorder.start(...)
if (selectedDevice === "muse" && museRecorder) {
  // ✅ if for any reason stream isn't running, start it here
  if (!museRecorder.isRunning()) {
    console.log("⚠️ Muse was not running inside flow — starting stream now...");
    await museRecorder.start();
  }
}

  // ✅ STEP 1: Start useEEGRecorder subscription FIRST
  console.log('🎥 STEP 1: Starting useEEGRecorder subscription');
  await recorder.start({
  device: selectedDevice,
  neurosity: selectedDevice === "neurosity" ? neurosity : null,
  museRecorder: selectedDevice === "muse" ? museRecorder : null,
  onFrame: () => {
    frameRef.current += 1;
    //setFrameCount(frameRef.current);
    //setEegStatus("active");
  },
});


  // ✅ STEP 2: For Muse - REMOVE clearRecordings! Just start recording mode
  if (selectedDevice === "muse" && museRecorder) {
    console.log('🎥 STEP 2: Starting Muse recording mode (KEEPING existing frames)');
    museRecorder.startRecording(); // This should NOT clear the buffer
  }

  // ✅ STEP 3: Mark session started
  console.log('🎥 STEP 3: Marking session started');
  recorder.markEvent("session_started", { device: selectedDevice });
  
  // ✅ STEP 4: Log what we have
   //setTimeout(() => {
   // const frames = museRecorder?.getRecordings().length || 0;
   // console.log(`🔍 After start: MuseRecorder has ${frames} frames`);
 // }, 1000);
};
  // Add this useEffect in EEGAssessmentFlow to monitor the recorder
  // ! --------------- -------------- ! //
// Add this near the top of your component
// UI Ticker useEffect()
useEffect(() => {
  let lastCount = 0;
  let lastChangeAt = Date.now();

  const id = window.setInterval(() => {
    const nowCount = frameRef.current;

    if (nowCount !== lastCount) {
      lastCount = nowCount;
      lastChangeAt = Date.now();
      setEegStatus("active");
    } else if (Date.now() - lastChangeAt > 2000) {
      setEegStatus("idle");
    }

    setFrameCount(nowCount); // ✅ only 4x/sec
  }, 250);

  return () => window.clearInterval(id);
}, []);


// useEffect(() => {
//  if (!museRecorder) return;
  
  // Check every 2 seconds if we're getting new frames
//  const interval = setInterval(() => {
//    const frames = museRecorder.getRecordings();
//    console.log(`⏰ TIMED CHECK: MuseRecorder has ${frames.length} frames`);
    
//    if (frames.length > 0) {
//      const latest = frames[frames.length - 1];
//      console.log(`   Latest frame: ${latest.values.map(v => v.toFixed(1)).join(', ')} µV`);
 //   }
 // }, 2000);
  
 // return () => clearInterval(interval);
//}, [museRecorder]);
//useEffect(() => {
//  if (!recorder) return;
  
  // Check every 5 seconds if we're getting data
//  const interval = setInterval(() => {
//    const data = recorder.getData({ trimmed: false });
//    console.log('🔍 EEGAssessmentFlow recorder stats:', {
 //     totalRecords: data.totalRecords,
 //     totalRawFrames: data.totalRawFrames,
 //     device: data.meta.device
  //  });
 // }, 5000);
  
 // return () => clearInterval(interval);
//}, [recorder]);
  // Frame counter + active status
  // Add this near the top of EEGAssessmentFlow
useEffect(() => {
  if (museRecorder) {
    console.log('🎮 MuseRecorder is available');
    
    // Check if we're already getting frames
    const frames = museRecorder.getRecordings();
    console.log(`📊 Initial buffer has ${frames.length} frames`);
  }
}, [museRecorder]);
 

  /* ================= OVERALL PROGRESS ================= */
  const totalMs = useMemo(() => {
    // Total across the “timed” part (excluding questionnaire + postEEG)
    const alphaReactiveTotal =
      // 2 cycles: (instruction + closed + instruction + open) * 2
      2 * (instructionMs + alphaReactiveClosedMs + instructionMs + alphaReactiveOpenMs) +
      // optional breathing after 2 cycles
      Math.max(0, alphaReactiveBreathingMs);

    return (
      getReadyMs +
      (instructionMs + eyesClosedMs + instructionMs + eyesOpenMs) +
      (instructionMs + alphaRestTaskMs) +
      (instructionMs + breathingTaskMs) +
      alphaReactiveTotal +
      mentalSubtractionMs 
      // mentalSubtraction is user-paced in your current component; exclude from progress bar
    );
  }, []);

  const elapsedMsRef = useRef(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const lastProgressTickRef = useRef<number | null>(null);


  /* ======================================================
     Per-step UI state (presentational screens consume these)
     ====================================================== */
  // Eyes
  const [eyesStage, setEyesStage] = useState<EyesStage>("closed");
  const [eyesPhase, setEyesPhase] = useState<UIPhase>("instruction");
  const [eyesTimeLeft, setEyesTimeLeft] = useState(5);

  // Alpha Rest
  const [alphaRestPhase, setAlphaRestPhase] =
    useState<AlphaRestPhase>("instruction");

  // Breathing
  const [breathingMode, setBreathingMode] =
    useState<BreathingMode>("instruction");
  const [breathLabel, setBreathLabel] = useState<"Inhale" | "Exhale">("Inhale");

  // Alpha Reactive
  const [alphaReactiveMode, setAlphaReactiveMode] =
    useState<AlphaReactiveMode>("instruction");
  const [alphaReactivePhase, setAlphaReactivePhase] =
    useState<AlphaReactivePhase>("eyesClosed");
  const [alphaReactiveProgress, setAlphaReactiveProgress] = useState(0);
  const [alphaReactiveTimeLeft, setAlphaReactiveTimeLeft] = useState(0);
  const [alphaReactiveTotalSec, setAlphaReactiveTotalSec] = useState(1);
  useEffect(() => {
    if (step === "postEEG") {
      lastProgressTickRef.current = null;
      
    }
  }, [step]);

  /* =====================================================================
     ✅ WINDOW CAPTURE (THIS FIXES EMPTY TRIMMED RECORDS)
     - Only open windows during the actual "task/running" parts
     - Instruction screens remain as your 5s gaps
     ===================================================================== */

  // Eyes: open window only while running (captures eyes_closed + eyes_open separately)
  useEffect(() => {
    if (step !== "eyes") return;

    if (eyesPhase === "running") {
      recorder.openWindow(`eyes_${eyesStage}`);
    } else {
      recorder.closeWindow();
    }

    return () => {
      recorder.closeWindow();
    };
  }, [step, eyesPhase, eyesStage, recorder]);

  // Alpha Rest: open window only during questions/task
  useEffect(() => {
    if (step !== "alphaResting") return;

    if (alphaRestPhase === "questions") {
      recorder.openWindow("alphaResting");
    } else {
      recorder.closeWindow();
    }

    return () => {
      recorder.closeWindow();
    };
  }, [step, alphaRestPhase, recorder]);

  // Breathing: open window only during breathing mode
  useEffect(() => {
    if (step !== "breathing") return;

    if (breathingMode === "breathing") {
      recorder.openWindow("breathing");
    } else {
      recorder.closeWindow();
    }

    return () => {
      recorder.closeWindow();
    };
  }, [step, breathingMode, recorder]);


  // Beep Effect for Alpha Reactive Sessions
  const alphaReactivePrevRef = useRef<number>(0);
  const alphaReactiveBeepedRef = useRef(false);

useEffect(() => {
  if (step !== "alphaReactive") return;

  const isWheelPhase =
    alphaReactivePhase === "eyesClosed" || alphaReactivePhase === "eyesOpen";

  // reset beep for each new wheel run
  if (alphaReactiveMode === "running" && isWheelPhase) {
    alphaReactiveBeepedRef.current = false;
  }

  // track prev
  alphaReactivePrevRef.current = alphaReactiveTimeLeft;
}, [step, alphaReactiveMode, alphaReactivePhase]);

// Beep Trigger Effect:
useEffect(() => {
  if (step !== "alphaReactive") return;

  const isWheelPhase =
    alphaReactivePhase === "eyesClosed" || alphaReactivePhase === "eyesOpen";

  if (!(alphaReactiveMode === "running" && isWheelPhase)) return;

  const prev = alphaReactivePrevRef.current;

  // drift-safe: beep when it reaches 1 or 0
  if (
    prev > 1 &&
    alphaReactiveTimeLeft <= 1 &&
    !alphaReactiveBeepedRef.current
  ) {
    alphaReactiveBeepedRef.current = true;
    playBeep();
  }

  alphaReactivePrevRef.current = alphaReactiveTimeLeft;
}, [step, alphaReactiveMode, alphaReactivePhase, alphaReactiveTimeLeft]);

  // Alpha Reactive: open window during running phases (including imageBreathing if you want it captured too)
  useEffect(() => {
    if (step !== "alphaReactive") return;

    if (alphaReactiveMode === "running") {
      recorder.openWindow(`alphaReactive_${alphaReactivePhase}`);
    } else {
      recorder.closeWindow();
    }

    return () => {
      recorder.closeWindow();
    };
  }, [step, alphaReactiveMode, alphaReactivePhase, recorder]);

  // Mental Subtraction: open window for whole step (component is user-paced)
  useEffect(() => {
    if (step !== "mentalSubtraction") return;

    recorder.openWindow("mentalSubtraction");
    return () => {
      recorder.closeWindow();
    };
  }, [step, recorder]);

  /* ================= TIMING ENGINE =================
     We run a single “segment timer” per step to avoid stuck screens.
  ================================================== */
  const segmentTimerRef = useRef<number | null>(null);
  const hardStopRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (segmentTimerRef.current) window.clearInterval(segmentTimerRef.current);
    if (hardStopRef.current) window.clearTimeout(hardStopRef.current);
    segmentTimerRef.current = null;
    hardStopRef.current = null;
  };

  const goNextStep = () => {
    const idx = STEP_ORDER.indexOf(step);
    const next = STEP_ORDER[idx + 1] ?? "postEEG";
    setStep(next);
  };

  const startHardFailsafe = (ms: number) => {
    if (hardStopRef.current) window.clearTimeout(hardStopRef.current);
    hardStopRef.current = window.setTimeout(() => {
      // If anything goes wrong, force advance.
      goNextStep();
    }, ms + HARD_FAILSAFE_EXTRA_MS);
  };

  // Update overall progress as time passes (only during timed steps)
  const tickOverall = React.useCallback(
    (delta: number) => {
      elapsedMsRef.current += delta;
      setOverallProgress(Math.max(0, Math.min(1, elapsedMsRef.current / totalMs)));
    },
    [totalMs]
  );


  /**
 * ✅ Overall progress ticker (time-based, drift-safe)
 * We compute the global progress bar using real elapsed wall-clock time rather than relying on
 * step setTimeouts or UI countdown intervals (which can drift / desync).
 *
 * - Runs only during the timed steps (getReady, eyes, alphaResting, breathing, alphaReactive)
 * - Uses Date.now() deltas to accumulate elapsedMsRef
 * - Updates overallProgress as a clamped ratio of elapsedMsRef / totalMs
 * - Pauses automatically on non-timed steps (questionnaire, mentalSubtraction, postEEG)
 */
useEffect(() => {
  const isTimedStep =
    step === "getReady" ||
    step === "eyes" ||
    step === "alphaResting" ||
    step === "breathing" ||
    step === "alphaReactive"||
    step === "mentalSubtraction";

  if (!isTimedStep) {
    lastProgressTickRef.current = null;
    return;
  }

  const id = window.setInterval(() => {
    const now = Date.now();

    if (lastProgressTickRef.current === null) {
      lastProgressTickRef.current = now;
      return;
    }

    const delta = now - lastProgressTickRef.current;
    lastProgressTickRef.current = now;

    // ✅ your existing helper
    tickOverall(delta);
  }, 200);

  return () => window.clearInterval(id);
}, [step, tickOverall]);


  /* ================= STEP: getReady ================= */
  useEffect(() => {
    if (step !== "getReady") return;

    console.log("🟢 GetReady started");

    const timeout = window.setTimeout(() => {
      console.log("➡️ GetReady done → eyes");
      setStep("eyes");
    }, getReadyMs);

    // hard failsafe (optional but safe)
    const failsafe = window.setTimeout(() => {
      setStep("eyes");
    }, getReadyMs + HARD_FAILSAFE_EXTRA_MS);

    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(failsafe);
    };
  }, [step]);

  useEffect(() => {
    if (step !== "eyes") return;
    if (eyesPhase !== "running") return;

    const interval = setInterval(() => {
      setEyesTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [step, eyesPhase]);

  useEffect(() => {
    if (step !== "alphaReactive") return;
    if (alphaReactiveMode !== "running") return;

    // Only countdown on wheel phases (not breathing)
    const isWheelPhase =
      alphaReactivePhase === "eyesClosed" || alphaReactivePhase === "eyesOpen";
    if (!isWheelPhase) return;

    const interval = window.setInterval(() => {
      setAlphaReactiveTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [step, alphaReactiveMode, alphaReactivePhase]);

  // keep progress synced with the countdown
  useEffect(() => {
    if (step !== "alphaReactive") return;

    const safeTotal = Math.max(alphaReactiveTotalSec, 1);
    const p = 1 - alphaReactiveTimeLeft / safeTotal;

    setAlphaReactiveProgress(
      alphaReactiveMode === "running" &&
        (alphaReactivePhase === "eyesClosed" ||
          alphaReactivePhase === "eyesOpen")
        ? Math.max(0, Math.min(1, p))
        : 0
    );
  }, [
    step,
    alphaReactiveMode,
    alphaReactivePhase,
    alphaReactiveTimeLeft,
    alphaReactiveTotalSec,
  ]);

  /* ================= STEP: eyes (closed then open) ================= */
  useEffect(() => {
    if (step !== "eyes") return;

    let cancelled = false;

    // Phase 1: instruction (closed)
    setEyesStage("closed");
    setEyesPhase("instruction");
    setEyesTimeLeft(Math.ceil(instructionMs / 1000));

    const t1 = setTimeout(() => {
      if (cancelled) return;

      // Phase 2: closed
      setEyesPhase("running");
      setEyesTimeLeft(Math.ceil(eyesClosedMs / 1000));

      const t2 = setTimeout(() => {
        if (cancelled) return;

        // Phase 3: instruction (open)
        setEyesStage("open");
        setEyesPhase("instruction");
        setEyesTimeLeft(Math.ceil(instructionMs / 1000));

        const t3 = setTimeout(() => {
          if (cancelled) return;

          // Phase 4: open
          setEyesPhase("running");
          setEyesTimeLeft(Math.ceil(eyesOpenMs / 1000));

          const t4 = setTimeout(() => {
            if (cancelled) return;
            setStep("alphaResting");
          }, eyesOpenMs);

          return () => clearTimeout(t4);
        }, instructionMs);

        return () => clearTimeout(t3);
      }, eyesClosedMs);

      return () => clearTimeout(t2);
    }, instructionMs);

    // HARD FAILSAFE
    const failsafe = setTimeout(() => {
      if (!cancelled) setStep("alphaResting");
    }, instructionMs + eyesClosedMs + instructionMs + eyesOpenMs + 4000);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(failsafe);
    };
  }, [step]);

  /* ================= STEP: alphaResting ================= */
  useEffect(() => {
    if (step !== "alphaResting") return;

    let cancelled = false;

    // Phase 1: instruction
    setAlphaRestPhase("instruction");

    const t1 = setTimeout(() => {
      if (cancelled) return;

      // Phase 2: questions / task
      setAlphaRestPhase("questions");

      const t2 = setTimeout(() => {
        if (cancelled) return;
        setStep("breathing");
      }, alphaRestTaskMs);

      return () => clearTimeout(t2);
    }, instructionMs);

    // HARD FAILSAFE
    const failsafe = setTimeout(() => {
      if (!cancelled) setStep("breathing");
    }, instructionMs + alphaRestTaskMs + 4000);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(failsafe);
    };
  }, [step]);

  /* ================= STEP: breathing ================= */
  useEffect(() => {
    if (step !== "breathing") return;

    let cancelled = false;

    // Phase 1: instruction
    setBreathingMode("instruction");
    setBreathLabel("Inhale");

    const t1 = setTimeout(() => {
      if (cancelled) return;

      // Phase 2: breathing
      setBreathingMode("breathing");

      const breathInterval = setInterval(() => {
        setBreathLabel((prev) => (prev === "Inhale" ? "Exhale" : "Inhale"));
      }, 5000);

      const t2 = setTimeout(() => {
        clearInterval(breathInterval);
        if (cancelled) return;
        setStep("alphaReactive");
      }, breathingTaskMs);

      return () => {
        clearInterval(breathInterval);
        clearTimeout(t2);
      };
    }, instructionMs);

    // HARD FAILSAFE
    const failsafe = setTimeout(() => {
      if (!cancelled) setStep("alphaReactive");
    }, instructionMs + breathingTaskMs + 4000);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(failsafe);
    };
  }, [step]);

  /* ================= STEP: alphaReactive ================= */
  /* ================= STEP: alphaReactive (2 cycles) ================= */
  useEffect(() => {
    if (step !== "alphaReactive") return;

    let cancelled = false;
    const breathingMs = Math.max(0, alphaReactiveBreathingMs);

    const closedSec = Math.ceil(alphaReactiveClosedMs / 1000);
    const openSec = Math.ceil(alphaReactiveOpenMs / 1000);

    const setInstruction = (p: AlphaReactivePhase) => {
      setAlphaReactiveMode("instruction");
      setAlphaReactivePhase(p);
      setAlphaReactiveProgress(0);
      setAlphaReactiveTotalSec(p === "eyesClosed" ? closedSec : openSec);
      setAlphaReactiveTimeLeft(p === "eyesClosed" ? closedSec : openSec);
    };

    const setRunning = (p: AlphaReactivePhase) => {
      setAlphaReactiveMode("running");
      setAlphaReactivePhase(p);
      setAlphaReactiveProgress(0);
      setAlphaReactiveTotalSec(p === "eyesClosed" ? closedSec : openSec);
      setAlphaReactiveTimeLeft(p === "eyesClosed" ? closedSec : openSec);
    };

    // Start: Instruction (eyes closed)
    setInstruction("eyesClosed");

    const t1 = window.setTimeout(() => {
      if (cancelled) return;

      // RUN 1: eyes closed
      setRunning("eyesClosed");

      const t2 = window.setTimeout(() => {
        if (cancelled) return;

        // Instruction 1: eyes open
        setInstruction("eyesOpen");

        const t3 = window.setTimeout(() => {
          if (cancelled) return;

          // RUN 1: eyes open
          setRunning("eyesOpen");

          const t4 = window.setTimeout(() => {
            if (cancelled) return;

            // Instruction 2: eyes closed
            setInstruction("eyesClosed");

            const t5 = window.setTimeout(() => {
              if (cancelled) return;

              // RUN 2: eyes closed
              setRunning("eyesClosed");

              const t6 = window.setTimeout(() => {
                if (cancelled) return;

                // Instruction 2: eyes open
                setInstruction("eyesOpen");

                const t7 = window.setTimeout(() => {
                  if (cancelled) return;

                  // RUN 2: eyes open
                  setRunning("eyesOpen");

                  const t8 = window.setTimeout(() => {
                    if (cancelled) return;

                    // Breathing AFTER 2 cycles
                    if (breathingMs > 0) {
                      setAlphaReactiveMode("running");
                      setAlphaReactivePhase("imageBreathing");

                      const breathInterval = window.setInterval(() => {
                        setBreathLabel((prev) =>
                          prev === "Inhale" ? "Exhale" : "Inhale"
                        );
                      }, 5000);

                      const t9 = window.setTimeout(() => {
                        window.clearInterval(breathInterval);
                        if (!cancelled) setStep("mentalSubtraction");
                      }, breathingMs);

                      return () => {
                        window.clearInterval(breathInterval);
                        window.clearTimeout(t9);
                      };
                    } else {
                      setStep("mentalSubtraction");
                    }
                  }, alphaReactiveOpenMs);

                  return () => window.clearTimeout(t8);
                }, instructionMs);

                return () => window.clearTimeout(t7);
              }, alphaReactiveClosedMs);

              return () => window.clearTimeout(t6);
            }, instructionMs);

            return () => window.clearTimeout(t5);
          }, alphaReactiveOpenMs);

          return () => window.clearTimeout(t4);
        }, instructionMs);

        return () => window.clearTimeout(t3);
      }, alphaReactiveClosedMs);

      return () => window.clearTimeout(t2);
    }, instructionMs);

    // HARD FAILSAFE (2 cycles + breathing)
    const failsafe = window.setTimeout(
      () => {
        if (!cancelled) setStep("mentalSubtraction");
      },
      // cycle 1
      instructionMs +
        alphaReactiveClosedMs +
        instructionMs +
        alphaReactiveOpenMs +
        // cycle 2
        instructionMs +
        alphaReactiveClosedMs +
        instructionMs +
        alphaReactiveOpenMs +
        // breathing
        breathingMs +
        HARD_FAILSAFE_EXTRA_MS
    );

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(failsafe);
    };
  }, [step]);

  /* ================= mentalSubtraction (user-paced component) =================
     Add a hard failsafe anyway so it NEVER gets stuck.
  ========================================================================== */
  useEffect(() => {
    if (step !== "mentalSubtraction") return;

    const failsafe = window.setTimeout(() => {
      setStep("postEEG");
    }, 70_000);

    return () => window.clearTimeout(failsafe);
  }, [step]);

  /* ================= POST EEG + DOWNLOAD ================= */
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [recordedEEG, setRecordedEEG] = useState<any>(null);

  const handlePostEEGSubmit = (data: any) => {
    recorder.setPostEEG(data);
    recorder.stop();

    // Try trimmed first
    let eeg = recorder.getData({ trimmed: true });

    // ✅ If windows missing, fallback to untrimmed
    if (!eeg.windows?.length || eeg.totalTrimmedRecords === 0) {
      eeg = recorder.getData({ trimmed: false });
    }

    setRecordedEEG(eeg);
    setShowDownloadModal(true);
  };

  const download = () => {
  const device = recordedEEG?.meta?.device ?? "eeg";
  const startedAt = recordedEEG?.meta?.startedAt
    ? new Date(recordedEEG.meta.startedAt).toISOString().replace(/[:.]/g, "-")
    : `${Date.now()}`;

  const blob = new Blob([JSON.stringify(recordedEEG, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${device}_EEG_${startedAt}.json`;

  a.click();
  URL.revokeObjectURL(url);

  onComplete(recordedEEG);
};


  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-[#0c0f14] text-white flex flex-col">
      {/* Header: keep it simple inside EEGHeader ("EEG In Progress...") */}
      <EEGHeader onBack={onBack} eegStatus={eegStatus} frameCount={frameCount} />

      {/* ✅ Overall progress bar: BELOW header, ABOVE screen */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-md px-6">
          {/* Show progress only during the timed portion */}
          {step !== "questionnaire" && step !== "postEEG" && (
            <ProgressBar progress={overallProgress} />
          )}
        </div>
      </div>

      <DeveloperMenu currentStep={step} setStep={(s) => setStep(s)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex-1 flex items-center justify-center px-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
        >
          {step === "questionnaire" && (
            <EEGQuestionnaire
              onComplete={async () => {
                await unlockAudio(); // ✅ unlock audio on user gesture before any beep attempts
                await unlockMusic(); // ✅ unlock music AudioContext
                // ✅ reset progress at the true start
                elapsedMsRef.current = 0;
                lastProgressTickRef.current = null;
                setOverallProgress(0);
                await startRecordingOnce();
                setStep("getReady");
              }}
            />
          )}

          {step === "getReady" && <GetReady />}

          {step === "eyes" && (
            <EyesClosedOpen
              stage={eyesStage}
              phase={eyesPhase}
              timeLeft={eyesTimeLeft}
              totalTime={
                eyesStage === "closed" ? eyesClosedMs / 1000 : eyesOpenMs / 1000
              }
            // step={step}
            />
          )}

          {step === "alphaResting" && (
            <AlphaRestingStateTest phase={alphaRestPhase} />
          )}

          {step === "breathing" && (
            <BreathingScreen mode={breathingMode} breathLabel={breathLabel} />
          )}

          {step === "alphaReactive" && (
            <AlphaReactiveStateTest
              phase={alphaReactivePhase}
              mode={alphaReactiveMode}
              progress={alphaReactiveProgress}
              breathLabel={breathLabel}
            />
          )}

          {step === "mentalSubtraction" && (
            <MentalSubtractionScreen onComplete={() => setStep("postEEG")} />
          )}

          {step === "postEEG" && (
            <PostEEGQuestionnaire onSubmit={handlePostEEGSubmit} />
          )}
        </motion.div>
      </AnimatePresence>

      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl w-80">
            <div className="text-center text-sm text-gray-300 mb-4">
              EEG saved. Post-EEG tags included.
            </div>
            <button
              onClick={download}
              className="w-full py-3 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
            >
              Download EEG
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EEGAssessmentFlow;
