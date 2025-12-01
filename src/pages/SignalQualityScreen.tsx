// src/pages/SignalQualityScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";

import { useDevice } from "../context/DeviceContext";
import neurosityImg from "../assets/images/neurosity-headband.png";

// ---- Types & helpers -------------------------------------------------------

type SQStatus = "bad" | "ok" | "good" | "great";

interface SQPacketItem {
  standardDeviation?: number;
  status?: SQStatus | string;
}

interface ChannelMeta {
  id: string;
  index: number;
  side: "left" | "right";
  label: string;
}

interface ChannelState extends ChannelMeta {
  status: SQStatus;
  std: number;
  score: number; // 0–1
}

const CHANNELS_META: ChannelMeta[] = [
  { id: "F5", index: 0, side: "left",  label: "Left front" },
  { id: "C3", index: 1, side: "left",  label: "Left middle" },
  { id: "CP3", index: 2, side: "left", label: "Left rear" },
  { id: "PO3", index: 3, side: "left", label: "Left back" },
  { id: "PO4", index: 4, side: "right", label: "Right back" },
  { id: "CP4", index: 5, side: "right", label: "Right rear" },
  { id: "C4", index: 6, side: "right", label: "Right middle" },
  { id: "F6", index: 7, side: "right", label: "Right front" },
];

// Map Neurosity status + std dev → score 0–1
function computeScore(status: string | undefined, std: number | undefined): number {
  let base: number;
  switch (status) {
    case "great":
      base = 0.95;
      break;
    case "good":
      base = 0.8;
      break;
    case "ok":
      base = 0.6;
      break;
    default:
      base = 0.25;
      break;
  }

  const s = std ?? 0;
  if (s > 0) {
    if (s > 30000) base -= 0.15;
    else if (s > 20000) base -= 0.1;
    else if (s > 10000) base -= 0.05;
    else if (s < 8000) base += 0.05;
  }

  return Math.min(1, Math.max(0, base));
}

function statusToColor(status: SQStatus): string {
  switch (status) {
    case "great":
      return "bg-emerald-400 shadow-emerald-500/50";
    case "good":
      return "bg-lime-400 shadow-lime-500/50";
    case "ok":
      return "bg-amber-400 shadow-amber-500/50";
    case "bad":
    default:
      return "bg-rose-500 shadow-rose-500/40";
  }
}

function statusToLabel(status: SQStatus): string {
  switch (status) {
    case "great":
      return "Great";
    case "good":
      return "Good";
    case "ok":
      return "OK";
    case "bad":
    default:
      return "Poor";
  }
}

// ----------------------------------------------------------------------------

const SignalQualityScreen: React.FC = () => {
  const navigate = useNavigate();
  const { neurosity, setConnection } = useDevice();

  const [channels, setChannels] = useState<ChannelState[]>(
    CHANNELS_META.map((meta) => ({
      ...meta,
      status: "bad",
      std: 0,
      score: 0,
    }))
  );

  // ----- Subscribe to Neurosity streams -------------------------------------

  useEffect(() => {
    if (!neurosity) {
      console.warn("No neurosity instance; redirecting.");
      return;
    }

    console.log("Starting EEG + signal quality streams…");

    // Optional: raw stream for debugging
    const rawSub = neurosity.brainwaves("raw").subscribe((bw: any) => {
      // console.log("RAW EEG sample", bw);
    });

    const sqSub = neurosity.signalQuality().subscribe(
      (packet: SQPacketItem[] | any) => {
        if (!Array.isArray(packet)) {
          console.warn("Unexpected signalQuality packet:", packet);
          return;
        }

        console.log("📡 SIGNAL QUALITY PACKET:", packet);

        setChannels(
          CHANNELS_META.map((meta) => {
            const item = packet[meta.index] ?? {};
            const status = (item.status as SQStatus) || "bad";
            const std = item.standardDeviation ?? 0;
            const score = computeScore(status, std);

            return {
              ...meta,
              status,
              std,
              score,
            };
          })
        );
      },
      (err: any) => {
        console.error("signalQuality() stream error:", err);
      }
    );

    return () => {
      rawSub.unsubscribe();
      sqSub.unsubscribe();
    };
  }, [neurosity, setConnection]);

  // ----- Derived values ------------------------------------------------------

  const overallQuality = useMemo(() => {
    if (!channels.length) return 0;
    const avg = channels.reduce((sum, ch) => sum + ch.score, 0) / channels.length;
    return Math.round(avg * 100);
  }, [channels]);

  const numGood = useMemo(
    () =>
      channels.filter((ch) => ch.status === "good" || ch.status === "great").length,
    [channels]
  );

  const isReady = overallQuality >= 70 && numGood >= 6;

  const weakest = useMemo(
    () => channels.reduce((min, ch) => (ch.score < min.score ? ch : min), channels[0]),
    [channels]
  );

  const guidanceText = useMemo(() => {
    if (!weakest) return "";

    if (isReady) {
      return "Your Crown fit looks great. Stay still and press Continue to begin the test.";
    }

    const sideText =
      weakest.side === "left" ? "left side of the Crown" : "right side of the Crown";

    if (weakest.id === "F5" || weakest.id === "F6") {
      return `Gently adjust the ${sideText} on your forehead. Make sure the ${weakest.id} electrode touches skin without hair.`;
    }

    if (weakest.id === "PO3" || weakest.id === "PO4") {
      return `Press the back of the Crown slightly towards your head so that ${weakest.id} makes better contact.`;
    }

    return `Tighten the ${sideText} slightly and smooth hair away from the ${weakest.id} contact. Hold still for a few seconds.`;
  }, [weakest, isReady]);

  const gaugeStyle = useMemo(
    () => ({
      background: `conic-gradient(#a855f7 ${overallQuality * 3.6}deg, rgba(148,163,184,0.2) 0deg)`,
    }),
    [overallQuality]
  );

  // Auto-mark connection when ready (optional)
  useEffect(() => {
    if (isReady && neurosity) {
      setConnection(true, "neurosity", neurosity);
      // You can auto-navigate here if you like:
      // setTimeout(() => navigate("/mind"), 800);
    }
  }, [isReady, neurosity, setConnection]);

  // ----- UI ------------------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br ... px-4 pt-6 pb-32 text-white">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md flex items-center mb-4"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-300 hover:text-purple-100"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>

        <h1 className="flex-1 text-center text-lg font-semibold tracking-wide">
          Crown Fit & Signal Quality
        </h1>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl">
          <CardContent className="p-5 space-y-5">
            {/* Crown image + gauge */}
            <div className="flex flex-col items-center gap-4">
              <motion.img
                src={neurosityImg}
                alt="Neurosity Crown"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-20 opacity-90"
              />

              {/* Radial gauge */}
              <div className="relative">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(168,85,247,0.4)]"
                  style={gaugeStyle}
                >
                  <div className="w-20 h-20 rounded-full bg-slate-950 flex flex-col items-center justify-center border border-slate-700">
                    <span className="text-2xl font-semibold">
                      {overallQuality}%
                    </span>
                    <span className="text-[11px] text-slate-300">
                      overall contact
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-slate-300">
                  {numGood} / 8 electrodes good
                </div>
              </div>
            </div>

            {/* Electrode map */}
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-3 text-center">
                Electrode contact map
              </p>

              {/* Simple U-shape layout */}
              <div className="grid grid-cols-2 gap-y-4 text-xs">
                {/* Left column: F5, C3, CP3, PO3 */}
                <div className="flex flex-col items-center gap-4">
                  {["F5", "C3", "CP3", "PO3"].map((id) => {
                    const ch = channels.find((c) => c.id === id)!;
                    const percent = Math.round(ch.score * 100);
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className="flex flex-col items-end">
                          <span className="text-[11px] text-slate-300">{id}</span>
                          <span className="text-[10px] text-slate-500">
                            {statusToLabel(ch.status)}
                          </span>
                        </div>
                        <motion.div
                          className={`w-7 h-7 rounded-full shadow-lg ${statusToColor(
                            ch.status
                          )}`}
                          animate={{
                            scale: ch.status === "great" || ch.status === "good"
                              ? [1, 1.12, 1]
                              : [1, 1.04, 1],
                            opacity: [0.85, 1, 0.85],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.6,
                            ease: "easeInOut",
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-slate-900">
                            {percent}%
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Right column: F6, C4, CP4, PO4 */}
                <div className="flex flex-col items-center gap-4">
                  {["F6", "C4", "CP4", "PO4"].map((id) => {
                    const ch = channels.find((c) => c.id === id)!;
                    const percent = Math.round(ch.score * 100);
                    return (
                      <motion.div
                        key={id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          className={`w-7 h-7 rounded-full shadow-lg ${statusToColor(
                            ch.status
                          )}`}
                          animate={{
                            scale: ch.status === "great" || ch.status === "good"
                              ? [1, 1.12, 1]
                              : [1, 1.04, 1],
                            opacity: [0.85, 1, 0.85],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.6,
                            ease: "easeInOut",
                          }}
                        >
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-slate-900">
                            {percent}%
                          </div>
                        </motion.div>
                        <div className="flex flex-col items-start">
                          <span className="text-[11px] text-slate-300">{id}</span>
                          <span className="text-[10px] text-slate-500">
                            {statusToLabel(ch.status)}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Simple bar under the map (extra feedback) */}
              <div className="mt-4">
                <Progress
                  value={overallQuality}
                  className="h-2 bg-slate-800"
                />
              </div>
            </div>

            {/* Guidance + CTA */}
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 text-xs">
                {isReady ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-[2px]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-[2px]" />
                )}
                <p className="text-slate-200 leading-snug">{guidanceText}</p>
              </div>

              <button
                onClick={() => isReady && navigate("/mind")}
                disabled={!isReady}
                className={`w-full mt-1 py-2.5 rounded-xl text-sm font-semibold transition
                  ${
                    isReady
                      ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/40"
                      : "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
                  }`}
              >
                {isReady ? "Continue to EEG Tests" : "Adjust Crown to improve contact"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignalQualityScreen;
