// src/pages/SignalQualityScreen.tsx

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useDevice } from "../context/DeviceContext";

const ELECTRODE_NAMES = [
  "CP3", "CP4", "C3", "C4", "F5", "F6", "PO3", "PO4"
];

const SignalQualityScreen = () => {
  const navigate = useNavigate();
  const { neurosity, setConnection } = useDevice();

  const [data, setData] = useState<any[]>([]);
  const [avgQuality, setAvgQuality] = useState(0);

  useEffect(() => {
    if (!neurosity) return;

    console.log("🧠 Starting futuristic signal-quality tracking…");

    const sub = neurosity.signalQuality().subscribe((packet) => {
      console.log("signalQuality()", packet);

      if (!Array.isArray(packet)) return;

      setData(packet);

      // Convert statuses to numeric
      const statusScore = {
        great: 1,
        good: 0.7,
        ok: 0.5,
        bad: 0.1
      };

      const scores = packet.map((p) => statusScore[p.status] || 0);
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

      setAvgQuality(Math.round(avg * 100));

      if (avg * 100 >= 60) {
        setTimeout(() => navigate("/mind"), 700);
      }
    });

    return () => sub.unsubscribe();
  }, [neurosity]);

  // AI Adjustment Assistant Messages
  const suggestion = useMemo(() => {
    if (!data.length) return "Adjust the Crown for optimal fit.";

    const badIndexes = data
      .map((p, i) => (p.status === "bad" ? i : null))
      .filter((i) => i !== null);

    if (badIndexes.includes(1) || badIndexes.includes(3) || badIndexes.includes(5)) {
      return "➡️ Adjust RIGHT side inward & tilt slightly backward.";
    }

    if (badIndexes.includes(6)) {
      return "⬇️ Lower the BACK-LEFT electrode (PO3).";
    }

    if (badIndexes.length === 0) {
      return "🔥 All electrodes stable. Perfect fit!";
    }

    return "Make small adjustments for optimal connection.";
  }, [data]);

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 flex flex-col items-center">

      {/* HEADER */}
      <div className="w-full max-w-md flex items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-400 hover:text-purple-200"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-white tracking-wide">
          Headband Fit Assistant
        </h1>
      </div>

      {/* ULTRA-PREMIUM NEON HEAD */}
      <div className="relative w-[260px] h-[360px] mb-6">

        {/* Neon Head Silhouette */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-full border-[3px] border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.6)]"
        />

        {/* Electrode Points (8) */}
        {data.map((item, index) => {
          const pos = [
            { top: "10%", left: "30%" }, // F5
            { top: "10%", left: "60%" }, // F6
            { top: "30%", left: "28%" }, // C3
            { top: "30%", left: "62%" }, // C4
            { top: "48%", left: "25%" }, // CP3
            { top: "48%", left: "65%" }, // CP4
            { top: "70%", left: "35%" }, // PO3
            { top: "70%", left: "55%" }, // PO4
          ][index];

          const colorMap = {
            great: "bg-green-400 shadow-[0_0_25px_rgba(34,197,94,0.8)]",
            good: "bg-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.8)]",
            ok: "bg-orange-400 shadow-[0_0_25px_rgba(250,140,22,0.8)]",
            bad: "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)]",
          };

          return (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`absolute w-6 h-6 rounded-full border border-white/40 ${colorMap[item.status]}`}
              style={{ ...pos }}
            >
            </motion.div>
          );
        })}
      </div>

      {/* SUGGESTION */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-purple-300 text-center text-sm mb-4"
      >
        {suggestion}
      </motion.p>

      {/* OVERALL SIGNAL BAR */}
      <div className="w-full max-w-md">
        <div className="w-full bg-gray-800/50 rounded-full h-3 overflow-hidden">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${avgQuality}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-center mt-2 text-lg font-semibold text-purple-400">
          {avgQuality}% Connected
        </p>
      </div>
    </div>
  );
};

export default SignalQualityScreen;
