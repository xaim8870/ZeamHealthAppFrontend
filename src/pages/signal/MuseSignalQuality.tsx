import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEEGRecorder } from "@/hooks/useEEGRecorder";
import { EEGFrame } from "@/types/eeg";

const CHANNELS = ["TP9", "AF7", "AF8", "TP10"] as const;

type Quality = "poor" | "fair" | "good";

export default function MuseSignalQuality({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const recorder = useEEGRecorder();

  const [quality, setQuality] = useState<Record<string, Quality>>({});

  useEffect(() => {
    recorder.start();

    const interval = setInterval(() => {
      const data = recorder.getData().samples;
      const latestFrame: EEGFrame | undefined = data[data.length - 1];

      if (!latestFrame) return;

      const updates: Record<string, Quality> = {};

      CHANNELS.forEach((ch) => {
        const samples = latestFrame.channels[ch] as number[] | undefined;
        if (!samples || samples.length === 0) return;

        const mean =
          samples.reduce((a, b) => a + b, 0) / samples.length;

        const variance =
          samples.reduce((a, b) => a + (b - mean) ** 2, 0) /
          samples.length;

        if (variance < 10) updates[ch] = "poor";
        else if (variance < 30) updates[ch] = "fair";
        else updates[ch] = "good";
      });

      setQuality((prev) => ({ ...prev, ...updates }));
    }, 500);

    return () => {
      clearInterval(interval);
      recorder.stop();
    };
  }, []);

  const allGood =
    CHANNELS.every((ch) => quality[ch] === "good");

  return (
    <div className="min-h-screen px-4 py-6">
      <h2 className="text-xl font-semibold text-center mb-6">
        Signal Quality Check
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {CHANNELS.map((ch) => {
          const status = quality[ch] ?? "poor";
          return (
            <Card key={ch} className="p-4 text-center">
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
              <p className="text-sm text-gray-500 capitalize">
                {status}
              </p>
            </Card>
          );
        })}
      </div>

      <Button
        className="w-full mt-6"
        disabled={!allGood}
        onClick={onContinue}
      >
        Continue to EEG Assessment
      </Button>
    </div>
  );
}
