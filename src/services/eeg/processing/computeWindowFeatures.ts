// src/services/eeg/processing/computeWindowFeatures.ts
import { WindowData } from "./windowing";
import { welchPSD } from "./welch";
import { BANDS, bandPower, peakAlphaFrequency, alpha3dBBandwidth, spectralEdgeFreq } from "./features";

export interface WindowFeatures {
  channels: string[];
  fs: number;
  perChannel: Array<{
    bandAbs: Record<string, number>;
    bandRel: Record<string, number>;
    thetaBeta: number;
    alphaTheta: number;
    paf: number; 
    alphaBW3dB: number;
    sef95: number;
    sef5: number;
  }>;
  avg: WindowFeatures["perChannel"][number];
}

export function computeWindowFeatures(w: WindowData): WindowFeatures {
  const fs = w.samplingRate;

  const perChannel = w.data.map((sig) => {
    const { freqs, psd } = welchPSD(sig, fs, { segmentSeconds: 2, overlap: 0.5 });

    // total 0.5-45
    const total = bandPower({ freqs, psd }, [0.5, 45]) || 1e-12;

    const bandAbs: Record<string, number> = {};
    const bandRel: Record<string, number> = {};

    for (const [name, band] of Object.entries(BANDS)) {
      const p = bandPower({ freqs, psd }, band as any);
      bandAbs[name] = p;
      bandRel[name] = p / total;
    }

    const thetaBeta = (bandRel.theta ?? 0) / Math.max(1e-12, (bandRel.beta ?? 0));
    const alphaTheta = (bandRel.alpha ?? 0) / Math.max(1e-12, (bandRel.theta ?? 0));

    const paf = peakAlphaFrequency(freqs, psd);
    const alphaBW3dB = alpha3dBBandwidth(freqs, psd);
    const sef95 = spectralEdgeFreq(freqs, psd, 0.95);
    const sef5 = spectralEdgeFreq(freqs, psd, 0.05);

    return { bandAbs, bandRel, thetaBeta, alphaTheta, paf, alphaBW3dB, sef95, sef5 };
  });

  // simple average across channels
  const avg = (() => {
    const n = perChannel.length;
    const sumAbs: Record<string, number> = {};
    const sumRel: Record<string, number> = {};
    for (const b of Object.keys(BANDS)) { sumAbs[b] = 0; sumRel[b] = 0; }

    let thetaBeta = 0, alphaTheta = 0, paf = 0, alphaBW3dB = 0, sef95 = 0, sef5 = 0;

    for (const ch of perChannel) {
      for (const b of Object.keys(BANDS)) {
        sumAbs[b] += ch.bandAbs[b];
        sumRel[b] += ch.bandRel[b];
      }
      thetaBeta += ch.thetaBeta;
      alphaTheta += ch.alphaTheta;
      paf += (Number.isFinite(ch.paf) ? ch.paf : 0);
      alphaBW3dB += (Number.isFinite(ch.alphaBW3dB) ? ch.alphaBW3dB : 0);
      sef95 += (Number.isFinite(ch.sef95) ? ch.sef95 : 0);
      sef5 += (Number.isFinite(ch.sef5) ? ch.sef5 : 0);
    }

    const bandAbs: Record<string, number> = {};
    const bandRel: Record<string, number> = {};
    for (const b of Object.keys(BANDS)) {
      bandAbs[b] = sumAbs[b] / n;
      bandRel[b] = sumRel[b] / n;
    }

    return {
      bandAbs,
      bandRel,
      thetaBeta: thetaBeta / n,
      alphaTheta: alphaTheta / n,
      paf: paf / n,
      alphaBW3dB: alphaBW3dB / n,
      sef95: sef95 / n,
      sef5: sef5 / n
    };
  })();

  return { channels: w.channels, fs, perChannel, avg };
}