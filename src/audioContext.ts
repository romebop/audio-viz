export const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
export const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
