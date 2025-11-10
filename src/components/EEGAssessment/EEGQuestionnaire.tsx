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
  // 🧠 States
  const [mood, setMood] = useState<string[]>([]);
  const [wakefulness, setWakefulness] = useState<number>(5);
  const [focusLevel, setFocusLevel] = useState<number>(5);
  const [medications, setMedications] = useState(false);
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

  // 🎭 Mood Options
  const moodOptions = [
    { value: "happy", label: "Happy", gradient: "from-pink-500 via-fuchsia-500 to-rose-500", icon: <Smile className="w-6 h-6 text-white" /> },
    { value: "content", label: "Content", gradient: "from-emerald-500 via-teal-500 to-green-400", icon: <Heart className="w-6 h-6 text-white" /> },
    { value: "neutral", label: "Neutral", gradient: "from-slate-500 via-gray-600 to-slate-700", icon: <Meh className="w-6 h-6 text-white" /> },
    { value: "worried", label: "Worried", gradient: "from-yellow-400 via-amber-500 to-orange-500", icon: <AlertTriangle className="w-6 h-6 text-white" /> },
    { value: "sad", label: "Sad", gradient: "from-blue-500 via-indigo-500 to-sky-500", icon: <Frown className="w-6 h-6 text-white" /> },
    { value: "depressed", label: "Depressed", gradient: "from-purple-500 via-fuchsia-500 to-pink-600", icon: <CloudRain className="w-6 h-6 text-white" /> },
  ];

  // 🌀 Handle mood selection
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

  // ✅ Validation
  const isFormValid = () => {
    if (mood.length === 0) return false;
    if (wakefulness < 1 || focusLevel < 1) return false;

    if (showMoodForm) {
      if (mood.includes("sad") && (!moodDetails.sadInterest || !moodDetails.sadDepressed)) return false;
      if (mood.includes("depressed") && (!moodDetails.depressedInterest || !moodDetails.depressedDepressed)) return false;
      if (mood.includes("worried") && (!moodDetails.worriedNervous || !moodDetails.worriedControl)) return false;
    }
    return true;
  };

  useEffect(() => {
    setIsValid(isFormValid());
  }, [mood, moodDetails, wakefulness, focusLevel, showMoodForm]);

  // 🚀 Submit Handler
  const handleSubmit = () => {
    if (!isValid) return;
    onComplete({ mood, moodDetails, wakefulness, medications, focusLevel, otherFactors });
  };

  // 🎨 Mood Form (conditional)
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
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="space-y-4 mt-4 rounded-2xl p-5 bg-gradient-to-br from-[#0b2a21]/90 via-[#0b3b30]/80 to-[#092920]/90 border border-emerald-600/40 shadow-[0_0_25px_rgba(16,185,129,0.25)] backdrop-blur-xl"
        >
          {["sad", "depressed", "worried"].map(
            (moodKey) =>
              mood.includes(moodKey) && (
                <div key={moodKey} className="space-y-3">
                  <p className="text-sm text-gray-300 font-medium capitalize">
                    {moodKey === "sad" && "Little interest or pleasure in doing things?"}
                    {moodKey === "depressed" && "Loss of interest or pleasure in daily activities?"}
                    {moodKey === "worried" && "Feeling nervous, anxious, or on edge?"}
                  </p>
                  <select
                    name={`${moodKey}Interest`}
                    value={(moodDetails as any)[`${moodKey}Interest`]}
                    onChange={handleMoodDetailChange}
                    className="w-full p-3 rounded-lg bg-gray-900/70 border border-emerald-700/50 text-gray-100 focus:ring-emerald-400 focus:border-emerald-400"
                  >
                    <option value="">Select</option>
                    {options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  // 🌌 UI
  return (
    <div className="w-full max-w-md bg-gradient-to-br from-[#0b1320] via-[#0d1f25] to-[#0a1a14] border border-emerald-800/40 backdrop-blur-xl rounded-b-3xl shadow-[0_0_30px_rgba(16,185,129,0.25)] p-6 space-y-6 overflow-y-auto text-white">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <ClipboardList className="w-6 h-6 text-emerald-400" />
        <h2 className="text-lg font-semibold tracking-wide text-emerald-300">
          Tell us about your current state
        </h2>
      </div>

      {/* Mood Buttons */}
      <div>
        <p className="text-sm text-gray-300 mb-2">How’s your mood today?</p>
        <div className="grid grid-cols-2 gap-3">
          {moodOptions.map((m) => (
            <motion.div
              key={m.value}
              onClick={() => handleMoodChange(m.value)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`flex flex-col items-center justify-center p-4 rounded-md cursor-pointer bg-gradient-to-br ${m.gradient} transition-all shadow-md ${
                mood.includes(m.value)
                  ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0b1320]"
                  : "opacity-95 hover:opacity-100"
              }`}
            >
              {m.icon}
              <span className="mt-1 text-sm font-semibold">{m.label}</span>
            </motion.div>
          ))}
        </div>
        {renderMoodForm()}
      </div>

      {/* Wakefulness Level */}
      <div className="w-full">
        <p className="text-sm text-gray-300 mb-1">Wakefulness Level</p>
        <input
          type="range"
          min="1"
          max="10"
          value={wakefulness}
          onChange={(e) => setWakefulness(Number(e.target.value))}
          className="
            w-full h-3 rounded-lg cursor-pointer appearance-none
            bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
            [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-br
            [&::-webkit-slider-thumb]:from-blue-400 [&::-webkit-slider-thumb]:to-violet-500
            hover:[&::-webkit-slider-thumb]:scale-110
          "
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
          <span>Drowsy</span>
          <span>Neutral</span>
          <span>Alert</span>
        </div>
      </div>

      {/* Medications */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="medications"
          checked={medications}
          onChange={(e) => setMedications(e.target.checked)}
          className="w-5 h-5 accent-emerald-400"
        />
        <label htmlFor="medications" className="text-sm text-gray-300">
          Took medications affecting EEG today
        </label>
      </div>

      {/* Focus Level */}
      <div className="w-full">
        <p className="text-sm text-gray-300 mb-1">Focus Level</p>
        <input
          type="range"
          min="1"
          max="10"
          value={focusLevel}
          onChange={(e) => setFocusLevel(Number(e.target.value))}
          className="
            w-full h-3 rounded-lg cursor-pointer appearance-none
            bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7
            [&::-webkit-slider-thumb]:rounded-md [&::-webkit-slider-thumb]:bg-gradient-to-br
            [&::-webkit-slider-thumb]:from-emerald-400 [&::-webkit-slider-thumb]:to-cyan-400
            hover:[&::-webkit-slider-thumb]:scale-110
          "
        />
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
          <span>Not Focused</span>
          <span>Normal</span>
          <span>Focused</span>
        </div>
      </div>

      {/* Other Factors */}
      <div>
        <p className="text-sm text-gray-300 mb-1">Other Factors (optional)</p>
        <textarea
          value={otherFactors}
          onChange={(e) => setOtherFactors(e.target.value)}
          className="w-full p-3 rounded-xl bg-gray-900/70 border border-emerald-700/40 text-gray-100 focus:ring-emerald-400 focus:border-emerald-400 placeholder-gray-500"
          rows={2}
          placeholder="e.g. had coffee, slept less, high workload..."
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`flex-1 py-3 rounded-2xl font-semibold tracking-wide transition-all duration-300 ${
            isValid
              ? "bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-pulse"
              : "bg-gray-800 text-gray-500 cursor-not-allowed"
          }`}
        >
          Proceed to Eyes Assessment
        </button>
        {isValid && <CheckCircle2 className="w-7 h-7 text-emerald-400 animate-pulse" />}
      </div>
    </div>
  );
};

export default EEGQuestionnaire;
