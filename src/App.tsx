import { useRef, useCallback } from 'react';

import AudioPlayer from './components/AudioPlayer';
import Visualizer from './components/Visualizer';
import { audioContext, analyser } from './audioContext';

import './App.css';

declare global {
  interface HTMLMediaElement {
    __sourceNode?: MediaElementAudioSourceNode;
  }
}

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioSrc = `${import.meta.env.BASE_URL}outofcontrol.mp3`;

  const audioCallbackRef = useCallback((audioElement: HTMLAudioElement | null) => {
    audioRef.current = audioElement;

    if (audioElement && !audioElement.__sourceNode) {
      try {
        const sourceNode = audioContext.createMediaElementSource(audioElement);
        sourceNode.connect(analyser);
        analyser.connect(audioContext.destination);
        audioElement.__sourceNode = sourceNode;
        console.log('Audio source connected successfully via callback ref.');
      } catch (error) {
        console.error('Error connecting audio source via callback ref:', error);
      }
    }
  }, []);

  return (
    <div className='app-container'>
      <Visualizer analyser={analyser} />
      <audio ref={audioCallbackRef} src={audioSrc} preload='metadata' />
      <AudioPlayer audioRef={audioRef} />
    </div>
  );
}

export default App;