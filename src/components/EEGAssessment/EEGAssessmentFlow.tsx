import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import EEGQuestionnaire from "./EEGQuestionnaire";
import EyesClosedOpen from "./EyesClosedOpen";
import AlphaRestingStateTest from "./AlphaRestingStateTest";
import AlphaReactiveStateTest from "./AlphaReactiveStateTest";

import { ArrowLeft } from "lucide-react";

import { useEEGRecorder } from "../../hooks/useEEGRecorder";
import { useDevice } from "../../context/DeviceContext";

const EEGAssessmentFlow: React.FC<{
  onBack: () => void;
  onComplete: (data: any) => void;
}> = ({ onBack, onComplete }) => {

  const [step, setStep] = useState<
    "questionnaire" | "eyes" | "alphaResting" | "alphaReactive"
  >("questionnaire");

  const [assessmentData, setAssessmentData] = useState<any>({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [recordedEEG, setRecordedEEG] = useState<any>(null);

  const steps = ["questionnaire", "eyes", "alphaResting", "alphaReactive"];
  const currentStepIndex = steps.indexOf(step);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const { selectedDevice, neurosity } = useDevice();

  /** ---------------- USE STABLE RECORDER INSTANCE ---------------- */
  
  const recorder = useEEGRecorder(neurosity);


  /** ---------------- START RECORDING ONCE ---------------- */
  useEffect(() => {
    recorder.start({
      device: selectedDevice,
      channels:
        selectedDevice === "neurosity"
          ? ["F5", "C3", "CP3", "PO3", "PO4", "CP4", "C4", "F6"]
          : ["TP9", "AF7", "AF8", "TP10"],
      samplingRate: 256,
    });

    return () => {
      recorder.stop();
    };
  }, [selectedDevice]);

  /** ---------------- HIDE FOOTER ---------------- */
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => document.body.classList.remove("hide-footer");
  }, []);

  /** ---------------- TITLE ---------------- */
  const getHeaderTitle = () => {
    switch (step) {
      case "questionnaire":
        return "EEG Questionnaire";
      case "eyes":
        return "Eyes Assessment";
      case "alphaResting":
        return "Alpha Resting State";
      case "alphaReactive":
        return "Alpha Reactive State";
      default:
        return "EEG Assessment";
    }
  };

  /** ---------------- STEP CALLBACKS ---------------- */
  const handleQuestionnaireComplete = (data: any) => {
    setAssessmentData(data);
    setStep("eyes");
  };

  const handleEyesComplete = () => setStep("alphaResting");

  const handleAlphaRestingComplete = () => {
    setTimeout(() => setStep("alphaReactive"), 300);
  };

  const handleAlphaReactiveComplete = () => {
    recorder.stop();
    const eegData = recorder.getData();
    setRecordedEEG(eegData);
    setShowDownloadModal(true);
  };

  /** ---------------- DOWNLOAD EEG ---------------- */
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

  /** ---------------- ANIMATION ---------------- */
  const screenVariants = {
    initial: { opacity: 0, x: 90 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -90 },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0B1120] text-white relative">

      {/* HEADER */}
      <div className="w-full flex justify-center z-10">
        <div className="w-full max-w-md mt-6 px-6 py-4 bg-gray-900/70 backdrop-blur-xl border border-gray-700/60 shadow-lg rounded-t-2xl flex items-center justify-between">
          <button
            onClick={
              currentStepIndex === 0
                ? onBack
                : () => setStep(steps[currentStepIndex - 1] as any)
            }
            className="p-2 hover:bg-gray-800 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-emerald-400" />
          </button>

          <div className="text-center flex-1">
            <motion.h1
              key={step}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-lg font-semibold text-emerald-300"
            >
              {getHeaderTitle()}
            </motion.h1>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="w-full flex justify-center z-10">
        <div className="w-full max-w-md px-6 mb-4">
          <div className="bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-700/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-gradient-to-r from-emerald-400 to-blue-500"
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
          transition={{ duration: 0.4 }}
          className="flex-1 w-full px-4 flex items-center justify-center z-10"
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

          {step === "alphaReactive" && (
            <AlphaReactiveStateTest onComplete={handleAlphaReactiveComplete} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* DOWNLOAD MODAL */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 p-6 rounded-xl shadow-xl w-80 border border-gray-700"
          >
            <h2 className="text-lg font-semibold text-emerald-400 text-center">
              EEG Recording Complete
            </h2>

            <p className="text-gray-300 text-sm text-center mt-2">
              Your EEG session is complete. Download raw EEG below.
            </p>

            <button
              onClick={downloadEEG}
              className="w-full mt-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg"
            >
              Download EEG Data
            </button>

            <button
              onClick={() => {
                setShowDownloadModal(false);
                onComplete({ ...assessmentData, eeg: recordedEEG });
              }}
              className="w-full mt-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Continue Without Downloading
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EEGAssessmentFlow;
