import { useRef, useState } from "react";
import type { Neurosity } from "@neurosity/sdk";

import { useDevice } from "@/context/DeviceContext";
import { MuseRecorder } from "@/services/eeg/MuseRecorder";
import { EEGFrame } from "@/types/eeg";

/* ================= TYPES ================= */

type Recorder = {
  start: () => Promise<void>;
  stop: () => void;
  onData: (cb: (frame: EEGFrame) => void) => void;
};

/* ================= HOOK ================= */

export const useEEGRecorder = (neurosity?: Neurosity | null) => {
  const { selectedDevice } = useDevice();

  const [recording, setRecording] = useState(false);
  const [samples, setSamples] = useState<EEGFrame[]>([]);

  const museRecorderRef = useRef<MuseRecorder | null>(null);
  const neurositySubRef = useRef<any>(null);

  const sessionRef = useRef({
    device: "" as "neurosity" | "muse" | "",
    samplingRate: 256,
    startTime: 0,
    endTime: 0,
  });

  /* ================= DEVICE SELECTION ================= */

  const getRecorder = (): Recorder => {
    if (selectedDevice === "neurosity") {
      if (!neurosity) {
        throw new Error(
          "Neurosity selected but instance was not provided"
        );
      }

      return {
        start: async () => {
          neurositySubRef.current = neurosity
            .brainwaves("raw")
            .subscribe((pkt: any) => {
              setSamples((prev) => [
                ...prev,
                {
                  device: "neurosity",
                  timestamp: Date.now(),
                  samplingRate: 250,
                  channels: pkt.data,
                },
              ]);
            });
        },

        stop: () => {
          neurositySubRef.current?.unsubscribe();
          neurositySubRef.current = null;
        },

        onData: () => {},
      };
    }

    if (selectedDevice === "s-athena") {
      if (!museRecorderRef.current) {
        museRecorderRef.current = new MuseRecorder();
      }

      return museRecorderRef.current;
    }

    throw new Error("No EEG device selected");
  };

  /* ================= CONTROL ================= */

  const start = async () => {
    setSamples([]);
    setRecording(true);

    sessionRef.current = {
      device: selectedDevice === "s-athena" ? "muse" : "neurosity",
      samplingRate: selectedDevice === "s-athena" ? 256 : 250,
      startTime: Date.now(),
      endTime: 0,
    };

    const recorder = getRecorder();

    recorder.onData((frame) => {
      setSamples((prev) => [...prev, frame]);
    });

    await recorder.start();
  };

  const stop = () => {
    try {
      const recorder = getRecorder();
      recorder.stop();
    } finally {
      sessionRef.current.endTime = Date.now();
      setRecording(false);
    }
  };

  /* ================= DATA ================= */

  const getData = () => ({
    ...sessionRef.current,
    samples,
  });

  const download = () => {
    const blob = new Blob([JSON.stringify(getData(), null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `EEG_${sessionRef.current.device}_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return {
    recording,
    start,
    stop,
    getData,
    download,
  };
};
