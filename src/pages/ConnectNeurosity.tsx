// src/pages/ConnectNeurosity.tsx
import React, { useState } from "react";
import { loginNeurosity } from "../utils/NeurosityClient";
import { useDevice } from "../context/DeviceContext";

import { ArrowLeft, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ConnectNeurosity() {
  const navigate = useNavigate();
  const { setConnection } = useDevice();

  const [email, setEmail] = useState(localStorage.getItem("neurosityEmail") || "");
  const [password, setPassword] = useState(localStorage.getItem("neurosityPassword") || "");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("neurosityDeviceId") || "");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setError("");

    if (!email || !password || !deviceId) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const neurosity = await loginNeurosity({
        email,
        password,
        deviceId,
      });

      // Save the active device globally
      setConnection(true, "neurosity", neurosity);

      // Save last used credentials
      localStorage.setItem("neurosityEmail", email);
      localStorage.setItem("neurosityPassword", password);
      localStorage.setItem("neurosityDeviceId", deviceId);

      /** --------------------------------------------------------
       *  🔍 DEBUG RAW EEG (IMPORTANT TEST)
       *  Console should show EEG packets IMMEDIATELY after login.
       * --------------------------------------------------------*/
      neurosity.brainwaves("raw").subscribe((pkt) => {
        console.log("🔥 RAW EEG PACKET:", pkt);
      });

      // Move to signal quality
      navigate("/signal-quality");

    } catch (err) {
      console.error(err);
      setError("Could not connect. Check email, password or device ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-6 flex flex-col items-center mb-6">

      {/* HEADER */}
      <div className="w-full max-w-md flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
      </div>

      {/* CARD */}
      <div className="
        w-full max-w-md 
        bg-white/10 
        backdrop-blur-2xl 
        shadow-2xl 
        border border-white/10 
        rounded-2xl p-8
      ">
        <div className="flex flex-col items-center mb-6">
          <Cpu className="h-10 w-10 text-purple-400 mb-2" />
          <h2 className="text-2xl font-bold">Connect Your Neurosity Crown</h2>
          <p className="text-white/70 text-sm mt-1">Enter your Neurosity credentials</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Neurosity Email"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-600 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Neurosity Password"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-600 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="text"
            placeholder="Device ID"
            className="w-full p-3 rounded-lg bg-black/40 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-600 outline-none"
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value)}
          />

          {error && (
            <p className="text-red-400 text-center text-sm">{error}</p>
          )}

          <button
            onClick={handleConnect}
            disabled={loading}
            className="
              w-full py-3 rounded-lg 
              bg-purple-600 hover:bg-purple-500 
              disabled:bg-purple-900
              text-white font-semibold mt-4
            "
          >
            {loading ? "Connecting…" : "Connect"}
          </button>
        </div>
      </div>
    </div>
  );
}
