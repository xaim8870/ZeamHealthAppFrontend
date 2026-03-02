// src/services/eeg/processing/normalizeSession.ts
import { CanonicalFrame } from "./types";
import { museRecordToFrames } from "./normalizeMuse";
import { neurosityRecordToFrames } from "./normalizeNeurosity";

export function sessionToFrames(session: any): CanonicalFrame[] {
  const frames: CanonicalFrame[] = [];
  for (const rec of (session.records ?? [])) {
    if (rec.device === "muse") frames.push(...museRecordToFrames(rec));
    else if (rec.device === "neurosity") frames.push(...neurosityRecordToFrames(rec));
  }
  // sort by timestamp
  frames.sort((a, b) => a.ts - b.ts);
  return frames;
}