import { EEGRingBuffer, type BufferedSample } from "./ringBuffer";
import { LiveBaselineCollector } from "./liveBaseline";
import { preprocessWindowChannels } from "../processing/preprocess";
import { detectMovement } from "../processing/movement";
import { computeWindowFeatures } from "../processing/computeWindowFeatures";
import { computeScores } from "../processing/scores";

export interface LiveMetricsResult {
  ts: number;
  phase: "collecting_baseline" | "live";
  baselineReady: boolean;
  calmScore: number | null;
  focusScore: number | null;
  confidenceScore: number | null;
  confidenceBand: "high" | "medium" | "low" | null;
  movementBurden: number | null;
  movementEvents: number | null;
  sampleCount: number;
  bufferDurationMs: number;
  debug?: {
    baselineAcceptedWindows: number;
    baselineProgress01: number;
  };
}

export class LiveMetricsEngine {
  private readonly buffer: EEGRingBuffer;
  private readonly baseline: LiveBaselineCollector;
  private readonly analysisWindowMs: number;
  private readonly minSamples: number;

  constructor(args: {
    channels: string[];
    samplingRate: number;
    bufferSeconds?: number;
    analysisWindowMs?: number;
    baselineRequiredMs?: number;
  }) {
    const samplingRate = args.samplingRate;
    const analysisWindowMs = args.analysisWindowMs ?? 6000;

    this.buffer = new EEGRingBuffer({
      channels: args.channels,
      samplingRate,
      maxSeconds: args.bufferSeconds ?? 8,
    });

    this.baseline = new LiveBaselineCollector({
      requiredMs: args.baselineRequiredMs ?? 20000,
      windowMs: analysisWindowMs,
      maxMovementBurden: 0.12,
    });

    this.analysisWindowMs = analysisWindowMs;
    this.minSamples = Math.round((analysisWindowMs / 1000) * samplingRate);
  }

  reset() {
    this.buffer.clear();
    this.baseline.reset();
  }

  appendSample(sample: BufferedSample): LiveMetricsResult | null {
    this.buffer.append(sample);
    return this.tryCompute();
  }

  appendBatch(samples: BufferedSample[]): LiveMetricsResult | null {
    this.buffer.appendBatch(samples);
    return this.tryCompute();
  }

  private tryCompute(): LiveMetricsResult | null {
    const snapshot = this.buffer.getWindowLast(this.analysisWindowMs);
    if (!snapshot || snapshot.length < this.minSamples || !snapshot.endTs) {
      return null;
    }

    const baselineState = this.baseline.ingest(snapshot);

    if (!baselineState.ready) {
      return {
        ts: snapshot.endTs,
        phase: "collecting_baseline",
        baselineReady: false,
        calmScore: null,
        focusScore: null,
        confidenceScore: null,
        confidenceBand: null,
        movementBurden: null,
        movementEvents: null,
        sampleCount: snapshot.length,
        bufferDurationMs: (snapshot.endTs ?? 0) - (snapshot.startTs ?? 0),
        debug: {
          baselineAcceptedWindows: baselineState.acceptedWindows,
          baselineProgress01: baselineState.progress01,
        },
      };
    }

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

    const features = computeWindowFeatures({
      samplingRate: snapshot.samplingRate,
      channels: snapshot.channels,
      data: processed,
    });

    const scores = computeScores({
      perChannel: features.perChannel,
      sqi: 1 - Math.min(0.7, movement.burden),
      movementBurden: movement.burden,
      step: "live",
      baseline: baselineState.features,
      badChannelCount: 0,
      totalChannelCount: snapshot.channels.length,
      spikeChannelCount: 0,
    });

    return {
      ts: snapshot.endTs,
      phase: "live",
      baselineReady: true,
      calmScore: scores.calmScore,
      focusScore: scores.focusScore,
      confidenceScore: scores.confidenceScore,
      confidenceBand: scores.confidenceBand,
      movementBurden: movement.burden,
      movementEvents: movement.eventCount,
      sampleCount: snapshot.length,
      bufferDurationMs: (snapshot.endTs ?? 0) - (snapshot.startTs ?? 0),
      debug: {
        baselineAcceptedWindows: baselineState.acceptedWindows,
        baselineProgress01: baselineState.progress01,
      },
    };
  }
}