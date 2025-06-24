import React from 'react';
import { Box, styled } from '@mui/material';
import ControlSection from './ControlSection';
import AudioStatus from './AudioStatus';
import YouTubePlayer, { YouTubePlayerRef } from './YouTubePlayer';
import { VisualizationConfig, PlayerStatus } from '@/types/audio';
import { YouTubePlayerInstance } from '@/types/youtube';

interface RightPanelProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  onLoadVideo: () => void;
  videoId: string;
  isVisualizerActive: boolean;
  onToggleVisualizer: () => void;
  visualizationConfig: VisualizationConfig;
  onConfigChange: (config: Partial<VisualizationConfig>) => void;
  isLoading: boolean;
  playerStatus: PlayerStatus;
  hasAudio: boolean;
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
  isVisualizerActive,
  onToggleVisualizer,
  visualizationConfig,
  onConfigChange,
  isLoading,
  playerStatus,
  hasAudio,
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
        isVisualizerActive={isVisualizerActive}
        onToggleVisualizer={onToggleVisualizer}
        visualizationConfig={visualizationConfig}
        onConfigChange={onConfigChange}
        isLoading={isLoading}
      />

      <AudioStatus
        status={playerStatus}
        isVisualizerActive={isVisualizerActive}
        hasAudio={hasAudio}
      />

      {/* Hidden YouTube Player for audio only */}
      {videoId && (
        <Box sx={{ display: 'none' }}>
          <YouTubePlayer
            ref={playerRef}
            videoId={videoId}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
            onError={onPlayerError}
          />
        </Box>
      )}
    </Panel>
  );
};

export default RightPanel;