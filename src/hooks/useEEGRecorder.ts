import { useMemo, useRef } from "react";
import { useDevice } from "@/context/DeviceContext";
import type { EEGFrame } from "@/services/eeg/adapters/EEGAdapter";

type NeurosityEEGFrame = {
  device: "neurosity";
  data: any;
  ts: number;
};

export type AnyEEGFrame = EEGFrame | NeurosityEEGFrame;

export function useEEGRecorder() {
  const { selectedDevice, museRecorder, neurosity } = useDevice();

  const bufferRef = useRef<AnyEEGFrame[]>([]);
  const unsubRef = useRef<null | (() => void)>(null);

  return useMemo(
    () => ({
      async start(onFrame?: (f: AnyEEGFrame) => void) {
        bufferRef.current = [];
        unsubRef.current?.();

        /* ============== MUSE ============== */
        if (selectedDevice === "muse") {
          if (!museRecorder) throw new Error("Muse recorder missing");

          unsubRef.current = museRecorder.onData((frame) => {
            bufferRef.current.push(frame);
            onFrame?.(frame);
          });
          return;
        }

        /* ============ NEUROSITY ============ */
        if (selectedDevice === "neurosity") {
          if (!neurosity) throw new Error("Neurosity not available");

          const sub = neurosity.brainwaves("raw").subscribe((data: any) => {
            const frame: NeurosityEEGFrame = {
              device: "neurosity",
              data,
              ts: Date.now(),
            };
            bufferRef.current.push(frame);
            onFrame?.(frame);
          });

          unsubRef.current = () => sub.unsubscribe();
          return;
        }

        throw new Error("No EEG device selected");
      },

      stop() {
        unsubRef.current?.();
        unsubRef.current = null;
      },

      getData() {
        return {
          device: selectedDevice,
          frames: bufferRef.current,
          totalFrames: bufferRef.current.length,
        };
      },
    }),
    [selectedDevice, museRecorder, neurosity]
  );
}
