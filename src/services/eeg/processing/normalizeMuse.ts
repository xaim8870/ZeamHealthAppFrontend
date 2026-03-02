// src/services/eeg/processing/normalizeMuse.ts
import { CanonicalFrame } from "./types";

export function museRecordToFrames(rec: any): CanonicalFrame[] {
  const sr: number = rec.samplingRate ?? 256;
  const ts: number = rec.timestamp; // already per-sample-ish
  const channels: string[] = rec.channels;

  // Your export uses samples: [[v1,v2,v3,v4]] = one sample row
  const row = rec.samples?.[0];
  if (!row || row.length !== channels.length) return [];

  return [{
    device: "muse",
    ts,
    samplingRate: sr,
    channels,
    values: row,
    quality: rec.quality
  }];
}