import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../utils/formatters';
import { AudioFile } from '../types';

interface HymnPlayerProps {
  audioFiles: AudioFile[];
  title?: string;
  autoPlay?: boolean;
}

const HymnPlayer: React.FC<HymnPlayerProps> = ({ 
  audioFiles, 
  title = 'Audio Recording',
  autoPlay = false 
}) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Get current track
  const currentTrack = audioFiles[currentTrackIndex];

  // Create full title from track description or main title
  const trackTitle = currentTrack?.description || title;

  // Initialize audio element
  useEffect(() => {
    if (!audioFiles || audioFiles.length === 0) return;
    
    const audioElement = audioRef.current;
    if (!audioElement) return;

    // Set up event listeners
    const setAudioData = () => {
      setDuration(audioElement.duration);
      if (autoPlay) {
        audioElement.play().catch(e => console.error('Autoplay failed:', e));
      }
    };

    const setAudioTime = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const setAudioEnd = () => {
      // Go to next track or stop if this is the last one
      if (currentTrackIndex < audioFiles.length - 1) {
        setCurrentTrackIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    // Add event listeners
    audioElement.addEventListener('loadeddata', setAudioData);
    audioElement.addEventListener('timeupdate', setAudioTime);
    audioElement.addEventListener('ended', setAudioEnd);

    // Cleanup event listeners
    return () => {
      audioElement.removeEventListener('loadeddata', setAudioData);
      audioElement.removeEventListener('timeupdate', setAudioTime);
      audioElement.removeEventListener('ended', setAudioEnd);
    };
  }, [audioFiles, currentTrackIndex, autoPlay]);

  // Update audio element when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;
    
    // Reset time and start playing the new track
    setCurrentTime(0);
    setIsPlaying(true);
    
    // Update the source and play
    audioRef.current.src = currentTrack.audio_path;
    audioRef.current.load();
    audioRef.current.play().catch(e => {
      console.error('Playback failed:', e);
      setIsPlaying(false);
    });
  }, [currentTrackIndex, currentTrack]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error('Playback failed:', e));
    }
    
    setIsPlaying(!isPlaying);
  };

  // Play previous track
  const playPrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
    } else {
      // If at the first track, restart it
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.error('Playback failed:', e));
        setIsPlaying(true);
      }
    }
  };

  // Play next track
  const playNext = () => {
    if (currentTrackIndex < audioFiles.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      // If at the last track, stop playback
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const progressBar = e.currentTarget;
    const pos = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    audioRef.current.currentTime = pos * duration;
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (!audioRef.current) return;
    
    audioRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gray-100 dark:bg-gray-850 rounded-lg p-4 w-full">
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {/* Track title and controls */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {trackTitle}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track {currentTrackIndex + 1} of {audioFiles.length}
        </p>
      </div>

      {/* Progress bar */}
      <div 
        className="h-2 bg-gray-300 dark:bg-gray-700 rounded-full mb-4 cursor-pointer"
        onClick={handleProgressClick}
      >
        <div 
          className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Time indicators */}
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-4">
        <span>{formatDuration(currentTime)}</span>
        <span>-{formatDuration(duration - currentTime)}</span>
      </div>

      {/* Media controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Previous button */}
          <button 
            onClick={playPrevious} 
            disabled={audioFiles.length <= 1}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <SkipBack className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>

          {/* Play/Pause button */}
          <button 
            onClick={togglePlay}
            className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>

          {/* Next button */}
          <button 
            onClick={playNext}
            disabled={audioFiles.length <= 1 || currentTrackIndex >= audioFiles.length - 1}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <SkipForward className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Volume controls */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Volume2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
};

export default HymnPlayer;
