import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smile,
  Heart,
  Meh,
  Frown,
  AlertTriangle,
  CloudRain,
  Brain,
  Check,
  ChevronDown,
} from "lucide-react";
import EEGDropdown from "@/components/EEGDropdown";


interface EEGQuestionnaireProps {
  onComplete: (data: any) => void;
}

const EEGQuestionnaire: React.FC<EEGQuestionnaireProps> = ({ onComplete }) => {
  const [mood, setMood] = useState<string[]>([]);
  const [medications, setMedications] = useState(false);
  const [notes, setNotes] = useState("");
  const [showFollowUps, setShowFollowUps] = useState(false);

  const [details, setDetails] = useState({
    interest: "",
    depressed: "",
    anxious: "",
  });

  const moodOptions = [
    { value: "happy", label: "Happy", icon: Smile },
    { value: "content", label: "Content", icon: Heart },
    { value: "neutral", label: "Neutral", icon: Meh },
    { value: "worried", label: "Worried", icon: AlertTriangle },
    { value: "sad", label: "Sad", icon: Frown },
    { value: "depressed", label: "Depressed", icon: CloudRain },
  ];

  const toggleMood = (value: string) => {
    const updated = mood.includes(value)
      ? mood.filter((m) => m !== value)
      : [...mood, value];

    setMood(updated);
    setShowFollowUps(
      updated.some((m) => ["sad", "depressed", "worried"].includes(m))
    );
  };

  const valid =
    mood.length > 0 &&
    (!showFollowUps ||
      (details.interest && details.depressed && details.anxious));

  /* ================= COMMON STYLES ================= */

  const dropdownWrapper =
    "relative bg-[#0b0e13] border border-gray-700 rounded-xl px-4 py-4";

  const dropdown =
    "w-full bg-transparent text-sm text-gray-200 appearance-none focus:outline-none";

  const questionCard =
    "bg-[#0b0e13] border border-gray-700 rounded-xl p-4 space-y-2";

  const frequencyOptions = [
  { label: "Not at all", value: "0" },
  { label: "Several days", value: "1" },
  { label: "More than half the days", value: "2" },
  { label: "Nearly every day", value: "3" },
];


  return (
    <div className="w-full max-w-md rounded-3xl bg-gradient-to-br from-[#0b0f17] to-[#05070b] border border-gray-800 p-6 space-y-6 shadow-[0_0_60px_rgba(0,255,255,0.05)]">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-cyan-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Pre-Assessment</h2>
          <p className="text-xs text-gray-400">
            Please calibrate your current state
          </p>
        </div>

        <span className="ml-auto text-xs px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 tracking-widest">
          CHECK-IN
        </span>
      </div>

      {/* Mood */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-gray-500">
          Current Mood
        </p>

        <div className="grid grid-cols-2 gap-4">
          {moodOptions.map((m) => {
            const Icon = m.icon;
            const active = mood.includes(m.value);

            return (
              <motion.button
                key={m.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleMood(m.value)}
                className={`relative flex items-center gap-3 px-4 py-4 rounded-xl border transition
                  ${
                    active
                      ? "border-cyan-400 bg-cyan-500/10 shadow-[0_0_18px_rgba(0,255,255,0.25)]"
                      : "border-gray-700 bg-[#0b0e13] hover:border-gray-600"
                  }`}
              >
                {/* Icon background */}
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-300" />
                </div>

                <span className="text-sm">{m.label}</span>

                {/* Checkmark */}
                {active && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                    <Check className="w-3 h-3 text-black" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Follow-ups */}
      <AnimatePresence>
        {showFollowUps && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Question 1 */}
            <div className={questionCard}>
              <label className="text-sm text-gray-400">
                Diminished interest or pleasure?
              </label>
              <EEGDropdown
                  placeholder="Select frequency…"
                  value={details.interest}
                  onChange={(v) =>
                    setDetails({ ...details, interest: v })
                  }
                  options={frequencyOptions}
              />
            </div>

            {/* Question 2 */}
            <div className={questionCard}>
              <label className="text-sm text-gray-400">
                Feeling down, depressed, or hopeless?
              </label>
              <EEGDropdown
                placeholder="Select frequency…"
                value={details.depressed}
                onChange={(v) =>
                  setDetails({ ...details, depressed: v })
                }
                options={frequencyOptions}
              />

            </div>

            {/* Question 3 */}
            <div className={questionCard}>
              <label className="text-sm text-gray-400">
                Feeling nervous, anxious, or on edge?
              </label>
              <EEGDropdown
                placeholder="Select frequency…"
                value={details.anxious}
                onChange={(v) =>
                  setDetails({ ...details, anxious: v })
                }
                options={frequencyOptions}
              />

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medication */}
      <label className="flex items-center gap-3 text-xs text-gray-400">
        <input
          type="checkbox"
          checked={medications}
          onChange={(e) => setMedications(e.target.checked)}
          className="accent-cyan-400"
        />
        I have taken medication that may affect EEG
      </label>

      {/* Notes */}
      <textarea
        placeholder="Additional notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full bg-[#0b0e13] border border-gray-700 rounded-xl px-4 py-3 text-sm"
      />

      {/* CTA */}
      <button
        disabled={!valid}
        onClick={() => onComplete({ mood, details, medications, notes })}
        className={`w-full py-4 rounded-xl font-medium transition
          ${
            valid
              ? "bg-cyan-400 text-black hover:bg-cyan-300"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
      >
        Proceed to Assessment
      </button>
    </div>
  );
};

export default EEGQuestionnaire;
