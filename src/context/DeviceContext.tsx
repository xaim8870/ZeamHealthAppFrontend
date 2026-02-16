import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import type { Neurosity } from "@neurosity/sdk";
import { logoutNeurosity } from "../utils/NeurosityClient";
import { MuseRecorder } from "@/services/eeg/MuseRecorder";
import { useEEGRecorder } from "@/hooks/useEEGRecorder";

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

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const recorder = useEEGRecorder();

  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(null);

  // ✅ keep devices in refs (stable across re-renders)
  const neurosityRef = useRef<Neurosity | null>(null);
  const museRecorderRef = useRef<MuseRecorder | null>(null);

  // ✅ expose current values for UI
  const neurosity = neurosityRef.current;
  const museRecorder = museRecorderRef.current;

  const setConnection = (
    status: boolean,
    device: DeviceType,
    payload: Neurosity | MuseRecorder | null = null
  ) => {
    setIsConnected(status);
    setSelectedDevice(device);

    if (device === "neurosity") {
      neurosityRef.current = payload as Neurosity;
      museRecorderRef.current = null;
    }

    if (device === "muse") {
      museRecorderRef.current = payload as MuseRecorder;
      neurosityRef.current = null;
    }

    if (device === null) {
      neurosityRef.current = null;
      museRecorderRef.current = null;
    }
  };

  const disconnectDevice = () => {
    // ✅ disconnect muse safely
    museRecorderRef.current?.stop?.();
    museRecorderRef.current = null;

    // ✅ disconnect neurosity safely
    if (neurosityRef.current) {
      logoutNeurosity(neurosityRef.current);
      neurosityRef.current = null;
    }

    recorder.stop();

    setIsConnected(false);
    setSelectedDevice(null);
  };

  // ✅ memoise context value to avoid needless renders
  const value = useMemo(
    () => ({
      isConnected,
      selectedDevice,
      neurosity,
      museRecorder,
      recorder,
      setConnection,
      disconnectDevice,
    }),
    [isConnected, selectedDevice, neurosity, museRecorder, recorder]
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
};

export const useDevice = () => {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used inside DeviceProvider");
  return ctx;
};
