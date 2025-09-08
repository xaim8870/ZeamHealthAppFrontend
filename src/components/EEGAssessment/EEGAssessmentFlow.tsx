import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EEGQuestionnaire from "./EEGQuestionnaire";
import HeadbandSelection from "./HeadBandSelection";
import EyesClosedOpen from "./EyesClosedOpen";
import AlphaRestingStateTest from "./AlphaRestingStateTest";
import AlphaReactiveStateTest from "./AlphaReactiveStateTest";

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
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -40 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 relative overflow-hidden">
      {/* Modern Gradient Triangle Background */}
      <div className="absolute top-0 left-0 w-0 h-0 border-l-[100vw] border-l-transparent border-b-[220px] border-b-blue-500/20"></div>

      {/* Header with Company Name */}
      <div className="w-full text-center mt-6 mb-4 z-10">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold text-blue-700 tracking-wide"
        >
          Zeam Health
        </motion.h1>
        <p className="text-gray-600 text-sm md:text-base">EEG Brainwave Assessment</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-lg mb-6 z-10 px-4">
        <div className="bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 rounded-full shadow-lg"
          />
        </div>
        <p className="text-center mt-2 text-sm text-gray-700 font-semibold">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      {/* Screen Transition */}
      <AnimatePresence mode="wait">
        {step === "questionnaire" && (
          <motion.div
            key="questionnaire"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg z-10"
          >
            <EEGQuestionnaire onBack={onBack} onComplete={handleQuestionnaireComplete} />
          </motion.div>
        )}

        {step === "headband" && (
          <motion.div
            key="headband"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg z-10"
          >
            <HeadbandSelection onBack={() => setStep("questionnaire")} onNext={handleHeadbandComplete} />
          </motion.div>
        )}

        {step === "eyes" && (
          <motion.div
            key="eyes"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg z-10"
          >
            <EyesClosedOpen onBack={() => setStep("headband")} onComplete={handleEyesComplete} />
          </motion.div>
        )}

        {step === "alphaResting" && (
          <motion.div
            key="alphaResting"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg z-10"
          >
            <AlphaRestingStateTest onBack={() => setStep("eyes")} onComplete={handleAlphaRestingComplete} />
          </motion.div>
        )}

        {step === "alphaReactive" && (
          <motion.div
            key="alphaReactive"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg z-10"
          >
            <AlphaReactiveStateTest onBack={() => setStep("alphaResting")} onComplete={handleAlphaReactiveComplete} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EEGAssessmentFlow;
