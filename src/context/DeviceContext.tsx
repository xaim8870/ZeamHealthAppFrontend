import React, { createContext, useContext, useState, ReactNode } from "react";

interface DeviceContextType {
  isConnected: boolean;
  selectedDevice: string | null;
  setConnection: (connected: boolean, device?: string | null) => void;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

export const DeviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const setConnection = (connected: boolean, device: string | null = null) => {
    setIsConnected(connected);
    setSelectedDevice(device);
  };

  return (
    <DeviceContext.Provider value={{ isConnected, selectedDevice, setConnection }}>
      {children}
    </DeviceContext.Provider>
  );
};

export const useDevice = () => {
  const context = useContext(DeviceContext);
  if (!context) throw new Error("useDevice must be used within DeviceProvider");
  return context;
};
