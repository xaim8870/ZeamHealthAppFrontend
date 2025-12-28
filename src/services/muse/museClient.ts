/// <reference lib="dom" />

import { MUSE_EEG_SERVICE, EEG_CHARACTERISTICS } from "./museConstants";

export class MuseClient {
  device: BluetoothDevice | null = null;
  server: BluetoothRemoteGATTServer | null = null;

  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [MUSE_EEG_SERVICE] }],
    });

    this.server = await this.device.gatt!.connect();
  }

  async startEEG(onData: (channel: string, data: number[]) => void) {
    if (!this.server) throw new Error("Muse not connected");

    const eegService =
      await this.server.getPrimaryService(MUSE_EEG_SERVICE);

    for (const [channel, uuid] of Object.entries(EEG_CHARACTERISTICS)) {
      const characteristic =
        await eegService.getCharacteristic(uuid);

      await characteristic.startNotifications();

      characteristic.addEventListener(
        "characteristicvaluechanged",
        (event: any) => {
          const view = event.target.value as DataView;
          const samples: number[] = [];

          for (let i = 2; i < view.byteLength; i += 2) {
            samples.push(view.getInt16(i, false));
          }

          onData(channel, samples);
        }
      );
    }
  }

  disconnect() {
    this.device?.gatt?.disconnect();
  }
}
