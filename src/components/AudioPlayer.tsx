import { useState, useEffect, RefObject } from 'react';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import { audioContext } from '../audioContext'; // Import audioContext
import './AudioPlayer.css';

interface AudioPlayerProps {
  audioRef: RefObject<HTMLAudioElement>;
}

function AudioPlayer({ audioRef }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    console.log('AudioPlayer useEffect - audioRef.current:', audio); // Debugging line

    if (audio) {
      const setAudioData = () => {
        console.log('loadeddata event fired'); // Debugging line
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
      };

      const setAudioTime = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.addEventListener('loadeddata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);

      // Initialize if audio is already loaded (e.g., from cache)
      if (audio.readyState >= 2) { // HTMLMediaElement.HAVE_CURRENT_DATA or higher
        setAudioData();
      }

      // Set initial volume
      audio.volume = volume;

      return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
      };
    }
  }, [audioRef, volume]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    console.log('togglePlayPause called. audioRef.current:', audio); // Debugging line
    console.log('AudioContext state:', audioContext.state); // Debugging audio context state

    if (audio) {
      if (isPlaying) {
        audio.pause();
        console.log('Audio paused'); // Debugging line
      } else {
        // Resume AudioContext if it's suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('AudioContext resumed successfully');
            audio.play().then(() => {
              console.log('Audio play successful'); // Debugging line
            }).catch(error => {
              console.error('Error playing audio:', error); // Catch potential play errors
            });
          }).catch(error => {
            console.error('Error resuming AudioContext:', error);
          });
        } else {
          audio.play().then(() => {
            console.log('Audio play successful'); // Debugging line
          }).catch(error => {
            console.error('Error playing audio:', error); // Catch potential play errors
          });
        }
        console.log('Attempting to play audio'); // Debugging line
      }
      setIsPlaying(!isPlaying);
    } else {
      console.log('Audio element not available for play/pause in togglePlayPause'); // Debugging line
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = parseFloat(e.target.value);
      setCurrentTime(audio.currentTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const newVolume = parseFloat(e.target.value);
      audio.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="audio-player">
      <div className="controls">
        <button onClick={togglePlayPause}>
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="seek-bar"
        />
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
        <div className="volume-control">
          <FaVolumeUp />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>
    </div>
  );
}

export default AudioPlayer;
