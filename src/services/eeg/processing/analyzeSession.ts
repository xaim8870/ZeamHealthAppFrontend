import { sessionToFrames } from "./normalizeSession";
import { collectWindow } from "./windowing";
import { computeWindowFeatures } from "./computeWindowFeatures";
import { computeQuality } from "./quality";
import type { WindowDef } from "./types";

export type StepResult = {
  step: string;
  start: number;
  end: number;
  sqi: number;
  quality: ReturnType<typeof computeQuality>;
  features?: ReturnType<typeof computeWindowFeatures>;
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

    // ✅ collectWindow expects (frames, winObject)
    const winData = collectWindow(frames, w);

    // If the window has no data, skip safely
    if (!winData) {
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

    // Gate features on SQI + minimum samples (1s)
    const ok = q.sqi >= 0.6 && winData.data[0].length >= winData.samplingRate;

    results.push({
      step: w.step,
      start: w.start,
      end: w.end,
      sqi: q.sqi,
      quality: q,
      features: ok ? computeWindowFeatures(winData) : undefined,
      skippedReason: ok ? undefined : "Low signal quality or insufficient samples",
    });
  }

  return { framesCount: frames.length, results };
}