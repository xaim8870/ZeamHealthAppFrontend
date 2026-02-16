// src/utils/testMuseStreaming.tsx
import React from 'react'; // ADD THIS IMPORT
import { UniversalMuseAdapter } from '@/services/eeg/adapters/UniversalMuseAdapter';

export async function testMuseStreaming(durationMs = 10000): Promise<boolean> {
  console.log('🧪 Starting Muse S BBA3 streaming test...');
  
  const adapter = new UniversalMuseAdapter();
  const frames: any[] = [];
  let unsubscribe: (() => void) | null = null;
  
  try {
    // Step 1: Connect
    console.log('🔗 Connecting to Muse...');
    const connected = await adapter.connect();
    
    if (!connected) {
      throw new Error('Failed to connect');
    }
    
    console.log('✅ Connected successfully');
    
    // Step 2: Set up data listener
    console.log('👂 Listening for EEG data...');
    unsubscribe = adapter.onData((frame) => {
      frames.push(frame);
      console.log(`📊 Frame ${frames.length}:`, {
        ts: new Date(frame.ts).toISOString(),
        values: frame.values.map((v: number) => v.toFixed(2)),
        device: frame.device
      });
    });
    
    // Step 3: Start streaming
    console.log('🎵 Starting EEG stream...');
    await adapter.start(); // This should now work after fixing the duplicate method issue
    
    // Step 4: Collect data for specified duration
    console.log(`⏱️ Collecting data for ${durationMs/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, durationMs));
    
    // Step 5: Stop
    console.log('🛑 Stopping stream...');
    await adapter.stop();
    if (unsubscribe) unsubscribe();
    
    // Step 6: Save to JSON
    if (frames.length > 0) {
      const data = {
        meta: {
          test: 'Muse S BBA3 Streaming Test',
          timestamp: new Date().toISOString(),
          durationMs,
          totalFrames: frames.length,
          deviceInfo: adapter.getDeviceInfo(),
        },
        frames: frames
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `muse_test_${Date.now()}.json`;
      a.click();
      
      console.log(`✅ Test complete! Saved ${frames.length} frames to JSON`);
      console.log(`📁 File: ${a.download}`);
      
      URL.revokeObjectURL(url);
      return true;
    } else {
      console.warn('⚠️ No EEG frames were collected!');
      console.warn('Possible issues:');
      console.warn('1. Wrong EEG characteristic UUID');
      console.warn('2. Muse not initialized (use Muse Direct app first)');
      console.warn('3. Device not streaming EEG');
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ Test failed:', error);
    
    if (unsubscribe) unsubscribe();
    
    // Provide troubleshooting tips
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Ensure Muse S is charged and turned ON');
    console.log('2. Put Muse in pairing mode (blinking lights)');
    console.log('3. Try connecting with Muse Direct app first');
    console.log('4. Factory reset Muse (hold button 20+ seconds)');
    console.log('5. Use Chrome/Edge on desktop (full Web Bluetooth support)');
    
    return false;
  }
}

// Create a React component for testing
export const MuseTestButton: React.FC = () => {
  const [testing, setTesting] = React.useState(false);
  
  const handleTest = async () => {
    setTesting(true);
    try {
      const success = await testMuseStreaming(5000);
      if (success) {
        alert('✅ Muse test successful! JSON file downloaded.');
      } else {
        alert('❌ Muse test failed. Check console for details.');
      }
    } finally {
      setTesting(false);
    }
  };
  
  return (
    <button 
      onClick={handleTest}
      disabled={testing}
      style={{
        padding: '10px 20px',
        background: testing ? '#666' : '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: testing ? 'not-allowed' : 'pointer',
        fontSize: '14px'
      }}
    >
      {testing ? '🧪 Testing...' : ' Test Muse Streaming'}
    </button>
  );
};