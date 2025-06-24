import React from 'react';
import { Box, styled } from '@mui/material';
import ControlSection from './ControlSection';
import AudioStatus from './AudioStatus';
import AudioSourceSelector, { AudioSourceType } from './AudioSourceSelector';
import YouTubePlayer, { YouTubePlayerRef } from './YouTubePlayer';
import { VisualizationConfig, PlayerStatus } from '@/types/audio';
import { YouTubePlayerInstance } from '@/types/youtube';

interface RightPanelProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  onLoadVideo: () => void;
  videoId: string;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  visualizationConfig: VisualizationConfig;
  onConfigChange: (config: Partial<VisualizationConfig>) => void;
  isLoading: boolean;
  playerStatus: PlayerStatus;
  hasAudio: boolean;
  audioSource: AudioSourceType;
  onAudioSourceChange: (source: AudioSourceType) => void;
  connectionMethod?: string;
  onPlayerReady?: (player: YouTubePlayerInstance) => void;
  onPlayerStateChange?: (event: { data: number; target: YouTubePlayerInstance }) => void;
  onPlayerError?: (event: { data: number; target: YouTubePlayerInstance }) => void;
  playerRef?: React.RefObject<YouTubePlayerRef>;
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
  visualizationConfig,
  onConfigChange,
  isLoading,
  playerStatus,
  hasAudio,
  audioSource,
  onAudioSourceChange,
  connectionMethod,
  onPlayerReady,
  onPlayerStateChange,
  onPlayerError,
  playerRef,
}) => {
  return (
    <Panel>
      <ControlSection
        youtubeUrl={youtubeUrl}
        onUrlChange={onUrlChange}
        onLoadVideo={onLoadVideo}
        isPlaying={isPlaying}
        onTogglePlayback={onTogglePlayback}
        visualizationConfig={visualizationConfig}
        onConfigChange={onConfigChange}
        isLoading={isLoading}
      />

      <AudioSourceSelector
        selectedSource={audioSource}
        onSourceChange={onAudioSourceChange}
        hasVideo={!!videoId}
        isConnected={hasAudio}
        connectionMethod={connectionMethod || undefined}
      />

      <AudioStatus
        status={playerStatus}
        isVisualizerActive={isPlaying}
        hasAudio={hasAudio}
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