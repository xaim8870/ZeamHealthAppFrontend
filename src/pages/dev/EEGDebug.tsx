import React, { useMemo, useState } from "react";
import { analyzeSession } from "@/services/eeg/processing/analyzeSession";
import { downloadJson } from "@/utils/download";

// ✅ Fixed test session (Neurosity first)
import neurositySession from "@/assets/sessions/EEG_on_Neurosity.json";

export default function EEGDebug() {
  // Precomputed report for bundled Neurosity file
  const bundledReport = useMemo(() => analyzeSession(neurositySession as any), []);

  // Store last uploaded analysis so we can download it too
  const [uploadedReport, setUploadedReport] = useState<any>(null);

  const stamp = () =>
    new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  const bundledSummary = useMemo(
    () => ({
      framesCount: bundledReport.framesCount,
      steps: bundledReport.results.map((x: any) => ({
        step: x.step,
        sqi: Number(x.sqi.toFixed(2)),
        skipped: x.skippedReason ?? null,
        gaps: x.quality.gapCount,
        gapMs: Math.round(x.quality.gapMsTotal),
        flat: x.quality.flatlineChannels?.length ?? 0,
        spikes: x.quality.spikeChannels?.length ?? 0,
        hasFeatures: !!x.features,
      })),
    }),
    [bundledReport]
  );

  const uploadedSummary = useMemo(() => {
    if (!uploadedReport) return null;
    return {
      framesCount: uploadedReport.framesCount,
      steps: uploadedReport.results.map((x: any) => ({
        step: x.step,
        sqi: Number(x.sqi.toFixed(2)),
        skipped: x.skippedReason ?? null,
        gaps: x.quality.gapCount,
        gapMs: Math.round(x.quality.gapMsTotal),
        flat: x.quality.flatlineChannels?.length ?? 0,
        spikes: x.quality.spikeChannels?.length ?? 0,
        hasFeatures: !!x.features,
      })),
    };
  }, [uploadedReport]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 md:mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-3xl">
            EEG Debug
          </h1>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Developer
          </span>
        </div>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Analyse bundled Neurosity sessions and uploaded JSON files. Export reports
          for QA, validation, and debugging.
        </p>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Bundled Neurosity card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Bundled Session
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Run analysis on the built-in Neurosity JSON file.
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
              Neurosity
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                console.log("ANALYSIS REPORT (BUNDLED NEUROSITY):", bundledReport);
                alert("Printed bundled Neurosity report in console");
              }}
            >
              Run analysis
            </button>

            <button
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.99] dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              onClick={() => {
                downloadJson(`EEG_analysis_neurosity_${stamp()}.json`, bundledReport);
              }}
            >
              Download report
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                Frames
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {bundledReport.framesCount}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-300">
                Steps
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                {bundledReport.results?.length ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Upload card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Upload Session JSON
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Upload a JSON session file. It will be analysed and the report will
                download automatically.
              </p>
            </div>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              Upload
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {/* Upload dropzone button */}
            <label className="group relative block cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-white/20 dark:bg-white/5 dark:hover:border-indigo-400/60 dark:hover:bg-indigo-500/10">
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const session = JSON.parse(await file.text());
                  const r = analyzeSession(session);

                  setUploadedReport(r);
                  console.log("UPLOADED REPORT:", r);

                  // ✅ Auto-download right after upload (optional)
                  downloadJson(
                    `EEG_analysis_${session?.meta?.device ?? "device"}_${stamp()}.json`,
                    r
                  );

                  alert("Uploaded session analyzed + report downloaded");
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
                    <span className="font-mono text-[11px]">
                      application/json
                    </span>
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
                Download last uploaded report
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
          </div>
        </div>
      </div>

      {/* Summaries */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Quick Summary
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Step-level SQI, gaps, spikes, flatlines and feature availability.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Bundled */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Bundled (Neurosity)
              </h3>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
                Precomputed
              </span>
            </div>
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-black p-3 text-xs leading-relaxed text-emerald-200 dark:border-white/10">
              {JSON.stringify(bundledSummary, null, 2)}
            </pre>
          </div>

          {/* Uploaded */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/20">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Last Uploaded
              </h3>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                {uploadedReport ? "Ready" : "Empty"}
              </span>
            </div>
            <pre className="max-h-[420px] overflow-auto rounded-xl border border-slate-200 bg-black p-3 text-xs leading-relaxed text-emerald-200 dark:border-white/10">
              {uploadedSummary ? JSON.stringify(uploadedSummary, null, 2) : "No uploaded session analyzed yet."}
            </pre>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        Tip: For Safari/iOS uploads, keep filenames simple and ensure the file is valid JSON.
      </div>
    </div>
  );
}