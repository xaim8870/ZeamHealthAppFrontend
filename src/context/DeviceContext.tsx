import React, { createContext, useContext, useState } from "react";
import type { Neurosity } from "@neurosity/sdk";
import { logoutNeurosity } from "../utils/NeurosityClient";
import { MuseRecorder } from "@/services/eeg/MuseRecorder";
import { useEEGRecorder } from "@/hooks/useEEGRecorder";

/* ===================== TYPES ===================== */

type DeviceType = "neurosity" | "muse" | null;

interface DeviceState {
  isConnected: boolean;
  selectedDevice: DeviceType;

  neurosity: Neurosity | null;
  museRecorder: MuseRecorder | null;

  recorder: ReturnType<typeof useEEGRecorder>;

  setConnection: (
    status: boolean,
    device: DeviceType,
    payload?: Neurosity | MuseRecorder | null
  ) => void;

  disconnectDevice: () => void;
}

const DeviceContext = createContext<DeviceState | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  /* 🔒 EEG Recorder — CREATED ONCE, LEGALLY */
  const recorder = useEEGRecorder();

  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(null);

  const [neurosity, setNeurosity] = useState<Neurosity | null>(null);
  const [museRecorder, setMuseRecorder] = useState<MuseRecorder | null>(null);

  const setConnection = (
    status: boolean,
    device: DeviceType,
    payload: Neurosity | MuseRecorder | null = null
  ) => {
    setIsConnected(status);
    setSelectedDevice(device);

    if (device === "neurosity") {
      setNeurosity(payload as Neurosity);
      setMuseRecorder(null);
    }

    if (device === "muse") {
      setMuseRecorder(payload as MuseRecorder);
      setNeurosity(null);
    }
  };

  const disconnectDevice = () => {
    museRecorder?.stop?.();
    logoutNeurosity(neurosity);

    recorder.stop(); // ✅ stop EEG cleanly

    setIsConnected(false);
    setSelectedDevice(null);
    setNeurosity(null);
    setMuseRecorder(null);
  };

  return (
    <DeviceContext.Provider
      value={{
        isConnected,
        selectedDevice,
        neurosity,
        museRecorder,
        recorder,
        setConnection,
        disconnectDevice,
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

/* ===================== HOOK ===================== */

export const useDevice = () => {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used inside DeviceProvider");
  return ctx;
};
