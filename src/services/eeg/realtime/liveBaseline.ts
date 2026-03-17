import { preprocessWindowChannels } from "../processing/preprocess";
import { detectMovement } from "../processing/movement";
import { computeWindowFeatures } from "../processing/computeWindowFeatures";
import {
  aggregateFeatures,
  type AggregateFeatureSummary,
} from "../processing/scores";
import type { BufferSnapshot } from "./ringBuffer";

export interface LiveBaselineState {
  ready: boolean;
  startedAt: number | null;
  completedAt: number | null;
  features: AggregateFeatureSummary | null;
  acceptedWindows: number;
  progress01: number;
}

function safeMean(values: number[]): number {
  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function safeMeanOrNull(values: number[]): number | null {
  const valid = values.filter((v) => Number.isFinite(v));
  if (!valid.length) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function averageSummaries(items: AggregateFeatureSummary[]): AggregateFeatureSummary {
  return {
    alphaRelMean: safeMean(items.map((x) => x.alphaRelMean)),
    betaRelMean: safeMean(items.map((x) => x.betaRelMean)),
    thetaRelMean: safeMean(items.map((x) => x.thetaRelMean)),
    deltaRelMean: safeMean(items.map((x) => x.deltaRelMean)),
    gammaRelMean: safeMean(items.map((x) => x.gammaRelMean)),
    thetaBetaMean: safeMean(items.map((x) => x.thetaBetaMean)),
    alphaThetaMean: safeMean(items.map((x) => x.alphaThetaMean)),
    pafMean: safeMeanOrNull(items.map((x) => x.pafMean ?? NaN)),
  };
}

export class LiveBaselineCollector {
  private readonly requiredMs: number;
  private readonly windowMs: number;
  private readonly maxMovementBurden: number;
  private readonly accepted: AggregateFeatureSummary[] = [];
  private startedAt: number | null = null;
  private completedAt: number | null = null;
  private baseline: AggregateFeatureSummary | null = null;

  constructor(args?: {
    requiredMs?: number;
    windowMs?: number;
    maxMovementBurden?: number;
  }) {
    this.requiredMs = args?.requiredMs ?? 20000;
    this.windowMs = args?.windowMs ?? 6000;
    this.maxMovementBurden = args?.maxMovementBurden ?? 0.12;
  }

  reset() {
    this.accepted.length = 0;
    this.startedAt = null;
    this.completedAt = null;
    this.baseline = null;
  }

  getState(nowTs?: number): LiveBaselineState {
    const elapsed =
      this.startedAt != null && nowTs != null ? Math.max(0, nowTs - this.startedAt) : 0;

    return {
      ready: !!this.baseline,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      features: this.baseline,
      acceptedWindows: this.accepted.length,
      progress01: Math.max(0, Math.min(1, elapsed / this.requiredMs)),
    };
  }

  ingest(snapshot: BufferSnapshot): LiveBaselineState {
    if (!snapshot.length || !snapshot.endTs) {
      return this.getState(snapshot.endTs ?? undefined);
    }

    if (this.startedAt == null) {
      this.startedAt = snapshot.endTs;
    }

    if (this.baseline) {
      return this.getState(snapshot.endTs);
    }

    const enoughTime = snapshot.endTs - this.startedAt >= this.requiredMs;
    const enoughSamples =
      snapshot.length >= snapshot.samplingRate * (this.windowMs / 1000);

    if (enoughSamples) {
      const processed = preprocessWindowChannels(snapshot.data, {
        fs: snapshot.samplingRate,
        highpassHz: 0.5,
        notchHz: 50,
        notchQ: 30,
      });

      const movement = detectMovement(
        processed,
        snapshot.samplingRate,
        snapshot.channels
      );

      if (movement.burden <= this.maxMovementBurden) {
        const features = computeWindowFeatures({
          samplingRate: snapshot.samplingRate,
          channels: snapshot.channels,
          data: processed,
        });

        const agg = aggregateFeatures(features.perChannel);
        this.accepted.push(agg);
      }
    }

    if (enoughTime && this.accepted.length > 0) {
      this.baseline = averageSummaries(this.accepted);
      this.completedAt = snapshot.endTs;
    }

    return this.getState(snapshot.endTs);
  }
}