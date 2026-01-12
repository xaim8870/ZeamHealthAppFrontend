import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MuseWebAdapter } from "@/services/eeg/adapters/MuseWebAdapter";
import { MuseRecorder } from "@/services/eeg/museRecorder";
import { useDevice } from "@/context/DeviceContext";

const ConnectMuse: React.FC = () => {
  const navigate = useNavigate();
  const { setConnection } = useDevice();
  const [status, setStatus] = useState("Idle");
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (connecting) return;

    try {
      setConnecting(true);
      setStatus("Tap your Muse-S BBA3 in Bluetooth chooser…");

      const adapter = new MuseWebAdapter();
      await adapter.connect();

      setStatus("Muse S connected. Preparing session…");

      await new Promise((r) => setTimeout(r, 500));

      const recorder = new MuseRecorder(adapter);

      // ✅ Use "muse" to match DeviceType
      setConnection(true, "muse", recorder);

      setStatus("Connected! Redirecting…");
      navigate("/mind");
    } catch (e: any) {
      console.error("[Muse S BBA3 Error]", e);

      if (e?.name === "NotFoundError") {
        setStatus("❌ Bluetooth chooser cancelled or permission denied.");
      } else if (e?.message?.includes("Characteristic")) {
        setStatus("✅ web-muse handles Muse S BBA3. Try again.");
      } else {
        setStatus(`Failed: ${e.message || "Unknown error"}`);
      }
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
      }}
    >
      <h1>Connect Muse S Headset</h1>

      <button
        onClick={handleConnect}
        disabled={connecting}
        style={{
          padding: "14px 28px",
          fontSize: 16,
          background: "#00cfe8",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          opacity: connecting ? 0.6 : 1,
        }}
      >
        {connecting ? "Connecting…" : "Connect Muse S BBA3"}
      </button>

      <p style={{ opacity: 0.7, maxWidth: "400px", textAlign: "center" }}>
        {status}
      </p>
    </div>
  );
};

export default ConnectMuse;
