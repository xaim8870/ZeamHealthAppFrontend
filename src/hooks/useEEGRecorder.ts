// useEEGRecorder.ts
import { useMemo, useRef } from "react";
import { useDevice } from "@/context/DeviceContext";
import type { EEGFrame } from "@/services/eeg/adapters/EEGAdapter";

/**
 * -----------------------------
 * ✅ Canonical (readable) schema
 * -----------------------------
 * We will store EEG in a consistent structure for BOTH Muse and Neurosity.
 *
 * - `records[]` are the EEG chunks (each chunk can contain many samples)
 * - `events[]` are markers like "eyes_closed_start", "alpha_resting_start"
 * - `meta` helps analysis later (device, start time, etc.)
 */

type DeviceName = "muse" | "neurosity";

export type EEGEvent = {
  name: string;
  timestamp: number; // ms since epoch
  step?: string;
  extra?: Record<string, any>;
};

export type EEGRecord = {
  device: DeviceName;
  timestamp: number; // acquisition time (best effort)
  /**
   * channels: channel names for this record
   * samples:  2D array [channelIndex][sampleIndex]
   *
   * Example:
   * channels = ["TP9","AF7","AF8","TP10"]
   * samples  = [
   *   [..many samples..], // TP9
   *   [..many samples..], // AF7
   *   ...
   * ]
   */
  channels: string[];
  samples: number[][];
  samplingRate?: number;
  /**
   * Keep a light copy of raw packet if structure is weird.
   * (helps debugging without losing info)
   */
  raw?: any;
};

/**
 * Existing raw frame type you already used (kept for backward compatibility).
 * Your UI/debugger can still read `frame.data` and `frame.ts`.
 */
type NeurosityEEGFrame = {
  device: "neurosity";
  data: any;
  ts: number;
};

export type AnyEEGFrame = EEGFrame | NeurosityEEGFrame;

type EEGSession = {
  meta: {
    device: DeviceName | null;
    startedAt: string; // ISO
    endedAt?: string; // ISO
    appTimestampBasis: "device_or_packet_ts_if_available_else_client";
  };
  events: EEGEvent[];
  records: EEGRecord[];
  totalRawFrames: number;
  totalRecords: number;
};

/* ---------------------------------
 * Helpers: normalize different shapes
 * --------------------------------- */

function isNumber(n: any): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function pickTimestampFromNeurosityPacket(pkt: any): number {
  // Neurosity packets *often* contain some time field; best effort:
  const candidates = [
    pkt?.timestamp, // common
    pkt?.ts,
    pkt?.time,
    pkt?.info?.timestamp,
    pkt?.info?.ts,
    pkt?.data?.timestamp,
  ].filter(isNumber);

  return candidates.length ? candidates[0] : Date.now();
}

function normalizeMuseFrameToRecord(frame: EEGFrame): EEGRecord {
  // Your Muse adapter appears to emit per-channel frames like:
  // { device:"muse", channel:"TP9", values:[...many samples...], ...maybe ts }
  const channelName = (frame as any).channel ?? "unknown";
  const values: number[] = Array.isArray((frame as any).values)
    ? (frame as any).values
    : [];

  const tsCandidate = (frame as any).ts ?? (frame as any).timestamp;
  const timestamp = isNumber(tsCandidate) ? tsCandidate : Date.now();

  // samplingRate might exist on frame; keep if found
  const sr = (frame as any).samplingRate;
  const samplingRate = isNumber(sr) ? sr : undefined;

  return {
    device: "muse",
    timestamp,
    channels: [String(channelName)],
    samples: [values.map((v) => (typeof v === "number" ? v : Number(v)))],
    samplingRate,
  };
}

function normalizeNeurosityPacketToRecord(pkt: any): EEGRecord {
  const timestamp = pickTimestampFromNeurosityPacket(pkt);

  /**
   * Neurosity "raw brainwaves" packet shapes can vary by SDK version.
   * We try several known patterns:
   * - channels list in pkt.info?.channelNames or pkt.channelNames
   * - samples in pkt.data or pkt.samples or pkt.eeg
   *
   * Goal: produce:
   *  channels: string[]
   *  samples:  number[][]
   */
  const channels: string[] =
    pkt?.info?.channelNames ??
    pkt?.channelNames ??
    pkt?.info?.channels ??
    pkt?.channels ??
    pkt?.electrodes ??
    [];

  // If channels not found, keep empty array (still store raw).
  const channelList = Array.isArray(channels) ? channels.map(String) : [];

  const srCandidate =
    pkt?.info?.samplingRate ?? pkt?.samplingRate ?? pkt?.info?.sr ?? pkt?.sr;
  const samplingRate = isNumber(srCandidate) ? srCandidate : undefined;

  // Samples: try common locations
  const possibleSamples =
    pkt?.data ?? pkt?.samples ?? pkt?.eeg ?? pkt?.raw ?? pkt?.values;

  let samples: number[][] = [];

  // Many SDKs return 2D [channelIndex][sampleIndex]
  if (
    Array.isArray(possibleSamples) &&
    possibleSamples.length > 0 &&
    Array.isArray(possibleSamples[0])
  ) {
    samples = possibleSamples.map((row: any[]) =>
      row.map((v) => (typeof v === "number" ? v : Number(v)))
    );
  }
  // Some shapes return 1D samples for a single channel (rare)
  else if (Array.isArray(possibleSamples) && possibleSamples.length > 0) {
    samples = [
      possibleSamples.map((v: any) => (typeof v === "number" ? v : Number(v))),
    ];
  } else {
    samples = [];
  }

  return {
    device: "neurosity",
    timestamp,
    channels: channelList,
    samples,
    samplingRate,
    raw: pkt,
  };
}

export function useEEGRecorder() {
  const { selectedDevice, museRecorder, neurosity } = useDevice();

  // Keep raw frames (so existing debug code won’t break)
  const rawFramesRef = useRef<AnyEEGFrame[]>([]);

  // ✅ New: canonical records for analysis + clean JSON
  const recordsRef = useRef<EEGRecord[]>([]);

  // ✅ New: events/markers
  const eventsRef = useRef<EEGEvent[]>([]);

  const unsubRef = useRef<null | (() => void)>(null);

  const startedAtISORef = useRef<string>(new Date().toISOString());

  return useMemo(
    () => ({
      /**
       * Start EEG capture once per session.
       * `onFrame` is called with the RAW frame (Muse frame or Neurosity raw wrapper)
       * to keep your current UI logs working.
       */
      async start(onFrame?: (f: AnyEEGFrame) => void) {
        rawFramesRef.current = [];
        recordsRef.current = [];
        eventsRef.current = [];

        startedAtISORef.current = new Date().toISOString();

        unsubRef.current?.();

        /* ============== MUSE ============== */
        if (selectedDevice === "muse") {
          if (!museRecorder) throw new Error("Muse recorder missing");

          unsubRef.current = museRecorder.onData((frame) => {
            // 1) store raw
            rawFramesRef.current.push(frame);

            // 2) store normalized record
            try {
              const rec = normalizeMuseFrameToRecord(frame);
              recordsRef.current.push(rec);
            } catch (e) {
              // If something weird happens, still keep raw frame
              console.warn("[Muse] normalize error:", e);
            }

            // 3) keep backward-compatible callback
            onFrame?.(frame);
          });

          return;
        }

        /* ============ NEUROSITY ============ */
        if (selectedDevice === "neurosity") {
          if (!neurosity) throw new Error("Neurosity not available");

          const sub = neurosity.brainwaves("raw").subscribe((pkt: any) => {
            const rawFrame: NeurosityEEGFrame = {
              device: "neurosity",
              data: pkt,
              ts: Date.now(), // client-side capture time (still useful)
            };

            // 1) store raw
            rawFramesRef.current.push(rawFrame);

            // 2) store normalized record (prefer packet/device time if available)
            try {
              const rec = normalizeNeurosityPacketToRecord(pkt);
              recordsRef.current.push(rec);
            } catch (e) {
              console.warn("[Neurosity] normalize error:", e);
              // Still keep something analyzable:
              recordsRef.current.push({
                device: "neurosity",
                timestamp: Date.now(),
                channels: [],
                samples: [],
                raw: pkt,
              });
            }

            // 3) keep backward-compatible callback
            onFrame?.(rawFrame);
          });

          unsubRef.current = () => sub.unsubscribe();
          return;
        }

        throw new Error("No EEG device selected");
      },

      /**
       * Add an event marker (very important for analysis).
       * Example:
       * recorder.markEvent("eyes_closed_start", { step: "eyes" })
       */
      markEvent(name: string, opts?: { step?: string; extra?: Record<string, any> }) {
        eventsRef.current.push({
          name,
          timestamp: Date.now(),
          step: opts?.step,
          extra: opts?.extra,
        });
      },

      stop() {
        unsubRef.current?.();
        unsubRef.current = null;
      },

      /**
       * ✅ New: returns a clean, readable, analyzable session.
       * This is what you should download as JSON.
       */
      getData(): EEGSession {
        return {
          meta: {
            device: selectedDevice,
            startedAt: startedAtISORef.current,
            endedAt: new Date().toISOString(),
            appTimestampBasis: "device_or_packet_ts_if_available_else_client",
          },
          events: eventsRef.current,
          records: recordsRef.current,
          totalRawFrames: rawFramesRef.current.length,
          totalRecords: recordsRef.current.length,
        };
      },

      /**
       * Optional: if you ever want the raw frames for debugging.
       */
      getRawFrames() {
        return rawFramesRef.current;
      },
    }),
    [selectedDevice, museRecorder, neurosity]
  );
}
