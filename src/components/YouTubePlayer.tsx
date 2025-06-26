import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Box, styled } from '@mui/material';
import { YouTubePlayerInstance, YouTubePlayerConfig } from '@/types/youtube';
import { loadYouTubeAPI } from '@/utils/youtube';

interface YouTubePlayerProps {
  videoId: string;
  onReady?: (player: YouTubePlayerInstance) => void;
  onStateChange?: (event: { data: number; target: YouTubePlayerInstance }) => void;
  onError?: (event: { data: number; target: YouTubePlayerInstance }) => void;
  width?: string;
  height?: string;
}

export interface YouTubePlayerRef {
  getPlayer: () => YouTubePlayerInstance | null;
}

const PlayerContainer = styled(Box)(({ theme }) => ({
  display: 'none', // Hide the video player completely
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0px rgba(0, 0, 0, 0.3)',
  
  '& iframe': {
    width: '100% !important',
    
    [theme.breakpoints.down('md')]: {
      height: '250px !important',
    },
  },
}));

const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({
  videoId,
  onReady,
  onStateChange,
  onError,
  width = '560',
  height = '315',
}, ref) => {
  const playerRef = useRef<YouTubePlayerInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerElementId = useRef(`youtube-player-${Math.random().toString(36).substr(2, 9)}`);

  useImperativeHandle(ref, () => ({
    getPlayer: () => playerRef.current,
  }));

  useEffect(() => {
    let isMounted = true;

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (!isMounted || !containerRef.current) return;

        // Create player div
        const playerDiv = document.createElement('div');
        playerDiv.id = playerElementId.current;
        containerRef.current.appendChild(playerDiv);

        const config: YouTubePlayerConfig = {
          height,
          width,
          videoId,
          playerVars: {
            playsinline: 1,
            controls: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (isMounted) {
                playerRef.current = event.target;
                onReady?.(event.target);
              }
            },
            onStateChange: (event) => {
              if (isMounted && event.data !== undefined) {
                onStateChange?.({ data: event.data, target: event.target });
              }
            },
            onError: (event) => {
              if (isMounted) {
                onError?.({ data: event.data, target: event.target });
              }
            },
          },
        };

        playerRef.current = new window.YT.Player(playerElementId.current, config);
      } catch (error) {
        console.error('Failed to initialize YouTube player:', error);
      }
    };

    initializePlayer();

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy?.();
        } catch (error) {
          console.warn('Error destroying YouTube player:', error);
        }
        playerRef.current = null;
      }
    };
  }, [videoId, onReady, onStateChange, onError, width, height]);

  return (
    <PlayerContainer ref={containerRef} />
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';

export default YouTubePlayer;