import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EEGQuestionnaire from "./EEGQuestionnaire";
import HeadbandSelection from "./HeadBandSelection";
import EyesClosedOpen from "./EyesClosedOpen";
import AlphaRestingStateTest from "./AlphaRestingStateTest";
import AlphaReactiveStateTest from "./AlphaReactiveStateTest";
import { ArrowLeft } from "lucide-react";

const EEGAssessmentFlow: React.FC<{ onBack: () => void; onComplete: (data: any) => void }> = ({
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState<"questionnaire" | "headband" | "eyes" | "alphaResting" | "alphaReactive">(
    "questionnaire"
  );
  const [assessmentData, setAssessmentData] = useState<any>({});

  // Steps for progress bar
  const steps = ["questionnaire", "headband", "eyes", "alphaResting", "alphaReactive"];
  const currentStepIndex = steps.indexOf(step);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Dynamic header title based on step
  const getHeaderTitle = () => {
    switch (step) {
      case "questionnaire": return "EEG Questionnaire";
      case "headband": return "Select Headband";
      case "eyes": return "Eyes Assessment";
      case "alphaResting": return "Alpha Resting State";
      case "alphaReactive": return "Alpha Reactive State";
      default: return "EEG Assessment";
    }
  };

  // Hide footer on EEG screens
  useEffect(() => {
    document.body.classList.add("hide-footer");
    return () => {
      document.body.classList.remove("hide-footer");
    };
  }, []);

  // Handlers for step transitions
  const handleQuestionnaireComplete = (data: any) => {
    setAssessmentData(data);
    setStep("headband");
  };

  const handleHeadbandComplete = (headband: string) => {
    setAssessmentData({ ...assessmentData, headband });
    setStep("eyes");
  };

  const handleEyesComplete = () => setStep("alphaResting");

  const handleAlphaRestingComplete = () => {
    setTimeout(() => setStep("alphaReactive"), 300); // small delay for smooth transition
  };

  const handleAlphaReactiveComplete = () => onComplete(assessmentData);

  // Animation Variants
  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="min-h-screen items-center flex flex-col bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden ">
      {/* Subtle animated background particles for a modern feel */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-green-200 rounded-full filter blur-3xl opacity-30"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      {/* Unified Header */}
      <div className="w-full px-4 pt-6 pb-4 bg-white/80 backdrop-blur-md shadow-md z-10 flex items-center justify-between">
        <button onClick={currentStepIndex === 0 ? onBack : () => setStep(steps[currentStepIndex - 1] as any)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center flex-1">
          <motion.h1
            key={step}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-bold text-blue-800"
          >
            {getHeaderTitle()}
          </motion.h1>
          <p className="text-sm text-gray-600">Zeam Health EEG Assessment</p>
        </div>
        <div className="w-10" /> {/* Spacer for symmetry */}
      </div>

      {/* Progress Bar */}
      <div className="w-full px-4 mb-4 z-10">
        <div className="bg-gray-200 h-2 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-blue-400 to-green-500 rounded-full"
          />
        </div>
        <p className="text-center mt-2 text-xs text-gray-600">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
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

          {step === "headband" && (
            <HeadbandSelection onNext={handleHeadbandComplete} />
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
    </div>
  );
};

export default EEGAssessmentFlow;