import { useRef } from 'react';
import AudioPlayer from './components/AudioPlayer';
import Visualizer from './components/Visualizer';
import './App.css';

function App() {
  const audioRef = useRef<HTMLAudioElement>(null);

  return (
    <div className="app-container">
      <Visualizer audioRef={audioRef} />
      <audio ref={audioRef} src="/outofcontrol.mp3" preload="metadata" />
      <AudioPlayer audioRef={audioRef} />
    </div>
  );
}

export default App;
