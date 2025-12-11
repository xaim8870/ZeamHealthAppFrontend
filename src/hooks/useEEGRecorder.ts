// src/hooks/useEEGRecorder.ts
import { useRef, useState } from "react";
import type { Neurosity } from "@neurosity/sdk";

export const useEEGRecorder = (neurosity: Neurosity | null) => {
  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState<any[]>([]);

  const sessionRef = useRef({
    device: "",
    channels: [] as string[],
    samplingRate: 256,
    startTime: 0,
    endTime: 0,
  });

  const subscriptionRef = useRef<any>(null);

  const start = (options: any) => {
    if (!neurosity) {
      console.warn("❌ No neurosity instance available.");
      return;
    }

    sessionRef.current = {
      device: options.device,
      channels: options.channels,
      samplingRate: options.samplingRate,
      startTime: Date.now(),
      endTime: 0,
    };

    setSamples([]);
    setRecording(true);

    subscriptionRef.current = neurosity.brainwaves("raw").subscribe((pkt) => {
      setSamples((prev) => [...prev, pkt]); // <-- REAL EEG STORED HERE
    });
  };

  const stop = () => {
    if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    subscriptionRef.current = null;

    sessionRef.current.endTime = Date.now();
    setRecording(false);
  };

  const getData = () => ({
    ...sessionRef.current,
    samples,
  });

  const download = () => {
    const blob = new Blob([JSON.stringify(getData())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EEG_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { recording, start, stop, getData, download };
};
