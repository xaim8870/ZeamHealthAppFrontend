// src/services/eeg/processing/movement.ts

export type MovementKind = "jump" | "burst" | "multi_channel_artifact";

export interface MovementEvent {
  start: number;          // seconds relative to window start
  end: number;            // seconds relative to window start
  durationMs: number;
  channels: string[];
  peakScore: number;      // stronger = more suspicious
  kind: MovementKind;
}

export interface MovementSummary {
  eventCount: number;
  totalMovementMs: number;
  burden: number;         // 0..1 fraction of window contaminated
  events: MovementEvent[];
}

export interface DetectMovementOptions {
  jumpZ?: number;               // threshold for derivative jumps
  rmsBurstZ?: number;           // threshold for short-term RMS bursts
  minConsensusChannels?: number;
  rmsWindowMs?: number;
  mergeGapMs?: number;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? 0.5 * (sorted[mid - 1] + sorted[mid])
    : sorted[mid];
}

function mad(values: number[], med?: number): number {
  if (!values.length) return 0;
  const m = med ?? median(values);
  const devs = values.map((v) => Math.abs(v - m));
  return median(devs);
}

function rollingRMS(x: Float32Array, winSamples: number): Float32Array {
  const n = x.length;
  const out = new Float32Array(n);
  if (n === 0) return out;

  const w = Math.max(1, Math.min(winSamples, n));
  let sumSq = 0;

  for (let i = 0; i < w; i++) {
    sumSq += x[i] * x[i];
  }

  for (let i = 0; i < n; i++) {
    const start = Math.max(0, i - w + 1);
    const end = i;

    if (i === 0) {
      out[i] = Math.sqrt(sumSq / w);
    } else {
      const prevIdx = i - 1;
      const addIdx = i;
      const removeIdx = i - w;

      if (addIdx < n) sumSq += x[addIdx] * x[addIdx];
      if (removeIdx >= 0) sumSq -= x[removeIdx] * x[removeIdx];

      const denom = end - start + 1;
      out[i] = Math.sqrt(Math.max(sumSq, 0) / denom);
    }
  }

  return out;
}

interface ChannelFlags {
  jumpFlags: boolean[];
  burstFlags: boolean[];
  jumpScores: number[];
  burstScores: number[];
}

function analyzeChannel(
  x: Float32Array,
  fs: number,
  options: Required<DetectMovementOptions>
): ChannelFlags {
  const n = x.length;
  const jumpFlags = new Array<boolean>(n).fill(false);
  const burstFlags = new Array<boolean>(n).fill(false);
  const jumpScores = new Array<number>(n).fill(0);
  const burstScores = new Array<number>(n).fill(0);

  if (n < 3) {
    return { jumpFlags, burstFlags, jumpScores, burstScores };
  }

  // 1) Derivative-based jump detection
  const dx: number[] = [];
  for (let i = 1; i < n; i++) {
    dx.push(x[i] - x[i - 1]);
  }

  const dxAbs = dx.map((v) => Math.abs(v));
  const dxMed = median(dxAbs);
  const dxMad = mad(dxAbs, dxMed) || 1e-8;

  for (let i = 1; i < n; i++) {
    const score = Math.abs(dx[i - 1]) / (dxMad * 1.4826 + 1e-8);
    jumpScores[i] = score;
    if (score >= options.jumpZ) {
      jumpFlags[i] = true;
    }
  }

  // 2) Short-term RMS burst detection
  const rmsWinSamples = Math.max(1, Math.round((options.rmsWindowMs / 1000) * fs));
  const rms = rollingRMS(x, rmsWinSamples);
  const rmsArr = Array.from(rms);
  const rmsMed = median(rmsArr);
  const rmsMadVal = mad(rmsArr, rmsMed) || 1e-8;

  for (let i = 0; i < n; i++) {
    const score = (rms[i] - rmsMed) / (rmsMadVal * 1.4826 + 1e-8);
    burstScores[i] = score;
    if (score >= options.rmsBurstZ) {
      burstFlags[i] = true;
    }
  }

  return { jumpFlags, burstFlags, jumpScores, burstScores };
}

export function detectMovement(
  data: Float32Array[],
  fs: number,
  channels: string[],
  opts: DetectMovementOptions = {}
): MovementSummary {
  const options: Required<DetectMovementOptions> = {
    jumpZ: opts.jumpZ ?? 8,
    rmsBurstZ: opts.rmsBurstZ ?? 5,
    minConsensusChannels: opts.minConsensusChannels ?? 2,
    rmsWindowMs: opts.rmsWindowMs ?? 180,
    mergeGapMs: opts.mergeGapMs ?? 250,
  };

  const channelCount = data.length;
  if (!channelCount || !data[0]?.length || fs <= 0) {
    return {
      eventCount: 0,
      totalMovementMs: 0,
      burden: 0,
      events: [],
    };
  }

  const n = data[0].length;
  const perChannel = data.map((x) => analyzeChannel(x, fs, options));

  const activeCount = new Array<number>(n).fill(0);
  const activeChannelsAt: string[][] = Array.from({ length: n }, () => []);
  const peakScores = new Array<number>(n).fill(0);
  const kindsAt: MovementKind[] = new Array<MovementKind>(n).fill("jump");

  for (let ch = 0; ch < channelCount; ch++) {
    const name = channels[ch] ?? `ch${ch}`;
    const info = perChannel[ch];

    for (let i = 0; i < n; i++) {
      const isActive = info.jumpFlags[i] || info.burstFlags[i];
      if (!isActive) continue;

      activeCount[i] += 1;
      activeChannelsAt[i].push(name);

      const score = Math.max(info.jumpScores[i], info.burstScores[i]);
      peakScores[i] = Math.max(peakScores[i], score);

      if (info.jumpFlags[i] && info.burstFlags[i]) {
        kindsAt[i] = "multi_channel_artifact";
      } else if (info.burstFlags[i]) {
        kindsAt[i] = "burst";
      } else {
        kindsAt[i] = "jump";
      }
    }
  }

  const consensus = new Array<boolean>(n).fill(false);
  for (let i = 0; i < n; i++) {
    if (activeCount[i] >= options.minConsensusChannels) {
      consensus[i] = true;
    }
  }

  const events: MovementEvent[] = [];
  const maxGapSamples = Math.max(1, Math.round((options.mergeGapMs / 1000) * fs));

  let i = 0;
  while (i < n) {
    if (!consensus[i]) {
      i++;
      continue;
    }

    let start = i;
    let end = i;
    let lastActive = i;
    let peak = peakScores[i];
    const chSet = new Set<string>();
    let hasJump = false;
    let hasBurst = false;

    while (i < n) {
      if (consensus[i]) {
        lastActive = i;
        end = i;
        peak = Math.max(peak, peakScores[i]);
        for (const ch of activeChannelsAt[i]) chSet.add(ch);

        if (kindsAt[i] === "jump") hasJump = true;
        if (kindsAt[i] === "burst") hasBurst = true;
        if (kindsAt[i] === "multi_channel_artifact") {
          hasJump = true;
          hasBurst = true;
        }

        i++;
        continue;
      }

      if (i - lastActive <= maxGapSamples) {
        i++;
        continue;
      }

      break;
    }

    const kind: MovementKind =
      hasJump && hasBurst
        ? "multi_channel_artifact"
        : hasBurst
        ? "burst"
        : "jump";

    const startSec = start / fs;
    const endSec = end / fs;
    const durationMs = Math.max(0, Math.round(((end - start + 1) / fs) * 1000));

    events.push({
      start: startSec,
      end: endSec,
      durationMs,
      channels: Array.from(chSet),
      peakScore: Number(peak.toFixed(2)),
      kind,
    });
  }

  const totalMovementMs = events.reduce((sum, e) => sum + e.durationMs, 0);
  const windowMs = (n / fs) * 1000;
  const burden = clamp01(totalMovementMs / Math.max(windowMs, 1));

  return {
    eventCount: events.length,
    totalMovementMs,
    burden: Number(burden.toFixed(4)),
    events,
  };
}