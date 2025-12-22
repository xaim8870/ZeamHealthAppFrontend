import { MUSE_SERVICE, EEG_CHARACTERISTICS } from "./museConstants";

export class MuseClient {
  device: BluetoothDevice | null = null;
  server: BluetoothRemoteGATTServer | null = null;

  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [MUSE_SERVICE] }],
    });

    this.server = await this.device.gatt?.connect() ?? null;
    if (!this.server) throw new Error("GATT connection failed");

    return this.server;
  }

  async startEEG(onData: (channel: string, data: number[]) => void) {
    if (!this.server) return;

    for (const [channel, uuid] of Object.entries(EEG_CHARACTERISTICS)) {
      const service = await this.server.getPrimaryService(MUSE_SERVICE);
      const characteristic = await service.getCharacteristic(uuid);

      await characteristic.startNotifications();

      characteristic.addEventListener(
        "characteristicvaluechanged",
        (event: any) => {
          const raw = event.target.value;
          const values: number[] = [];

          for (let i = 0; i < raw.byteLength; i += 2) {
            values.push(raw.getInt16(i, false));
          }

          onData(channel, values);
        }
      );
    }
  }

  disconnect() {
    this.device?.gatt?.disconnect();
  }
}
