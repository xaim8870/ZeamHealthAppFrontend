// src/services/eeg/processing/normalizeNeurosity.ts
import { CanonicalFrame } from "./types";

export function neurosityRecordToFrames(rec: any): CanonicalFrame[] {
  const sr: number = rec.samplingRate ?? 256; // Crown is 256Hz :contentReference[oaicite:6]{index=6}
  const epochStartTs: number = rec.timestamp;
  const channels: string[] = rec.channels;

  const chMajor: number[][] = rec.samples; // expected: [ch][n]
  if (!Array.isArray(chMajor) || chMajor.length !== channels.length) return [];

  const n = chMajor[0]?.length ?? 0;
  if (n === 0) return [];
  // Validate consistent lengths
  for (let c = 1; c < chMajor.length; c++) {
    if (chMajor[c]?.length !== n) return [];
  }

  const frames: CanonicalFrame[] = [];
  const dtMs = 1000 / sr;

  for (let i = 0; i < n; i++) {
    const values = chMajor.map(chArr => chArr[i]);
    frames.push({
      device: "neurosity",
      ts: epochStartTs + i * dtMs,
      samplingRate: sr,
      channels,
      values
    });
  }

  return frames;
}