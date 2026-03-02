// src/services/eeg/processing/features.ts
import { PSDResult } from "./welch";

export type BandName = "delta"|"theta"|"alpha"|"beta"|"gamma";
export const BANDS: Record<BandName, [number, number]> = {
  delta: [0.5, 4],
  theta: [4, 8],
  alpha: [8, 12],
  beta:  [13, 30],
  gamma: [30, 45],
};

export function bandPower({ freqs, psd }: PSDResult, band: [number, number]): number {
  const [f1, f2] = band;
  if (freqs.length !== psd.length) throw new Error("freqs/psd length mismatch");

  let power = 0;
  for (let i = 1; i < freqs.length; i++) {
    const fPrev = freqs[i - 1], f = freqs[i];
    if (f <= f1) continue;
    if (fPrev >= f2) break;

    // trapezoidal integration over bin
    const left = Math.max(fPrev, f1);
    const right = Math.min(f, f2);
    const width = right - left;
    if (width <= 0) continue;

    const pPrev = psd[i - 1];
    const p = psd[i];
    power += 0.5 * (pPrev + p) * width;
  }
  return power;
}

export function spectralEdgeFreq(freqs: Float32Array, psd: Float32Array, pct: number): number {
  // pct: 0.95 => SEF95
  const total = bandPower({ freqs, psd }, [freqs[0], freqs[freqs.length - 1]]);
  if (total <= 0) return NaN;

  let cum = 0;
  for (let i = 1; i < freqs.length; i++) {
    const df = freqs[i] - freqs[i - 1];
    cum += 0.5 * (psd[i - 1] + psd[i]) * df;
    if (cum / total >= pct) return freqs[i];
  }
  return freqs[freqs.length - 1];
}

export function peakAlphaFrequency(freqs: Float32Array, psd: Float32Array): number {
  let bestF = NaN;
  let bestP = -Infinity;
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (f < 8 || f > 12) continue;
    if (psd[i] > bestP) { bestP = psd[i]; bestF = f; }
  }
  return bestF;
}

export function alpha3dBBandwidth(freqs: Float32Array, psd: Float32Array): number {
  const paf = peakAlphaFrequency(freqs, psd);
  if (!Number.isFinite(paf)) return NaN;

  // find peak bin index
  let peakIdx = -1;
  for (let i = 0; i < freqs.length; i++) {
    if (freqs[i] === paf) { peakIdx = i; break; }
  }
  if (peakIdx < 0) return NaN;

  const halfPower = psd[peakIdx] * 0.5;

  // left
  let left = paf;
  for (let i = peakIdx; i >= 0; i--) {
    if (freqs[i] < 8) break;
    if (psd[i] <= halfPower) { left = freqs[i]; break; }
  }

  // right
  let right = paf;
  for (let i = peakIdx; i < freqs.length; i++) {
    if (freqs[i] > 12) break;
    if (psd[i] <= halfPower) { right = freqs[i]; break; }
  }

  return right - left;
}