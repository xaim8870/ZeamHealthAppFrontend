import { MuseClient } from "@/services/muse/museClient";

export class MuseRecorder {
  muse = new MuseClient();
  callbacks: ((data: any) => void)[] = [];

  async start() {
    await this.muse.connect();
    await this.muse.startEEG((channel, values) => {
      this.callbacks.forEach(cb =>
        cb({ device: "muse", channel, values, ts: Date.now() })
      );
    });
  }

  stop() {
    this.muse.disconnect();
  }

  onData(cb: (data: any) => void) {
    this.callbacks.push(cb);
  }
}
