export interface BufferedSample {
  ts: number;
  values: number[];
}

export interface BufferSnapshot {
  channels: string[];
  samplingRate: number;
  startTs: number | null;
  endTs: number | null;
  data: Float32Array[];
  length: number;
}

export class EEGRingBuffer {
  private readonly channels: string[];
  private readonly samplingRate: number;
  private readonly maxSeconds: number;
  private samples: BufferedSample[] = [];

  constructor(args: {
    channels: string[];
    samplingRate: number;
    maxSeconds: number;
  }) {
    this.channels = args.channels;
    this.samplingRate = args.samplingRate;
    this.maxSeconds = args.maxSeconds;
  }

  append(sample: BufferedSample) {
    if (sample.values.length !== this.channels.length) {
      throw new Error(
        `EEGRingBuffer append error: expected ${this.channels.length} values, got ${sample.values.length}`
      );
    }

    this.samples.push(sample);
    this.trimOld();
  }

  appendBatch(samples: BufferedSample[]) {
    for (const s of samples) this.append(s);
  }

  clear() {
    this.samples = [];
  }

  getWindowLast(windowMs: number): BufferSnapshot | null {
    if (!this.samples.length) return null;

    const endTs = this.samples[this.samples.length - 1].ts;
    const startTs = endTs - windowMs;

    const selected = this.samples.filter((s) => s.ts >= startTs && s.ts <= endTs);
    if (!selected.length) return null;

    return this.toSnapshot(selected);
  }

  private trimOld() {
    if (!this.samples.length) return;

    const newestTs = this.samples[this.samples.length - 1].ts;
    const minTs = newestTs - this.maxSeconds * 1000;

    let firstKeep = 0;
    while (firstKeep < this.samples.length && this.samples[firstKeep].ts < minTs) {
      firstKeep++;
    }

    if (firstKeep > 0) {
      this.samples = this.samples.slice(firstKeep);
    }
  }

  private toSnapshot(samples: BufferedSample[]): BufferSnapshot {
    const channelCount = this.channels.length;
    const data = Array.from(
      { length: channelCount },
      () => new Float32Array(samples.length)
    );

    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      for (let ch = 0; ch < channelCount; ch++) {
        data[ch][i] = s.values[ch];
      }
    }

    return {
      channels: [...this.channels],
      samplingRate: this.samplingRate,
      startTs: samples[0]?.ts ?? null,
      endTs: samples[samples.length - 1]?.ts ?? null,
      data,
      length: samples.length,
    };
  }
}