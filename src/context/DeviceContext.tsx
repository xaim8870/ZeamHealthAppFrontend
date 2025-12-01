// src/context/DeviceContext.tsx
import React, { createContext, useContext, useState } from "react";
import type { Neurosity } from "@neurosity/sdk";
import { logoutNeurosity } from "../utils/NeurosityClient";

type DeviceType = "neurosity" | "muse" | "s-athena" | null;

interface DeviceState {
  isConnected: boolean;
  selectedDevice: DeviceType;
  neurosity: Neurosity | null;
  setConnection: (
    status: boolean,
    device: DeviceType,
    neurosityInstance?: Neurosity | null
  ) => void;
  disconnectDevice: () => void;
}

const DeviceContext = createContext<DeviceState | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>(null);
  const [neurosity, setNeurosity] = useState<Neurosity | null>(null);

  const setConnection = (
    status: boolean,
    device: DeviceType,
    neurosityInstance: Neurosity | null = null
  ) => {
    setIsConnected(status);
    setSelectedDevice(device);
    setNeurosity(neurosityInstance ?? null);
  };

  const disconnectDevice = () => {
    logoutNeurosity();
    setIsConnected(false);
    setSelectedDevice(null);
    setNeurosity(null);
  };

  return (
    <DeviceContext.Provider
      value={{ isConnected, selectedDevice, neurosity, setConnection, disconnectDevice }}
    >
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const ctx = useContext(DeviceContext);
  if (!ctx) throw new Error("useDevice must be used inside DeviceProvider");
  return ctx;
};
