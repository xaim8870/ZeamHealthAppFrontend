export interface PreprocessOptions {
  fs: number;
  highpassHz?: number;   // default 0.5
  notchHz?: number;      // default 50
  notchQ?: number;       // default 30
}

function biquadFilter(
  x: Float32Array,
  b0: number, b1: number, b2: number,
  a0: number, a1: number, a2: number
): Float32Array {
  b0 /= a0; b1 /= a0; b2 /= a0;
  a1 /= a0; a2 /= a0;

  const y = new Float32Array(x.length);

  let x1 = 0, x2 = 0;
  let y1 = 0, y2 = 0;

  for (let n = 0; n < x.length; n++) {
    const x0 = x[n];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

    y[n] = y0;

    x2 = x1; x1 = x0;
    y2 = y1; y1 = y0;
  }

  return y;
}

export function highpassBiquad(x: Float32Array, fs: number, fc: number): Float32Array {
  const w0 = 2 * Math.PI * (fc / fs);
  const cosw0 = Math.cos(w0);
  const sinw0 = Math.sin(w0);

  const Q = 0.7071;
  const alpha = sinw0 / (2 * Q);

  const b0 = (1 + cosw0) / 2;
  const b1 = -(1 + cosw0);
  const b2 = (1 + cosw0) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cosw0;
  const a2 = 1 - alpha;

  return biquadFilter(x, b0, b1, b2, a0, a1, a2);
}

export function notchBiquad(x: Float32Array, fs: number, f0: number, Q: number): Float32Array {
  const w0 = 2 * Math.PI * (f0 / fs);
  const cosw0 = Math.cos(w0);
  const sinw0 = Math.sin(w0);
  const alpha = sinw0 / (2 * Q);

  const b0 = 1;
  const b1 = -2 * cosw0;
  const b2 = 1;
  const a0 = 1 + alpha;
  const a1 = -2 * cosw0;
  const a2 = 1 - alpha;

  return biquadFilter(x, b0, b1, b2, a0, a1, a2);
}

export function preprocessChannel(
  x: Float32Array,
  opts: PreprocessOptions
): Float32Array {
  const fs = opts.fs;
  const hp = opts.highpassHz ?? 0.5;
  const notch = opts.notchHz ?? 50;
  const notchQ = opts.notchQ ?? 30;

  let y = highpassBiquad(x, fs, hp);

  if (notch > 0 && notch < fs / 2) {
    y = notchBiquad(y, fs, notch, notchQ);
  }

  return y;
}

export function preprocessWindowChannels(
  data: Float32Array[],
  opts: PreprocessOptions
): Float32Array[] {
  return data.map(ch => preprocessChannel(ch, opts));
}