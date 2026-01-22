import type { EEGFrame } from "./EEGAdapter";

export class MuseWebAdapter {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private running = false;
  private callbacks: ((f: EEGFrame) => void)[] = [];
  private eegChar: BluetoothRemoteGATTCharacteristic | null = null;
  private controlChar: BluetoothRemoteGATTCharacteristic | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  async connect() {
  if (!navigator.bluetooth) {
    throw new Error("Web Bluetooth is not supported in this browser. Use Chrome/Edge.");
  }

  console.log("🧪 Web Bluetooth API available:", !!navigator.bluetooth);
  console.log("🧪 User agent:", navigator.userAgent);
  
  try {
    console.log("1️⃣ Starting device request...");
    
    const MUSE_S_SERVICE_UUID = '0000fe8d-0000-1000-8000-00805f9b34fb';
    
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ name: 'MuseS-BBA3' }], // Exact name match
      optionalServices: [MUSE_S_SERVICE_UUID],
    });

    console.log('2️⃣ Device selected:', this.device);
    console.log('   - Name:', this.device.name);
    console.log('   - ID:', this.device.id);
    console.log('   - GATT available:', !!this.device.gatt);

    if (!this.device.gatt) {
      throw new Error("Device doesn't support GATT (Bluetooth Low Energy)");
    }

    console.log('3️⃣ Attempting GATT connection...');
    
    // Add connection timeout
    const connectWithTimeout = async () => {
      const timeout = 15000; // 15 seconds
      return new Promise<BluetoothRemoteGATTServer>((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`GATT connection timeout after ${timeout}ms`));
        }, timeout);
        
        this.device!.gatt!.connect()
          .then(server => {
            clearTimeout(timer);
            resolve(server);
          })
          .catch(error => {
            clearTimeout(timer);
            reject(error);
          });
      });
    };

    this.server = await connectWithTimeout();
    console.log('4️⃣ GATT Server connected successfully');
    console.log('   - Connected:', this.server.connected);

    // Try to get service with multiple UUIDs
    const serviceUUIDs = [
      '0000fe8d-0000-1000-8000-00805f9b34fb', // Muse S primary
      '0000fe8c-0000-1000-8000-00805f9b34fb', // Muse 2/S secondary
      '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART (old Muse)
    ];

    let service;
    for (const uuid of serviceUUIDs) {
      try {
        console.log(`   Trying service UUID: ${uuid}`);
        service = await this.server.getPrimaryService(uuid);
        console.log(`✅ Found service with UUID: ${uuid}`);
        break;
      } catch (error) {
        console.log(`❌ Service ${uuid} not found`);
      }
    }

    if (!service) {
      throw new Error("No Muse service found on device");
    }

    console.log('5️⃣ Service found, getting characteristics...');
    
    return true;
    
  } catch (error: any) {
    console.error('❌ FULL CONNECTION ERROR:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // Provide specific troubleshooting based on error
    if (error.name === 'SecurityError') {
      throw new Error("Security error: Make sure you're using HTTPS or localhost");
    } else if (error.name === 'NotFoundError') {
      throw new Error("Device not found. Make sure Muse S is in pairing mode");
    } else if (error.name === 'NetworkError') {
      throw new Error(`Network error: ${error.message}. This usually means:\n1. OS Bluetooth drivers are incompatible\n2. Muse S firmware issue\n3. Browser Web Bluetooth bug\n\nTry using a different computer or Bluetooth adapter`);
    } else if (error.message.includes('timeout')) {
      throw new Error("Connection timeout. The Muse S might not be responding.\n1. Ensure it's fully charged\n2. Try factory reset (hold button 20+ seconds)\n3. Use Muse Direct app to test first");
    } else if (error.message.includes('GATT')) {
      throw new Error("GATT error. Your operating system's Bluetooth stack might be incompatible with Web Bluetooth.\n\nTry: macOS or Linux instead of Windows");
    }
    
    throw new Error(`Connection failed: ${error.message || 'Unknown error'}`);
  }
}
  async start() {
    if (!this.controlChar || !this.eegChar) {
      throw new Error("Not properly connected. Call connect() first.");
    }

    this.running = true;
    console.log('🎵 Starting EEG streaming...');

    try {
      // Enable EEG notifications
      await this.eegChar.startNotifications();
      console.log('✅ EEG notifications enabled');

      // Setup data handler
      this.eegChar.addEventListener('characteristicvaluechanged', this.handleEEGData.bind(this));

      // Send start command to Muse S
      // Command format: [preset, register, value]
      const startCommand = new Uint8Array([0x02, 0x64, 0x0A]); // Start EEG
      await this.controlChar.writeValue(startCommand);
      
      // Also enable accelerometer if needed
      const accelCommand = new Uint8Array([0x02, 0x73, 0x0A]); // Enable accelerometer
      await this.controlChar.writeValue(accelCommand);
      
      console.log('✅ Start commands sent');
      console.log('✅ Muse S EEG streaming active');

    } catch (error) {
      console.error('Start streaming error:', error);
      this.running = false;
      throw error;
    }
  }

  private handleEEGData(event: Event) {
    if (!this.running) return;

    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (!value || value.byteLength < 12) {
      console.warn('Invalid EEG data received');
      return;
    }

    try {
      const data = new DataView(value.buffer);
      const samples: number[] = [];
      
      // Muse S: 12 bytes = 4 channels × 3 bytes each (24-bit samples)
      for (let i = 0; i < 12; i += 3) {
        // Read 24-bit little-endian
        const byte1 = data.getUint8(i);
        const byte2 = data.getUint8(i + 1);
        const byte3 = data.getUint8(i + 2);
        
        // Combine into 24-bit integer
        let sample = (byte3 << 16) | (byte2 << 8) | byte1;
        
        // Convert to signed 24-bit
        if (sample & 0x800000) {
          sample = sample - 0x1000000;
        }
        
        // Convert to microvolts (Muse S specific scaling)
        const microvolts = sample * 0.02235174445530707;
        samples.push(microvolts);
      }
      
      const frame: EEGFrame = {
        device: "muse-s",
        adapter: "web-bluetooth",
        ts: Date.now(),
        channel: "TP9,AF7,AF8,TP10",
        values: samples,
        quality: samples.map(s => Math.abs(s) < 500 ? 1 : 0) // Simple quality indicator
      };
      
      // Call all registered callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(frame);
        } catch (err) {
          console.warn('Callback error:', err);
        }
      });
      
      // Debug: Log first value occasionally
      if (Math.random() < 0.01) { // 1% of the time
        console.log('EEG sample:', samples[0]?.toFixed(2), 'µV');
      }
      
    } catch (error) {
      console.warn('EEG data parsing error:', error);
    }
  }

  async stop() {
    this.running = false;
    
    try {
      // Send stop command
      if (this.controlChar) {
        const stopCommand = new Uint8Array([0x03, 0x64, 0x0A]); // Stop EEG
        await this.controlChar.writeValue(stopCommand);
        console.log('✅ Stop command sent');
      }
      
      // Stop notifications
      if (this.eegChar) {
        await this.eegChar.stopNotifications();
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
    
    // Disconnect
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
      console.log('🔌 Device disconnected');
    }
    
    this.reconnectAttempts = 0;
  }

  onData(callback: (frame: EEGFrame) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  isRunning(): boolean {
    return this.running;
  }
}