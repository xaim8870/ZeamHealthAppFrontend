import type { EEGFrame, EEGAdapter, DeviceInfo, DeviceType, AdapterType } from "./EEGAdapter";

export class UniversalMuseAdapter implements EEGAdapter {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private running = false;
  private callbacks: ((f: EEGFrame) => void)[] = [];
  private eegChar: BluetoothRemoteGATTCharacteristic | null = null;
  private controlChar: BluetoothRemoteGATTCharacteristic | null = null;
  
  private deviceInfo: DeviceInfo = {
    id: '',
    name: 'Unknown Muse',
    type: 'unknown',
    manufacturer: 'Interaxon',
    channels: 4,
    samplingRate: 256
  };

  async connect(): Promise<boolean> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not supported. Use Chrome/Edge on desktop.');
    }

    console.log("🚀 Starting Muse device connection...");
    
    try {
      // Step 1: Request device with all possible services
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Muse' }],
        optionalServices: [
          '0000fe8d-0000-1000-8000-00805f9b34fb',
          '0000fe8c-0000-1000-8000-00805f9b34fb',
          '0000180a-0000-1000-8000-00805f9b34fb',
          '0000180f-0000-1000-8000-00805f9b34fb',
        ],
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      console.log(`✅ Device selected: ${this.device.name}`);
      console.log(`📱 Device ID: ${this.device.id}`);
      
      // Update device info
      this.deviceInfo.id = this.device.id;
      this.deviceInfo.name = this.device.name || 'Unknown Muse';
      
      // Detect Muse model
      if (this.device.name?.includes('MuseS') || this.device.name?.includes('BBA3')) {
        this.deviceInfo.type = 'muse-s';
        this.deviceInfo.manufacturer = 'Interaxon (Muse S)';
        this.deviceInfo.channels = 4;
      } else if (this.device.name?.includes('Muse-2') || this.device.name?.includes('Muse 2')) {
        this.deviceInfo.type = 'muse-2';
        this.deviceInfo.manufacturer = 'Interaxon (Muse 2)';
        this.deviceInfo.channels = 5;
      } else {
        this.deviceInfo.type = 'muse';
        this.deviceInfo.manufacturer = 'Interaxon (Muse)';
        this.deviceInfo.channels = 4;
      }

      console.log(`🤖 Detected: ${this.deviceInfo.type} with ${this.deviceInfo.channels} channels`);

      // Step 2: Connect to GATT server
      if (!this.device.gatt) {
        throw new Error("Device doesn't support GATT");
      }

      // Add connection timeout
      const connectWithTimeout = async (timeoutMs: number = 10000) => {
        return new Promise<BluetoothRemoteGATTServer>((resolve, reject) => {
          const timer = setTimeout(() => {
            reject(new Error(`GATT connection timeout after ${timeoutMs}ms`));
          }, timeoutMs);
          
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

      this.server = await connectWithTimeout(15000);
      console.log('✅ GATT Server connected');
      console.log(`🔗 Server connected: ${this.server.connected}`);

      // Step 3: Try to discover ALL services on the device
      console.log('🔍 Discovering services...');
      const services = await this.server.getPrimaryServices();
      console.log(`📋 Found ${services.length} services:`);
      
      services.forEach(service => {
        console.log(`   - ${service.uuid}`);
      });

      // Step 4: Find the Muse EEG service
      let museService: BluetoothRemoteGATTService | null = null;
      let serviceUUID = '';
      
      // Look for Muse-specific services
      const museServiceUUIDs = [
        '0000fe8d-0000-1000-8000-00805f9b34fb',
        '0000fe8c-0000-1000-8000-00805f9b34fb',
        '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      ];
      
      for (const service of services) {
        if (museServiceUUIDs.includes(service.uuid)) {
          museService = service;
          serviceUUID = service.uuid;
          console.log(`🎯 Found Muse service: ${service.uuid}`);
          break;
        }
      }

      if (!museService) {
        console.warn('No standard Muse service found, trying any service...');
        // Try any service that might contain EEG data
        for (const service of services) {
          try {
            const characteristics = await service.getCharacteristics();
            console.log(`Service ${service.uuid} has ${characteristics.length} characteristics`);
            
            // Look for characteristics that might be EEG data
            for (const char of characteristics) {
              console.log(`   Characteristic: ${char.uuid}`);
              
              // Check if this looks like an EEG characteristic
              if (char.uuid.includes('0003') || char.uuid.includes('273e')) {
                museService = service;
                serviceUUID = service.uuid;
                this.eegChar = char;
                console.log(`🎯 Potential EEG characteristic found: ${char.uuid}`);
                break;
              }
            }
            
            if (museService) break;
          } catch (error) {
            console.warn(`Error examining service ${service.uuid}:`, error);
          }
        }
      }

      if (!museService) {
        throw new Error('No Muse EEG service found on device');
      }

      // Step 5: Discover ALL characteristics in the Muse service
      console.log('🔍 Discovering characteristics...');
      const characteristics = await museService.getCharacteristics();
      console.log(`📋 Found ${characteristics.length} characteristics in service ${serviceUUID}:`);
      
      characteristics.forEach(char => {
        // Fix: Access properties correctly
        const props = [];
        if (char.properties.read) props.push('read');
        if (char.properties.write) props.push('write');
        if (char.properties.writeWithoutResponse) props.push('writeWithoutResponse');
        if (char.properties.notify) props.push('notify');
        if (char.properties.indicate) props.push('indicate');
        if (char.properties.broadcast) props.push('broadcast');
        
        console.log(`   - ${char.uuid} (${props.join(', ')})`);
      });

      // Step 6: Identify EEG and Control characteristics
      const eegUUIDs = [
        '273e0003-4c4d-454d-96be-f03bac821358',
        '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
        '273e000b-4c4d-454d-96be-f03bac821358',
      ];
      
      const controlUUIDs = [
        '273e0001-4c4d-454d-96be-f03bac821358',
        '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
        '273e0002-4c4d-454d-96be-f03bac821358',
      ];

      // Find EEG characteristic
      for (const char of characteristics) {
        if (eegUUIDs.includes(char.uuid)) {
          this.eegChar = char;
          console.log(`✅ Found EEG characteristic: ${char.uuid}`);
          break;
        }
      }

      // Find Control characteristic
      for (const char of characteristics) {
        if (controlUUIDs.includes(char.uuid)) {
          this.controlChar = char;
          console.log(`✅ Found Control characteristic: ${char.uuid}`);
          break;
        }
      }

      // If we still don't have EEG characteristic, try any characteristic with notify property
      if (!this.eegChar) {
        for (const char of characteristics) {
          // Fix: Check notify property correctly
          if (char.properties.notify) {
            this.eegChar = char;
            console.log(`⚠️ Using notify characteristic as EEG: ${char.uuid}`);
            break;
          }
        }
      }

      if (!this.eegChar) {
        throw new Error('Could not find EEG data characteristic');
      }

      console.log('✅ All characteristics found successfully');
      return true;

    } catch (error: any) {
      console.error('❌ Connection error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      let errorMessage = 'Connection failed';
      
      if (error.name === 'NotFoundError') {
        errorMessage = 'No Muse device found. Make sure:\n• Device is powered ON\n• In pairing mode (blinking lights)\n• Forgotten from other devices';
      } else if (error.name === 'NetworkError') {
        errorMessage = 'Bluetooth connection failed.\n• Move closer to computer\n• Restart Muse device\n• Check Bluetooth adapter';
      } else if (error.message.includes('No Muse EEG service found')) {
        errorMessage = 'Device found but not compatible.\nYour Muse S BBA3 may need firmware update\nor use Muse Direct app first';
      } else if (error.message.includes('GATT')) {
        errorMessage = 'Bluetooth GATT error.\n• Try different computer/OS\n• Use official Muse apps to test first';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout.\n• Ensure Muse is fully charged\n• Factory reset (hold button 20+ seconds)';
      }
      
      throw new Error(errorMessage);
    }
  }

  async start(): Promise<void> {
    if (!this.eegChar) {
      throw new Error('Not connected. Call connect() first.');
    }

    console.log('🎵 Starting EEG streaming...');
    this.running = true;

    try {
      // Enable notifications
      await this.eegChar.startNotifications();
      console.log('✅ Notifications enabled');
      
      // Try to send start command if we have control characteristic
      if (this.controlChar) {
        try {
          const commands = [
            new Uint8Array([0x02, 0x64, 0x0A]),
            new Uint8Array([0x02, 0x73, 0x0A]),
            new Uint8Array([0x02, 0x6D, 0x0A]),
          ];
          
          for (const command of commands) {
            try {
              await this.controlChar.writeValue(command);
              console.log(`✅ Command sent: ${Array.from(command).map(b => b.toString(16)).join(' ')}`);
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (cmdError) {
              console.warn('Command failed, trying next...');
            }
          }
        } catch (cmdError) {
          console.warn('Could not send control commands, but EEG may still work:', cmdError);
        }
      }
      
      // Setup data handler
      this.eegChar.addEventListener('characteristicvaluechanged', this.handleData.bind(this));
      console.log('✅ Data handler setup complete');
      console.log('🎉 EEG streaming READY');
      
    } catch (error) {
      console.error('❌ Start error:', error);
      this.running = false;
      throw error;
    }
  }

  private handleData(event: Event) {
    if (!this.running) return;

    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    
    if (!value) {
      console.warn('No data in characteristic value');
      return;
    }

    try {
      console.log(`📦 Raw data received: ${value.byteLength} bytes`);
      
      // Try different parsing methods
      let samples: number[] = [];
      let channels = 'TP9,AF7,AF8,TP10';
      
      // Method 1: Try Muse 2/S parsing (24-bit)
      if (value.byteLength >= 12) {
        samples = this.parseMuse2SData(value);
      }
      
      // Method 2: Try Muse OG parsing (16-bit)
      if (samples.length === 0 && value.byteLength >= 10) {
        samples = this.parseMuseOGData(value);
        channels = 'TP9,AF7,AF8,TP10,AUX';
      }
      
      // Method 3: Generic parsing
      if (samples.length === 0) {
        samples = this.parseGenericData(value);
      }
      
      if (samples.length === 0) {
        console.warn('Could not parse EEG data');
        return;
      }
      
      const frame: EEGFrame = {
        device: this.deviceInfo.type,
        adapter: 'web-bluetooth',
        ts: Date.now(),
        channel: channels,
        values: samples,
        quality: samples.map(s => Math.abs(s) < 1000 ? 1 : 0)
      };
      
      // Log first frame and occasionally thereafter
      if (Math.random() < 0.01) {
        console.log('🧠 EEG Sample:', samples.map(s => s.toFixed(1)).join(', '), 'µV');
      }
      
      // Notify all callbacks
      this.callbacks.forEach(callback => {
        try {
          callback(frame);
        } catch (err) {
          console.warn('Callback error:', err);
        }
      });
      
    } catch (error) {
      console.warn('Data parsing error:', error);
    }
  }

  private parseMuse2SData(value: DataView): number[] {
    const data = new Uint8Array(value.buffer);
    const samples: number[] = [];
    
    for (let i = 0; i < data.length && i < 15; i += 3) {
      if (i + 2 >= data.length) break;
      
      const byte1 = data[i];
      const byte2 = data[i + 1];
      const byte3 = data[i + 2];
      
      let sample = (byte3 << 16) | (byte2 << 8) | byte1;
      
      // Convert to signed 24-bit
      if (sample & 0x800000) {
        sample = sample - 0x1000000;
      }
      
      // Convert to microvolts
      const microvolts = sample * 0.02235174445530707;
      samples.push(microvolts);
    }
    
    return samples;
  }

  private parseMuseOGData(value: DataView): number[] {
    const data = new Uint8Array(value.buffer);
    const samples: number[] = [];
    
    for (let i = 0; i < data.length && i < 10; i += 2) {
      if (i + 1 >= data.length) break;
      
      const sample = data[i] + data[i + 1] * 256;
      
      // Convert to signed 16-bit
      let signedSample = sample;
      if (sample > 32767) signedSample = sample - 65536;
      
      // Convert to microvolts
      const microvolts = signedSample * 0.48828125;
      samples.push(microvolts);
    }
    
    return samples;
  }

  private parseGenericData(value: DataView): number[] {
    const data = new Uint8Array(value.buffer);
    const samples: number[] = [];
    
    // Try to parse as 16-bit samples
    if (data.length % 2 === 0) {
      for (let i = 0; i < data.length; i += 2) {
        if (i + 1 >= data.length) break;
        
        const sample = (data[i + 1] << 8) | data[i];
        let signedSample = sample;
        if (sample > 32767) signedSample = sample - 65536;
        
        samples.push(signedSample);
      }
    } else {
      // Just use raw bytes
      for (let i = 0; i < Math.min(data.length, 8); i++) {
        samples.push(data[i]);
      }
    }
    
    return samples;
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping EEG streaming...');
    this.running = false;
    
    try {
      // Try to send stop command
      if (this.controlChar) {
        try {
          const stopCommand = new Uint8Array([0x03, 0x64, 0x0A]);
          await this.controlChar.writeValue(stopCommand);
          console.log('✅ Stop command sent');
        } catch (cmdError) {
          console.warn('Stop command failed:', cmdError);
        }
      }
      
      // Stop notifications
      if (this.eegChar) {
        try {
          await this.eegChar.stopNotifications();
          console.log('✅ Notifications stopped');
        } catch (notifyError) {
          console.warn('Failed to stop notifications:', notifyError);
        }
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
    
    // Disconnect
    if (this.device?.gatt?.connected) {
      try {
        this.device.gatt.disconnect();
        console.log('🔌 Device disconnected');
      } catch (disconnectError) {
        console.warn('Disconnect error:', disconnectError);
      }
    }
  }

  onData(callback: (frame: EEGFrame) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  isRunning(): boolean {
    return this.running;
  }

  getDeviceInfo(): DeviceInfo {
    return { ...this.deviceInfo };
  }
}