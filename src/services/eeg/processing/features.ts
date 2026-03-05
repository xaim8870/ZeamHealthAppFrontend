// src/services/eeg/processing/features.ts

export type Band = [number, number];

export const BANDS: Record<string, Band> = {
  delta: [0.5, 4],
  theta: [4, 8],
  alpha: [8, 12],
  beta: [13, 30],
  gamma: [30, 45], // keep gamma capped at 45 for EEG metrics
};

export interface PSDLike {
  freqs: Float32Array; // increasing 0..fs/2
  psd: Float32Array;   // same length
}

const DEFAULT_FMIN = 0.5;
const DEFAULT_FMAX = 45;

function clampBand(band: Band, fmin: number, fmax: number): Band {
  const lo = Math.max(band[0], fmin);
  const hi = Math.min(band[1], fmax);
  return [lo, hi];
}

function findIndexRange(freqs: Float32Array, lo: number, hi: number): { i0: number; i1: number } {
  // inclusive [i0..i1]
  let i0 = 0;
  while (i0 < freqs.length && freqs[i0] < lo) i0++;

  let i1 = freqs.length - 1;
  while (i1 >= 0 && freqs[i1] > hi) i1--;

  if (i0 >= freqs.length || i1 < 0 || i0 > i1) return { i0: 1, i1: 0 }; // empty
  return { i0, i1 };
}

function dfFromFreqs(freqs: Float32Array): number {
  // Welch output has constant df; use first step if possible
  if (freqs.length < 2) return 0;
  const df = freqs[1] - freqs[0];
  return df > 0 ? df : 0;
}

/**
 * Integrate PSD over a band (absolute power).
 * IMPORTANT: this integrates only within [fmin..fmax].
 */
export function bandPower(
  psdLike: PSDLike,
  band: Band,
  fmin = DEFAULT_FMIN,
  fmax = DEFAULT_FMAX
): number {
  const { freqs, psd } = psdLike;
  if (!freqs?.length || freqs.length !== psd?.length) return NaN;

  const df = dfFromFreqs(freqs);
  if (df <= 0) return NaN;

  const [lo, hi] = clampBand(band, fmin, fmax);
  if (hi <= lo) return 0;

  const { i0, i1 } = findIndexRange(freqs, lo, hi);
  if (i0 > i1) return 0;

  let sum = 0;
  for (let i = i0; i <= i1; i++) sum += psd[i];
  return sum * df;
}

/**
 * Spectral Edge Frequency (SEF):
 * Returns frequency where `fraction` (e.g. 0.95) of total power is below it,
 * computed ONLY within [fmin..fmax].
 */
export function spectralEdgeFreq(
  freqs: Float32Array,
  psd: Float32Array,
  fraction: number,
  fmin = DEFAULT_FMIN,
  fmax = DEFAULT_FMAX
): number {
  if (!freqs?.length || freqs.length !== psd?.length) return NaN;
  if (!(fraction > 0 && fraction < 1)) return NaN;

  const df = dfFromFreqs(freqs);
  if (df <= 0) return NaN;

  const { i0, i1 } = findIndexRange(freqs, fmin, fmax);
  if (i0 > i1) return NaN;

  // total power in [fmin..fmax]
  let total = 0;
  for (let i = i0; i <= i1; i++) total += psd[i];
  total *= df;

  // ✅ Good practice: if no power, SEF not defined
  if (total <= 0 || !Number.isFinite(total)) return NaN;

  const target = total * fraction;

  let cum = 0;
  for (let i = i0; i <= i1; i++) {
    cum += psd[i] * df;
    if (cum >= target) return freqs[i];
  }

  // numerical fallback
  return freqs[i1];
}

/**
 * Peak Alpha Frequency (PAF): frequency with max PSD in alpha band [8..12],
 * but still clamped to [fmin..fmax].
 */
export function peakAlphaFrequency(
  freqs: Float32Array,
  psd: Float32Array,
  fmin = DEFAULT_FMIN,
  fmax = DEFAULT_FMAX
): number {
  if (!freqs?.length || freqs.length !== psd?.length) return NaN;

  const [lo, hi] = clampBand(BANDS.alpha, fmin, fmax);
  if (hi <= lo) return NaN;

  const { i0, i1 } = findIndexRange(freqs, lo, hi);
  if (i0 > i1) return NaN;

  let bestI = i0;
  let best = psd[i0];

  for (let i = i0 + 1; i <= i1; i++) {
    if (psd[i] > best) {
      best = psd[i];
      bestI = i;
    }
  }

  // If peak is non-finite or <=0, alpha peak isn't meaningful
  if (!Number.isFinite(best) || best <= 0) return NaN;
  return freqs[bestI];
}

/**
 * Alpha 3 dB bandwidth:
 * Find bandwidth around alpha peak where PSD >= peak/2 (≈ -3 dB).
 * Returns 0 if peak exists but boundaries can't be found robustly.
 * Returns NaN if no meaningful alpha peak exists.
 */
export function alpha3dBBandwidth(
  freqs: Float32Array,
  psd: Float32Array,
  fmin = DEFAULT_FMIN,
  fmax = DEFAULT_FMAX
): number {
  if (!freqs?.length || freqs.length !== psd?.length) return NaN;

  const [lo, hi] = clampBand(BANDS.alpha, fmin, fmax);
  if (hi <= lo) return NaN;

  const { i0, i1 } = findIndexRange(freqs, lo, hi);
  if (i0 > i1) return NaN;

  // find peak within alpha band
  let peakI = i0;
  let peak = psd[i0];
  for (let i = i0 + 1; i <= i1; i++) {
    if (psd[i] > peak) {
      peak = psd[i];
      peakI = i;
    }
  }

  if (!Number.isFinite(peak) || peak <= 0) return NaN;

  const halfPower = peak / 2;

  // search left boundary where PSD drops below halfPower
  let left = peakI;
  while (left > i0 && psd[left] >= halfPower) left--;

  // search right boundary
  let right = peakI;
  while (right < i1 && psd[right] >= halfPower) right++;

  // If boundaries never moved, bandwidth is not well-defined (very sharp/noisy peak)
  if (left === peakI && right === peakI) return 0;

  // Convert indices to frequencies safely
  const fLeft = freqs[Math.max(i0, left)];
  const fRight = freqs[Math.min(i1, right)];

  const bw = fRight - fLeft;
  return Number.isFinite(bw) && bw >= 0 ? bw : 0;
}