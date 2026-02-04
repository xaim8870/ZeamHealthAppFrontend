// museRecorder.ts
import type { EEGFrame, EEGAdapter } from "./adapters/EEGAdapter";

type Unsubscribe = () => void;

export class MuseRecorder {
  private adapter: EEGAdapter;
  private recordings: EEGFrame[] = [];
  private isRecording = false;

  constructor(adapter: EEGAdapter) {
    this.adapter = adapter;

    // Internal subscription ONLY for recording storage
    this.adapter.onData((frame: EEGFrame) => {
      if (this.isRecording) {
        this.recordings.push(frame);
      }
    });
  }

  // ✅ ADD THIS — REQUIRED BY useEEGRecorder
  onData(cb: (frame: EEGFrame) => void): Unsubscribe {
    return this.adapter.onData(cb);
  }

  startRecording(): void {
    this.recordings = [];
    this.isRecording = true;
    console.log("🎥 Started recording EEG data");
  }

  stopRecording(): EEGFrame[] {
    this.isRecording = false;
    console.log("🛑 Stopped recording. Captured", this.recordings.length, "frames");
    return [...this.recordings];
  }
  async start(): Promise<void> {
    if (!this.isRecording) {
      await this.adapter.start();
      this.isRecording = true;
      console.log("✅ MuseRecorder started");
    }
  }

  

  async stop(): Promise<void> {
    await this.adapter.stop();
  }

  isRunning(): boolean {
    return this.adapter.isRunning();
  }

  async stopStreaming(): Promise<void> {
    await this.stop();
  }

  getAdapter(): EEGAdapter {
    return this.adapter;
  }

  getRecordings(): EEGFrame[] {
    return [...this.recordings];
  }

  clearRecordings(): void {
    this.recordings = [];
  }
}
