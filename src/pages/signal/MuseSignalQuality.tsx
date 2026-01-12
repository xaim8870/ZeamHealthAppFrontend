// src/pages/signal/MuseSignalQuality.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEEGRecorder } from "@/hooks/useEEGRecorder";

const CHANNELS = ["TP9", "AF7", "AF8", "TP10"] as const;
type Quality = "poor" | "fair" | "good";

function isMuseFrame(
  f: any
): f is { device: "muse"; channel: string; values: number[] } {
  return f?.device === "muse" && Array.isArray(f.values);
}

export default function MuseSignalQuality({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const recorder = useEEGRecorder();
  const [quality, setQuality] = useState<Record<string, Quality>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const frames = recorder.getData().frames ?? [];
      const latest: Record<string, number[]> = {};

      for (let i = frames.length - 1; i >= 0; i--) {
        const f = frames[i];
        if (!isMuseFrame(f)) continue;
        if (!latest[f.channel]) latest[f.channel] = f.values;
      }

      const updates: Record<string, Quality> = {};

      CHANNELS.forEach((ch) => {
        const samples = latest[ch];
        if (!samples || samples.length === 0) return;

        // ✅ RMS-based quality (Muse-appropriate)
        const rms = Math.sqrt(
          samples.reduce((s, x) => s + x * x, 0) / samples.length
        );

        if (rms < 50) updates[ch] = "poor";
        else if (rms < 200) updates[ch] = "fair";
        else updates[ch] = "good";
      });

      setQuality((prev) => ({ ...prev, ...updates }));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const allGood = CHANNELS.every((ch) => quality[ch] === "good");

  return (
    <div className="min-h-screen flex justify-center bg-[#0c0f14] text-white">
      <div className="w-full max-w-md px-4 py-6">
        <h2 className="text-xl font-semibold text-center mb-6">
          Signal Quality Check
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {CHANNELS.map((ch) => {
            const status = quality[ch] ?? "poor";
            return (
              <Card
                key={ch}
                className="p-4 text-center bg-gray-900 border border-gray-700"
              >
                <motion.div
                  className={`w-16 h-16 mx-auto rounded-full mb-2 ${
                    status === "good"
                      ? "bg-green-400"
                      : status === "fair"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
                <p className="font-medium">{ch}</p>
                <p className="text-sm capitalize text-gray-400">{status}</p>
              </Card>
            );
          })}
        </div>

        <Button
          className="w-full mt-6 bg-cyan-500 hover:bg-cyan-400 text-black"
          disabled={!allGood}
          onClick={onContinue}
        >
          Continue to EEG Assessment
        </Button>
      </div>
    </div>
  );
}
