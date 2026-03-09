// src/pages/SignalQualityScreen.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BatteryCharging, BatteryFull } from "lucide-react";

import { useDevice } from "../../context/DeviceContext";
import neurosityImg from "../../assets/images/neurosity-headband.png";

// ---- Types -------------------------------------------------------

type SQStatus = "bad" | "ok" | "good" | "great";

interface SQPacketItem {
  standardDeviation?: number;
  status?: SQStatus | string;
}

interface ChannelMeta {
  id: string;
  index: number;
  side: "left" | "right";
}

interface ChannelState extends ChannelMeta {
  status: SQStatus;
}

// ---- Config ------------------------------------------------------

const UI_UPDATE_MS = 250; // update UI at most every 250ms
const DROPOUT_GRACE_MS = 1200; // keep last known value during short signal drops
const SMOOTHING_ALPHA = 0.28; // lower = smoother, higher = faster response

// Electrode placement positions
const ELECTRODE_POS: Record<string, { top: string; left: string }> = {
  F5: { top: "22%", left: "32%" },
  F6: { top: "22%", left: "68%" },
  C3: { top: "42%", left: "35%" },
  C4: { top: "42%", left: "65%" },
  CP3: { top: "58%", left: "33%" },
  CP4: { top: "58%", left: "67%" },
  PO3: { top: "76%", left: "30%" },
  PO4: { top: "76%", left: "70%" },
};

// Channels metadata
const CHANNELS_META: ChannelMeta[] = [
  { id: "F5", index: 0, side: "left" },
  { id: "C3", index: 1, side: "left" },
  { id: "CP3", index: 2, side: "left" },
  { id: "PO3", index: 3, side: "left" },
  { id: "PO4", index: 4, side: "right" },
  { id: "CP4", index: 5, side: "right" },
  { id: "C4", index: 6, side: "right" },
  { id: "F6", index: 7, side: "right" },
];

// ---- Helpers -----------------------------------------------------

function statusToColor(status: SQStatus) {
  switch (status) {
    case "great":
      return "bg-emerald-400 shadow-emerald-500/60";
    case "good":
      return "bg-lime-400 shadow-lime-500/60";
    case "ok":
      return "bg-amber-400 shadow-amber-500/60";
    default:
      return "bg-rose-500 shadow-rose-500/60";
  }
}

function statusToScore(status: SQStatus): number {
  switch (status) {
    case "great":
      return 3;
    case "good":
      return 2;
    case "ok":
      return 1;
    default:
      return 0;
  }
}

function scoreToStatus(score: number): SQStatus {
  if (score >= 2.5) return "great";
  if (score >= 1.5) return "good";
  if (score >= 0.5) return "ok";
  return "bad";
}

function sdToScore(sd: number): number {
  if (sd < 7000) return 3; // great
  if (sd < 12000) return 2; // good
  if (sd < 20000) return 1; // ok
  return 0; // bad
}

function itemToScore(item?: SQPacketItem): number | null {
  if (!item) return null;

  if (item.status) {
    const s = String(item.status).toLowerCase();
    if (s === "great" || s === "good" || s === "ok" || s === "bad") {
      return statusToScore(s);
    }
  }

  if (typeof item.standardDeviation === "number") {
    return sdToScore(item.standardDeviation);
  }

  return null;
}

function shallowEqualChannels(a: ChannelState[], b: ChannelState[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].id !== b[i].id || a[i].status !== b[i].status) return false;
  }
  return true;
}

// ---- Component ---------------------------------------------------

const SignalQualityScreen = () => {
  const navigate = useNavigate();
  const { neurosity, setConnection } = useDevice();

  const [channels, setChannels] = useState<ChannelState[]>(
    CHANNELS_META.map((m) => ({ ...m, status: "bad" }))
  );

  const [online, setOnline] = useState(false);
  const [battery, setBattery] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);

  // refs to avoid excessive renders
  const channelsRef = useRef<ChannelState[]>(
    CHANNELS_META.map((m) => ({ ...m, status: "bad" }))
  );
  const smoothedScoresRef = useRef<Record<string, number>>(
    Object.fromEntries(CHANNELS_META.map((c) => [c.id, 0]))
  );
  const lastSeenRef = useRef<Record<string, number>>(
    Object.fromEntries(CHANNELS_META.map((c) => [c.id, 0]))
  );
  const latestPacketRef = useRef<SQPacketItem[]>([]);
  const updateTimerRef = useRef<number | null>(null);

  useEffect(() => {
    channelsRef.current = channels;
  }, [channels]);

  useEffect(() => {
    if (!neurosity) return;

    setConnection(true, "neurosity", neurosity);

    // Status stream
    const statusSub = neurosity.status().subscribe((s: any) => {
      setOnline(s?.state === "online");

      if (typeof s?.battery === "number") {
        setBattery(s.battery);
        setCharging(false);
      } else if (s?.battery && typeof s.battery.percentage === "number") {
        setBattery(s.battery.percentage);
        setCharging(Boolean(s.battery.charging));
      }
    });

    const commitVisualState = () => {
      const now = Date.now();
      const packet = latestPacketRef.current;

      const nextChannels: ChannelState[] = CHANNELS_META.map((meta) => {
        const item = packet[meta.index];
        const rawScore = itemToScore(item);

        let nextSmoothed = smoothedScoresRef.current[meta.id] ?? 0;

        if (rawScore !== null) {
          // we received fresh data for this channel
          lastSeenRef.current[meta.id] = now;

          // exponential smoothing
          nextSmoothed =
            nextSmoothed * (1 - SMOOTHING_ALPHA) + rawScore * SMOOTHING_ALPHA;
        } else {
          // short dropouts while adjusting should not instantly turn red
          const lastSeen = lastSeenRef.current[meta.id] ?? 0;
          const age = now - lastSeen;

          if (age > DROPOUT_GRACE_MS) {
            // decay slowly after grace period
            nextSmoothed = nextSmoothed * 0.92;
          }
        }

        smoothedScoresRef.current[meta.id] = nextSmoothed;

        return {
          ...meta,
          status: scoreToStatus(nextSmoothed),
        };
      });

      if (!shallowEqualChannels(channelsRef.current, nextChannels)) {
        channelsRef.current = nextChannels;
        setChannels(nextChannels);
      }
    };

    const scheduleCommit = () => {
      if (updateTimerRef.current !== null) return;

      updateTimerRef.current = window.setTimeout(() => {
        commitVisualState();
        updateTimerRef.current = null;
      }, UI_UPDATE_MS);
    };

    // Signal quality stream
    const sqSub = neurosity.signalQuality().subscribe((value: any) => {
      const packet = Array.isArray(value) ? value : value?.channels ?? [];
      latestPacketRef.current = packet;
      scheduleCommit();
    });

    return () => {
      statusSub.unsubscribe();
      sqSub.unsubscribe();

      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
    };
  }, [neurosity, setConnection]);

  const weakest = useMemo(() => {
    return (
      channels.find((c) => c.status === "bad") ||
      channels.find((c) => c.status === "ok") ||
      channels[0]
    );
  }, [channels]);

  const guidanceText = useMemo(() => {
    if (!weakest) return "";

    if (weakest.id === "F5" || weakest.id === "F6") {
      return `Adjust the front band so ${weakest.id} contacts the skin properly.`;
    }

    if (weakest.id.startsWith("PO")) {
      return `Press the back of the Crown slightly so ${weakest.id} improves contact.`;
    }

    return `Adjust hair or strap near ${weakest.id} to improve contact.`;
  }, [weakest]);

  const poor = channels.some((c) => c.status === "bad");
  const goodCount = channels.filter(
    (c) => c.status === "good" || c.status === "great"
  ).length;

  const progressValue = useMemo(() => {
    return Math.round((goodCount / channels.length) * 100);
  }, [goodCount, channels.length]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 pt-6 pb-32 text-white">
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-300 hover:text-purple-100 transition-colors"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </button>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span
              className={`w-3 h-3 rounded-full ${
                online ? "bg-emerald-400" : "bg-rose-500"
              }`}
            />
            <span className="text-slate-300">{online ? "Online" : "Offline"}</span>
          </div>

          {battery !== null && (
            <div className="flex items-center gap-1 text-slate-300">
              {charging ? (
                <BatteryCharging className="w-4 h-4 text-yellow-300" />
              ) : (
                <BatteryFull className="w-4 h-4 text-green-300" />
              )}
              {battery}%
            </div>
          )}
        </div>
      </div>

      <h1 className="text-lg font-semibold tracking-wide mb-4">
        Crown Fit & Signal Quality
      </h1>

      <Card className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="relative w-64 sm:w-80 mx-auto aspect-[4/3]">
            <img
              src={neurosityImg}
              alt="Neurosity Crown"
              className="absolute inset-0 w-full h-full object-contain opacity-95"
            />

            {channels.map((ch) => {
              const pos = ELECTRODE_POS[ch.id];

              return (
                <motion.div
                  key={ch.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-semibold text-slate-900 shadow-lg ${statusToColor(
                    ch.status
                  )}`}
                  style={{ top: pos.top, left: pos.left }}
                  animate={{
                    scale:
                      ch.status === "great"
                        ? [1, 1.12, 1]
                        : ch.status === "good"
                        ? [1, 1.08, 1]
                        : [1, 1.03, 1],
                  }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                >
                  {ch.id}
                </motion.div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 text-[11px] text-slate-400 mt-2 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-400 rounded-full" /> Great
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-lime-400 rounded-full" /> Good
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-400 rounded-full" /> OK
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-rose-500 rounded-full" /> Poor
            </span>
          </div>

          <Progress value={progressValue} className="h-2 bg-slate-800" />

          <p className="text-xs text-slate-300">{guidanceText}</p>

          {poor && (
            <p className="text-[11px] text-amber-400">
              Signal is temporarily unstable while adjusting. Continue once contact settles.
            </p>
          )}

          <button
            onClick={() => navigate("/mind")}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-500/40 transition-colors"
          >
            Continue to EEG Tests
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalQualityScreen;