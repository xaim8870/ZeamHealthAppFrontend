import type { EEGFrame, EEGAdapter, DeviceInfo } from "./EEGAdapter";

export class UniversalMuseAdapter implements EEGAdapter {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;

  private eegChar: BluetoothRemoteGATTCharacteristic | null = null;
  private controlChar: BluetoothRemoteGATTCharacteristic | null = null;

  private eegHandler?: (event: Event) => void;
  private controlHandler?: (event: Event) => void;

  private callbacks: ((f: EEGFrame) => void)[] = [];

  private running = false; // becomes true only after real frames parsed
  private wantAutoReconnect = false;
  private reconnecting = false;
  private readonly MAX_RECONNECT = 5;

  private packetCount = 0;

  // first-frame gate (so start() resolves only when real EEG frames flow)
  private awaitingFirstFrame = false;
  private firstFrameResolve: (() => void) | null = null;
  private firstFrameTimer: number | null = null;

  private deviceInfo: DeviceInfo = {
    id: "",
    name: "Unknown Muse",
    type: "unknown",
    manufacturer: "Interaxon",
    channels: 4,
    samplingRate: 256,
  };

  private readonly MUSE_SERVICE_UUID = "0000fe8d-0000-1000-8000-00805f9b34fb";
  private readonly CONTROL_UUID = "273e0001-4c4d-454d-96be-f03bac821358";
  private readonly EEG_COMBINED_UUID = "273e0013-4c4d-454d-96be-f03bac821358";
  private readonly EEG_TP9_UUID = "273e0003-4c4d-454d-96be-f03bac821358";

  async connect(): Promise<boolean> {
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth not supported. Use Chrome/Edge on desktop.");
    }

    console.log("🚀 Starting Muse device connection...");

    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "Muse" }],
      optionalServices: [this.MUSE_SERVICE_UUID],
    });

    if (!this.device) throw new Error("No device selected");
    if (!this.device.gatt) throw new Error("Device doesn't support GATT");

    console.log(`✅ Device selected: ${this.device.name}`);
    console.log(`📱 Device ID: ${this.device.id}`);

    // stable listener
    this.device.addEventListener("gattserverdisconnected", this.onDisconnected);

    this.deviceInfo.id = this.device.id;
    this.deviceInfo.name = this.device.name || "Unknown Muse";

    if (this.device.name?.includes("MuseS") || this.device.name?.includes("BBA3")) {
      this.deviceInfo.type = "muse-s";
      this.deviceInfo.channels = 4;
      this.deviceInfo.samplingRate = 256;
    }

    console.log("🔗 Connecting to GATT...");
    this.server = await this.device.gatt.connect();
    console.log("✅ GATT Server connected");

    await this.refreshCharacteristics();

    console.log("✅ Connection complete");
    return true;
  }

  private onDisconnected = () => {
    console.log("🔌 Device disconnected");
    this.running = false;
    this.server = null;

    if (this.wantAutoReconnect) {
      void this.tryReconnect();
    }
  };

  private async refreshCharacteristics(): Promise<void> {
    if (!this.server?.connected) throw new Error("GATT not connected");

    console.log("🔍 Getting service...");
    const service = await this.server.getPrimaryService(this.MUSE_SERVICE_UUID);
    console.log("✅ Service found");

    console.log("🔍 Getting characteristics...");
    const characteristics = await service.getCharacteristics();
    console.log(`📋 Found ${characteristics.length} characteristics`);

    this.eegChar = null;
    this.controlChar = null;

    for (const char of characteristics) {
      const uuid = char.uuid.toLowerCase();
      const props = this.getCharacteristicProperties(char);
      console.log(`   ${uuid} (${props.join(", ")})`);

      if (uuid === this.CONTROL_UUID) {
        this.controlChar = char;
        console.log("✅ Found Control characteristic");
      }

      if (uuid === this.EEG_COMBINED_UUID) {
        this.eegChar = char;
        console.log("✅ Found EEG characteristic (273e0013)");
      }

      // fallback only if combined not present
      if (!this.eegChar && uuid === this.EEG_TP9_UUID) {
        this.eegChar = char;
        console.log("✅ Found EEG fallback (273e0003)");
      }
    }

    if (!this.controlChar) throw new Error("Control characteristic not found");
    if (!this.eegChar) throw new Error("No EEG characteristic found (273e0013 / 273e0003)");
  }

  private getCharacteristicProperties(char: BluetoothRemoteGATTCharacteristic): string[] {
    const props: string[] = [];
    if (char.properties.read) props.push("read");
    if (char.properties.write) props.push("write");
    if (char.properties.writeWithoutResponse) props.push("writeWithoutResponse");
    if (char.properties.notify) props.push("notify");
    if (char.properties.indicate) props.push("indicate");
    return props;
  }

  private sleep(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }

  // Muse control command encoder: [len][ascii...]['\n']
  private encodeCommand(cmd: string): Uint8Array {
    const text = cmd.endsWith("\n") ? cmd : `${cmd}\n`;
    const len = text.length; // includes newline
    const out = new Uint8Array(1 + len);
    out[0] = len;
    for (let i = 0; i < len; i++) out[i + 1] = text.charCodeAt(i);
    return out;
  }

  // ✅ Force true ArrayBuffer (avoids SharedArrayBuffer typing problems)
  private toArrayBuffer(u8: Uint8Array): ArrayBuffer {
    const ab = new ArrayBuffer(u8.byteLength);
    new Uint8Array(ab).set(u8);
    return ab;
  }

  private async writeControlBytes(cmdBytes: Uint8Array): Promise<void> {
    if (!this.controlChar) throw new Error("No control characteristic");

    const buffer = this.toArrayBuffer(cmdBytes);

    const c: any = this.controlChar;
    if (typeof c.writeValueWithoutResponse === "function") {
      await c.writeValueWithoutResponse(buffer);
    } else {
      await this.controlChar.writeValue(buffer);
    }
  }

  private waitForFirstFrame(timeoutMs: number): Promise<void> {
    this.awaitingFirstFrame = true;

    if (this.firstFrameTimer) window.clearTimeout(this.firstFrameTimer);
    this.firstFrameTimer = null;

    return new Promise<void>((resolve, reject) => {
      this.firstFrameResolve = () => {
        this.awaitingFirstFrame = false;
        this.firstFrameResolve = null;
        if (this.firstFrameTimer) window.clearTimeout(this.firstFrameTimer);
        this.firstFrameTimer = null;
        resolve();
      };

      this.firstFrameTimer = window.setTimeout(() => {
        this.awaitingFirstFrame = false;
        this.firstFrameResolve = null;
        this.firstFrameTimer = null;
        reject(new Error("No EEG frames parsed (first frame timeout)"));
      }, timeoutMs);
    });
  }

  async start(): Promise<void> {
    if (!this.eegChar) throw new Error("Not connected");
    if (!this.controlChar) throw new Error("No control characteristic");
    if (!this.server?.connected) throw new Error("GATT not connected");

    console.log("🎵 Starting EEG stream...");

    this.wantAutoReconnect = true;
    this.packetCount = 0;
    this.running = false;

    // cleanup old handlers
    try {
      await this.eegChar.stopNotifications();
    } catch {}
    if (this.eegHandler) {
      try {
        this.eegChar.removeEventListener("characteristicvaluechanged", this.eegHandler);
      } catch {}
      this.eegHandler = undefined;
    }

    try {
      await this.controlChar.stopNotifications();
    } catch {}
    if (this.controlHandler) {
      try {
        this.controlChar.removeEventListener("characteristicvaluechanged", this.controlHandler);
      } catch {}
      this.controlHandler = undefined;
    }

    // attach EEG handler FIRST
    this.eegHandler = (event: Event) => {
      this.packetCount++;

      const ch = event.target as BluetoothRemoteGATTCharacteristic;
      const dv = ch.value;
      if (!dv) return;

      const u8 = new Uint8Array(dv.buffer, dv.byteOffset, dv.byteLength);

      // optional raw debug
      if (this.packetCount <= 5 || this.packetCount % 200 === 0) {
        const head = Array.from(u8.slice(0, 18))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(" ");
        console.log(`📦 EEG RAW #${this.packetCount}: len=${u8.length} head=${head}`);
      }

      // parse frames (works even while running=false)
      const frames = this.parseCombinedEegPacket(u8);

      // If parsing succeeds, that means EEG is truly flowing
      if (frames.length > 0) {
        if (!this.running) {
          this.running = true;
          if (this.awaitingFirstFrame && this.firstFrameResolve) this.firstFrameResolve();
        }

        const baseTs = Date.now();
        const dt = 1000 / this.deviceInfo.samplingRate;
        const total = frames.length;

        for (let i = 0; i < total; i++) {
          const values = frames[i];
          const ts = baseTs - (total - 1 - i) * dt;

          const frame: EEGFrame = {
            device: this.deviceInfo.type,
            adapter: "web-bluetooth",
            ts,
            channel: "TP9,AF7,AF8,TP10",
            values,
            quality: values.map((v) => (Number.isFinite(v) && Math.abs(v) < 2000 ? 1 : 0)),
          };

          for (const cb of this.callbacks) {
            try {
              cb(frame);
            } catch {}
          }
        }
      }
    };

    this.eegChar.addEventListener("characteristicvaluechanged", this.eegHandler);
    console.log("👂 Data handler attached");

    // control notify handler (quiet)
    this.controlHandler = (event: Event) => {
      // keep silent by default
      void event;
    };
    this.controlChar.addEventListener("characteristicvaluechanged", this.controlHandler);

    // enable notifications with retry
    console.log("🔔 Enabling notifications...");
    await this.enableNotificationsWithRetry(this.eegChar, 4, 250);
    await this.enableNotificationsWithRetry(this.controlChar, 4, 250);
    console.log("✅ Notifications enabled");

    // Init sequences (Muse S often needs these)
    const sequences: { name: string; cmds: string[] }[] = [
      { name: "legacy_p21_d", cmds: ["v6", "p21", "s", "d"] },
      { name: "legacy_p20_d", cmds: ["v6", "p20", "s", "d"] },
      { name: "museS_dc001_basic", cmds: ["v6", "s", "dc001", "L1"] },
      { name: "museS_sleep_p1034_1035", cmds: ["v6", "p1034", "p1035", "s", "dc001", "L1"] },
    ];

    let lastErr: any = null;

    for (const seq of sequences) {
      try {
        console.log(`📡 Initializing Muse (${seq.name})...`);

        const firstFrame = this.waitForFirstFrame(2500);

        for (const cmd of seq.cmds) {
          const bytes = this.encodeCommand(cmd);
          await this.writeControlBytes(bytes);

          // show like your “✅ 02 73 0a” logs
          console.log(
            `   ✅ ${Array.from(bytes)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(" ")}`
          );

          await this.sleep(120);
        }

        await firstFrame;

        console.log("🎉 EEG streaming ready!");
        return;
      } catch (e) {
        lastErr = e;
        console.warn(`⚠️ Init sequence failed (${seq.name}):`, e);
        this.running = false;
        await this.sleep(250);
      }
    }

    console.error("❌ Could not start EEG streaming with any init sequence:", lastErr);
    throw lastErr ?? new Error("Failed to start Muse EEG stream");
  }

  private async enableNotificationsWithRetry(
    ch: BluetoothRemoteGATTCharacteristic,
    tries: number,
    delayMs: number
  ) {
    let lastErr: any = null;
    for (let i = 0; i < tries; i++) {
      try {
        await ch.startNotifications();
        return;
      } catch (e) {
        lastErr = e;
        await this.sleep(delayMs);
      }
    }
    throw lastErr ?? new Error("startNotifications failed");
  }

  /**
   * ✅ Parses Muse-S “combined” big packets (like 223/236 bytes).
   * Strategy:
   * - scan for 74-byte blocks
   * - each block: [2 bytes seq][(18 bytes × 4 channels)] => 12 samples/channel
   * - emit 12 EEG frames per valid block
   */
  private parseCombinedEegPacket(buf: Uint8Array): number[][] {
    const BLOCK = 74;          // 2 + 18*4
    const CH_BYTES = 18;       // 12 samples @ 12-bit packed
    const SAMPLES_PER_BLOCK = 12;

    if (buf.length < BLOCK) return [];

    // score an offset by "how plausible" decoded EEG looks
    const scoreOffset = (off: number): { score: number; frames: number[][] } => {
      const chunk = buf.slice(off, off + BLOCK);
      // ignore first 2 bytes (sequence id)
      const ch0 = chunk.slice(2 + 0 * CH_BYTES, 2 + 1 * CH_BYTES);
      const ch1 = chunk.slice(2 + 1 * CH_BYTES, 2 + 2 * CH_BYTES);
      const ch2 = chunk.slice(2 + 2 * CH_BYTES, 2 + 3 * CH_BYTES);
      const ch3 = chunk.slice(2 + 3 * CH_BYTES, 2 + 4 * CH_BYTES);

      const s0 = this.decodeEEGSamples12Bit(ch0);
      const s1 = this.decodeEEGSamples12Bit(ch1);
      const s2 = this.decodeEEGSamples12Bit(ch2);
      const s3 = this.decodeEEGSamples12Bit(ch3);

      if (s0.length !== 12 || s1.length !== 12 || s2.length !== 12 || s3.length !== 12) {
        return { score: 0, frames: [] };
      }

      // build 12 frames
      const frames: number[][] = [];
      let score = 0;

      for (let i = 0; i < SAMPLES_PER_BLOCK; i++) {
        const v = [s0[i], s1[i], s2[i], s3[i]];

        // plausibility: EEG typically within a few thousand µV max; most is far smaller
        const ok =
          v.every((x) => Number.isFinite(x)) &&
          v.every((x) => Math.abs(x) < 5000);

        if (ok) score += 1;
        frames.push(v);
      }

      return { score, frames };
    };

    // 1) find best offset
    let bestOff = -1;
    let bestScore = 0;

    for (let off = 0; off <= buf.length - BLOCK; off++) {
      const { score } = scoreOffset(off);
      if (score > bestScore) {
        bestScore = score;
        bestOff = off;
      }
    }

    // require at least 8/12 plausible samples in a block
    if (bestOff < 0 || bestScore < 8) return [];

    // 2) once best offset found, parse sequential blocks from there
    const out: number[][] = [];
    for (let off = bestOff; off <= buf.length - BLOCK; off += BLOCK) {
      const { score, frames } = scoreOffset(off);
      if (score < 8) break;
      out.push(...frames);
    }

    return out;
  }

  // from muse-js style decoding: 12-bit packed => µV-ish
  private decodeUnsigned12BitData(samples: Uint8Array): number[] {
    const out: number[] = [];
    for (let i = 0; i < samples.length; i++) {
      if (i % 3 === 0) {
        out.push((samples[i] << 4) | (samples[i + 1] >> 4));
      } else {
        out.push(((samples[i] & 0x0f) << 8) | samples[i + 1]);
        i++;
      }
    }
    return out;
  }

  private decodeEEGSamples12Bit(samples: Uint8Array): number[] {
    // Muse baseline: centered around 0x800
    return this.decodeUnsigned12BitData(samples).map((n) => 0.48828125 * (n - 0x800));
  }

  async stop(): Promise<void> {
    this.wantAutoReconnect = false;
    this.running = false;

    if (this.firstFrameTimer) window.clearTimeout(this.firstFrameTimer);
    this.firstFrameTimer = null;
    this.awaitingFirstFrame = false;
    this.firstFrameResolve = null;

    if (this.eegChar) {
      try {
        await this.eegChar.stopNotifications();
      } catch {}
      if (this.eegHandler) {
        try {
          this.eegChar.removeEventListener("characteristicvaluechanged", this.eegHandler);
        } catch {}
        this.eegHandler = undefined;
      }
    }

    if (this.controlChar) {
      try {
        await this.controlChar.stopNotifications();
      } catch {}
      if (this.controlHandler) {
        try {
          this.controlChar.removeEventListener("characteristicvaluechanged", this.controlHandler);
        } catch {}
        this.controlHandler = undefined;
      }
    }

    if (this.device?.gatt?.connected) {
      try {
        this.device.gatt.disconnect();
      } catch {}
    }
  }

  private async tryReconnect(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;

    try {
      for (let attempt = 1; attempt <= this.MAX_RECONNECT; attempt++) {
        console.log(`🔁 Reconnect attempt ${attempt}/${this.MAX_RECONNECT}...`);

        try {
          if (!this.device?.gatt) throw new Error("No device.gatt for reconnect");
          this.server = await this.device.gatt.connect();

          await this.refreshCharacteristics();
          await this.start();

          console.log("✅ Reconnected + streaming resumed");
          this.reconnecting = false;
          return;
        } catch (e) {
          console.warn("Reconnect failed:", e);
          await this.sleep(600 + attempt * 250);
        }
      }
    } finally {
      this.reconnecting = false;
    }
  }

  onData(callback: (frame: EEGFrame) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  isRunning(): boolean {
    return this.running;
  }

  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
}
