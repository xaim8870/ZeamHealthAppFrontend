
import type { EEGFrame } from "./EEGAdapter";

export class MuseWebAdapter {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private running = false;
  private callbacks: ((f: EEGFrame) => void)[] = [];
  private eegChar: BluetoothRemoteGATTCharacteristic | null = null;

  async connect() {
    if (!navigator.bluetooth) throw new Error("Web Bluetooth required (Chrome/Edge)");

    // Step 1: Device discovery
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'Muse' }],
      optionalServices: ['6e400001-b5a3-f393-e0a9-e50e24dcca9e'] // Nordic UART
    });

    console.log('✅ Connected to:', this.device.name);
    
    // Step 2: GATT connection (WHERE IT STOPPED)
    this.server = await this.device.gatt!.connect();
    console.log('✅ GATT Server connected');

    // Step 3: Discover EEG service
    const service = await this.server.getPrimaryService('6e400001-b5a3-f393-e0a9-e50e24dcca9e');
    this.eegChar = await service.getCharacteristic('6e400003-b5a3-f393-e0a9-e50e24dcca9e'); // TX characteristic
    
    console.log('✅ EEG characteristic found');
    return true;
  }

  async start() {
    if (!this.eegChar) throw new Error("Call connect() first");

    this.running = true;
    console.log('🎵 Starting EEG notifications...');

    // Enable notifications for real EEG data
    await this.eegChar.startNotifications();
    
    this.eegChar.addEventListener('characteristicvaluechanged', (event: any) => {
      if (!this.running) return;
      
      try {
        const rawValue = event.target.value.buffer;
        const data = new Uint8Array(rawValue);
        
        // Parse Muse EEG packets (simplified - 4 channels x 4 bytes)
        const eegData = new Array(4).fill(0);
        for (let i = 0; i < 4 && i < data.length; i += 4) {
          eegData[i/4] = data[i] + data[i+1] * 256; // 16-bit samples
        }

        const frame: EEGFrame = {
          device: "muse",
          adapter: "web-bluetooth",
          ts: Date.now(),
          channel: "TP9,AF7,AF8,TP10",
          values: eegData.slice(0, 4)
        };
        
        this.callbacks.forEach(cb => cb(frame));
      } catch (e) {
        console.warn('EEG parse error:', e);
      }
    });

    console.log('✅ EEG streaming active (check console for frames)');
  }

  stop() {
    this.running = false;
    if (this.eegChar) {
      this.eegChar.startNotifications();
    }
    if (this.device?.gatt) {
      this.device.gatt.disconnect();
    }
    console.log('🔌 Muse disconnected');
  }

  onData(callback: (frame: EEGFrame) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }
}