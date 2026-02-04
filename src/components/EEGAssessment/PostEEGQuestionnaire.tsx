import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface Props {
  onSubmit: (data: PostEEGData) => void;
}

export type PostEEGData = {
  stillness: number;
  calmness: number;
  activities: string[];
  feedback: string;
};

type Step = "stillness" | "activities" | "calmness" | "feedback";

const ACTIVITIES = [
  "Eating",
  "Drinking",
  "Fidgeting",
  "Talking",
  "None of the above",
];

const SCALE = Array.from({ length: 10 }, (_, i) => i + 1);

const PostEEGQuestionnaire: React.FC<Props> = ({ onSubmit }) => {
  const [step, setStep] = useState<Step>("stillness");

  const [stillness, setStillness] = useState<number | null>(null);
  const [calmness, setCalmness] = useState<number | null>(null);
  const [activities, setActivities] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  /* ---------------- Helpers ---------------- */

  const toggleActivity = (value: string) => {
    if (value === "None of the above") {
      setActivities(["None of the above"]);
      return;
    }

    setActivities((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev.filter((v) => v !== "None of the above"), value]
    );
  };

  const next = () => {
    if (step === "stillness") setStep("activities");
    else if (step === "activities") setStep("calmness");
    else if (step === "calmness") setStep("feedback");
  };

  const submit = () => {
    if (stillness && calmness && activities.length > 0) {
      onSubmit({
        stillness,
        calmness,
        activities,
        feedback,
      });
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div
      className="
        w-full max-w-md h-[420px]
        bg-gradient-to-br from-[#0b0f17] to-[#05070b]
        border border-gray-800
        rounded-b-3xl
        p-6
        flex flex-col justify-between
      "
    >
      <AnimatePresence mode="wait">
        {/* ================= STILLNESS ================= */}
        {step === "stillness" && (
          <motion.div
            key="stillness"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6 text-center"
          >
            <h3 className="text-lg font-semibold">
              How still were you?
            </h3>
            <p className="text-sm text-gray-400">
              1 = very restless · 10 = completely still
            </p>

            <div className="grid grid-cols-5 gap-3">
              {SCALE.map((n) => (
                <button
                  key={n}
                  onClick={() => setStillness(n)}
                  className={`py-3 rounded-xl border text-sm font-medium transition
                    ${
                      stillness === n
                        ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                        : "border-gray-700 text-gray-400 hover:bg-white/5"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              disabled={stillness === null}
              onClick={next}
              className={`w-full py-3 rounded-lg mt-4 transition
                ${
                  stillness !== null
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </motion.div>
        )}

        {/* ================= ACTIVITIES ================= */}
        {step === "activities" && (
          <motion.div
            key="activities"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-center">
              Did you do any of these?
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {ACTIVITIES.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleActivity(a)}
                  className={`py-3 rounded-xl border text-sm transition
                    ${
                      activities.includes(a)
                        ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                        : "border-gray-700 text-gray-400 hover:bg-white/5"
                    }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              disabled={activities.length === 0}
              onClick={next}
              className={`w-full py-3 rounded-lg mt-4 transition
                ${
                  activities.length > 0
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </motion.div>
        )}

        {/* ================= CALMNESS ================= */}
        {step === "calmness" && (
          <motion.div
            key="calmness"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6 text-center"
          >
            <h3 className="text-lg font-semibold">
              How calm were you?
            </h3>
            <p className="text-sm text-gray-400">
              1 = very stressed · 10 = deeply calm
            </p>

            <div className="grid grid-cols-5 gap-3">
              {SCALE.map((n) => (
                <button
                  key={n}
                  onClick={() => setCalmness(n)}
                  className={`py-3 rounded-xl border text-sm font-medium transition
                    ${
                      calmness === n
                        ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                        : "border-gray-700 text-gray-400 hover:bg-white/5"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              disabled={calmness === null}
              onClick={next}
              className={`w-full py-3 rounded-lg mt-4 transition
                ${
                  calmness !== null
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}
            >
              Next
            </button>
          </motion.div>
        )}

        {/* ================= FEEDBACK ================= */}
        {step === "feedback" && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold text-center">
              Any additional feedback?
            </h3>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Optional…"
              className="
                w-full rounded-xl bg-black/30
                border border-gray-700
                text-sm text-gray-200 p-3 resize-none
              "
            />

            <motion.button
              onClick={submit}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-lg
                bg-cyan-600 hover:bg-cyan-700
                text-white font-medium transition"
            >
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Continue to Download
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostEEGQuestionnaire;
