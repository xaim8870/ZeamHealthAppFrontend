// src/services/eeg/adapters/EEGAdapter.ts
export type EEGFrame = {
  device: "muse" | "muse-s" | "neurosity";  // ✅ Added "muse-s"
  adapter: "web" | "web-muse" | "brainflow"; // ✅ Added "web-muse"
  channel: string;
  values: number[];
  ts: number;
  phase?: string;
};
