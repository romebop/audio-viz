import { useRef, useCallback } from 'react';
import AudioPlayer from './components/AudioPlayer';
import Visualizer from './components/Visualizer';
import { audioContext, analyser } from './audioContext';
import './App.css';

// Extend HTMLMediaElement to include our custom source node
declare global {
  interface HTMLMediaElement {
    __sourceNode?: MediaElementSourceNode;
  }
}

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Callback ref for the audio element to ensure connection happens only once
  const audioCallbackRef = useCallback((audioElement: HTMLAudioElement | null) => {
    audioRef.current = audioElement; // Keep the ref updated

    if (audioElement && !audioElement.__sourceNode) {
      try {
        const sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        audioElement.__sourceNode = sourceNode; // Store the source node on the audio element itself
        console.log("Audio source connected successfully via callback ref.");
      } catch (error) {
        console.error("Error connecting audio source via callback ref:", error);
      }
    }
  }, []); // Empty dependency array ensures the callback ref itself is stable

  return (
    <div className="app-container">
      <Visualizer analyser={analyser} />
      <audio ref={audioCallbackRef} src="/outofcontrol.mp3" preload="metadata" />
      <AudioPlayer audioRef={audioRef} />
    </div>
  );
}

export default App;






  
