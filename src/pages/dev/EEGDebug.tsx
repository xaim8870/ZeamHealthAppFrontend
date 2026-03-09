import React, { useMemo, useState } from "react";
import { analyzeSession } from "@/services/eeg/processing/analyzeSession";
import { downloadJson } from "@/utils/download";

type UploadedMeta = {
  filename: string;
  device: string;
  uploadedAt: string;
};

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

function sqiTone(sqi?: number) {
  if (sqi == null) return "text-slate-400";
  if (sqi >= 0.8) return "text-emerald-600 dark:text-emerald-400";
  if (sqi >= 0.6) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

function sqiBadge(sqi?: number) {
  if (sqi == null) return "Unknown";
  if (sqi >= 0.8) return "Good";
  if (sqi >= 0.6) return "Usable";
  return "Poor";
}

export default function EEGDebug() {
  const [uploadedReport, setUploadedReport] = useState<any>(null);
  const [uploadedMeta, setUploadedMeta] = useState<UploadedMeta | null>(null);

  const stamp = () =>
    new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const uploadedSummary = useMemo(() => {
    if (!uploadedReport) return null;

    return {
      framesCount: uploadedReport.framesCount,
      steps: uploadedReport.results.map((x: any) => ({
        step: x.step,
        sqi: Number((x.sqi ?? 0).toFixed(2)),
        skipped: x.skippedReason ?? null,
        gaps: x.quality?.gapCount ?? 0,
        gapMs: Math.round(x.quality?.gapMsTotal ?? 0),
        flat: x.quality?.flatlineChannels?.length ?? 0,
        spikes: x.quality?.spikeChannels?.length ?? 0,
        movementEvents: x.movement?.eventCount ?? 0,
        movementBurden: Number((x.movement?.burden ?? 0).toFixed(3)),
        calmScore: x.scores?.calmScore ?? null,
        focusScore: x.scores?.focusScore ?? null,
        confidenceScore: x.scores?.confidenceScore ?? null,
        hasFeatures: !!x.features,
      })),
    };
  }, [uploadedReport]);

  const stepCards = useMemo(() => {
    if (!uploadedReport?.results) return [];
    return uploadedReport.results.map((x: any, index: number) => ({
      id: `${x.step}-${index}`,
      step: x.step,
      start: x.start,
      end: x.end,
      sqi: x.sqi ?? 0,
      skippedReason: x.skippedReason ?? null,
      calmScore: x.scores?.calmScore ?? null,
      focusScore: x.scores?.focusScore ?? null,
      confidenceScore: x.scores?.confidenceScore ?? null,
      movementEvents: x.movement?.eventCount ?? 0,
      movementBurden: x.movement?.burden ?? 0,
      gaps: x.quality?.gapCount ?? 0,
      gapMs: Math.round(x.quality?.gapMsTotal ?? 0),
      flat: x.quality?.flatlineChannels?.length ?? 0,
      spikes: x.quality?.spikeChannels?.length ?? 0,
      hasFeatures: !!x.features,
    }));
  }, [uploadedReport]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            EEG Debug
          </h1>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Upload-only
          </span>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Upload a session JSON file. It will be analysed, results will appear on
          screen, and the report will download automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Upload Session JSON
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Choose a JSON file exported from Muse, Neurosity, or your own pipeline.
            </p>
          </div>

          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Upload
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <label className="group relative block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-white/20 dark:bg-white/5 dark:hover:border-indigo-400/60 dark:hover:bg-indigo-500/10">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  const raw = await file.text();
                  const session = JSON.parse(raw);

                  const r = analyzeSession(session);

                  setUploadedReport(r);
                  setUploadedMeta({
                    filename: file.name,
                    device: session?.meta?.device ?? "device",
                    uploadedAt: new Date().toLocaleString(),
                  });

                  console.log("UPLOADED REPORT:", r);

                  downloadJson(
                    `EEG_analysis_${session?.meta?.device ?? "device"}_${stamp()}.json`,
                    r
                  );
                } catch (err) {
                  console.error("Upload/parse/analyse error:", err);
                  alert("Failed to read or analyse the JSON file. Please upload a valid session JSON.");
                } finally {
                  e.currentTarget.value = "";
                }
              }}
            />

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:ring-indigo-200 dark:bg-white/10 dark:ring-white/10 dark:group-hover:ring-indigo-400/30">
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-slate-700 dark:text-slate-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 16V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M20 16.5a4.5 4.5 0 0 0-3.5-4.4" />
                  <path d="M4 16.5A4.5 4.5 0 0 1 7.5 12" />
                  <path d="M4 20h16" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Click to upload{" "}
                  <span className="font-medium text-slate-500 dark:text-slate-300">
                    (JSON)
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                  Accepted format:{" "}
                  <span className="font-mono text-[11px]">application/json</span>
                </div>
              </div>
            </div>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              disabled={!uploadedReport}
              onClick={() => {
                if (!uploadedReport) return;
                downloadJson(`EEG_analysis_uploaded_${stamp()}.json`, uploadedReport);
              }}
            >
              Download last report
            </button>

            <button
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              disabled={!uploadedReport}
              onClick={() => {
                setUploadedReport(null);
                setUploadedMeta(null);
              }}
            >
              Clear
            </button>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <span
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  uploadedReport ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20",
                ].join(" ")}
              />
              {uploadedReport ? "Uploaded session analysed" : "No uploaded session yet"}
            </div>
          </div>

          {uploadedMeta && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-black/20 dark:text-slate-200">
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                    File
                  </div>
                  <div className="mt-0.5 break-all font-semibold">
                    {uploadedMeta.filename}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                    Device
                  </div>
                  <div className="mt-0.5 font-semibold">{uploadedMeta.device}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                    Uploaded
                  </div>
                  <div className="mt-0.5 font-semibold">{uploadedMeta.uploadedAt}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Results
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Step-level quality, movement, calm, focus, confidence and feature availability.
          </p>
        </div>

        {!uploadedReport ? (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-700 dark:border-white/20 dark:bg-white/5 dark:text-slate-200">
            Upload a session JSON to see analysis results here. The report will also
            download automatically after analysis.
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Overview
                </h3>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                      Frames
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {uploadedReport.framesCount}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                      Steps
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                      {uploadedReport.results?.length ?? 0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Quick Summary (JSON)
                  </h3>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    Ready
                  </span>
                </div>

                <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-black p-3 text-xs leading-relaxed text-emerald-200 dark:border-white/10">
                  {JSON.stringify(uploadedSummary, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Step Cards
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-300">
                  Calm, focus, confidence and movement per window
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {stepCards.map((step: any) => (
                  <div
                    key={step.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-black/20"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold capitalize text-slate-900 dark:text-white">
                          {step.step}
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
                          {Number(step.start).toFixed(2)}s → {Number(step.end).toFixed(2)}s
                        </p>
                      </div>

                      <div
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          step.sqi >= 0.8
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : step.sqi >= 0.6
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                            : "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
                        ].join(" ")}
                      >
                        SQI {Number(step.sqi).toFixed(2)} · {sqiBadge(step.sqi)}
                      </div>
                    </div>

                    {step.skippedReason && (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                        {step.skippedReason}
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className={`rounded-xl border border-slate-200 p-3 dark:border-white/10 ${scoreBg(step.calmScore)}`}>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Calm
                        </div>
                        <div className={`mt-1 text-xl font-bold ${scoreTone(step.calmScore)}`}>
                          {step.calmScore ?? "—"}
                        </div>
                      </div>

                      <div className={`rounded-xl border border-slate-200 p-3 dark:border-white/10 ${scoreBg(step.focusScore)}`}>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Focus
                        </div>
                        <div className={`mt-1 text-xl font-bold ${scoreTone(step.focusScore)}`}>
                          {step.focusScore ?? "—"}
                        </div>
                      </div>

                      <div className={`rounded-xl border border-slate-200 p-3 dark:border-white/10 ${scoreBg(step.confidenceScore)}`}>
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Confidence
                        </div>
                        <div className={`mt-1 text-xl font-bold ${scoreTone(step.confidenceScore)}`}>
                          {step.confidenceScore ?? "—"}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Movement Events
                        </div>
                        <div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                          {step.movementEvents}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Movement Burden
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {Number(step.movementBurden).toFixed(3)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Gaps
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {step.gaps}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Gap Time
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {step.gapMs} ms
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Flat Channels
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {step.flat}
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                        <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                          Spike Channels
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                          {step.spikes}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5">
                      <span className="text-slate-600 dark:text-slate-300">
                        Feature extraction
                      </span>
                      <span
                        className={[
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          step.hasFeatures
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                        ].join(" ")}
                      >
                        {step.hasFeatures ? "Available" : "Not available"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Tip: test first with a clean resting or breathing session, then compare against a noisier file to verify movement detection and confidence behaviour.
      </div>
    </div>
  );
}