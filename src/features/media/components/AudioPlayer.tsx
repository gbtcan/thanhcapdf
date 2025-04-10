import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  RefreshCw
} from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  title?: string;
  disabled?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  src, 
  title = 'Audio',
  disabled = false 
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Update audio element when src changes
  useEffect(() => {
    if (audioRef.current) {
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(true);
      setError(false);
      
      // Set initial volume
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
      
      // Load audio
      audioRef.current.load();
    }
  }, [src]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current || disabled) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || disabled) return;
    
    const newTime = parseFloat(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || disabled) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    
    // Unmute if volume is changed and was previously muted
    if (isMuted && newVolume > 0) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };
  
  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current || disabled) return;
    
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };
  
  // Skip backward 10 seconds
  const skipBackward = () => {
    if (!audioRef.current || disabled) return;
    
    const newTime = Math.max(0, currentTime - 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Skip forward 10 seconds
  const skipForward = () => {
    if (!audioRef.current || disabled) return;
    
    const newTime = Math.min(duration, currentTime + 10);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Reset player on error
  const handleReset = () => {
    setError(false);
    setIsLoading(true);
    
    if (audioRef.current) {
      audioRef.current.load();
    }
  };
  
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-4 ${disabled ? 'opacity-50' : ''}`}>
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onDurationChange={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => setIsPlaying(false)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        preload="metadata"
      />
      
      {/* Title */}
      <div className="text-sm font-medium text-gray-800 dark:text-white mb-3 truncate">
        {title}
      </div>
      
      {/* Time slider */}
      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          disabled={disabled || isLoading || error}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: disabled || isLoading || error
              ? ''
              : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Time display */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Main controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={skipBackward}
            disabled={disabled || isLoading || error}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed focus:outline-none"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            disabled={disabled || isLoading || error}
            className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed focus:outline-none"
          >
            {isLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : error ? (
              <RefreshCw className="h-5 w-5" onClick={handleReset} />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          
          <button
            onClick={skipForward}
            disabled={disabled || isLoading || error}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed focus:outline-none"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>
        
        {/* Volume controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleMute}
            disabled={disabled}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed focus:outline-none"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={handleVolumeChange}
            disabled={disabled}
            className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: disabled
                ? ''
                : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
            }}
          />
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mt-3 text-xs text-red-600 dark:text-red-400">
          Không thể phát audio. Vui lòng thử lại hoặc tải xuống tệp.
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;
