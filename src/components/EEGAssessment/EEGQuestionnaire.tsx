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
} from "lucide-react";
import EEGDropdown from "@/components/EEGDropdown";

interface EEGQuestionnaireProps {
  onComplete: (data: any) => void;
}

type Step = "mood" | "followups" | "medication" | "notes";

const EEGQuestionnaire: React.FC<EEGQuestionnaireProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>("mood");

  const [mood, setMood] = useState<string[]>([]);
  const [medications, setMedications] = useState(false);
  const [notes, setNotes] = useState("");

  const [details, setDetails] = useState({
    interest: "",
    depressed: "",
    anxious: "",
  });

  /* ---------------- Config ---------------- */

  const moodOptions = [
    { value: "happy", label: "Happy", icon: Smile, color: "text-green-400" },
    { value: "content", label: "Content", icon: Heart, color: "text-pink-400" },
    { value: "neutral", label: "Neutral", icon: Meh, color: "text-gray-300" },
    { value: "worried", label: "Worried", icon: AlertTriangle, color: "text-yellow-400" },
    { value: "sad", label: "Sad", icon: Frown, color: "text-blue-400" },
    { value: "depressed", label: "Depressed", icon: CloudRain, color: "text-indigo-400" },
  ];

  const frequencyOptions = [
    { label: "Not at all", value: "0" },
    { label: "Several days", value: "1" },
    { label: "More than half the days", value: "2" },
    { label: "Nearly every day", value: "3" },
  ];

  const showFollowUps = mood.some((m) =>
    ["sad", "depressed", "worried"].includes(m)
  );

  /* ---------------- Logic ---------------- */

  const toggleMood = (value: string) => {
    setMood((prev) =>
      prev.includes(value)
        ? prev.filter((m) => m !== value)
        : [...prev, value]
    );
  };

  const next = () => {
    if (step === "mood") {
      setStep(showFollowUps ? "followups" : "medication");
    } else if (step === "followups") {
      setStep("medication");
    } else if (step === "medication") {
      setStep("notes");
    }
  };

  const submit = () => {
    if (mood.length === 0) return;

    onComplete({
      mood,
      details,
      medications,
      notes,
    });
  };

  const needsPHQ = mood.some((m) => ["sad", "depressed"].includes(m));
const needsGAD = mood.includes("worried");

const validFollowUps =
  (!needsPHQ || (details.interest && details.depressed)) &&
  (!needsGAD || details.anxious);

  /* ---------------- UI ---------------- */

  return (
    <div
      className="
        w-full max-w-md
        rounded-b-3xl rounded-t-none
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800 border-t-0
        p-6 mt-4
        shadow-[0_0_60px_rgba(0,255,255,0.05)]
        min-h-[520px]
        flex flex-col
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-cyan-500/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-cyan-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold">Pre-Assessment</h2>
          <p className="text-xs text-gray-400">
            Calibrate your current mental state
          </p>
        </div>
      </div>

      {/* FIXED CONTENT AREA (NO RESIZE) */}
      <div className="flex-1 flex items-center">
        <AnimatePresence mode="wait">
          {/* ================= MOOD ================= */}
          {step === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full space-y-6"
            >
              <p className="text-sm text-gray-300">
                How would you describe your current mood?
              </p>

              <div className="grid grid-cols-2 gap-4">
                {moodOptions.map((m) => {
                  const Icon = m.icon;
                  const active = mood.includes(m.value);

                  return (
                    <button
                      key={m.value}
                      onClick={() => toggleMood(m.value)}
                      className={`relative flex items-center gap-3 px-4 py-4 rounded-xl border transition
                        ${
                          active
                            ? "border-cyan-400 bg-cyan-500/10"
                            : "border-gray-700 bg-[#0b0e13] hover:border-gray-600"
                        }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${m.color}`} />
                      </div>

                      <span className="text-sm">{m.label}</span>

                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={mood.length === 0}
                onClick={next}
                className={`w-full py-3 rounded-xl transition
                  ${
                    mood.length > 0
                      ? "bg-cyan-400 text-black hover:bg-cyan-300"
                      : "bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Next
              </button>
            </motion.div>
          )}

          {/* ================= FOLLOW UPS ================= */}
{step === "followups" && (
  <motion.div
    key="followups"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -16 }}
    className="w-full space-y-5"
  >
    <p className="text-sm text-gray-300">
      Over the past few days…
    </p>

    {/* PHQ-style questions (Sad / Depressed) */}
    {needsPHQ && (
      <>
        <EEGDropdown
          placeholder="Diminished interest or pleasure?"
          value={details.interest}
          onChange={(v) =>
            setDetails({ ...details, interest: v })
          }
          options={frequencyOptions}
        />

        <EEGDropdown
          placeholder="Feeling down or hopeless?"
          value={details.depressed}
          onChange={(v) =>
            setDetails({ ...details, depressed: v })
          }
          options={frequencyOptions}
        />
      </>
    )}

    {/* GAD-style question (Worried) */}
    {needsGAD && (
      <EEGDropdown
        placeholder="Feeling anxious or on edge?"
        value={details.anxious}
        onChange={(v) =>
          setDetails({ ...details, anxious: v })
        }
        options={frequencyOptions}
      />
    )}

    <button
      disabled={!validFollowUps}
      onClick={next}
      className={`w-full py-3 rounded-xl transition
        ${
          validFollowUps
            ? "bg-cyan-400 text-black hover:bg-cyan-300"
            : "bg-gray-700 text-gray-400 cursor-not-allowed"
        }`}
    >
      Next
    </button>
  </motion.div>
)}

          {/* ================= MEDICATION ================= */}
          {step === "medication" && (
            <motion.div
              key="medication"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full space-y-6"
            >
              <p className="text-sm text-gray-300">
                Have you taken medication that may affect EEG?
              </p>

              <label className="flex items-center gap-3 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={medications}
                  onChange={(e) => setMedications(e.target.checked)}
                  className="accent-cyan-400"
                />
                Yes, I have taken medication
              </label>

              <button
                onClick={next}
                className="w-full py-3 rounded-xl bg-cyan-400 text-black hover:bg-cyan-300 transition"
              >
                Next
              </button>
            </motion.div>
          )}

          {/* ================= NOTES ================= */}
          {step === "notes" && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full space-y-6"
            >
              <p className="text-sm text-gray-300">
                Any additional notes?
              </p>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Optional…"
                className="w-full rounded-xl bg-[#0b0e13] border border-gray-700 px-4 py-3 text-sm"
              />

              <button
                onClick={submit}
                className="w-full py-4 rounded-xl font-medium bg-cyan-400 text-black hover:bg-cyan-300 transition"
              >
                Proceed to Assessment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EEGQuestionnaire;
