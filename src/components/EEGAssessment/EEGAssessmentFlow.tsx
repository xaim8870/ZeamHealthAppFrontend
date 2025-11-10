import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EEGQuestionnaire from "./EEGQuestionnaire";
import EyesClosedOpen from "./EyesClosedOpen";
import AlphaRestingStateTest from "./AlphaRestingStateTest";
import AlphaReactiveStateTest from "./AlphaReactiveStateTest";
import { ArrowLeft } from "lucide-react";

const EEGAssessmentFlow: React.FC<{ onBack: () => void; onComplete: (data: any) => void }> = ({
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState<"questionnaire" | "eyes" | "alphaResting" | "alphaReactive">(
    "questionnaire"
  );
  const [assessmentData, setAssessmentData] = useState<any>({});

  // Steps for progress bar
  const steps = ["questionnaire", "eyes", "alphaResting", "alphaReactive"];
  const currentStepIndex = steps.indexOf(step);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Dynamic header title
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

  // Hide footer on EEG screens
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => {
      document.body.classList.remove("hide-footer");
    };
  }, []);

  // Step Handlers
  const handleQuestionnaireComplete = (data: any) => {
    setAssessmentData(data);
    setStep("eyes"); // 👈 directly go to eyes screen
  };

  const handleEyesComplete = () => setStep("alphaResting");

  const handleAlphaRestingComplete = () => {
    setTimeout(() => setStep("alphaReactive"), 300);
  };

  const handleAlphaReactiveComplete = () => onComplete(assessmentData);

  // Animation
  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="min-h-screen items-center flex flex-col bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#0B1120] relative overflow-hidden text-white">
      {/* Subtle Animated Background Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-blue-500/20 filter blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-48 h-48 bg-emerald-500/20  filter blur-[120px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
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
              className="text-lg md:text-xl font-semibold text-emerald-300 tracking-wide"
            >
              {getHeaderTitle()}
            </motion.h1>
            <p className="text-xs text-gray-400">Zeam Health EEG Assessment</p>
          </div>

          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full flex justify-center z-10">
        <div className="w-full max-w-md px-6 mb-4">
          <div className="bg-gray-800 h-2 rounded-full overflow-hidden shadow-inner border border-gray-700/70">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 rounded-full shadow-[0_0_10px_#10B981]"
            />
          </div>
          <p className="text-center mt-2 text-xs text-gray-400">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>
      </div>

      {/* Screen Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex-1 w-full px-4 flex items-center justify-center z-10"
        >
          {step === "questionnaire" && (
            <EEGQuestionnaire onComplete={handleQuestionnaireComplete} />
          )}

          {step === "eyes" && <EyesClosedOpen onComplete={handleEyesComplete} />}

          {step === "alphaResting" && (
            <AlphaRestingStateTest onComplete={handleAlphaRestingComplete} />
          )}

          {step === "alphaReactive" && (
            <AlphaReactiveStateTest onComplete={handleAlphaReactiveComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EEGAssessmentFlow;
