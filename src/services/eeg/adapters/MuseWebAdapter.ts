import * as WebMuse from "web-muse";
import type { EEGFrame } from "./EEGAdapter";

export class MuseWebAdapter {
  private connected = false;
  private running = false;
  private callbacks: ((f: EEGFrame) => void)[] = [];

  async connect() {
    if (this.connected) {
      console.warn("[Muse S] Already connected");
      return;
    }

    console.log("[web-muse module exports]:", WebMuse);

    // 🔥 Try the ONLY function we KNOW exists: connect
    if (typeof (WebMuse as any).connect !== "function") {
      throw new Error("web-muse: connect() not found");
    }

    console.log("[Muse S BBA3] Opening Bluetooth chooser…");
    await (WebMuse as any).connect();

    this.connected = true;
    console.log("[Muse S BBA3] Connected!");
  }

  async start() {
    if (!this.connected) {
      throw new Error("[Muse S] start() called before connect()");
    }
    if (this.running) return;

    this.running = true;

    // start EEG if available
    if (typeof (WebMuse as any).startEEG === "function") {
      await (WebMuse as any).startEEG();
    }

    // subscribe if available
    if (typeof (WebMuse as any).subscribeEEG === "function") {
      (WebMuse as any).subscribeEEG((data: any) => {
        if (!this.running) return;

        const frame: EEGFrame = {
          device: "muse",
          adapter: "web-muse",
          ts: Date.now(),
          channel: data.channel ?? "TP9",
          values: data.samples ?? [],
        };

        this.callbacks.forEach((cb) => cb(frame));
      });
    } else {
      console.warn("[web-muse] No EEG subscription API found");
    }
  }

  stop() {
    this.running = false;
    this.connected = false;

    if (typeof (WebMuse as any).stopEEG === "function") {
      try {
        (WebMuse as any).stopEEG();
      } catch {
        /* ignore */
      }
    }
  }

  onData(cb: (f: EEGFrame) => void) {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((x) => x !== cb);
    };
  }
}
