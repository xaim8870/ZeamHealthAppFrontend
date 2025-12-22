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
  /* ===================== STATE ===================== */
  const [mood, setMood] = useState<string[]>([]);
  const [wakefulness, setWakefulness] = useState(5);
  const [focusLevel, setFocusLevel] = useState(5);
  const [medications, setMedications] = useState(false);
  const [otherFactors, setOtherFactors] = useState("");
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const [moodDetails, setMoodDetails] = useState({
    sadInterest: "",
    depressedInterest: "",
    worriedNervous: "",
  });

  /* ===================== MOODS ===================== */
  const moodOptions = [
    { value: "happy", label: "Happy", icon: Smile },
    { value: "content", label: "Content", icon: Heart },
    { value: "neutral", label: "Neutral", icon: Meh },
    { value: "worried", label: "Worried", icon: AlertTriangle },
    { value: "sad", label: "Sad", icon: Frown },
    { value: "depressed", label: "Depressed", icon: CloudRain },
  ];

  /* ===================== HANDLERS ===================== */
  const handleMoodChange = (value: string) => {
    const updated = mood.includes(value)
      ? mood.filter((m) => m !== value)
      : [...mood, value];

    setMood(updated);
    setShowMoodForm(
      updated.some((m) => ["sad", "depressed", "worried"].includes(m))
    );
  };

  const handleMoodDetailChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setMoodDetails((prev) => ({ ...prev, [name]: value }));
  };

  /* ===================== VALIDATION ===================== */
  const isFormValid = () => {
    if (mood.length === 0) return false;

    if (showMoodForm) {
      if (mood.includes("sad") && !moodDetails.sadInterest) return false;
      if (mood.includes("depressed") && !moodDetails.depressedInterest)
        return false;
      if (mood.includes("worried") && !moodDetails.worriedNervous)
        return false;
    }

    return true;
  };

  useEffect(() => {
    setIsValid(isFormValid());
  }, [mood, moodDetails, showMoodForm]);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = () => {
    if (!isValid) return;

    onComplete({
      mood,
      moodDetails,
      wakefulness,
      focusLevel,
      medications,
      otherFactors,
    });
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="w-full max-w-md bg-[#0c0f14] border border-gray-700 rounded-2xl p-6 text-gray-100 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-center gap-2">
        <ClipboardList className="w-5 h-5 text-gray-300" />
        <h2 className="text-sm font-medium tracking-wide text-gray-200">
          Pre-Assessment Check-In
        </h2>
      </div>

      {/* Mood Selection */}
      <div>
        <p className="text-xs text-gray-400 mb-2">
          How are you feeling right now?
        </p>

        <div className="grid grid-cols-2 gap-3">
          {moodOptions.map((m) => {
            const Icon = m.icon;
            return (
              <motion.button
                key={m.value}
                onClick={() => handleMoodChange(m.value)}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition
                  ${
                    mood.includes(m.value)
                      ? "border-gray-300 bg-gray-800"
                      : "border-gray-700 bg-[#0f131a] hover:bg-[#141926]"
                  }`}
              >
                <Icon className="w-4 h-4 text-gray-300" />
                {m.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Conditional Mood Follow-ups */}
      <AnimatePresence>
        {showMoodForm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {mood.includes("sad") && (
              <select
                name="sadInterest"
                value={moodDetails.sadInterest}
                onChange={handleMoodDetailChange}
                className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-2 text-sm"
              >
                <option value="">Little interest or pleasure?</option>
                <option value="0">Not at all</option>
                <option value="1">Several days</option>
                <option value="2">More than half the days</option>
                <option value="3">Nearly every day</option>
              </select>
            )}

            {mood.includes("depressed") && (
              <select
                name="depressedInterest"
                value={moodDetails.depressedInterest}
                onChange={handleMoodDetailChange}
                className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-2 text-sm"
              >
                <option value="">Feeling down or hopeless?</option>
                <option value="0">Not at all</option>
                <option value="1">Several days</option>
                <option value="2">More than half the days</option>
                <option value="3">Nearly every day</option>
              </select>
            )}

            {mood.includes("worried") && (
              <select
                name="worriedNervous"
                value={moodDetails.worriedNervous}
                onChange={handleMoodDetailChange}
                className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-2 text-sm"
              >
                <option value="">Feeling nervous or anxious?</option>
                <option value="0">Not at all</option>
                <option value="1">Several days</option>
                <option value="2">More than half the days</option>
                <option value="3">Nearly every day</option>
              </select>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medications */}
      <label className="flex items-center gap-2 text-xs text-gray-400">
        <input
          type="checkbox"
          checked={medications}
          onChange={(e) => setMedications(e.target.checked)}
        />
        Took medication that may affect EEG
      </label>

      {/* Notes */}
      <textarea
        value={otherFactors}
        onChange={(e) => setOtherFactors(e.target.value)}
        rows={2}
        placeholder="Optional notes"
        className="w-full bg-[#0f131a] border border-gray-700 rounded-lg p-2 text-sm"
      />

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition
            ${
              isValid
                ? "bg-gray-200 text-black hover:bg-white"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
        >
          Proceed 
        </button>
        {isValid && <CheckCircle2 className="w-5 h-5 text-gray-300" />}
      </div>
    </div>
  );
};

export default EEGQuestionnaire;
