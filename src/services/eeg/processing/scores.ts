import type { BaselineFeatureSummary } from "./baseline";
export type ScoresStepKind =
  | "rest"
  | "breathing"
  | "eyes_closed"
  | "eyes_open"
  | "task"
  | "unknown";

export interface PerChannelFeatureLike {
  bandRel?: Record<string, number>;
  bandAbs?: Record<string, number>;
  thetaBeta?: number;
  alphaTheta?: number;
  paf?: number;
  alphaBW3dB?: number;
  sef5?: number;
  sef95?: number;
}

export interface AggregateFeatureSummary {
  alphaRelMean: number;
  betaRelMean: number;
  thetaRelMean: number;
  deltaRelMean: number;
  gammaRelMean: number;
  thetaBetaMean: number;
  alphaThetaMean: number;
  pafMean: number | null;
}


export interface ScoreInputs {
  perChannel: PerChannelFeatureLike[];
  sqi?: number; // 0..1
  movementBurden?: number; // 0..1
  step?: string;
  baseline?: BaselineFeatureSummary | null;
  badChannelCount?: number;
  totalChannelCount?: number;
  spikeChannelCount?: number;
}

export interface ScoreDetails {
  stepKind: ScoresStepKind;
  aggregates: AggregateFeatureSummary;
  baseline: BaselineFeatureSummary | null;
  deltas: {
    alphaRelDelta: number;
    betaRelDelta: number;
    thetaRelDelta: number;
    thetaBetaDelta: number;
    alphaThetaDelta: number;
  };
  sqi: number;
  movementBurden: number;
  usableChannelFraction: number;
  artifactPenalty: number;
  confidenceBand: "high" | "medium" | "low";
}

export interface ScoresResult {
  calmScore: number;
  focusScore: number;
  confidenceScore: number;
  confidenceBand: "high" | "medium" | "low";
  scoreSuppressed: boolean;
  details: ScoreDetails;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
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

function normRange(x: number, lo: number, hi: number): number {
  if (!Number.isFinite(x) || hi <= lo) return 0;
  return clamp01((x - lo) / (hi - lo));
}

function invertNormRange(x: number, lo: number, hi: number): number {
  return 1 - normRange(x, lo, hi);
}

export function classifyStepKind(step?: string): ScoresStepKind {
  const s = (step ?? "").toLowerCase();

  if (s.includes("breath")) return "breathing";
  if (s.includes("eyes_closed") || s.includes("eyes closed")) return "eyes_closed";
  if (s.includes("eyes_open") || s.includes("eyes open")) return "eyes_open";
  if (s.includes("rest") || s.includes("alpharest") || s.includes("alpha_rest")) return "rest";
  if (
    s.includes("mental") ||
    s.includes("subtract") ||
    s.includes("task") ||
    s.includes("focus") ||
    s.includes("attention")
  ) {
    return "task";
  }

  return "unknown";
}

export function aggregateFeatures(
  perChannel: PerChannelFeatureLike[]
): AggregateFeatureSummary {
  const alphaRel: number[] = [];
  const betaRel: number[] = [];
  const thetaRel: number[] = [];
  const deltaRel: number[] = [];
  const gammaRel: number[] = [];
  const thetaBeta: number[] = [];
  const alphaTheta: number[] = [];
  const paf: number[] = [];

  for (const ch of perChannel) {
    alphaRel.push(ch.bandRel?.alpha ?? 0);
    betaRel.push(ch.bandRel?.beta ?? 0);
    thetaRel.push(ch.bandRel?.theta ?? 0);
    deltaRel.push(ch.bandRel?.delta ?? 0);
    gammaRel.push(ch.bandRel?.gamma ?? 0);

    if (Number.isFinite(ch.thetaBeta)) thetaBeta.push(ch.thetaBeta as number);
    if (Number.isFinite(ch.alphaTheta)) alphaTheta.push(ch.alphaTheta as number);
    if (Number.isFinite(ch.paf)) paf.push(ch.paf as number);
  }

  return {
    alphaRelMean: safeMean(alphaRel),
    betaRelMean: safeMean(betaRel),
    thetaRelMean: safeMean(thetaRel),
    deltaRelMean: safeMean(deltaRel),
    gammaRelMean: safeMean(gammaRel),
    thetaBetaMean: safeMean(thetaBeta),
    alphaThetaMean: safeMean(alphaTheta),
    pafMean: safeMeanOrNull(paf),
  };
}

function deltaOrZero(current: number, baseline?: number | null): number {
  if (!Number.isFinite(current) || !Number.isFinite(baseline as number)) return 0;
  return current - (baseline as number);
}

function normDelta(
  current: number,
  baseline: number | null | undefined,
  lo: number,
  hi: number
): number {
  return normRange(deltaOrZero(current, baseline), lo, hi);
}

function invertDelta(
  current: number,
  baseline: number | null | undefined,
  lo: number,
  hi: number
): number {
  return 1 - normDelta(current, baseline, lo, hi);
}

function computeUsableChannelFraction(
  badChannelCount: number,
  totalChannelCount: number
): number {
  if (!Number.isFinite(totalChannelCount) || totalChannelCount <= 0) return 1;
  return clamp01((totalChannelCount - Math.max(0, badChannelCount)) / totalChannelCount);
}

function computeArtifactPenalty(
  movementBurden: number,
  spikeChannelCount: number,
  totalChannelCount: number
): number {
  const spikeFrac =
    totalChannelCount > 0 ? clamp01(spikeChannelCount / totalChannelCount) : 0;

  return clamp01(0.65 * movementBurden + 0.35 * spikeFrac);
}

function computeConfidenceBand(
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): "high" | "medium" | "low" {
  if (sqi >= 0.8 && movementBurden < 0.1 && usableChannelFraction >= 0.8) {
    return "high";
  }
  if (sqi >= 0.6 && movementBurden < 0.25 && usableChannelFraction >= 0.6) {
    return "medium";
  }
  return "low";
}

function computeConfidenceScore(
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number,
  artifactPenalty: number
): number {
  const confidence01 =
    0.55 * clamp01(sqi) +
    0.15 * clamp01(1 - movementBurden) +
    0.15 * usableChannelFraction +
    0.15 * clamp01(1 - artifactPenalty);

  return Math.round(100 * clamp01(confidence01));
}

function computeRestCalm(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const alphaAbs = normRange(a.alphaRelMean, 0.12, 0.42);
  const betaInvAbs = invertNormRange(a.betaRelMean, 0.08, 0.30);
  const alphaThetaAbs = normRange(a.alphaThetaMean, 0.8, 2.5);

  const alphaDelta = normDelta(a.alphaRelMean, b?.alphaRelMean, -0.03, 0.12);
  const betaDeltaInv = invertDelta(a.betaRelMean, b?.betaRelMean, -0.02, 0.10);
  const alphaThetaDelta = normDelta(a.alphaThetaMean, b?.alphaThetaMean, -0.2, 1.2);

  return clamp01(
    0.24 * alphaAbs +
      0.10 * betaInvAbs +
      0.08 * alphaThetaAbs +
      0.22 * alphaDelta +
      0.14 * betaDeltaInv +
      0.08 * alphaThetaDelta +
      0.08 * sqi +
      0.04 * (1 - movementBurden) +
      0.02 * usableChannelFraction
  );
}

function computeBreathingCalm(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const alphaAbs = normRange(a.alphaRelMean, 0.12, 0.42);
  const betaInvAbs = invertNormRange(a.betaRelMean, 0.08, 0.30);
  const alphaDelta = normDelta(a.alphaRelMean, b?.alphaRelMean, -0.03, 0.12);

  return clamp01(
    0.26 * alphaAbs +
      0.12 * betaInvAbs +
      0.24 * alphaDelta +
      0.14 * sqi +
      0.16 * (1 - movementBurden) +
      0.08 * usableChannelFraction
  );
}

function computeEyesClosedCalm(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const alphaAbs = normRange(a.alphaRelMean, 0.15, 0.45);
  const alphaThetaAbs = normRange(a.alphaThetaMean, 0.9, 2.8);
  const alphaDelta = normDelta(a.alphaRelMean, b?.alphaRelMean, -0.03, 0.12);

  return clamp01(
    0.28 * alphaAbs +
      0.12 * alphaThetaAbs +
      0.24 * alphaDelta +
      0.16 * sqi +
      0.12 * (1 - movementBurden) +
      0.08 * usableChannelFraction
  );
}

function computeTaskFocus(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const betaAbs = normRange(a.betaRelMean, 0.08, 0.30);
  const thetaBetaInvAbs = invertNormRange(a.thetaBetaMean, 1.0, 4.0);
  const alphaInvAbs = invertNormRange(a.alphaRelMean, 0.15, 0.45);

  const betaDelta = normDelta(a.betaRelMean, b?.betaRelMean, -0.02, 0.10);
  const thetaBetaInvDelta = invertDelta(a.thetaBetaMean, b?.thetaBetaMean, -0.4, 1.2);
  const alphaInvDelta = invertDelta(a.alphaRelMean, b?.alphaRelMean, -0.03, 0.10);

  return clamp01(
    0.18 * betaAbs +
      0.16 * thetaBetaInvAbs +
      0.08 * alphaInvAbs +
      0.22 * betaDelta +
      0.18 * thetaBetaInvDelta +
      0.08 * alphaInvDelta +
      0.06 * sqi +
      0.02 * (1 - movementBurden) +
      0.02 * usableChannelFraction
  );
}

function computeEyesOpenFocus(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const betaAbs = normRange(a.betaRelMean, 0.08, 0.28);
  const thetaBetaInv = invertNormRange(a.thetaBetaMean, 1.0, 4.0);
  const betaDelta = normDelta(a.betaRelMean, b?.betaRelMean, -0.02, 0.08);

  return clamp01(
    0.22 * betaAbs +
      0.20 * thetaBetaInv +
      0.24 * betaDelta +
      0.16 * sqi +
      0.10 * (1 - movementBurden) +
      0.08 * usableChannelFraction
  );
}

function computeGenericCalm(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const alphaAbs = normRange(a.alphaRelMean, 0.12, 0.42);
  const betaInv = invertNormRange(a.betaRelMean, 0.08, 0.30);
  const alphaDelta = normDelta(a.alphaRelMean, b?.alphaRelMean, -0.03, 0.12);

  return clamp01(
    0.24 * alphaAbs +
      0.18 * betaInv +
      0.20 * alphaDelta +
      0.16 * sqi +
      0.14 * (1 - movementBurden) +
      0.08 * usableChannelFraction
  );
}

function computeGenericFocus(
  a: AggregateFeatureSummary,
  b: BaselineFeatureSummary | null,
  sqi: number,
  movementBurden: number,
  usableChannelFraction: number
): number {
  const betaAbs = normRange(a.betaRelMean, 0.08, 0.30);
  const thetaBetaInv = invertNormRange(a.thetaBetaMean, 1.0, 4.0);
  const betaDelta = normDelta(a.betaRelMean, b?.betaRelMean, -0.02, 0.10);

  return clamp01(
    0.24 * betaAbs +
      0.22 * thetaBetaInv +
      0.18 * betaDelta +
      0.16 * sqi +
      0.12 * (1 - movementBurden) +
      0.08 * usableChannelFraction
  );
}

export function computeScores(inputs: ScoreInputs): ScoresResult {
  const sqi = clamp01(inputs.sqi ?? 0);
  const movementBurden = clamp01(inputs.movementBurden ?? 0);
  const baseline = inputs.baseline ?? null;

  const badChannelCount = Math.max(0, inputs.badChannelCount ?? 0);
  const totalChannelCount = Math.max(1, inputs.totalChannelCount ?? 1);
  const spikeChannelCount = Math.max(0, inputs.spikeChannelCount ?? 0);

  const usableChannelFraction = computeUsableChannelFraction(
    badChannelCount,
    totalChannelCount
  );
  const artifactPenalty = computeArtifactPenalty(
    movementBurden,
    spikeChannelCount,
    totalChannelCount
  );

  const aggregates = aggregateFeatures(inputs.perChannel);
  const stepKind = classifyStepKind(inputs.step);

  let calm01 = 0;
  let focus01 = 0;

  switch (stepKind) {
    case "rest":
      calm01 = computeRestCalm(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      focus01 = computeGenericFocus(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      ) * 0.65;
      break;

    case "breathing":
      calm01 = computeBreathingCalm(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      focus01 = computeGenericFocus(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      ) * 0.45;
      break;

    case "eyes_closed":
      calm01 = computeEyesClosedCalm(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      focus01 = computeGenericFocus(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      ) * 0.40;
      break;

    case "eyes_open":
      calm01 = computeGenericCalm(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      ) * 0.75;
      focus01 = computeEyesOpenFocus(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      break;

    case "task":
      calm01 = computeGenericCalm(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      ) * 0.55;
      focus01 = computeTaskFocus(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      break;

    default:
      calm01 = computeGenericCalm(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      focus01 = computeGenericFocus(
        aggregates,
        baseline,
        sqi,
        movementBurden,
        usableChannelFraction
      );
      break;
  }

  // Stronger artifact-aware penalty
  calm01 *= 1 - 0.45 * artifactPenalty;
  focus01 *= 1 - 0.45 * artifactPenalty;

  // Extra penalty for clearly poor signal
  if (sqi < 0.5) {
    calm01 *= 0.82;
    focus01 *= 0.82;
  }

  const confidenceBand = computeConfidenceBand(
    sqi,
    movementBurden,
    usableChannelFraction
  );

  const confidenceScore = computeConfidenceScore(
    sqi,
    movementBurden,
    usableChannelFraction,
    artifactPenalty
  );

  // Suppress but do not zero-out completely for low trust
  const scoreSuppressed = confidenceBand === "low";
  if (scoreSuppressed) {
    calm01 *= 0.9;
    focus01 *= 0.9;
  }

  return {
    calmScore: Math.round(100 * clamp01(calm01)),
    focusScore: Math.round(100 * clamp01(focus01)),
    confidenceScore,
    confidenceBand,
    scoreSuppressed,
    details: {
      stepKind,
      aggregates,
      baseline,
      deltas: {
        alphaRelDelta: deltaOrZero(aggregates.alphaRelMean, baseline?.alphaRelMean),
        betaRelDelta: deltaOrZero(aggregates.betaRelMean, baseline?.betaRelMean),
        thetaRelDelta: deltaOrZero(aggregates.thetaRelMean, baseline?.thetaRelMean),
        thetaBetaDelta: deltaOrZero(aggregates.thetaBetaMean, baseline?.thetaBetaMean),
        alphaThetaDelta: deltaOrZero(aggregates.alphaThetaMean, baseline?.alphaThetaMean),
      },
      sqi,
      movementBurden,
      usableChannelFraction,
      artifactPenalty,
      confidenceBand,
    },
  };
}