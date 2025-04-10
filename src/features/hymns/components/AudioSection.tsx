import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { Button } from '../../../core/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../core/components/ui/card';
import { supabase } from '../../../lib/supabase';

interface AudioSectionProps {
  hymnId: string;
}

interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

const AudioSection: React.FC<AudioSectionProps> = ({ hymnId }) => {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  // Tải danh sách âm thanh
  useEffect(() => {
    async function fetchAudioTracks() {
      try {
        setIsLoading(true);
        setError('');
        
        const { data: hymn_audios, error: tracksError } = await supabase
          .from('hymn_audios')
          .select('id, title, file_key')
          .eq('hymn_id', hymnId)
          .order('title');
        
        if (tracksError) throw tracksError;

        if (hymn_audios && hymn_audios.length > 0) {
          // Lấy signed URL cho mỗi file audio
          const tracksWithUrls = await Promise.all(
            hymn_audios.map(async track => {
              try {
                const { data: urlData } = await supabase
                  .storage
                  .from('audio')
                  .createSignedUrl(track.file_key, 3600);

                return {
                  id: track.id,
                  title: track.title,
                  url: urlData?.signedUrl || ''
                };
              } catch (err) {
                console.error('Error creating signed URL:', err);
                return {
                  id: track.id,
                  title: track.title,
                  url: ''
                };
              }
            })
          );

          setAudioTracks(tracksWithUrls.filter(track => track.url));
        } else {
          setAudioTracks([]);
        }
      } catch (err) {
        console.error('Error fetching audio tracks:', err);
        setError('Không thể tải danh sách âm thanh.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAudioTracks();

    // Dọn dẹp
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [hymnId]);

  // Xử lý khi chọn track mới
  const handleTrackSelect = (index: number) => {
    // Nếu đang phát một track khác, dừng lại
    if (audio) {
      audio.pause();
    }

    // Khởi tạo audio mới nếu chọn track khác
    if (index !== currentTrackIndex) {
      const newAudio = new Audio(audioTracks[index].url);
      newAudio.muted = isMuted;
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      setAudio(newAudio);
      setCurrentTrackIndex(index);
      
      // Tự động phát khi chọn
      newAudio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Error playing audio:', err);
        });
    } else {
      // Nếu đã đang chọn track này, toggle play/pause
      togglePlayPause();
    }
  };

  // Toggle phát/dừng
  const togglePlayPause = () => {
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Toggle tắt/bật âm
  const toggleMute = () => {
    if (!audio) return;
    
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Nếu không có audio nào, không hiển thị gì
  if (!isLoading && audioTracks.length === 0 && !error) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Âm thanh</CardTitle>
        {currentTrackIndex !== -1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 p-3 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="animate-pulse flex flex-col space-y-2">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {audioTracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-md ${
                  currentTrackIndex === index
                    ? 'bg-indigo-50 dark:bg-indigo-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="font-medium">{track.title}</span>
                <Button
                  size="icon"
                  variant={currentTrackIndex === index ? 'default' : 'ghost'}
                  className={currentTrackIndex === index ? 'text-white' : ''}
                  onClick={() => handleTrackSelect(index)}
                >
                  {currentTrackIndex === index && isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioSection;
