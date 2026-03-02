// src/services/eeg/processing/types.ts
export type DeviceType = "muse" | "neurosity";

export interface CanonicalFrame {
  device: DeviceType;
  ts: number;                 // epoch ms (your exported basis)
  samplingRate: number;       // Hz
  channels: string[];         // names in order
  values: number[];           // length = channels.length
  quality?: number[];         // optional per-channel quality (Muse provides)
}

export interface WindowDef {
  step: string;
  start: number;
  end: number;
}