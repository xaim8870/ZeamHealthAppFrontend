// EEGDeviceManager.ts
import type { EEGAdapter, EEGFrame, DeviceInfo, DeviceType } from "./adapters/EEGAdapter";
import { UniversalMuseAdapter } from "./adapters/UniversalMuseAdapter";

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'streaming' | 'error';

export class EEGDeviceManager {
  private static instance: EEGDeviceManager;
  private adapter: EEGAdapter | null = null;
  private deviceInfo: DeviceInfo | null = null;
  private status: ConnectionStatus = 'disconnected';
  private callbacks: {
    onData: ((frame: EEGFrame) => void)[];
    onStatusChange: ((status: ConnectionStatus, deviceInfo: DeviceInfo | null) => void)[];
  } = {
    onData: [],
    onStatusChange: []
  };

  private constructor() {}

  static getInstance(): EEGDeviceManager {
    if (!EEGDeviceManager.instance) {
      EEGDeviceManager.instance = new EEGDeviceManager();
    }
    return EEGDeviceManager.instance;
  }

  async discoverMuseDevices(): Promise<DeviceInfo[]> {
    console.log('🔍 Scanning for Muse devices...');
    
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not supported. Use Chrome/Edge on desktop.');
    }

    const devices: DeviceInfo[] = [];
    
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Muse' }],
        optionalServices: [
          '0000fe8d-0000-1000-8000-00805f9b34fb', // Muse S
          '0000fe8c-0000-1000-8000-00805f9b34fb', // Muse 2
          '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Muse OG
        ],
      });

      // Create device info
      const deviceInfo: DeviceInfo = {
        id: device.id,
        name: device.name || 'Unknown Muse',
        type: 'muse',
        manufacturer: 'Interaxon',
        channels: 4,
        samplingRate: 256
      };

      // Detect specific model
      if (device.name?.includes('MuseS') || device.name?.includes('BBA3')) {
        deviceInfo.type = 'muse-s';
      } else if (device.name?.includes('Muse-2') || device.name?.includes('Muse 2')) {
        deviceInfo.type = 'muse-2';
      }

      devices.push(deviceInfo);
      
    } catch (error: any) {
      if (error.name !== 'NotFoundError') {
        console.error('Discovery error:', error);
      }
    }
    
    return devices;
  }

  async connect(): Promise<DeviceInfo> {
    if (this.status === 'connected' || this.status === 'streaming') {
      throw new Error('Already connected');
    }

    this.updateStatus('connecting');
    
    try {
      // Create and connect adapter
      this.adapter = new UniversalMuseAdapter();
      await this.adapter.connect();
      
      // Get device info
      this.deviceInfo = this.adapter.getDeviceInfo?.() || {
        id: 'unknown',
        name: 'Muse Device',
        type: 'muse',
        manufacturer: 'Interaxon',
        channels: 4,
        samplingRate: 256
      };
      
      // Setup data handler
      this.adapter.onData((frame: EEGFrame) => {
        this.callbacks.onData.forEach(callback => callback(frame));
      });
      
      this.updateStatus('connected');
      return this.deviceInfo;
      
    } catch (error: any) {
      this.updateStatus('error');
      throw error;
    }
  }

  async startStreaming(): Promise<void> {
    if (!this.adapter) {
      throw new Error('Not connected. Call connect() first.');
    }

    if (this.status === 'streaming') {
      throw new Error('Already streaming');
    }

    try {
      await this.adapter.start();
      this.updateStatus('streaming');
    } catch (error: any) {
      this.updateStatus('error');
      throw error;
    }
  }

  async stopStreaming(): Promise<void> {
    if (this.adapter) {
      await this.adapter.stop();
    }
    this.updateStatus('connected');
  }

  async disconnect(): Promise<void> {
    if (this.adapter) {
      await this.adapter.stop();
      this.adapter = null;
    }
    
    this.deviceInfo = null;
    this.updateStatus('disconnected');
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  isConnected(): boolean {
    return this.status === 'connected' || this.status === 'streaming';
  }

  isStreaming(): boolean {
    return this.status === 'streaming';
  }

  // Event subscription
  onData(callback: (frame: EEGFrame) => void): () => void {
    this.callbacks.onData.push(callback);
    return () => {
      this.callbacks.onData = this.callbacks.onData.filter(cb => cb !== callback);
    };
  }

  onStatusChange(callback: (status: ConnectionStatus, deviceInfo: DeviceInfo | null) => void): () => void {
    this.callbacks.onStatusChange.push(callback);
    return () => {
      this.callbacks.onStatusChange = this.callbacks.onStatusChange.filter(cb => cb !== callback);
    };
  }

  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.callbacks.onStatusChange.forEach(callback => 
      callback(status, this.deviceInfo)
    );
  }
}