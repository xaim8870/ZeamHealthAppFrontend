let audioContext: AudioContext | null = null;

export const playBeep = () => {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Hz
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime); // low volume

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.15); // 150 ms
};
