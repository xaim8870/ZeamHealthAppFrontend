import { MuseWebAdapter } from "./adapters/MuseWebAdapter";
import type { EEGFrame } from "./adapters/EEGAdapter";

export class MuseRecorder {
  private buffer: EEGFrame[] = [];
  private unsub: (() => void) | null = null;

  constructor(private adapter: MuseWebAdapter) {}

  async start() {
    await this.adapter.start();

    this.unsub = this.adapter.onData((frame) => {
      this.buffer.push(frame);
    });
  }

  stop() {
    this.unsub?.();
    this.unsub = null;
    this.adapter.stop();
  }

  onData(cb: (f: EEGFrame) => void) {
    return this.adapter.onData(cb);
  }

  getData() {
    return {
      device: "muse",
      frames: this.buffer,
      totalFrames: this.buffer.length,
    };
  }
}
