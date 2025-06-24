import React from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  styled,
} from '@mui/material';
import {
  VideoLibrary,
  Mic,
  Science,
} from '@mui/icons-material';

export type AudioSourceType = 'video' | 'microphone' | 'demo';

interface AudioSourceSelectorProps {
  selectedSource: AudioSourceType;
  onSourceChange: (source: AudioSourceType) => void;
  hasVideo: boolean;
  isConnected: boolean;
  connectionMethod?: string;
}

const SelectorContainer = styled(Box)(({ theme }) => ({
  padding: 16,
  borderRadius: 12,
  backgroundColor: theme.palette.mode === 'light' 
    ? 'rgba(255, 255, 255, 0.8)' 
    : 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: 16,
}));

const SourceOption = styled(FormControlLabel)(({ theme }) => ({
  margin: '8px 0',
  padding: '8px 12px',
  borderRadius: 8,
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.04)' 
      : 'rgba(255, 255, 255, 0.08)',
  },
  
  '& .MuiRadio-root': {
    marginRight: 12,
  },
  
  '& .MuiFormControlLabel-label': {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    
    '& .source-icon': {
      fontSize: 20,
      color: theme.palette.primary.main,
    },
    
    '& .source-details': {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      
      '& .source-title': {
        fontWeight: 500,
        fontSize: '0.9rem',
      },
      
      '& .source-description': {
        fontSize: '0.75rem',
        color: theme.palette.text.secondary,
        marginTop: 2,
      },
    },
  },
}));

const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  selectedSource,
  onSourceChange,
  hasVideo,
  isConnected,
  connectionMethod,
}) => {
  return (
    <SelectorContainer>
      <Typography variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
        Audio Source
      </Typography>
      
      {isConnected && connectionMethod && (
        <Alert severity="success" sx={{ mb: 2, fontSize: '0.875rem' }}>
          Connected via: {connectionMethod}
        </Alert>
      )}
      
      <RadioGroup
        value={selectedSource}
        onChange={(e) => onSourceChange(e.target.value as AudioSourceType)}
      >
        <SourceOption
          value="video"
          control={<Radio />}
          disabled={!hasVideo}
          label={
            <Box className="source-details">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoLibrary className="source-icon" />
                <Typography className="source-title">
                  YouTube Video Audio
                </Typography>
              </Box>
              <Typography className="source-description">
                {hasVideo 
                  ? 'Use audio from the loaded YouTube video' 
                  : 'Load a YouTube video first'}
              </Typography>
            </Box>
          }
        />
        
        <SourceOption
          value="microphone"
          control={<Radio />}
          label={
            <Box className="source-details">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mic className="source-icon" />
                <Typography className="source-title">
                  Microphone Input
                </Typography>
              </Box>
              <Typography className="source-description">
                Use your microphone to capture ambient audio
              </Typography>
            </Box>
          }
        />
        
        <SourceOption
          value="demo"
          control={<Radio />}
          label={
            <Box className="source-details">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Science className="source-icon" />
                <Typography className="source-title">
                  Demo Mode
                </Typography>
              </Box>
              <Typography className="source-description">
                Synthetic audio for testing visualization
              </Typography>
            </Box>
          }
        />
      </RadioGroup>
    </SelectorContainer>
  );
};

export default AudioSourceSelector;