// src/services/eeg/processing/psdUtils.ts

export type BandName = "delta" | "theta" | "alpha" | "beta" | "gamma";

export type BandsDef = Record<BandName, [number, number]>;

export const DEFAULT_BANDS: BandsDef = {
  delta: [0.5, 4],
  theta: [4, 8],
  alpha: [8, 12],
  beta:  [13, 30],
  gamma: [30, 45], // clamp gamma to 45 to avoid EMG-heavy region
};

export function clampIndexRange(
  freqs: Float32Array,
  fmin: number,
  fmax: number
): { i0: number; i1: number } {
  // inclusive indices [i0..i1]
  let i0 = 0;
  while (i0 < freqs.length && freqs[i0] < fmin) i0++;

  let i1 = freqs.length - 1;
  while (i1 >= 0 && freqs[i1] > fmax) i1--;

  if (i0 >= freqs.length || i1 < 0 || i0 > i1) return { i0: 1, i1: 0 }; // empty
  return { i0, i1 };
}

export function bandPowerAbs(
  freqs: Float32Array,
  psd: Float32Array,
  fLo: number,
  fHi: number,
  fmin: number,
  fmax: number
): number {
  // integrate PSD over [fLo,fHi] but also enforce global [fmin,fmax]
  const lo = Math.max(fLo, fmin);
  const hi = Math.min(fHi, fmax);
  if (hi <= lo) return 0;

  const { i0, i1 } = clampIndexRange(freqs, lo, hi);
  if (i0 > i1) return 0;

  // PSD units ~ power/Hz, integrate with df
  // df is constant in your Welch: freqs[i] = i*fs/nfft
  const df = freqs.length > 1 ? (freqs[1] - freqs[0]) : 0;

  let sum = 0;
  for (let i = i0; i <= i1; i++) sum += psd[i];
  return sum * df;
}

export function totalPowerAbs(
  freqs: Float32Array,
  psd: Float32Array,
  fmin: number,
  fmax: number
): number {
  const { i0, i1 } = clampIndexRange(freqs, fmin, fmax);
  if (i0 > i1) return 0;

  const df = freqs.length > 1 ? (freqs[1] - freqs[0]) : 0;

  let sum = 0;
  for (let i = i0; i <= i1; i++) sum += psd[i];
  return sum * df;
}

export function spectralEdgeFrequency(
  freqs: Float32Array,
  psd: Float32Array,
  fmin: number,
  fmax: number,
  fraction: number // 0..1 e.g. 0.95
): number {
  const { i0, i1 } = clampIndexRange(freqs, fmin, fmax);
  if (i0 > i1) return NaN;

  const df = freqs.length > 1 ? (freqs[1] - freqs[0]) : 0;

  // total power
  let total = 0;
  for (let i = i0; i <= i1; i++) total += psd[i];
  total *= df;
  if (total <= 0) return NaN;

  const target = total * fraction;

  let cum = 0;
  for (let i = i0; i <= i1; i++) {
    cum += psd[i] * df;
    if (cum >= target) return freqs[i];
  }
  return freqs[i1];
}

export function peakFrequency(
  freqs: Float32Array,
  psd: Float32Array,
  fLo: number,
  fHi: number,
  fmin: number,
  fmax: number
): number {
  const lo = Math.max(fLo, fmin);
  const hi = Math.min(fHi, fmax);
  const { i0, i1 } = clampIndexRange(freqs, lo, hi);
  if (i0 > i1) return NaN;

  let bestI = i0;
  let best = psd[i0];

  for (let i = i0 + 1; i <= i1; i++) {
    if (psd[i] > best) {
      best = psd[i];
      bestI = i;
    }
  }
  return freqs[bestI];
}