import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import EEGQuestionnaire from "./EEGQuestionnaire";
import EyesClosedOpen from "./EyesClosedOpen";
import AlphaRestingStateTest from "./AlphaRestingStateTest";
import BreathingScreen from "./BreathingScreen";
import AlphaReactiveStateTest from "./AlphaReactiveStateTest";
import MentalSubtractionScreen from "./MentalSubtractionScreen";

import { ArrowLeft } from "lucide-react";
import { useEEGRecorder } from "../../hooks/useEEGRecorder";
import { useDevice } from "../../context/DeviceContext";

type Step =
  | "questionnaire"
  | "eyes"
  | "alphaResting"
  | "breathing"
  | "alphaReactive"
  | "mentalSubtraction";

const EEGAssessmentFlow: React.FC<{
  onBack: () => void;
  onComplete: (data: any) => void;
}> = ({ onBack, onComplete }) => {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [step, setStep] = useState<Step>("questionnaire");
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [recordedEEG, setRecordedEEG] = useState<any>(null);

  const { selectedDevice } = useDevice();
  const recorder = useEEGRecorder();

  const steps: Step[] = [
    "questionnaire",
    "eyes",
    "alphaResting",
    "breathing",
    "alphaReactive",
    "mentalSubtraction",
  ];

  const currentStepIndex = steps.indexOf(step);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  /* ================= DEV MENU TOGGLE ================= */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        setShowDevMenu((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ================= START EEG ONCE ================= */
  useEffect(() => {
    (async () => {
      try {
        await recorder.start((frame) => {
          // Optional debug
          if ((frame as any).device === "muse") {
            console.log(
              "[Muse EEG]",
              (frame as any).channel,
              (frame as any).values?.slice?.(0, 5)
            );
          }
        });

        recorder.markEvent("assessment_started");
      } catch (e) {
        console.error("Failed to start EEG:", e);
      }
    })();

    // ❌ Do NOT stop on step change
    return () => {};
  }, [selectedDevice]);

  /* ================= BODY STYLE ================= */
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => document.body.classList.remove("hide-footer");
  }, []);

  /* ================= STEP TITLES ================= */
  const getHeaderTitle = () => {
    switch (step) {
      case "questionnaire":
        return "Pre-Assessment";
      case "eyes":
        return "Eyes Open / Closed";
      case "alphaResting":
        return "Cognitive Baseline";
      case "breathing":
        return "Guided Breathing";
      case "alphaReactive":
        return "Neural Reactivity";
      case "mentalSubtraction":
        return "Mental Load Task";
      default:
        return "EEG Assessment";
    }
  };

  /* ================= STEP HANDLERS ================= */

  const handleQuestionnaireComplete = (data: any) => {
    setAssessmentData(data);
    recorder.markEvent("questionnaire_complete", { step: "questionnaire" });
    setStep("eyes");
    recorder.markEvent("eyes_open_closed_start", { step: "eyes" });
  };

  const handleEyesComplete = () => {
    recorder.markEvent("eyes_open_closed_complete", { step: "eyes" });
    setStep("alphaResting");
    recorder.markEvent("alpha_resting_start", { step: "alphaResting" });
  };

  const handleAlphaRestingComplete = () => {
    recorder.markEvent("alpha_resting_complete", { step: "alphaResting" });
    setStep("breathing");
    recorder.markEvent("breathing_start", { step: "breathing" });
  };

  const handleAlphaReactiveComplete = () => {
    recorder.markEvent("alpha_reactive_complete", { step: "alphaReactive" });
    setStep("mentalSubtraction");
    recorder.markEvent("mental_subtraction_start", {
      step: "mentalSubtraction",
    });
  };

  const handleMentalSubtractionComplete = () => {
    recorder.markEvent("mental_subtraction_complete", {
      step: "mentalSubtraction",
    });
    recorder.markEvent("assessment_completed");

    recorder.stop();

    const eegData = recorder.getData();
    setRecordedEEG(eegData);
    setShowDownloadModal(true);
  };

  /* ================= DOWNLOAD ================= */

  const downloadEEG = () => {
    if (!recordedEEG) return;

    const blob = new Blob([JSON.stringify(recordedEEG, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EEG_${recordedEEG.meta?.device ?? selectedDevice}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    onComplete({ ...assessmentData, eeg: recordedEEG });
  };

  /* ================= ANIMATION ================= */

  const screenVariants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -80 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0f14] text-white relative">
      {/* HEADER */}
      <div className="w-full flex justify-center z-10">
        <div className="w-full max-w-md mt-6 px-6 py-4
          bg-gradient-to-br from-[#0b0f17]/80 to-[#05070b]/80
          border border-gray-800 backdrop-blur-xl
          rounded-t-2xl flex items-center justify-between
          shadow-[0_0_30px_rgba(0,255,255,0.06)]
        ">
          <button
            onClick={
              currentStepIndex === 0
                ? onBack
                : () => setStep(steps[currentStepIndex - 1])
            }
            className="p-2 rounded-full hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>

          <div className="flex flex-col items-center gap-0.5">
            <h1 className="text-sm font-medium text-gray-100 tracking-wide">
              {getHeaderTitle()}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full
              bg-cyan-500/10 text-cyan-400 tracking-widest uppercase">
              EEG SESSION • {selectedDevice ?? "no device"}
            </span>
          </div>

          <div className="w-6" />
        </div>
      </div>

      {/* PROGRESS */}
      <div className="w-full flex justify-center z-10">
        <div className="w-full max-w-md px-6 mb-4">
          <div className="bg-gray-800 h-2 rounded-full overflow-hidden mt-4">
            <motion.div
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 flex items-center justify-center px-4"
        >
          {step === "questionnaire" && (
            <EEGQuestionnaire onComplete={handleQuestionnaireComplete} />
          )}

          {step === "eyes" && (
            <EyesClosedOpen onComplete={handleEyesComplete} />
          )}

          {step === "alphaResting" && (
            <AlphaRestingStateTest onComplete={handleAlphaRestingComplete} />
          )}

          {step === "breathing" && (
            <BreathingScreen onComplete={() => {
              recorder.markEvent("breathing_complete", { step: "breathing" });
              setStep("alphaReactive");
              recorder.markEvent("alpha_reactive_start", { step: "alphaReactive" });
            }} />
          )}

          {step === "alphaReactive" && (
            <AlphaReactiveStateTest onComplete={handleAlphaReactiveComplete} />
          )}

          {step === "mentalSubtraction" && (
            <MentalSubtractionScreen onComplete={handleMentalSubtractionComplete} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* DEV MENU */}
      {showDevMenu && (
        <div className="fixed bottom-4 right-4 z-50 bg-[#0c0f14] border border-gray-600 rounded-xl shadow-xl p-4 text-sm w-56">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">
            Developer Menu
          </p>
          {steps.map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-800"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* DOWNLOAD MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-80 border border-gray-700">
            <p className="text-center mb-4">EEG Recording Complete</p>
            <button
              onClick={downloadEEG}
              className="w-full py-2 bg-gray-200 text-black rounded-lg"
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
