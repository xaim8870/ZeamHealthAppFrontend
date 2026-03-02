// src/services/eeg/processing/welch.ts
import FFT from "fft.js";

function hann(n: number): Float32Array {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
  return w;
}

export interface WelchOptions {
  segmentSeconds?: number;  // e.g. 2
  overlap?: number;         // 0..0.9, e.g. 0.5
}

export interface PSDResult {
  freqs: Float32Array;      // 0..fs/2
  psd: Float32Array;        // same length
}

export function welchPSD(x: Float32Array, fs: number, opts: WelchOptions = {}): PSDResult {
  const segmentSeconds = opts.segmentSeconds ?? 2;
  const overlap = opts.overlap ?? 0.5;

  const nperseg = Math.max(128, Math.round(segmentSeconds * fs));
  // force power-of-two for FFT speed:
  const nfft = 1 << Math.floor(Math.log2(nperseg));
  const step = Math.max(1, Math.floor(nfft * (1 - overlap)));
  if (x.length < nfft) throw new Error(`Not enough samples: have ${x.length}, need ${nfft}`);

  const win = hann(nfft);
  let winPow = 0;
  for (let i = 0; i < nfft; i++) winPow += win[i] * win[i];

  const fft = new FFT(nfft);
  const input = new Float64Array(nfft);
  const out = fft.createComplexArray(); // length 2*nfft

  const half = Math.floor(nfft / 2);
  const psd = new Float32Array(half + 1);
  let k = 0;

  for (let start = 0; start + nfft <= x.length; start += step) {
    // windowed segment
    for (let i = 0; i < nfft; i++) input[i] = x[start + i] * win[i];

    // real FFT
    fft.realTransform(out, input);
    fft.completeSpectrum(out);

    // accumulate power
    for (let bin = 0; bin <= half; bin++) {
      const re = out[2 * bin];
      const im = out[2 * bin + 1];
      const mag2 = re * re + im * im;

      // Welch PSD scaling (common form)
      // PSD ~ |X|^2 / (fs * sum(win^2))
      psd[bin] += mag2 / (fs * winPow);
    }
    k++;
  }

  // average across segments
  for (let i = 0; i < psd.length; i++) psd[i] = psd[i] / k;

  const freqs = new Float32Array(half + 1);
  for (let i = 0; i <= half; i++) freqs[i] = (i * fs) / nfft;

  return { freqs, psd };
}