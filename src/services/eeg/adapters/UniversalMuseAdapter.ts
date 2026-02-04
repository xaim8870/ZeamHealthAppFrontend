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

  // ✅ Common Muse service UUID
  private readonly MUSE_SERVICE_UUID = '0000fe8d-0000-1000-8000-00805f9b34fb';
  
  // Try ALL known Muse UUIDs
  private readonly KNOWN_EEG_UUIDS = [
    '273e0003-4c4d-454d-96be-f03bac821358', // Standard Muse EEG
    '273e000b-4c4d-454d-96be-f03bac821358', // Alternative 1
    '273e000c-4c4d-454d-96be-f03bac821358', // Alternative 2
    '6e400003-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART RX
    '273e0003-0000-1000-8000-00805f9b34fb', // Some Muse 2
    '273e0003-0001-1000-8000-00805f9b34fb', // Some Muse S
  ];
  
  private readonly KNOWN_CONTROL_UUIDS = [
    '273e0001-4c4d-454d-96be-f03bac821358', // Standard control
    '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART TX
    '273e0002-4c4d-454d-96be-f03bac821358', // Alternative control
  ];

  async connect(): Promise<boolean> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not supported. Use Chrome/Edge on desktop.');
    }

    console.log("🚀 Starting Muse device connection...");
    
    try {
      // Step 1: Request device
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Muse' }],
        optionalServices: [this.MUSE_SERVICE_UUID],
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      console.log(`✅ Device selected: ${this.device.name}`);
      console.log(`📱 Device ID: ${this.device.id}`);
      
      // Add disconnect listener
      this.device.addEventListener('gattserverdisconnected', () => {
        console.warn('⚠️ Device disconnected unexpectedly');
        this.running = false;
        this.server = null;
      });

      // Update device info
      this.deviceInfo.id = this.device.id;
      this.deviceInfo.name = this.device.name || 'Unknown Muse';
      
      // Detect Muse model
      if (this.device.name?.includes('MuseS') || this.device.name?.includes('BBA3')) {
        this.deviceInfo.type = 'muse-s';
        this.deviceInfo.manufacturer = 'Interaxon (Muse S)';
        this.deviceInfo.channels = 4;
        this.deviceInfo.samplingRate = 256;
      } else if (this.device.name?.includes('Muse-2') || this.device.name?.includes('Muse 2')) {
        this.deviceInfo.type = 'muse-2';
        this.deviceInfo.manufacturer = 'Interaxon (Muse 2)';
        this.deviceInfo.channels = 5;
        this.deviceInfo.samplingRate = 256;
      } else {
        this.deviceInfo.type = 'muse';
        this.deviceInfo.manufacturer = 'Interaxon (Muse)';
        this.deviceInfo.channels = 4;
        this.deviceInfo.samplingRate = 256;
      }

      console.log(`🤖 Detected: ${this.deviceInfo.type} with ${this.deviceInfo.channels} channels`);

      // Step 2: Connect to GATT server with retry logic
      if (!this.device.gatt) {
        throw new Error("Device doesn't support GATT");
      }

      // ✅ CRITICAL FIX: Add connection retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          console.log(`🔗 Connecting to GATT (attempt ${4 - retries}/3)...`);
          
          this.server = await this.device.gatt.connect();
          
          // ✅ ADDED: Wait a moment to ensure connection is stable
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (this.server.connected) {
            console.log('✅ GATT Server connected and stable');
            console.log(`🔗 Server connected: ${this.server.connected}`);
            break;
          } else {
            throw new Error('Server not connected after connect()');
          }
        } catch (connectError) {
          retries--;
          if (retries === 0) throw connectError;
          console.warn(`Connection failed, retrying... (${retries} left)`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // ✅ ADDED: Double-check connection before proceeding
      if (!this.server || !this.server.connected) {
        throw new Error('Failed to establish stable GATT connection');
      }

      // Step 3: Get service with timeout
      console.log(`🔍 Getting service: ${this.MUSE_SERVICE_UUID}`);
      
      const servicePromise = this.server.getPrimaryService(this.MUSE_SERVICE_UUID);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Service discovery timeout')), 5000);
      });

      const service = await Promise.race([servicePromise, timeoutPromise]);
      console.log('✅ Service found');

      // Step 4: 🚀 CRITICAL FIX - Get ALL characteristics and examine them
      console.log('🔍 Discovering ALL characteristics...');
      const allCharacteristics = await service.getCharacteristics();
      console.log(`📋 Found ${allCharacteristics.length} characteristics:`);
      
      // Log all characteristics with their properties
      allCharacteristics.forEach((char, index) => {
        const props = this.getCharacteristicProperties(char);
        console.log(`   ${index + 1}. ${char.uuid} (${props.join(', ')})`);
        
        // Log the first few bytes of known UUIDs to help identify them
        if (char.uuid.includes('273e') || char.uuid.includes('0003') || char.uuid.includes('0001')) {
          console.log(`       ↳ Likely Muse characteristic`);
        }
      });

      // Step 5: Identify EEG and Control characteristics by examining properties
      console.log('🎯 Identifying EEG and Control characteristics...');
      
      for (const char of allCharacteristics) {
        const props = this.getCharacteristicProperties(char);
        const uuid = char.uuid.toLowerCase();
        
        console.log(`   Examining ${uuid}: ${props.join(', ')}`);
        
        // Look for EEG characteristic (usually has "notify" property)
        if (props.includes('notify') && !this.eegChar) {
          // Check if it's in known EEG UUIDs or has EEG-like pattern
          if (this.KNOWN_EEG_UUIDS.includes(uuid) || 
              uuid.includes('0003') || 
              uuid.includes('000b') ||
              uuid.includes('000c')) {
            this.eegChar = char;
            console.log(`✅ Found EEG characteristic by UUID: ${uuid}`);
          } else if (props.includes('notify') && !props.includes('write')) {
            // If it has notify but no write, it's likely EEG data
            this.eegChar = char;
            console.log(`⚠️ Guessing EEG characteristic by properties: ${uuid} (${props.join(', ')})`);
          }
        }
        
        // Look for Control characteristic (usually has "write" property)
        if (props.includes('write') && !this.controlChar) {
          if (this.KNOWN_CONTROL_UUIDS.includes(uuid) || 
              uuid.includes('0001') || 
              uuid.includes('0002')) {
            this.controlChar = char;
            console.log(`✅ Found Control characteristic: ${uuid}`);
          }
        }
      }

      // Step 6: Fallback - If we didn't find EEG by UUID, try by properties
      if (!this.eegChar) {
        console.log('🔄 Fallback: Looking for EEG by properties only...');
        for (const char of allCharacteristics) {
          const props = this.getCharacteristicProperties(char);
          
          // EEG data characteristics typically have "notify" and NOT "write"
          if (props.includes('notify') && !props.includes('write')) {
            this.eegChar = char;
            console.log(`🎯 Selected EEG characteristic by properties: ${char.uuid} (${props.join(', ')})`);
            break;
          }
        }
      }

      // Step 7: If still no EEG, try any characteristic with notify
      if (!this.eegChar) {
        console.log('🆘 Last resort: Looking for ANY characteristic with notify...');
        for (const char of allCharacteristics) {
          const props = this.getCharacteristicProperties(char);
          if (props.includes('notify')) {
            this.eegChar = char;
            console.log(`🆘 Using any notify characteristic as EEG: ${char.uuid}`);
            break;
          }
        }
      }

      if (!this.eegChar) {
        // Log all characteristics for debugging
        console.error('❌ Could not find EEG characteristic. Available characteristics:');
        allCharacteristics.forEach((char, index) => {
          console.error(`   ${index + 1}. ${char.uuid} (${this.getCharacteristicProperties(char).join(', ')})`);
        });
        throw new Error('Could not find any EEG data characteristic on device');
      }

      // Control characteristic is optional
      if (!this.controlChar) {
        console.warn('⚠️ No control characteristic found. EEG may still work, but initialization commands may fail.');
        
        // Try to find any write characteristic as fallback
        for (const char of allCharacteristics) {
          const props = this.getCharacteristicProperties(char);
          if (props.includes('write') && !this.controlChar) {
            this.controlChar = char;
            console.log(`⚠️ Using write characteristic as control: ${char.uuid}`);
            break;
          }
        }
      }

      console.log('✅ Characteristics identified successfully');
      console.log(`   EEG: ${this.eegChar.uuid}`);
      console.log(`   Control: ${this.controlChar ? this.controlChar.uuid : 'none'}`);
      
      return true;

    } catch (error: any) {
      console.error('❌ Connection error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Connection failed';
      
      if (error.message.includes('Could not find any EEG data characteristic')) {
        errorMessage = 'Device connected but EEG service not found.\n• Your Muse S BBA3 may need firmware update\n• Use Muse Direct app first to initialize device';
      } else if (error.message.includes('GATT Server is disconnected')) {
        errorMessage = 'Bluetooth connection lost.\n• Move device closer\n• Ensure Muse is fully charged\n• Try reconnecting';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout.\n• Restart Muse device\n• Factory reset (hold button 20+ seconds)\n• Try different USB port';
      } else if (error.message.includes('Not found') || error.message.includes('No device selected')) {
        errorMessage = 'No Muse device found.\n• Ensure Muse is ON\n• In pairing mode (blinking lights)\n• Bluetooth is enabled on computer';
      }
      
      throw new Error(errorMessage);
    }
  }

  // Helper method to get characteristic properties
  private getCharacteristicProperties(char: BluetoothRemoteGATTCharacteristic): string[] {
    const props = [];
    if (char.properties.read) props.push('read');
    if (char.properties.write) props.push('write');
    if (char.properties.writeWithoutResponse) props.push('writeWithoutResponse');
    if (char.properties.notify) props.push('notify');
    if (char.properties.indicate) props.push('indicate');
    if (char.properties.broadcast) props.push('broadcast');
    if (char.properties.authenticatedSignedWrites) props.push('authenticatedSignedWrites');
    return props;
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
      
      // Set up data handler
      this.eegChar.addEventListener('characteristicvaluechanged', this.handleData.bind(this));
      console.log('✅ Data handler setup complete');
      
      // Send initialization commands if we have control characteristic
      if (this.controlChar) {
        try {
          console.log('📡 Sending Muse initialization commands...');
          
          // Try different command sequences for different Muse models
          const initCommands = [
            new Uint8Array([0x02, 0x64, 0x0A]), // Enable EEG (most common)
            new Uint8Array([0x02, 0x73, 0x0A]), // Resume
            new Uint8Array([0x02, 0x6D, 0x0A]), // Enable Battery
            new Uint8Array([0x04, 0x70, 0x0A]), // Enable PPG (for some models)
          ];
          
          for (const command of initCommands) {
            try {
              // Just use writeValue - it will work with or without response
              await this.controlChar.writeValue(command);
              
              console.log(`✅ Command sent: ${Array.from(command).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (cmdError) {
              console.warn(`Command ${Array.from(command).map(b => b.toString(16)).join(' ')} failed:`, cmdError);
            }
          }
        } catch (cmdError) {
          console.warn('Control commands failed, but EEG may still work:', cmdError);
        }
      } else {
        console.warn('⚠️ No control characteristic, skipping initialization commands');
      }
      
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
      const dataView = new DataView(value.buffer);
      const byteLength = dataView.byteLength;
      
      // Log first few packets for debugging
      if (Math.random() < 0.01) {
        console.log(`📦 Raw data: ${byteLength} bytes`);
        
        // Log first few bytes for debugging
        const bytes = [];
        for (let i = 0; i < Math.min(20, byteLength); i++) {
          bytes.push(dataView.getUint8(i).toString(16).padStart(2, '0'));
        }
        console.log(`🔍 First ${bytes.length} bytes: ${bytes.join(' ')}`);
      }
      
      // Parse Muse S data
      const samples = this.parseMuseSData(dataView);
      
      if (samples.length === 0) {
        return;
      }
      
      const frame: EEGFrame = {
        device: this.deviceInfo.type,
        adapter: 'web-bluetooth',
        ts: Date.now(),
        channel: 'TP9,AF7,AF8,TP10',
        values: samples,
        quality: samples.map(s => Math.abs(s) < 1000 ? 1 : 0)
      };
      
      // Log occasionally
      if (Math.random() < 0.005) {
        console.log('🧠 EEG Sample (µV):', samples.map(s => s.toFixed(1)).join(', '));
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

  private parseMuseSData(dataView: DataView): number[] {
    const samples: number[] = [];
    const byteLength = dataView.byteLength;
    
    // Try different parsing methods
    
    // Method 1: 24-bit samples (Muse S/2)
    if (byteLength >= 12) {
      for (let i = 0; i + 2 < byteLength && samples.length < 4; i += 3) {
        // Read 24-bit little endian
        const byte1 = dataView.getUint8(i);
        const byte2 = dataView.getUint8(i + 1);
        const byte3 = dataView.getUint8(i + 2);
        
        let sample = (byte3 << 16) | (byte2 << 8) | byte1;
        
        // Convert from signed 24-bit to signed 32-bit
        if (sample & 0x800000) {
          sample |= 0xFF000000; // Sign extend
        }
        
        // Convert to microvolts (Muse S scale factor)
        const microvolts = sample * 0.02235174445530707; // 450 / (2^24)
        samples.push(microvolts);
      }
      
      if (samples.length === 4) {
        return samples;
      }
    }
    
    // Method 2: 16-bit samples (older Muse)
    if (byteLength >= 8) {
      for (let i = 0; i + 1 < byteLength && samples.length < 4; i += 2) {
        const sample = dataView.getInt16(i, true); // little endian
        
        // Convert to microvolts (Muse OG scale factor)
        const microvolts = sample * 0.48828125;
        samples.push(microvolts);
      }
    }
    
    return samples;
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping EEG streaming...');
    this.running = false;
    
    try {
      // Send stop commands
      if (this.controlChar) {
        try {
          const stopCommands = [
            new Uint8Array([0x03, 0x64, 0x0A]), // Disable EEG
            new Uint8Array([0x03, 0x6D, 0x0A]), // Disable Battery
          ];
          
          for (const command of stopCommands) {
            try {
              await this.controlChar.writeValue(command);
              console.log(`✅ Stop command sent`);
            } catch (cmdError) {
              console.warn('Stop command failed:', cmdError);
            }
          }
        } catch (cmdError) {
          console.warn('Stop commands failed:', cmdError);
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