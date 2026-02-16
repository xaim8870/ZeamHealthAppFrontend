// updated museRecorder.ts
import type { EEGFrame, EEGAdapter } from "./adapters/EEGAdapter";

type Unsubscribe = () => void;

export class MuseRecorder {
  private adapter: EEGAdapter;
  private recordings: EEGFrame[] = [];
  private isRecordingMode = false;
  private isStreaming = false;
  private subscribers: ((frame: EEGFrame) => void)[] = [];
  private unsubscribeFromAdapter: (() => void) | null = null;

  constructor(adapter: EEGAdapter) {
    console.log('🏗️ MuseRecorder constructor called');
    this.adapter = adapter;

    // Store reference to instance
    const self = this;
    
    this.unsubscribeFromAdapter = this.adapter.onData((frame: EEGFrame) => {
  // ✅ Only store frames when recording mode is ON
  if (this.isRecordingMode) {
    this.recordings.push(frame);

    if (this.recordings.length === 1) {
      console.log("✅ FIRST RECORDED FRAME:", {
        ts: frame.ts,
        values: frame.values.map(v => v.toFixed(1)),
        channels: frame.channel,
      });
    } else if (this.recordings.length % 256 === 0) {
      console.log(`📊 MuseRecorder recorded: ${this.recordings.length} frames`);
    }
  }

  // ✅ Always notify subscribers
  for (const cb of this.subscribers) {
    try { cb(frame); } catch (err) { console.error("❌ Subscriber error:", err); }
  }
});


    console.log('✅ MuseRecorder subscribed to adapter data');
  }

  /**
   * Subscribe to EEG data frames
   */
  onData(cb: (frame: EEGFrame) => void): Unsubscribe {
    console.log(`➕ Adding subscriber. Current subscribers: ${this.subscribers.length}`);
    this.subscribers.push(cb);
    console.log(`✅ Subscriber added. Total subscribers: ${this.subscribers.length}`);
    
    return () => {
      console.log(`➖ Removing subscriber. Before: ${this.subscribers.length}`);
      this.subscribers = this.subscribers.filter(fn => fn !== cb);
      console.log(`✅ Subscriber removed. After: ${this.subscribers.length}`);
    };
  }

  /**
   * Start recording mode for a new session
   * IMPORTANT: Does NOT clear recordings - use clearRecordings() separately if needed
   */
  startRecording(): void {
  console.log('🎥 MuseRecorder.startRecording() called');
  console.log(`   Current frames: ${this.recordings.length}`);
  
  // ✅ ABSOLUTELY NO CLEARING HERE!
  this.isRecordingMode = true;
  console.log("🎥 Muse recording mode STARTED");
}

// ✅ Keep clearRecordings as a SEPARATE method for explicit use
clearRecordings(): void {
  console.log(`🧹 Muse recordings cleared. Was: ${this.recordings.length} frames`);
  this.recordings = [];
}

  /**
   * Stop recording mode and return captured frames
   */
  stopRecording(): EEGFrame[] {
    this.isRecordingMode = false;
    console.log("🛑 Muse recording mode STOPPED - captured", this.recordings.length, "frames");
    return [...this.recordings];
  }

  /**
   * Start the EEG stream (calls adapter.start())
   */
  async start(): Promise<void> {
    console.log('▶️ MuseRecorder.start() called');
    console.log(`   isStreaming: ${this.isStreaming}`);
    console.log(`   adapter.isRunning: ${this.adapter.isRunning()}`);
    
    if (!this.isStreaming) {
      console.log('   Calling adapter.start()...');
      await this.adapter.start();
      this.isStreaming = true;
      console.log("✅ Muse streaming STARTED");
    } else {
      console.log('   Already streaming, skipping');
    }
  }

  /**
   * Stop the EEG stream (calls adapter.stop())
   */
  async stop(): Promise<void> {
    console.log('⏹️ MuseRecorder.stop() called');
    
    if (this.unsubscribeFromAdapter) {
      console.log('   Unsubscribing from adapter');
      this.unsubscribeFromAdapter();
      this.unsubscribeFromAdapter = null;
    }
    
    await this.adapter.stop();
    this.isStreaming = false;
    console.log("🛑 Muse streaming STOPPED");
  }

  /**
   * Check if adapter is running
   */
  isRunning(): boolean {
    return this.adapter.isRunning();
  }

  /**
   * Alias for stop()
   */
  async stopStreaming(): Promise<void> {
    await this.stop();
  }

  /**
   * Get the underlying adapter
   */
  getAdapter(): EEGAdapter {
    return this.adapter;
  }

  /**
   * Get all recorded frames
   */
  getRecordings(): EEGFrame[] {
    console.log(`📊 MuseRecorder.getRecordings(): ${this.recordings.length} frames`);
    return [...this.recordings];
  }
  getRecordingCount(): number {
    return this.recordings.length;
  }

  getLatestFrame(): EEGFrame | null {
    return this.recordings.length ? this.recordings[this.recordings.length - 1] : null;
  }

  /**
   * Explicitly clear all recordings
   * Use this ONLY when starting a new session
   
  clearRecordings(): void {
    console.log(`🧹 Muse recordings cleared. Was: ${this.recordings.length} frames`);
    this.recordings = [];
  } */
}