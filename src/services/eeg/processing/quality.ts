import type { CanonicalFrame } from "./types";

export type QualityReport = {
  expectedDtMs: number;
  gapCount: number;
  gapMsTotal: number;
  flatlineChannels: string[];
  spikeChannels: string[];
  sqi: number; // 0..1
};

export function computeQuality(frames: CanonicalFrame[], opts?: {
  gapToleranceMult?: number;   // default 1.5
  flatVarEps?: number;         // device-specific
  spikeAbsMax?: number;        // device-specific
}): QualityReport {
  if (frames.length < 4) {
    return { expectedDtMs: 0, gapCount: 0, gapMsTotal: 0, flatlineChannels: [], spikeChannels: [], sqi: 0 };
  }

  const fs = frames[0].samplingRate;
  const expectedDtMs = 1000 / fs;
  const gapTol = (opts?.gapToleranceMult ?? 1.5) * expectedDtMs;

  // 1) Gaps
  let gapCount = 0;
  let gapMsTotal = 0;
  for (let i = 1; i < frames.length; i++) {
    const dt = frames[i].ts - frames[i - 1].ts;
    if (dt > gapTol) {
      gapCount++;
      gapMsTotal += (dt - expectedDtMs);
    }
  }

  // 2) Flatline + spikes per channel
  const ch = frames[0].channels;
  const C = ch.length;
  const flatVarEps = opts?.flatVarEps ?? 1e-3;
  const spikeAbsMax = opts?.spikeAbsMax ?? 2000; // adjust per device

  const flatlineChannels: string[] = [];
  const spikeChannels: string[] = [];

  for (let c = 0; c < C; c++) {
    // variance (Welford)
    let mean = 0, m2 = 0, n = 0;
    let maxAbs = 0;
    for (const f of frames) {
      const x = f.values[c];
      n++;
      const delta = x - mean;
      mean += delta / n;
      m2 += delta * (x - mean);
      const ax = Math.abs(x);
      if (ax > maxAbs) maxAbs = ax;
    }
    const varx = n > 1 ? m2 / (n - 1) : 0;

    if (varx < flatVarEps) flatlineChannels.push(ch[c]);
    if (maxAbs > spikeAbsMax) spikeChannels.push(ch[c]);
  }

  // 3) Muse quality flags (if available) — simple down-weight
  let museBadQuality = 0;
  if (frames[0].quality) {
    let bad = 0, total = 0;
    for (const f of frames) {
      if (!f.quality) continue;
      for (const q of f.quality) { total++; if (q <= 0) bad++; }
    }
    museBadQuality = total ? bad / total : 0;
  }

  // 4) SQI scoring (simple MVP)
  // Start at 1, subtract penalties
  let sqi = 1.0;
  sqi -= Math.min(0.5, gapMsTotal / (frames.length * expectedDtMs * 10)); // penalty for many gaps
  sqi -= flatlineChannels.length ? 0.4 : 0;
  sqi -= spikeChannels.length ? 0.3 : 0;
  sqi -= 0.5 * museBadQuality;

  sqi = Math.max(0, Math.min(1, sqi));

  return { expectedDtMs, gapCount, gapMsTotal, flatlineChannels, spikeChannels, sqi };
}