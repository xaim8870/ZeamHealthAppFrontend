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
  /* ================= DEV MENU ================= */
  const [showDevMenu, setShowDevMenu] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === "d") {
        setShowDevMenu((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  /* ================= FLOW STATE ================= */
  const [step, setStep] = useState<Step>("questionnaire");
  const [assessmentData, setAssessmentData] = useState<any>({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [recordedEEG, setRecordedEEG] = useState<any>(null);

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

  /* ================= DEVICE & EEG ================= */
  const { selectedDevice, neurosity } = useDevice();
  const recorder = useEEGRecorder(neurosity);

  useEffect(() => {
    recorder.start({
      device: selectedDevice,
      channels:
        selectedDevice === "neurosity"
          ? ["F5", "C3", "CP3", "PO3", "PO4", "CP4", "C4", "F6"]
          : ["TP9", "AF7", "AF8", "TP10"],
      samplingRate: 256,
    });

    return () => recorder.stop();
  }, [selectedDevice]);

  /* ================= UI EFFECTS ================= */
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => document.body.classList.remove("hide-footer");
  }, []);

  /* ================= HEADER ================= */
  const getHeaderTitle = () => {
    switch (step) {
      case "questionnaire":
        return "EEG Questionnaire";
      case "eyes":
        return "Eyes Assessment";
      case "alphaResting":
        return "Cognitive Task";
      case "breathing":
        return "Relaxation";
      case "alphaReactive":
        return "Neuro Assessment";
      default:
        return "EEG Assessment";
    }
  };

  /* ================= STEP HANDLERS ================= */
  const handleQuestionnaireComplete = (data: any) => {
    setAssessmentData(data);
    setStep("eyes");
  };

  const handleEyesComplete = () => setStep("alphaResting");
  const handleAlphaRestingComplete = () => setStep("breathing");

  const handleAlphaReactiveComplete = () => {
    setStep("mentalSubtraction");
    
  };
  const handleMentalSubtractionComplete = () => {
  recorder.stop();

  const eegData = recorder.getData();
  setRecordedEEG(eegData);
  setShowDownloadModal(true);
};


  /* ================= DOWNLOAD ================= */
  const downloadEEG = () => {
    if (!recordedEEG) return;

    const blob = new Blob([JSON.stringify(recordedEEG)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EEG_${recordedEEG.device}_${Date.now()}.json`;
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
        <div className="w-full max-w-md mt-6 px-6 py-4 bg-gray-900/70 border border-gray-700 rounded-t-2xl flex items-center justify-between">
          <button
            onClick={
              currentStepIndex === 0
                ? onBack
                : () => setStep(steps[currentStepIndex - 1])
            }
            className="p-2 hover:bg-gray-800 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>

          <motion.h1
            key={step}
            className="text-sm font-medium text-gray-200"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {getHeaderTitle()}
          </motion.h1>

          <div className="w-6" />
        </div>
      </div>

      {/* PROGRESS */}
      <div className="w-full flex justify-center z-10">
        <div className="w-full max-w-md px-6 mb-4">
          <div className="bg-gray-800 h-2 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-gray-300"
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
          {step === "eyes" && <EyesClosedOpen onComplete={handleEyesComplete} />}
          {step === "alphaResting" && (
            <AlphaRestingStateTest onComplete={handleAlphaRestingComplete} />
          )}
          {step === "breathing" && (
            <BreathingScreen onComplete={() => setStep("alphaReactive")} />
          )}
          {step === "alphaReactive" && (
            <AlphaReactiveStateTest
              onComplete={handleAlphaReactiveComplete}
            />
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
