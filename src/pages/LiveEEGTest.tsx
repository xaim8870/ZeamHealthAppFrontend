import React, { useEffect, useMemo, useRef, useState } from "react";
import { LiveMetricsEngine, type LiveMetricsResult } from "@/services/eeg/realtime/liveMetricsEngine";
import { FakeEEGGenerator } from "@/services/eeg/realtime/fakeEEG";

const CHANNELS = ["CP3", "C3", "F5", "PO3", "PO4", "F6", "C4", "CP4"];
const FS = 256;

function scoreTone(score?: number | null) {
  if (score == null) return "text-slate-400";
  if (score >= 75) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function scoreBg(score?: number | null) {
  if (score == null) return "bg-slate-100 dark:bg-white/5";
  if (score >= 75) return "bg-emerald-50 dark:bg-emerald-500/10";
  if (score >= 50) return "bg-amber-50 dark:bg-amber-500/10";
  return "bg-rose-50 dark:bg-rose-500/10";
}

export default function LiveEEGTest() {
  const engineRef = useRef<LiveMetricsEngine | null>(null);
  const generatorRef = useRef<FakeEEGGenerator | null>(null);
  const timerRef = useRef<number | null>(null);

  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"baseline" | "calm" | "focus" | "noisy">("baseline");
  const [result, setResult] = useState<LiveMetricsResult | null>(null);
  const [sampleCounter, setSampleCounter] = useState(0);

  const samplesPerTick = 16; // 16 samples every ~62.5ms => ~256 Hz

  const statusText = useMemo(() => {
    if (!result) return "Waiting to start";
    if (!result.baselineReady) return "Collecting baseline";
    return "Live metrics running";
  }, [result]);

  const baselineProgressPct = Math.round((result?.debug?.baselineProgress01 ?? 0) * 100);

  useEffect(() => {
    engineRef.current = new LiveMetricsEngine({
      channels: CHANNELS,
      samplingRate: FS,
      bufferSeconds: 8,
      analysisWindowMs: 6000,
      baselineRequiredMs: 20000,
    });

    generatorRef.current = new FakeEEGGenerator({
      channels: CHANNELS,
      samplingRate: FS,
      alphaHz: 10,
      betaHz: 20,
      noiseLevel: 3,
      baseAmplitude: 18,
    });

    return () => {
      if (timerRef.current != null) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const g = generatorRef.current;
    if (g) g.setMode(mode);
  }, [mode]);

  const start = () => {
    if (running) return;

    setRunning(true);

    let ts = Date.now();

    timerRef.current = window.setInterval(() => {
      const engine = engineRef.current;
      const gen = generatorRef.current;
      if (!engine || !gen) return;

      const batch = [];
      for (let i = 0; i < samplesPerTick; i++) {
        ts += Math.round(1000 / FS);
        batch.push(gen.nextSample(ts));
      }

      const out = engine.appendBatch(batch);
      setSampleCounter((c) => c + batch.length);

      if (out) {
        setResult(out);
      }
    }, 1000 * (samplesPerTick / FS));
  };

  const stop = () => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRunning(false);
  };

  const resetAll = () => {
    stop();
    engineRef.current?.reset();
    setResult(null);
    setSampleCounter(0);
    setMode("baseline");
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
          Live EEG Runtime Test
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          This page simulates live EEG on the client and feeds it into your runtime
          engine. It first collects a baseline, then starts producing live Calm,
          Focus, Confidence, and movement metrics.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={start}
            disabled={running}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Start
          </button>

          <button
            onClick={stop}
            disabled={!running}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Stop
          </button>

          <button
            onClick={resetAll}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
          >
            Reset
          </button>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode("baseline")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                mode === "baseline"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Baseline
            </button>

            <button
              onClick={() => setMode("calm")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                mode === "calm"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Calm
            </button>

            <button
              onClick={() => setMode("focus")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                mode === "focus"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Focus
            </button>

            <button
              onClick={() => setMode("noisy")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                mode === "noisy"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "border border-slate-200 bg-white text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white"
              }`}
            >
              Noisy
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Status</div>
            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {statusText}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Mode</div>
            <div className="mt-1 text-lg font-semibold capitalize text-slate-900 dark:text-white">
              {mode}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Samples fed</div>
            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {sampleCounter}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Phase</div>
            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
              {result?.phase ?? "idle"}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              Baseline Progress
            </div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              {baselineProgressPct}%
            </div>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-slate-900 transition-all dark:bg-white"
              style={{ width: `${baselineProgressPct}%` }}
            />
          </div>

          <div className="mt-2 text-xs text-slate-500 dark:text-slate-300">
            Accepted windows: {result?.debug?.baselineAcceptedWindows ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className={`rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-white/10 ${scoreBg(result?.calmScore)}`}>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Calm</div>
          <div className={`mt-2 text-3xl font-bold ${scoreTone(result?.calmScore)}`}>
            {result?.calmScore ?? "—"}
          </div>
        </div>

        <div className={`rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-white/10 ${scoreBg(result?.focusScore)}`}>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Focus</div>
          <div className={`mt-2 text-3xl font-bold ${scoreTone(result?.focusScore)}`}>
            {result?.focusScore ?? "—"}
          </div>
        </div>

        <div className={`rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-white/10 ${scoreBg(result?.confidenceScore)}`}>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Confidence</div>
          <div className={`mt-2 text-3xl font-bold ${scoreTone(result?.confidenceScore)}`}>
            {result?.confidenceScore ?? "—"}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300">
            {result?.confidenceBand ?? "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Movement Events</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {result?.movementEvents ?? "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-300">Movement Burden</div>
          <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {result?.movementBurden != null
              ? result.movementBurden.toFixed(3)
              : "—"}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 text-base font-semibold text-slate-900 dark:text-white">
          Debug JSON
        </div>
        <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-black p-3 text-xs leading-relaxed text-emerald-200 dark:border-white/10">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Suggested test flow: Start in baseline mode for ~20 seconds, then switch to Calm,
        then Focus, then Noisy and observe how the runtime scores respond.
      </div>
    </div>
  );
}