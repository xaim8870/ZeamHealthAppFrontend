import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Smile,
  Heart,
  Meh,
  Frown,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface EEGQuestionnaireProps {
  onComplete: (data: any) => void;
}

const EEGQuestionnaire: React.FC<EEGQuestionnaireProps> = ({ onComplete }) => {
  const [mood, setMood] = useState<string[]>([]);
  const [wakefulness, setWakefulness] = useState<number | null>(null);
  const [medications, setMedications] = useState(false);
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [otherFactors, setOtherFactors] = useState("");
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [moodDetails, setMoodDetails] = useState({
    sadInterest: "",
    sadDepressed: "",
    depressedInterest: "",
    depressedDepressed: "",
    worriedNervous: "",
    worriedControl: "",
  });

  const moodOptions = [
    {
      value: "happy",
      label: "Happy",
      color: "from-pink-400 to-pink-600",
      icon: <Smile className="w-6 h-6 text-white dark:text-yellow-300" />,
    },
    {
      value: "content",
      label: "Content",
      color: "from-green-400 to-green-600",
      icon: <Heart className="w-6 h-6 text-white dark:text-green-300" />,
    },
    {
      value: "neutral",
      label: "Neutral",
      color: "from-gray-400 to-gray-600",
      icon: <Meh className="w-6 h-6 text-white dark:text-gray-300" />,
    },
    {
      value: "worried",
      label: "Worried",
      color: "from-yellow-400 to-yellow-600",
      icon: <AlertTriangle className="w-6 h-6 text-white dark:text-amber-300" />,
    },
    {
      value: "sad",
      label: "Sad",
      color: "from-blue-400 to-blue-600",
      icon: <Frown className="w-6 h-6 text-white dark:text-blue-300" />,
    },
    {
      value: "depressed",
      label: "Depressed",
      color: "from-purple-400 to-purple-600",
      icon: <CloudRain className="w-6 h-6 text-white dark:text-purple-300" />,
    },
  ];

  const handleMoodChange = (value: string) => {
    const updated = mood.includes(value)
      ? mood.filter((m) => m !== value)
      : [...mood, value];
    setMood(updated);
    setShowMoodForm(updated.some((m) => ["sad", "depressed", "worried"].includes(m)));
  };

  const handleMoodDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMoodDetails((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid = () => {
    if (mood.length === 0) return false;
    if (wakefulness === null || focusLevel === null) return false;
    if (showMoodForm) {
      if (mood.includes("sad")) {
        if (!moodDetails.sadInterest || !moodDetails.sadDepressed) return false;
      }
      if (mood.includes("depressed")) {
        if (!moodDetails.depressedInterest || !moodDetails.depressedDepressed) return false;
      }
      if (mood.includes("worried")) {
        if (!moodDetails.worriedNervous || !moodDetails.worriedControl) return false;
      }
    }
    if (!otherFactors.trim()) return false;
    return true;
  };

  useEffect(() => {
    setIsValid(isFormValid());
  }, [mood, moodDetails, wakefulness, focusLevel, otherFactors]);

  const handleSubmit = () => {
    if (!isValid) return;
    onComplete({ mood, moodDetails, wakefulness, medications, focusLevel, otherFactors });
  };

  const renderMoodForm = () => {
    if (!showMoodForm) return null;

    const options = [
      { value: "0", label: "Not at all" },
      { value: "1", label: "Several days" },
      { value: "2", label: "More than half the days" },
      { value: "3", label: "Nearly every day" },
    ];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 mt-4 bg-gray-100 dark:bg-gray-800/60 p-4 rounded-xl shadow-inner transition-colors"
        >
          {["sad", "depressed", "worried"].map(
            (moodKey) =>
              mood.includes(moodKey) && (
                <div key={moodKey} className="space-y-3">
                  {moodKey === "sad" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Little interest or pleasure in doing things?
                      </label>
                      <select
                        name="sadInterest"
                        value={moodDetails.sadInterest}
                        onChange={handleMoodDetailChange}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Feeling down, depressed, or hopeless?
                      </label>
                      <select
                        name="sadDepressed"
                        value={moodDetails.sadDepressed}
                        onChange={handleMoodDetailChange}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {moodKey === "depressed" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Loss of interest or pleasure in daily activities?
                      </label>
                      <select
                        name="depressedInterest"
                        value={moodDetails.depressedInterest}
                        onChange={handleMoodDetailChange}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Feeling hopeless or worthless?
                      </label>
                      <select
                        name="depressedDepressed"
                        value={moodDetails.depressedDepressed}
                        onChange={handleMoodDetailChange}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                  {moodKey === "worried" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Feeling nervous, anxious, or on edge?
                      </label>
                      <select
                        name="worriedNervous"
                        value={moodDetails.worriedNervous}
                        onChange={handleMoodDetailChange}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Not being able to stop worrying?
                      </label>
                      <select
                        name="worriedControl"
                        value={moodDetails.worriedControl}
                        onChange={handleMoodDetailChange}
                        className="w-full mt-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        {options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              )
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="w-full max-w-md bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 rounded-2xl shadow-2xl p-6 space-y-5 overflow-y-auto transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-center mb-3">
        <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          Tell us about your current state
        </h2>
      </div>

      {/* Mood Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          How's your mood today?
        </label>
        <div className="grid grid-cols-2 gap-3">
          {moodOptions.map((m) => (
            <motion.div
              key={m.value}
              onClick={() => handleMoodChange(m.value)}
              whileHover={{ scale: 1.05 }}
              className={`flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer bg-gradient-to-r ${m.color} text-white shadow-md hover:shadow-lg transition ${
                mood.includes(m.value)
                  ? "ring-2 ring-offset-2 ring-blue-500"
                  : ""
              }`}
            >
              {m.icon}
              <span className="mt-1 text-sm font-semibold">{m.label}</span>
            </motion.div>
          ))}
        </div>
        {renderMoodForm()}
      </div>

      {/* Wakefulness */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Wakefulness Level: {wakefulness ?? "Select"}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={wakefulness ?? 5}
          onChange={(e) => setWakefulness(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Drowsy</span>
          <span>Alert</span>
        </div>
      </div>

      {/* Medications */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="medications"
          checked={medications}
          onChange={(e) => setMedications(e.target.checked)}
          className="w-4 h-4 accent-blue-500"
        />
        <label htmlFor="medications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
          Took medications affecting EEG today
        </label>
      </div>

      {/* Focus Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Focus Level: {focusLevel ?? "Select"}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={focusLevel ?? 5}
          onChange={(e) => setFocusLevel(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Scattered</span>
          <span>Focused</span>
        </div>
      </div>

      {/* Other Factors */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Other Factors (e.g., caffeine, stress)
        </label>
        <textarea
          value={otherFactors}
          onChange={(e) => setOtherFactors(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
          rows={2}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 py-3 rounded-xl font-semibold transition duration-300 ${
            isValid
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md hover:shadow-lg"
              : "bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          }`}
        >
          Proceed to Headband
        </button>

        {isValid && (
          <CheckCircle2 className="w-6 h-6 text-green-500 animate-bounce" />
        )}
      </div>
    </div>
  );
};

export default EEGQuestionnaire;
