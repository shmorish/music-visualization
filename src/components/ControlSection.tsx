import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Fab,
  styled,
} from '@mui/material';
import {
  Link as LinkIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';

interface ControlSectionProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  onLoadVideo: () => void;
  isPlaying: boolean;
  onTogglePlayback: () => void;
  isLoading: boolean;
}

const SectionHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 24,
});

const SectionIcon = styled(Box)(({ theme }) => ({
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
}));

const InputSection = styled(Box)({
  marginBottom: 24,
});

const InputField = styled(Box)({
  display: 'flex',
  gap: 16,
  alignItems: 'stretch',
  marginBottom: 24,
});

const ControlGroup = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 24,
});

const ControlText = styled(Typography)(({ theme }) => ({
  fontSize: '1rem',
  color: theme.palette.text.primary,
  fontWeight: 500,
}));


const ControlSection: React.FC<ControlSectionProps> = ({
  youtubeUrl,
  onUrlChange,
  onLoadVideo,
  isPlaying,
  onTogglePlayback,
  isLoading,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onLoadVideo();
    }
  };

  return (
    <Box>
      {/* YouTube Link Section */}
      <Box mb={4}>
        <SectionHeader>
          <SectionIcon>
            <LinkIcon />
          </SectionIcon>
          <Typography variant="h5" component="h2">
            YouTube Link
          </Typography>
        </SectionHeader>
        
        <InputSection>
          <InputField>
            <TextField
              fullWidth
              type="url"
              value={youtubeUrl}
              onChange={(e) => onUrlChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Paste YouTube URL here..."
              variant="outlined"
              disabled={isLoading}
            />
            <Button
              variant="contained"
              onClick={onLoadVideo}
              disabled={isLoading || !youtubeUrl.trim()}
              startIcon={<PlayArrowIcon />}
              sx={{ minWidth: 140 }}
            >
              {isLoading ? 'Loading...' : 'Load Video'}
            </Button>
          </InputField>
        </InputSection>
      </Box>

      {/* Audio Playback Controls Section */}
      <Box>
        <SectionHeader>
          <SectionIcon>
            <VolumeUpIcon />
          </SectionIcon>
          <Typography variant="h5" component="h2">
            Audio Playback
          </Typography>
        </SectionHeader>
        
        <ControlGroup>
          <Fab
            color="primary"
            onClick={onTogglePlayback}
            sx={{
              backgroundColor: isPlaying ? 'error.main' : 'primary.main',
              '&:hover': {
                backgroundColor: isPlaying ? 'error.dark' : 'primary.dark',
                transform: 'scale(1.05)',
              },
            }}
          >
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </Fab>
          <ControlText>
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </ControlText>
        </ControlGroup>

      </Box>
    </Box>
  );
};

export default ControlSection;