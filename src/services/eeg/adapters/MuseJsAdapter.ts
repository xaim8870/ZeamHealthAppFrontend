import { MuseClient, EEGReading, TelemetryData } from 'muse-js';
import type { EEGFrame } from "./EEGAdapter";

export class MuseJsAdapter {
  private client: MuseClient;
  private running = false;
  private callbacks: ((f: EEGFrame) => void)[] = [];

  constructor() {
    this.client = new MuseClient();
    
    // Note: enableDrlRef doesn't exist in current muse-js API
    // Configuration happens differently in current version
  }

  async connect() {
    try {
      console.log("Connecting with muse-js...");
      
      // Connect to Muse
      await this.client.connect();
      console.log('✅ Muse connected via muse-js');
      
      return true;
    } catch (error: any) {
      console.error('muse-js connection error:', error);
      throw new Error(`Connection Error: ${error.message || 'Connection attempt failed.'}`);
    }
  }

  async start() {
    // Check if connected - current API might use different property
    if (!this.client) {
      throw new Error("Call connect() first");
    }

    this.running = true;
    console.log('🎵 Starting EEG streaming with muse-js...');

    try {
      // Start data acquisition
      await this.client.start();
      console.log('✅ Muse started');

      // Listen for EEG data
      this.client.eegReadings.subscribe((reading: EEGReading) => {
        if (!this.running) return;

        try {
          // Check what properties are actually available
          console.log('Raw EEG reading:', {
            electrode: reading.electrode,
            samplesCount: reading.samples?.length,
            timestamp: reading.timestamp
          });
          
          // Extract channel names
          const channelNames = ["TP9", "AF7", "AF8", "TP10", "AUX"];
          const electrode = reading.electrode || 0;
          const channel = electrode < channelNames.length ? channelNames[electrode] : `Channel_${electrode}`;
          
          // Create EEG frame
          const frame: EEGFrame = {
            device: "muse-s",
            adapter: "muse-js",
            ts: Date.now(),
            channel: channel,
            values: reading.samples || [],
          };
          
          // Notify all callbacks
          this.callbacks.forEach(callback => {
            try {
              callback(frame);
            } catch (err) {
              console.warn('Callback error:', err);
            }
          });
          
          // Log first sample for debugging
          if (reading.samples && reading.samples.length > 0) {
            console.log(`EEG Channel ${channel}: First sample = ${reading.samples[0]}`);
          }
        } catch (error) {
          console.warn('EEG parsing error:', error);
        }
      });

      // Listen for telemetry (battery) data if available
      if (this.client.telemetryData) {
        this.client.telemetryData.subscribe((telemetry: TelemetryData) => {
          console.log('Telemetry received:', telemetry);
          // Battery level might be in telemetry data
          if (telemetry.batteryLevel !== undefined) {
            console.log('Battery level:', telemetry.batteryLevel);
          }
        });
      }

      // Listen for accelerometer data if needed
      if (this.client.accelerometerData) {
        this.client.accelerometerData.subscribe((accel) => {
          console.log('Accelerometer:', accel);
        });
      }

      console.log('✅ EEG streaming active with muse-js');
    } catch (error) {
      console.error('Start error:', error);
      this.running = false;
      throw error;
    }
  }

  async stop() {
    this.running = false;
    
    try {
      if (this.client) {
        // Note: Some versions of muse-js don't have stop() method
        // Disconnect directly
        await this.client.disconnect();
        console.log('🔌 Muse disconnected via muse-js');
      }
    } catch (error) {
      console.error('Stop error:', error);
    }
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

  // Additional helper methods
  async getDeviceInfo() {
    try {
      // Check if deviceInfo is available
      if ((this.client as any).deviceInfo) {
        return (this.client as any).deviceInfo;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getBatteryLevel(): Promise<number | null> {
    try {
      // Battery level might come from telemetry
      // This is a placeholder - you need to check how your version provides battery
      return null;
    } catch {
      return null;
    }
  }
}