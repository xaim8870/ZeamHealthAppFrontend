export type EEGFrame = {
  device: "muse" | "muse-s" | "neurosity";
  adapter: "web" | "web-muse" | "brainflow" | "web-bluetooth"; // ✅ Remove musejs
  channel: string;
  values: number[];
  ts: number;
  phase?: string;
};