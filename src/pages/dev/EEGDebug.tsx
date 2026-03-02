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

  return (
    <div style={{ padding: 16 }}>
      <h2>EEG Debug</h2>

      {/* ✅ Bundled Neurosity actions */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <button
          onClick={() => {
            console.log("ANALYSIS REPORT (BUNDLED NEUROSITY):", bundledReport);
            alert("Printed bundled Neurosity report in console");
          }}
        >
          Run analysis on bundled Neurosity JSON
        </button>

        <button
          onClick={() => {
            downloadJson(
              `EEG_analysis_neurosity_${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[:T]/g, "-")}.json`,
              bundledReport
            );
          }}
        >
          Download bundled report (JSON)
        </button>
      </div>

      {/* ✅ Upload + analyze + auto-save in state */}
      <div style={{ marginTop: 16 }}>
        <h3>Upload a session JSON</h3>

        <input
          type="file"
          accept="application/json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const session = JSON.parse(await file.text());
            const r = analyzeSession(session);

            setUploadedReport(r);
            console.log("UPLOADED REPORT:", r);

            // ✅ Auto-download right after upload (optional)
            downloadJson(
              `EEG_analysis_${session?.meta?.device ?? "device"}_${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[:T]/g, "-")}.json`,
              r
            );

            alert("Uploaded session analyzed + report downloaded");
          }}
        />
      </div>

      {/* ✅ Download last uploaded report */}
      <div style={{ marginTop: 12 }}>
        <button
          disabled={!uploadedReport}
          onClick={() => {
            if (!uploadedReport) return;
            downloadJson(
              `EEG_analysis_uploaded_${new Date()
                .toISOString()
                .slice(0, 19)
                .replace(/[:T]/g, "-")}.json`,
              uploadedReport
            );
          }}
        >
          Download last uploaded report (JSON)
        </button>
      </div>

      {/* ✅ Quick summary (bundled + uploaded) */}
      <div style={{ marginTop: 16 }}>
        <h3>Quick summary (Bundled Neurosity)</h3>
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          {JSON.stringify(
            {
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
            },
            null,
            2
          )}
        </pre>

        <h3 style={{ marginTop: 16 }}>Quick summary (Last Uploaded)</h3>
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
          }}
        >
          {uploadedReport
            ? JSON.stringify(
                {
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
                },
                null,
                2
              )
            : "No uploaded session analyzed yet."}
        </pre>
      </div>
    </div>
  );
}