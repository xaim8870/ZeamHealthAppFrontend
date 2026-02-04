// useEEGRecorder.ts
import { useMemo, useRef } from "react";
import type { EEGFrame } from "@/services/eeg/adapters/EEGAdapter";
import type { Neurosity } from "@neurosity/sdk";
import type { MuseRecorder } from "@/services/eeg/MuseRecorder";

/* ===================== TYPES ===================== */

type DeviceName = "muse" | "neurosity";

export type EEGEvent = {
  name: string;
  timestamp: number;
  step?: string;
  extra?: Record<string, any>;
};

export type EEGRecord = {
  device: DeviceName;
  timestamp: number; // epoch ms (normalized)
  channels: string[];
  samples: number[][]; // shape depends on device
  samplingRate?: number;
  raw?: any;
};

export type StepWindow = {
  step: string;
  start: number; // epoch ms
  end?: number;  // epoch ms
};

type EEGSession = {
  meta: {
    device: DeviceName | null;
    startedAt: string;
    endedAt?: string;
    appTimestampBasis: string;
    postEEG?: Record<string, any>;
  };
  events: EEGEvent[];
  windows: StepWindow[];
  records: EEGRecord[];
  totalRawFrames: number;
  totalRecords: number;
  totalTrimmedRecords: number;
};

/* ===================== HELPERS ===================== */

const isNumber = (n: any): n is number =>
  typeof n === "number" && Number.isFinite(n);

function resolveNeurosityTimestamp(pkt: any, startEpoch: number) {
  const ts = pkt?.timestamp ?? pkt?.ts ?? pkt?.info?.timestamp;
  if (!isNumber(ts)) return Date.now();

  // Neurosity can be absolute epoch OR relative. Normalize to epoch ms.
  return ts > 1e12 ? ts : startEpoch + ts;
}

function inAnyWindow(ts: number, windows: StepWindow[]) {
  for (const w of windows) {
    const end = w.end ?? Number.POSITIVE_INFINITY;
    if (ts >= w.start && ts <= end) return true;
  }
  return false;
}

/* ===================== MAIN HOOK ===================== */

export function useEEGRecorder() {
  const rawFramesRef = useRef<any[]>([]);
  const recordsRef = useRef<EEGRecord[]>([]);
  const eventsRef = useRef<EEGEvent[]>([]);
  const windowsRef = useRef<StepWindow[]>([]);
  const unsubRef = useRef<null | (() => void)>(null);

  const startedAtEpochRef = useRef(0);
  const startedAtISORef = useRef("");
  const currentStepRef = useRef<string | undefined>(undefined);
  const postEEGRef = useRef<Record<string, any> | undefined>(undefined);

  // only one active window at a time (your flow is sequential)
  const activeWindowRef = useRef<StepWindow | null>(null);

  return useMemo(
    () => ({
      async start(opts: {
        device: DeviceName;
        neurosity?: Neurosity | null;
        museRecorder?: MuseRecorder | null;
        onFrame?: (f: any) => void;
      }) {
        const { device, neurosity, museRecorder, onFrame } = opts;

        rawFramesRef.current = [];
        recordsRef.current = [];
        eventsRef.current = [];
        windowsRef.current = [];
        postEEGRef.current = undefined;
        activeWindowRef.current = null;

        startedAtEpochRef.current = Date.now();
        startedAtISORef.current = new Date(
          startedAtEpochRef.current
        ).toISOString();

        unsubRef.current?.();

        if (device === "muse") {
          if (!museRecorder) throw new Error("Muse recorder missing");

          await museRecorder.start();
          unsubRef.current = museRecorder.onData((frame: EEGFrame) => {
            rawFramesRef.current.push(frame);

            recordsRef.current.push({
              device: "muse",
              timestamp: Date.now(),
              channels: [String((frame as any).channel)],
              samples: [(frame as any).values ?? []],
            });

            onFrame?.(frame);
          });
          return;
        }

        if (device === "neurosity") {
          if (!neurosity) throw new Error("Neurosity missing");

          const sub = neurosity.brainwaves("raw").subscribe((pkt: any) => {
            rawFramesRef.current.push(pkt);

            recordsRef.current.push({
              device: "neurosity",
              timestamp: resolveNeurosityTimestamp(
                pkt,
                startedAtEpochRef.current
              ),
              channels: pkt?.info?.channelNames ?? [],
              samples: pkt?.data ?? [],
              samplingRate: pkt?.info?.samplingRate,
              raw: pkt,
            });

            onFrame?.(pkt);
          });

          unsubRef.current = () => sub.unsubscribe();
          return;
        }
      },

      /* ========= STEP + WINDOWS ========= */

      setStep(step: string) {
        currentStepRef.current = step;
      },

      openWindow(step: string) {
        // close existing window (safety)
        if (activeWindowRef.current && !activeWindowRef.current.end) {
          activeWindowRef.current.end = Date.now();
        }

        const w: StepWindow = { step, start: Date.now() };
        windowsRef.current.push(w);
        activeWindowRef.current = w;
      },

      closeWindow() {
        if (activeWindowRef.current && !activeWindowRef.current.end) {
          activeWindowRef.current.end = Date.now();
        }
        activeWindowRef.current = null;
      },

      setPostEEG(data: Record<string, any>) {
        postEEGRef.current = data;
      },

      /* ========= EVENTS ========= */

      markEvent(name: string, extra?: any) {
        eventsRef.current.push({
          name,
          timestamp: Date.now(),
          step: currentStepRef.current,
          extra,
        });
      },

      stop() {
        // close any open window so trimming works cleanly
        if (activeWindowRef.current && !activeWindowRef.current.end) {
          activeWindowRef.current.end = Date.now();
        }
        activeWindowRef.current = null;

        unsubRef.current?.();
        unsubRef.current = null;
      },

      getData(opts?: { trimmed?: boolean }): EEGSession {
        const trimmed = !!opts?.trimmed;

        const allRecords = recordsRef.current;
        const windows = windowsRef.current;

        const kept = trimmed
          ? allRecords.filter((r) => inAnyWindow(r.timestamp, windows))
          : allRecords;

        return {
          meta: {
            device: allRecords[0]?.device ?? null,
            startedAt: startedAtISORef.current,
            endedAt: new Date().toISOString(),
            appTimestampBasis: "epoch_ms_normalized",
            postEEG: postEEGRef.current,
          },
          events: eventsRef.current,
          windows,
          records: kept,
          totalRawFrames: rawFramesRef.current.length,
          totalRecords: allRecords.length,
          totalTrimmedRecords: kept.length,
        };
      },
    }),
    []
  );
}
