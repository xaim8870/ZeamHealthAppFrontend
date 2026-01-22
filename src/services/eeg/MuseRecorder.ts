// museRecorder.ts
import type { EEGFrame, EEGAdapter } from "./adapters/EEGAdapter";

export class MuseRecorder {
  private adapter: EEGAdapter;
  private recordings: EEGFrame[] = [];
  private isRecording = false;
  
  constructor(adapter: EEGAdapter) {
    this.adapter = adapter;
    
    // Subscribe to EEG data
    this.adapter.onData((frame: EEGFrame) => {
      if (this.isRecording) {
        this.recordings.push(frame);
      }
    });
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
    await this.adapter.start();
  }
  
  async stop(): Promise<void> {
    await this.adapter.stop();
  }
  
  isRunning(): boolean {
    return this.adapter.isRunning();
  }
  
  // Add this method for DeviceContext compatibility
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