// src/pages/SignalQualityScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, BatteryCharging, BatteryFull } from "lucide-react";

import { useDevice } from "../context/DeviceContext";
import neurosityImg from "../assets/images/neurosity-headband.png";

// ---- Types -------------------------------------------------------

type SQStatus = "bad" | "ok" | "good" | "great";

interface SQPacketItem {
  standardDeviation?: number;
  status?: SQStatus | string;
}

interface StatusPacket {
  battery?: { percentage: number; charging: boolean };
  state?: string;
}

interface ChannelMeta {
  id: string;
  index: number;
  side: "left" | "right";
}

interface ChannelState extends ChannelMeta {
  status: SQStatus;
}

// Electrode placement positions
const ELECTRODE_POS = {
  F5: { top: "22%", left: "32%" },
  F6: { top: "22%", left: "68%" },
  C3: { top: "42%", left: "35%" },
  C4: { top: "42%", left: "65%" },
  CP3: { top: "58%", left: "33%" },
  CP4: { top: "58%", left: "67%" },
  PO3: { top: "76%", left: "30%" },
  PO4: { top: "76%", left: "70%" },
};

// Color states
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

const SignalQualityScreen = () => {
  const navigate = useNavigate();
  const { neurosity, setConnection } = useDevice();

  // Electrode states
  const [channels, setChannels] = useState<ChannelState[]>(
    CHANNELS_META.map((m) => ({ ...m, status: "bad" }))
  );

  // Device status
  const [online, setOnline] = useState(false);
  const [battery, setBattery] = useState<number | null>(null);
  const [charging, setCharging] = useState(false);

  // ----- Subscribe to streams -------------------------------------

  useEffect(() => {
    if (!neurosity) return;

    // Device status
    const statusSub = neurosity.status().subscribe((s: any) => {
  setOnline(s.state === "online");

  // Neurosity SDK gives battery as a NUMBER!
  if (typeof s.battery === "number") {
    setBattery(s.battery);
    setCharging(false); // Crown does NOT report charging state
  }
});

    // Signal Quality stream
    const sqSub = neurosity.signalQuality().subscribe((value: any) => {
  const packet = Array.isArray(value) ? value : value?.channels ?? [];

  setChannels(
    CHANNELS_META.map(meta => {
      const item = packet[meta.index] ?? {};

      let status: SQStatus;

      if (item.status) {
        status = item.status as SQStatus;
      } else {
        const sd = item.standardDeviation ?? 99999;
        if (sd < 7000) status = "great";
        else if (sd < 12000) status = "good";
        else if (sd < 20000) status = "ok";
        else status = "bad";
      }

      return { ...meta, status };
    })
  );
});


    return () => {
      statusSub.unsubscribe();
      sqSub.unsubscribe();
    };
  }, [neurosity]);

  // Weakest channel
  const weakest = useMemo(() => {
    return (
      channels.find((c) => c.status === "bad") ||
      channels.find((c) => c.status === "ok") ||
      channels[0]
    );
  }, [channels]);

  // Guidance messages
  const guidanceText = useMemo(() => {
    if (!weakest) return "";

    if (weakest.id === "F5" || weakest.id === "F6")
      return `Adjust the front band so ${weakest.id} contacts the skin properly.`;

    if (weakest.id.startsWith("PO"))
      return `Press the back of the Crown slightly so ${weakest.id} improves contact.`;

    return `Adjust hair or strap near ${weakest.id} to improve contact.`;
  }, [weakest]);

  const poor = channels.some((c) => c.status === "bad");

  useEffect(() => {
    if (neurosity) setConnection(true, "neurosity", neurosity);
  }, [neurosity, setConnection]);

  // -----------------------------------------------------------------

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 pt-6 pb-32 text-white">

      {/* HEADER */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-300 hover:text-purple-100"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </button>

        <div className="flex items-center gap-4 text-sm">
          {/* ONLINE/OFFLINE */}
          <div className="flex items-center gap-1">
            <span
              className={`w-3 h-3 rounded-full ${
                online ? "bg-emerald-400" : "bg-rose-500"
              }`}
            />
            <span className="text-slate-300">{online ? "Online" : "Offline"}</span>
          </div>

          {/* BATTERY */}
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

      {/* TITLE */}
      <h1 className="text-lg font-semibold tracking-wide mb-4">
        Crown Fit & Signal Quality
      </h1>

      <Card className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-xl">
        <CardContent className="p-6 space-y-6">
          {/* Crown Image */}
          <div className="relative w-64 sm:w-80 mx-auto aspect-[4/3]">
            <img
              src={neurosityImg}
              className="absolute inset-0 w-full h-full object-contain opacity-95"
            />

            {/* Electrode Dots */}
            {channels.map((ch) => {
              const pos = ELECTRODE_POS[ch.id];

              return (
                <motion.div
                  key={ch.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 
                    w-8 h-8 rounded-full flex items-center justify-center text-[10px] 
                    font-semibold text-slate-900 ${statusToColor(ch.status)}
                  `}
                  style={{ top: pos.top, left: pos.left }}
                  animate={{
                    scale:
                      ch.status === "great" || ch.status === "good"
                        ? [1, 1.14, 1]
                        : [1, 1.04, 1],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {ch.id}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-4 text-[11px] text-slate-400 mt-2">
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

          <Progress value={poor ? 20 : 80} className="h-2 bg-slate-800" />

          {/* Guidance */}
          <p className="text-xs text-slate-300">{guidanceText}</p>

          {poor && (
            <p className="text-[11px] text-amber-400">
              Signal is low, but you can continue.
            </p>
          )}

          {/* CONTINUE */}
          <button
            onClick={() => navigate("/mind")}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 
                       text-white text-sm font-semibold shadow-lg shadow-purple-500/40"
          >
            Continue to EEG Tests
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignalQualityScreen;
