import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MuseWebAdapter } from "@/services/eeg/adapters/MuseWebAdapter";
import { MuseRecorder } from "@/services/eeg/museRecorder";
import { useDevice } from "@/context/DeviceContext";

const ConnectMuse: React.FC = () => {
  const navigate = useNavigate();
  const { setConnection } = useDevice();
  const [status, setStatus] = useState("Ready to connect");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (connecting) return;
    
    try {
      setConnecting(true);
      setStatus("🔍 Choose your Muse headset...");

      const adapter = new MuseWebAdapter();
      await adapter.connect();

      setStatus("✅ Connected! Starting EEG stream...");
      await new Promise(r => setTimeout(r, 500));
      
      const recorder = new MuseRecorder(adapter);
      setConnection(true, "muse", recorder);

      setStatus("🎉 Ready for EEG sessions!");
      setTimeout(() => navigate("/mind"), 1000);

    } catch (e: any) {
      console.error("[Muse Error]", e);
      setStatus(e.name === "NotFoundError" 
        ? "❌ No Muse found. Power ON + forget in Bluetooth settings."
        : `❌ ${e.message}`);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "black", color: "white",
      display: "flex", flexDirection: "column", justifyContent: "center",
      alignItems: "center", gap: 24, padding: "20px", fontFamily: "Inter"
    }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        🔵 Connect Muse Headset
      </h1>
      
      <p style={{ textAlign: "center", maxWidth: "400px", opacity: 0.8 }}>
        Power ON your Muse S, wet electrodes, forget in phone/PC Bluetooth
      </p>

      <button
        onClick={handleConnect}
        disabled={connecting}
        style={{
          padding: "16px 32px", fontSize: 18, fontWeight: 600,
          background: connecting ? "#666" : "#00cfe8", color: "black",
          border: "none", borderRadius: 12, cursor: connecting ? "not-allowed" : "pointer",
          boxShadow: "0 8px 32px rgba(0,207,232,0.4)"
        }}
      >
        {connecting ? "🔄 Connecting..." : "🎧 Connect Muse S"}
      </button>

      <div style={{ opacity: 0.9, maxWidth: "400px", textAlign: "center" }}>
        {status}
      </div>
    </div>
  );
};

export default ConnectMuse;