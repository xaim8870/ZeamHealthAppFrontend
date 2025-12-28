export type EEGDeviceType = "neurosity" | "muse";

export interface EEGChannelData {
  [channel: string]: number[]; // e.g. TP9 → [samples]
}

export interface EEGFrame {
  device: EEGDeviceType;
  timestamp: number;
  samplingRate: number;
  channels: EEGChannelData;
}
