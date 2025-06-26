import React from 'react';
import { Box, styled } from '@mui/material';
import ControlSection from './ControlSection';
import AudioStatus from './AudioStatus';
import YouTubePlayer, { YouTubePlayerRef } from './YouTubePlayer';
import AudioProgressBar from './AudioProgressBar';
import YouTubePlaylist from './YouTubePlaylist';
import { PlayerStatus } from '@/types/audio';
import { YouTubePlayerInstance } from '@/types/youtube';

interface RightPanelProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  onLoadVideo: () => void;
  videoId: string;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  isLoading: boolean;
  playerStatus: PlayerStatus;
  hasAudio: boolean;
  connectionMethod?: string;
  onPlayerReady?: (player: YouTubePlayerInstance) => void;
  onPlayerStateChange?: (event: { data: number; target: YouTubePlayerInstance }) => void;
  onPlayerError?: (event: { data: number; target: YouTubePlayerInstance }) => void;
  playerRef?: React.RefObject<YouTubePlayerRef>;
  getCurrentTime: () => number;
  getDuration: () => number;
  seekTo: (time: number) => void;
}

const Panel = styled(Box)(({ theme }) => ({
  flex: 1,
  backgroundColor: theme.palette.background.paper,
  padding: 32,
  display: 'flex',
  flexDirection: 'column',
  gap: 32,
  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  
  [theme.breakpoints.down('lg')]: {
    padding: 24,
  },
  
  [theme.breakpoints.down('md')]: {
    padding: 16,
    gap: 24,
  },
}));

const PlayerSection = styled(Box)({
  textAlign: 'center',
});

const RightPanel: React.FC<RightPanelProps> = ({
  youtubeUrl,
  onUrlChange,
  onLoadVideo,
  videoId,
  isPlaying,
  onTogglePlayback,
  isLoading,
  playerStatus,
  hasAudio,
  connectionMethod,
  onPlayerReady,
  onPlayerStateChange,
  onPlayerError,
  playerRef,
  getCurrentTime,
  getDuration,
  seekTo,
}) => {
  return (
    <Panel>
      <ControlSection
        youtubeUrl={youtubeUrl}
        onUrlChange={onUrlChange}
        onLoadVideo={onLoadVideo}
        isPlaying={isPlaying}
        onTogglePlayback={onTogglePlayback}
        isLoading={isLoading}
      />

      <AudioStatus
        status={playerStatus}
        isVisualizerActive={isPlaying}
        hasAudio={hasAudio}
        connectionMethod={connectionMethod}
      />

      {/* Audio Progress Bar */}
      {videoId && playerStatus !== 'idle' && (
        <AudioProgressBar
          getCurrentTime={getCurrentTime}
          getDuration={getDuration}
          isPlaying={playerStatus === 'playing'}
          onSeek={seekTo}
        />
      )}

      {/* YouTube Playlist */}
      <YouTubePlaylist
        onSelectVideo={onUrlChange}
        currentVideoId={videoId}
      />

      {/* YouTube Player for audio playback */}
      {videoId && (
        <PlayerSection>
          <YouTubePlayer
            ref={playerRef}
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            onError={onPlayerError}
          />
        </PlayerSection>
      )}
    </Panel>
  );
};

export default RightPanel;