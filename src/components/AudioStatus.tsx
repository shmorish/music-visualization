import React from 'react';
import { Box, Typography, Chip, styled } from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  Stop, 
  MusicNote,
  VolumeUp,
  VolumeOff 
} from '@mui/icons-material';
import { PlayerStatus } from '@/types/audio';

interface AudioStatusProps {
  status: PlayerStatus;
  isVisualizerActive: boolean;
  hasAudio: boolean;
  videoTitle?: string;
}

const StatusContainer = styled(Box)(({ theme }) => ({
  padding: 16,
  borderRadius: 12,
  backgroundColor: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: 16,
}));

const StatusRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
  
  '&:last-child': {
    marginBottom: 0,
  },
});

const StatusChip = styled(Chip)<{ statuscolor: string }>(({ statuscolor }) => ({
  backgroundColor: statuscolor,
  color: 'white',
  fontWeight: 600,
  '& .MuiChip-icon': {
    color: 'white',
  },
}));

const AudioStatus: React.FC<AudioStatusProps> = ({
  status,
  isVisualizerActive,
  hasAudio,
  videoTitle,
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'playing':
        return {
          label: 'Playing',
          icon: <PlayArrow />,
          color: '#4caf50',
        };
      case 'paused':
        return {
          label: 'Paused',
          icon: <Pause />,
          color: '#ff9800',
        };
      case 'loading':
        return {
          label: 'Loading',
          icon: <MusicNote />,
          color: '#2196f3',
        };
      case 'ready':
        return {
          label: 'Ready',
          icon: <Stop />,
          color: '#9e9e9e',
        };
      case 'error':
        return {
          label: 'Error',
          icon: <VolumeOff />,
          color: '#f44336',
        };
      default:
        return {
          label: 'Idle',
          icon: <VolumeOff />,
          color: '#9e9e9e',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <StatusContainer>
      <StatusRow>
        <Typography variant="body2" color="text.secondary">
          Audio Status
        </Typography>
        <StatusChip
          statuscolor={statusConfig.color}
          icon={statusConfig.icon}
          label={statusConfig.label}
          size="small"
        />
      </StatusRow>
      
      <StatusRow>
        <Typography variant="body2" color="text.secondary">
          Visualization
        </Typography>
        <StatusChip
          statuscolor={isVisualizerActive ? '#4caf50' : '#9e9e9e'}
          icon={isVisualizerActive ? <VolumeUp /> : <VolumeOff />}
          label={isVisualizerActive ? 'Active' : 'Inactive'}
          size="small"
        />
      </StatusRow>

      <StatusRow>
        <Typography variant="body2" color="text.secondary">
          Audio Source
        </Typography>
        <StatusChip
          statuscolor={hasAudio ? '#4caf50' : '#9e9e9e'}
          icon={<MusicNote />}
          label={hasAudio ? 'Connected' : 'None'}
          size="small"
        />
      </StatusRow>

      {videoTitle && (
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            Now Playing:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {videoTitle}
          </Typography>
        </Box>
      )}
    </StatusContainer>
  );
};

export default AudioStatus;