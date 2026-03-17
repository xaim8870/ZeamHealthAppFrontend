import type { BufferedSample } from "./ringBuffer";

export interface FakeEEGGeneratorOptions {
  channels: string[];
  samplingRate: number;
  alphaHz?: number;
  betaHz?: number;
  noiseLevel?: number;
  baseAmplitude?: number;
}

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export class FakeEEGGenerator {
  private readonly channels: string[];
  private readonly samplingRate: number;
  private readonly alphaHz: number;
  private readonly betaHz: number;
  private readonly noiseLevel: number;
  private readonly baseAmplitude: number;

  private sampleIndex = 0;
  private mode: "baseline" | "calm" | "focus" | "noisy" = "baseline";

  constructor(opts: FakeEEGGeneratorOptions) {
    this.channels = opts.channels;
    this.samplingRate = opts.samplingRate;
    this.alphaHz = opts.alphaHz ?? 10;
    this.betaHz = opts.betaHz ?? 20;
    this.noiseLevel = opts.noiseLevel ?? 3;
    this.baseAmplitude = opts.baseAmplitude ?? 20;
  }

  setMode(mode: "baseline" | "calm" | "focus" | "noisy") {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  nextSample(ts: number): BufferedSample {
    const t = this.sampleIndex / this.samplingRate;

    let alphaAmp = this.baseAmplitude * 0.7;
    let betaAmp = this.baseAmplitude * 0.35;
    let noiseAmp = this.noiseLevel;

    if (this.mode === "calm") {
      alphaAmp = this.baseAmplitude * 1.1;
      betaAmp = this.baseAmplitude * 0.2;
      noiseAmp = this.noiseLevel * 0.8;
    } else if (this.mode === "focus") {
      alphaAmp = this.baseAmplitude * 0.35;
      betaAmp = this.baseAmplitude * 0.8;
      noiseAmp = this.noiseLevel * 0.9;
    } else if (this.mode === "noisy") {
      alphaAmp = this.baseAmplitude * 0.55;
      betaAmp = this.baseAmplitude * 0.45;
      noiseAmp = this.noiseLevel * 3.5;
    }

    const values = this.channels.map((_, ch) => {
      const phaseShift = ch * 0.25;

      const alpha = alphaAmp * Math.sin(2 * Math.PI * this.alphaHz * t + phaseShift);
      const beta = betaAmp * Math.sin(2 * Math.PI * this.betaHz * t + phaseShift * 0.7);
      const drift = 2.5 * Math.sin(2 * Math.PI * 0.3 * t + ch * 0.1);
      const noise = noiseAmp * randn();

      let x = alpha + beta + drift + noise;

      if (this.mode === "noisy" && Math.random() < 0.01) {
        x += (Math.random() > 0.5 ? 1 : -1) * (40 + Math.random() * 50);
      }

      return x;
    });

    this.sampleIndex += 1;

    return {
      ts,
      values,
    };
  }
}