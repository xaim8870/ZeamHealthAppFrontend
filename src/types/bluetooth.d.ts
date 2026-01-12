/// <reference lib="dom" />

interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(
    service: BluetoothServiceUUID
  ): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  [x: string]: any;
  getCharacteristic(
    characteristic: BluetoothCharacteristicUUID
  ): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  writeValue(arg0: Uint8Array<ArrayBuffer>): unknown;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(
    type: "characteristicvaluechanged",
    listener: (this: BluetoothRemoteGATTCharacteristic, ev: Event) => any
  ): void;
  value?: DataView;
}

interface Navigator {
  bluetooth: {
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
  };
}
