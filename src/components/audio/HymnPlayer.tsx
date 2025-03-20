import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
         RefreshCw, Music, Maximize2, Minimize2 } from 'lucide-react';
import { AudioFile } from '../../types/hymns';

interface HymnPlayerProps {
  audioFiles: AudioFile[];
  title: string;
  onEnded?: () => void;
  className?: string;
  compact?: boolean;
  autoplay?: boolean;
}

const HymnPlayer: React.FC<HymnPlayerProps> = ({
  audioFiles,
  title,
  onEnded,
  className = '',
  compact = false,
  autoplay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Current audio file
  const currentFile = audioFiles[currentFileIndex];

  // Handle play/pause toggle
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle duration change
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle audio end
  const handleEnded = () => {
    if (currentFileIndex < audioFiles.length - 1) {
      // Play next track
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      // Reset to first track
      setCurrentFileIndex(0);
      setIsPlaying(false);
      if (onEnded) onEnded();
    }
  };

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      const newMuteState = !isMuted;
      audioRef.current.muted = newMuteState;
      setIsMuted(newMuteState);
    }
  };

  // Handle previous track
  const playPrevious = () => {
    if (currentFileIndex > 0) {
      setCurrentFileIndex(currentFileIndex - 1);
    } else {
      setCurrentFileIndex(audioFiles.length - 1);
    }
  };

  // Handle next track
  const playNext = () => {
    if (currentFileIndex < audioFiles.length - 1) {
      setCurrentFileIndex(currentFileIndex + 1);
    } else {
      setCurrentFileIndex(0);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update audio source when current file changes
  useEffect(() => {
    if (audioRef.current && currentFile) {
      audioRef.current.src = currentFile.file_url || currentFile.audio_path;
      audioRef.current.load();
      if (isPlaying || autoplay) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Error playing audio:', err);
            setIsPlaying(false);
          });
      }
    }
  }, [currentFile, currentFileIndex, autoplay]);

  // No audio files
  if (!audioFiles.length) {
    return null;
  }

  // Compact player view
  if (compact && !isExpanded) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentFile.description || title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Maximize2 size={16} />
          </button>
        </div>
        
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="hidden"
        />
      </div>
    );
  }

  // Full player view
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Music className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
            {currentFile.description || title}
          </h3>
        </div>
        
        {compact && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Minimize2 size={16} />
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <button 
            onClick={playPrevious}
            disabled={audioFiles.length <= 1}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button 
            onClick={playNext}
            disabled={audioFiles.length <= 1}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {audioFiles.length > 1 && (
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Audio tracks ({currentFileIndex + 1}/{audioFiles.length})
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {audioFiles.map((file, index) => (
              <button
                key={file.id}
                onClick={() => setCurrentFileIndex(index)}
                className={`w-full text-left px-2 py-1 text-sm rounded ${
                  index === currentFileIndex
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {file.description || `Track ${index + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

export default HymnPlayer;
