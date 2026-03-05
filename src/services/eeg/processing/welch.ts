// src/services/eeg/processing/welch.ts
import FFT from "fft.js";

function hann(n: number): Float32Array {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  }
  return w;
}

export interface WelchOptions {
  segmentSeconds?: number; // default 2s
  overlap?: number;        // default 0.5
}

export interface PSDResult {
  freqs: Float32Array;     // 0..fs/2
  psd: Float32Array;       // same length
}

function nextPow2(n: number): number {
  return 1 << Math.ceil(Math.log2(n));
}

export function welchPSD(
  x: Float32Array,
  fs: number,
  opts: WelchOptions = {}
): PSDResult {
  const segmentSeconds = opts.segmentSeconds ?? 2;
  const overlap = opts.overlap ?? 0.5;

  if (x.length < fs) {
    throw new Error("Signal too short for PSD");
  }

  // -------- 1) Remove DC (mean subtraction) --------
  let mean = 0;
  for (let i = 0; i < x.length; i++) mean += x[i];
  mean /= x.length;

  const xCentered = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    xCentered[i] = x[i] - mean;
  }

  // -------- 2) Segment size --------
  const nperseg = Math.round(segmentSeconds * fs);
  const nfft = nextPow2(nperseg); // zero-padding allowed
  const step = Math.max(1, Math.floor(nperseg * (1 - overlap)));

  const win = hann(nperseg);

  // window power normalization
  let winPow = 0;
  for (let i = 0; i < nperseg; i++) {
    winPow += win[i] * win[i];
  }

  const fft = new FFT(nfft);
  const input = new Float64Array(nfft);
  const out = fft.createComplexArray();

  const half = Math.floor(nfft / 2);
  const psd = new Float32Array(half + 1);

  let segmentCount = 0;

  for (let start = 0; start + nperseg <= xCentered.length; start += step) {
    // zero-pad input
    for (let i = 0; i < nfft; i++) input[i] = 0;

    // apply window
    for (let i = 0; i < nperseg; i++) {
      input[i] = xCentered[start + i] * win[i];
    }

    // FFT
    fft.realTransform(out, input);
    fft.completeSpectrum(out);

    // accumulate power
    for (let bin = 0; bin <= half; bin++) {
      const re = out[2 * bin];
      const im = out[2 * bin + 1];
      const mag2 = re * re + im * im;

      // PSD scaling
      psd[bin] += mag2 / (fs * winPow);
    }

    segmentCount++;
  }

  // average segments
  for (let i = 0; i <= half; i++) {
    psd[i] /= segmentCount;
  }

  // -------- 3) One-sided correction --------
  // Double interior bins (exclude DC and Nyquist)
  for (let bin = 1; bin < half; bin++) {
    psd[bin] *= 2;
  }

  // -------- 4) Frequency axis --------
  const freqs = new Float32Array(half + 1);
  for (let i = 0; i <= half; i++) {
    freqs[i] = (i * fs) / nfft;
  }

  return { freqs, psd };
}