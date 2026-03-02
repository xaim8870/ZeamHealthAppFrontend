// src/services/eeg/processing/windowing.ts
import { CanonicalFrame, WindowDef } from "./types";

export interface WindowData {
  samplingRate: number;
  channels: string[];
  data: Float32Array[];     // channel-major
  quality?: Float32Array[]; // optional, if you want Muse quality aligned
}

export function collectWindow(frames: CanonicalFrame[], win: WindowDef): WindowData | null {
  const slice = frames.filter(f => f.ts >= win.start && f.ts < win.end);
  if (slice.length === 0) return null;

  // Assume stable channels + samplingRate within a window (true in your use case)
  const { samplingRate, channels } = slice[0];
  const chCount = channels.length;

  const arrays: number[][] = Array.from({ length: chCount }, () => []);
  const qArrays: number[][] | null = slice[0].quality ? Array.from({ length: chCount }, () => []) : null;

  for (const f of slice) {
    if (f.channels.length !== chCount) continue;
    for (let c = 0; c < chCount; c++) arrays[c].push(f.values[c]);
    if (qArrays && f.quality?.length === chCount) {
      for (let c = 0; c < chCount; c++) qArrays[c].push(f.quality[c]);
    }
  }

  return {
    samplingRate,
    channels,
    data: arrays.map(a => Float32Array.from(a)),
    quality: qArrays ? qArrays.map(a => Float32Array.from(a)) : undefined
  };
}