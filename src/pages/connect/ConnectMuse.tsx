import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UniversalMuseAdapter } from "@/services/eeg/adapters/UniversalMuseAdapter";
import { MuseRecorder } from "@/services/eeg/MuseRecorder";
import { useDevice } from "@/context/DeviceContext";

const ConnectMuse: React.FC = () => {
  const navigate = useNavigate();
  const { setConnection } = useDevice();
  const [status, setStatus] = useState("Ready to connect");
  const [connecting, setConnecting] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [logMessage, ...prev.slice(0, 19)]);
  };

  const handleConnect = async () => {
    if (connecting) return;
    
    setConnecting(true);
    setDebugLogs([]);
    setStatus("🔍 Searching for Muse devices...");
    addDebugLog("Starting connection process");

    try {
      // Create adapter
      const adapter = new UniversalMuseAdapter();
      addDebugLog("UniversalMuseAdapter created");
      
      // Connect
      addDebugLog("Attempting to connect...");
      await adapter.connect();
      addDebugLog("Adapter connected successfully");
      
      // Setup data listener
      const unsubscribe = adapter.onData((frame) => {
        addDebugLog(`EEG: ${frame.values.map(v => v.toFixed(1)).join(', ')} µV`);
      });
      
      // Start streaming
      addDebugLog("Starting EEG stream...");
      await adapter.start();
      addDebugLog("EEG streaming active!");
      
      // Create recorder - NOW IT WILL WORK WITH UniversalMuseAdapter
      const recorder = new MuseRecorder(adapter);
      addDebugLog("Recorder created");
      
      // Update global state
      setConnection(true, "muse", recorder);
      addDebugLog("Global state updated");
      
      setStatus("🎉 Connected! Starting EEG sessions...");
      addDebugLog("Redirecting to mind module");
      
      // Clean up on unmount
      return () => {
        unsubscribe();
        if (adapter.isRunning()) {
          adapter.stop();
        }
      };
      
    } catch (error: any) {
      console.error("Connection error:", error);
      addDebugLog(`ERROR: ${error.message}`);
      
      let errorMessage = "❌ Connection failed";
      
      if (error.message.includes("No Muse device found")) {
        errorMessage = `❌ No Muse found.\n\nTroubleshooting:\n1. Power ON Muse (hold 5+ seconds)\n2. Lights should blink purple/blue\n3. Forget from phone/PC Bluetooth\n4. Move closer to computer`;
      } else if (error.message.includes("Web Bluetooth not supported")) {
        errorMessage = "❌ Browser not supported.\nUse Chrome/Edge on desktop\nEnable experimental Web Bluetooth flag";
      } else if (error.message.includes("Bluetooth connection failed")) {
        errorMessage = "❌ Bluetooth error.\n• Windows Bluetooth often fails\n• Try macOS/Linux if possible\n• Use Muse Direct app to test first";
      } else if (error.message.includes("No Muse EEG service found")) {
        errorMessage = "❌ Device incompatible.\nYour Muse S BBA3 may need:\n• Firmware update via Muse Direct\n• Factory reset (hold 20+ seconds)";
      } else if (error.message.includes("timeout")) {
        errorMessage = "❌ Connection timeout.\n• Ensure Muse is fully charged\n• Restart computer Bluetooth";
      }
      
      setStatus(errorMessage);
    } finally {
      setConnecting(false);
    }
  };

  const handleReset = () => {
    setStatus("Ready to connect");
    setDebugLogs([]);
  };

  return (
    <div style={{
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #000000 0%, #0a0a2a 100%)",
      color: "white",
      padding: "20px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        maxWidth: "500px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "8px" }}>
            🧠 Connect Muse Device
          </h1>
          <p style={{ opacity: 0.8, fontSize: "14px" }}>
            Universal Web Bluetooth support for Muse S, Muse 2, and Muse
          </p>
        </div>

        {/* Connection Status */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid rgba(0, 207, 232, 0.2)",
          minHeight: "100px",
          whiteSpace: "pre-line"
        }}>
          {status}
        </div>

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={connecting}
          style={{
            padding: "16px",
            background: connecting 
              ? "#666" 
              : "linear-gradient(90deg, #00cfe8, #6b46c1)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: connecting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            transition: "all 0.3s"
          }}
        >
          {connecting ? (
            <>
              <span className="spinner"></span>
              Connecting...
            </>
          ) : (
            <>
              ⚡ Connect Muse
            </>
          )}
        </button>

        {/* Debug Logs */}
        {debugLogs.length > 0 && (
          <div style={{
            background: "rgba(0, 0, 0, 0.3)",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            <div style={{
              padding: "12px",
              maxHeight: "200px",
              overflowY: "auto",
              fontSize: "12px",
              fontFamily: "monospace",
              background: "rgba(0, 0, 0, 0.5)"
            }}>
              {debugLogs.map((log, index) => (
                <div 
                  key={index} 
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    color: log.includes("ERROR") ? "#ff6b6b" : 
                           log.includes("✅") ? "#88ff88" : 
                           log.includes("❌") ? "#ff6b6b" : "#cccccc"
                  }}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Troubleshooting */}
        <div style={{
          background: "rgba(255, 107, 107, 0.1)",
          borderRadius: "12px",
          padding: "16px",
          border: "1px solid rgba(255, 107, 107, 0.3)"
        }}>
          <h3 style={{ marginBottom: "12px", color: "#ff6b6b" }}>
            ⚠️ Still Having Issues?
          </h3>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            <p style={{ marginBottom: "8px" }}>
              <strong>For Muse S BBA3:</strong>
            </p>
            <ol style={{ paddingLeft: "20px", margin: "0" }}>
              <li>Use Muse Direct app first to update firmware</li>
              <li>Connect via USB, not Bluetooth for initial setup</li>
              <li>After firmware update, try Web Bluetooth again</li>
            </ol>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          style={{
            padding: "12px",
            background: "transparent",
            color: "#00cfe8",
            border: "1px solid #00cfe8",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          🔄 Reset Connection
        </button>
      </div>

      {/* CSS for spinner */}
      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ConnectMuse;