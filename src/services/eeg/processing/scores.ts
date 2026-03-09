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
}

export interface ScoreDetails {
  aggregates: AggregateFeatureSummary;
  sqi: number;
  movementBurden: number;
}

export interface ScoresResult {
  calmScore: number;
  focusScore: number;
  confidenceScore: number;
  details: ScoreDetails;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function safeMean(values: number[]): number {
  const valid = values.filter(v => Number.isFinite(v));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function safeMeanOrNull(values: number[]): number | null {
  const valid = values.filter(v => Number.isFinite(v));
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

function isCalmFavouredStep(step?: string): boolean {
  const s = (step ?? "").toLowerCase();
  return (
    s.includes("rest") ||
    s.includes("breath") ||
    s.includes("eyes_closed") ||
    s.includes("eyes closed") ||
    s.includes("calm")
  );
}

function isFocusFavouredStep(step?: string): boolean {
  const s = (step ?? "").toLowerCase();
  return (
    s.includes("subtract") ||
    s.includes("mental") ||
    s.includes("focus") ||
    s.includes("task") ||
    s.includes("attention")
  );
}

function computeConfidenceScore(sqi: number, movementBurden: number): number {
  const confidence01 =
    0.75 * clamp01(sqi) +
    0.25 * clamp01(1 - movementBurden);

  return Math.round(100 * clamp01(confidence01));
}

export function computeScores(inputs: ScoreInputs): ScoresResult {
  const sqi = clamp01(inputs.sqi ?? 0);
  const movementBurden = clamp01(inputs.movementBurden ?? 0);
  const aggregates = aggregateFeatures(inputs.perChannel);

  const alphaSupport = normRange(aggregates.alphaRelMean, 0.12, 0.42);
  const betaSupport = normRange(aggregates.betaRelMean, 0.08, 0.30);
  const thetaBetaInverse = invertNormRange(aggregates.thetaBetaMean, 1.0, 4.0);
  const alphaThetaSupport = normRange(aggregates.alphaThetaMean, 0.8, 2.5);
  const betaPenaltyInverse = invertNormRange(aggregates.betaRelMean, 0.08, 0.30);
  const alphaPenaltyInverse = invertNormRange(aggregates.alphaRelMean, 0.15, 0.45);
  const qualitySupport = sqi;
  const movementPenaltyInverse = 1 - movementBurden;

  let calm01 =
    0.38 * alphaSupport +
    0.18 * betaPenaltyInverse +
    0.16 * alphaThetaSupport +
    0.18 * qualitySupport +
    0.10 * movementPenaltyInverse;

  let focus01 =
    0.34 * betaSupport +
    0.28 * thetaBetaInverse +
    0.12 * alphaPenaltyInverse +
    0.16 * qualitySupport +
    0.10 * movementPenaltyInverse;

  if (isCalmFavouredStep(inputs.step)) calm01 += 0.05;
  if (isFocusFavouredStep(inputs.step)) focus01 += 0.05;

  if (movementBurden > 0.25) {
    calm01 -= 0.08;
    focus01 -= 0.08;
  }

  if (sqi < 0.45) {
    calm01 -= 0.10;
    focus01 -= 0.10;
  }

  return {
    calmScore: Math.round(100 * clamp01(calm01)),
    focusScore: Math.round(100 * clamp01(focus01)),
    confidenceScore: computeConfidenceScore(sqi, movementBurden),
    details: {
      aggregates,
      sqi,
      movementBurden,
    },
  };
}