import { sessionToFrames } from "./normalizeSession";
import { collectWindow } from "./windowing";
import { computeWindowFeatures } from "./computeWindowFeatures";
import { computeQuality } from "./quality";
import { preprocessWindowChannels } from "./preprocess";
import { detectMovement } from "./movement";
import {
  aggregateFeatures,
  classifyStepKind,
  computeScores,
} from "./scores";
import { selectSessionBaseline, type BaselineCandidate } from "./baseline";
import type { WindowDef } from "./types";

export type StepResult = {
  step: string;
  start: number;
  end: number;
  sqi: number;
  quality: ReturnType<typeof computeQuality>;
  movement?: ReturnType<typeof detectMovement>;
  features?: ReturnType<typeof computeWindowFeatures>;
  scores?: ReturnType<typeof computeScores>;
  skippedReason?: string;
};

export function analyzeSession(session: any) {
  const frames = sessionToFrames(session);
  const results: StepResult[] = [];

  // Pass 1: compute usable feature windows and collect baseline candidates
  const stepCache: Array<{
    w: WindowDef;
    q: ReturnType<typeof computeQuality>;
    movement?: ReturnType<typeof detectMovement>;
    features?: ReturnType<typeof computeWindowFeatures>;
    skippedReason?: string;
  }> = [];

  const baselineCandidates: BaselineCandidate[] = [];

  for (const w of (session.windows ?? []) as WindowDef[]) {
    const slice = frames.filter((f) => f.ts >= w.start && f.ts < w.end);

    const q = computeQuality(slice, {
      spikeAbsMax: session.meta?.device === "muse" ? 2000 : 2000,
      flatVarEps: 1e-3,
      gapToleranceMult: 1.5,
    });

    const winData = collectWindow(frames, w);

    if (!winData || !winData.data.length || !winData.data[0]?.length) {
      stepCache.push({
        w,
        q,
        skippedReason: "No samples found in this window",
      });
      continue;
    }

    const processedData = preprocessWindowChannels(winData.data, {
      fs: winData.samplingRate,
      highpassHz: 0.5,
      notchHz: 50,
      notchQ: 30,
    });

    const processedWinData = {
      ...winData,
      data: processedData,
    };

    const movement = detectMovement(
      processedWinData.data,
      processedWinData.samplingRate,
      processedWinData.channels
    );

    const minSamples = processedWinData.samplingRate;
    const hasEnoughSamples = processedWinData.data[0].length >= minSamples;
    const usableForFeatures = q.sqi >= 0.6 && hasEnoughSamples;

    if (!usableForFeatures) {
      stepCache.push({
        w,
        q,
        movement,
        skippedReason: "Low signal quality or insufficient samples",
      });
      continue;
    }

    const features = computeWindowFeatures(processedWinData);

    stepCache.push({
      w,
      q,
      movement,
      features,
    });

    const kind = classifyStepKind(w.step);

    // Good candidate for session baseline
    if (
      features &&
      q.sqi >= 0.6 &&
      (movement?.burden ?? 1) <= 0.25 &&
      ["rest", "eyes_closed", "breathing", "eyes_open"].includes(kind)
    ) {
      baselineCandidates.push({
        step: w.step,
        kind,
        sqi: q.sqi,
        movementBurden: movement?.burden ?? 0,
        features: aggregateFeatures(features.perChannel),
      });
    }
  }

  const sessionBaseline = selectSessionBaseline(baselineCandidates);

  // Pass 2: compute final scores using chosen baseline
  for (const item of stepCache) {
    const { w, q, movement, features, skippedReason } = item;

    if (!features) {
      results.push({
        step: w.step,
        start: w.start,
        end: w.end,
        sqi: q.sqi,
        quality: q,
        movement,
        skippedReason,
      });
      continue;
    }

    const flatCount = q.flatlineChannels?.length ?? 0;
    const spikeCount = q.spikeChannels?.length ?? 0;
    const badChannelCount = Math.max(flatCount, spikeCount);
    const totalChannelCount = features.channels.length;

    const scores = computeScores({
      perChannel: features.perChannel,
      sqi: q.sqi,
      movementBurden: movement?.burden ?? 0,
      step: w.step,
      baseline: sessionBaseline?.features ?? null,
      badChannelCount,
      totalChannelCount,
      spikeChannelCount: spikeCount,
    });

    results.push({
      step: w.step,
      start: w.start,
      end: w.end,
      sqi: q.sqi,
      quality: q,
      movement,
      features,
      scores,
    });
  }

  return {
    framesCount: frames.length,
    baseline: sessionBaseline,
    results,
  };
}