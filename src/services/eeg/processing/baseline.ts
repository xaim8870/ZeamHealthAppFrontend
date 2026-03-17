import type { ScoresStepKind } from "./scores";

export interface BaselineFeatureSummary {
  alphaRelMean: number;
  betaRelMean: number;
  thetaRelMean: number;
  deltaRelMean: number;
  gammaRelMean: number;
  thetaBetaMean: number;
  alphaThetaMean: number;
  pafMean: number | null;
}

export interface BaselineCandidate {
  step: string;
  kind: ScoresStepKind;
  sqi: number;
  movementBurden: number;
  features: BaselineFeatureSummary;
}

export interface SessionBaseline {
  sourceStep: string;
  kind: ScoresStepKind;
  features: BaselineFeatureSummary;
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

function averageFeatureSummaries(items: BaselineFeatureSummary[]): BaselineFeatureSummary {
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

function baselinePriority(kind: ScoresStepKind): number {
  switch (kind) {
    case "rest":
      return 1;
    case "eyes_closed":
      return 2;
    case "breathing":
      return 3;
    case "eyes_open":
      return 4;
    case "task":
      return 5;
    default:
      return 99;
  }
}

export function selectSessionBaseline(
  candidates: BaselineCandidate[]
): SessionBaseline | null {
  if (!candidates.length) return null;

  // Strong quality filter first
  const strong = candidates.filter(
    (c) => c.sqi >= 0.75 && c.movementBurden <= 0.12
  );

  const pool = strong.length ? strong : candidates;

  // Prefer rest / eyes_closed / breathing in that order
  const sorted = [...pool].sort((a, b) => {
    const pa = baselinePriority(a.kind);
    const pb = baselinePriority(b.kind);
    if (pa !== pb) return pa - pb;

    if (b.sqi !== a.sqi) return b.sqi - a.sqi;
    return a.movementBurden - b.movementBurden;
  });

  const bestKind = sorted[0].kind;

  // Average all good candidates of that same preferred kind
  const sameKind = sorted.filter((x) => x.kind === bestKind);

  return {
    sourceStep: sameKind.map((x) => x.step).join(", "),
    kind: bestKind,
    features: averageFeatureSummaries(sameKind.map((x) => x.features)),
  };
}