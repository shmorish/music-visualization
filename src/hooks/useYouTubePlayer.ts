import { useState, useCallback, useRef } from 'react';
import { PlayerStatus } from '@/types/audio';
import { YouTubePlayerInstance, YouTubePlayerState } from '@/types/youtube';
import { extractVideoId, isValidYouTubeUrl } from '@/utils/youtube';

export const useYouTubePlayer = () => {
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('idle');
  const [videoId, setVideoId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const playerInstanceRef = useRef<YouTubePlayerInstance | null>(null);

  const loadVideo = useCallback((url: string) => {
    if (!isValidYouTubeUrl(url)) {
      setError('Invalid YouTube URL');
      return false;
    }

    const extractedVideoId = extractVideoId(url);
    if (!extractedVideoId) {
      setError('Could not extract video ID from URL');
      return false;
    }

    setPlayerStatus('loading');
    setVideoId(extractedVideoId);
    setError(null);
    return true;
  }, []);

  const handlePlayerReady = useCallback((player: YouTubePlayerInstance) => {
    playerInstanceRef.current = player;
    setPlayerStatus('ready');
    setError(null);
  }, []);

  const handlePlayerStateChange = useCallback((event: { 
    data: number; 
    target: YouTubePlayerInstance 
  }) => {
    const { data } = event;
    
    switch (data) {
      case YouTubePlayerState.PLAYING:
        setPlayerStatus('playing');
        break;
      case YouTubePlayerState.PAUSED:
        setPlayerStatus('paused');
        break;
      case YouTubePlayerState.ENDED:
        setPlayerStatus('ready');
        break;
      case YouTubePlayerState.BUFFERING:
        setPlayerStatus('loading');
        break;
      default:
        break;
    }
  }, []);

  const handlePlayerError = useCallback((event: { 
    data: number; 
    target: YouTubePlayerInstance 
  }) => {
    const errorMessages: Record<number, string> = {
      2: 'The request contains an invalid parameter value',
      5: 'The requested content cannot be played in an HTML5 player',
      100: 'The video requested was not found',
      101: 'The owner of the requested video does not allow it to be played in embedded players',
      150: 'The owner of the requested video does not allow it to be played in embedded players',
    };

    const errorMessage = errorMessages[event.data] || 'An unknown error occurred';
    setError(errorMessage);
    setPlayerStatus('error');
  }, []);

  const playVideo = useCallback(() => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.playVideo();
      } catch (err) {
        console.error('Error playing video:', err);
        setError('Failed to play video');
      }
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.pauseVideo();
      } catch (err) {
        console.error('Error pausing video:', err);
        setError('Failed to pause video');
      }
    }
  }, []);

  const getCurrentTime = useCallback((): number => {
    if (playerInstanceRef.current) {
      try {
        return playerInstanceRef.current.getCurrentTime();
      } catch (err) {
        console.error('Error getting current time:', err);
      }
    }
    return 0;
  }, []);

  const getDuration = useCallback((): number => {
    if (playerInstanceRef.current) {
      try {
        return playerInstanceRef.current.getDuration();
      } catch (err) {
        console.error('Error getting duration:', err);
      }
    }
    return 0;
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.setVolume(Math.max(0, Math.min(100, volume)));
      } catch (err) {
        console.error('Error setting volume:', err);
        setError('Failed to set volume');
      }
    }
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerInstanceRef.current) {
      try {
        playerInstanceRef.current.seekTo(seconds, true);
      } catch (err) {
        console.error('Error seeking to time:', err);
        setError('Failed to seek to time');
      }
    }
  }, []);

  const getPlayerInstance = useCallback((): YouTubePlayerInstance | null => {
    return playerInstanceRef.current;
  }, []);

  const reset = useCallback(() => {
    setPlayerStatus('idle');
    setVideoId('');
    setError(null);
    playerInstanceRef.current = null;
  }, []);

  return {
    playerStatus,
    videoId,
    error,
    loadVideo,
    handlePlayerReady,
    handlePlayerStateChange,
    handlePlayerError,
    playVideo,
    pauseVideo,
    getCurrentTime,
    getDuration,
    setVolume,
    seekTo,
    getPlayerInstance,
    reset,
  };
};