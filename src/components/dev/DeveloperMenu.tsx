import React, { useEffect, useState } from "react";
import { EEGStep, STEP_ORDER } from "@/types/eegFlow";

type Props = {
  currentStep: EEGStep;
  setStep: (s: EEGStep) => void;
};

const DeveloperMenu: React.FC<Props> = ({ currentStep, setStep }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      const typing =
        tag === "input" || tag === "textarea" || (e.target as any)?.isContentEditable;
      if (typing) return;

      if (e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        setOpen((s) => !s);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 p-5 rounded-2xl w-[360px]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">Developer Menu</div>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-gray-400 hover:text-gray-200"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {STEP_ORDER.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStep(s);
                setOpen(false);
              }}
              className={`py-2 rounded-lg text-xs border transition ${
                s === currentStep
                  ? "bg-cyan-600/20 border-cyan-500 text-cyan-200"
                  : "bg-white/5 border-gray-800 text-gray-300 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 text-[11px] text-gray-400">
          Shift + D toggles this menu.
        </div>
      </div>
    </div>
  );
};

export default DeveloperMenu;
