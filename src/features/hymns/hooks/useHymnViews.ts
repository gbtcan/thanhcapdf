import { useEffect, useState } from 'react';
import { incrementHymnView } from '../api/hymnApi';
import { useAuth } from '../../../contexts/AuthContext';

interface UseHymnViewsProps {
  hymnId: string;
  autoRecord?: boolean;
  delay?: number;
}

/**
 * Hook to handle recording hymn views
 */
export function useHymnViews({ hymnId, autoRecord = true, delay = 1000 }: UseHymnViewsProps) {
  const { user } = useAuth();
  const [viewed, setViewed] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Automatically record view after delay
  useEffect(() => {
    if (!hymnId || !autoRecord || viewed) return;

    const timer = setTimeout(() => {
      recordView();
    }, delay);

    return () => clearTimeout(timer);
  }, [hymnId, autoRecord, viewed, delay]);

  // Function to manually record a view
  const recordView = async () => {
    if (!hymnId || viewed || isRecording) return;

    try {
      setIsRecording(true);
      await incrementHymnView(hymnId, user?.id);
      setViewed(true);
    } catch (error) {
      console.error('Failed to record hymn view:', error);
    } finally {
      setIsRecording(false);
    }
  };

  return {
    viewed,
    isRecording,
    recordView
  };
}
