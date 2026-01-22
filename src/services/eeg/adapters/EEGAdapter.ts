// EEGAdapter.ts
export type DeviceType = "muse" | "muse-s" | "muse-2" | "muse-og" | "neurosity" | "unknown";
export type AdapterType = "web" | "web-muse" | "brainflow" | "web-bluetooth" | "muse-js" | "universal-muse";

export interface DeviceInfo {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer: string;
  channels: number;
  samplingRate: number;
  macAddress?: string;
}

export interface EEGFrame {
  device: DeviceType;
  adapter: AdapterType;
  channel: string;
  values: number[];
  ts: number;
  phase?: string;
  quality?: number[];
  battery?: number;
}

export interface EEGAdapter {
  connect(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<void>;
  onData(callback: (frame: EEGFrame) => void): () => void;
  isRunning(): boolean;
  getDeviceInfo?(): DeviceInfo;
}