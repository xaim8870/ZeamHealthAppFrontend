import { sessionToFrames } from "./normalizeSession";
import { collectWindow } from "./windowing";
import { computeWindowFeatures } from "./computeWindowFeatures";
import { computeQuality } from "./quality";
import { preprocessWindowChannels } from "./preprocess";
import { detectMovement } from "./movement";
import { computeScores } from "./scores";
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

  for (const w of (session.windows ?? []) as WindowDef[]) {
    const slice = frames.filter(f => f.ts >= w.start && f.ts < w.end);

    const q = computeQuality(slice, {
      spikeAbsMax: session.meta?.device === "muse" ? 2000 : 2000,
      flatVarEps: 1e-3,
      gapToleranceMult: 1.5,
    });

    const winData = collectWindow(frames, w);

    if (!winData || !winData.data.length || !winData.data[0]?.length) {
      results.push({
        step: w.step,
        start: w.start,
        end: w.end,
        sqi: q.sqi,
        quality: q,
        skippedReason: "No samples found in this window",
      });
      continue;
    }

    const minSamples = winData.samplingRate;
    const hasEnoughSamples = winData.data[0].length >= minSamples;
    const hasUsableSignal = q.sqi >= 0.6 && hasEnoughSamples;

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

    if (!hasUsableSignal) {
      results.push({
        step: w.step,
        start: w.start,
        end: w.end,
        sqi: q.sqi,
        quality: q,
        movement,
        skippedReason: "Low signal quality or insufficient samples",
      });
      continue;
    }

    const features = computeWindowFeatures(processedWinData);

    const scores = computeScores({
      perChannel: features.perChannel,
      sqi: q.sqi,
      movementBurden: movement.burden,
      step: w.step,
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

  return { framesCount: frames.length, results };
}