import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Fab,
  Grid,
  styled,
} from '@mui/material';
import {
  Link as LinkIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon,
  GraphicEq as GraphicEqIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { VisualizationConfig } from '@/types/audio';

interface ControlSectionProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  onLoadVideo: () => void;
  isVisualizerActive: boolean;
  onToggleVisualizer: () => void;
  visualizationConfig: VisualizationConfig;
  onConfigChange: (config: Partial<VisualizationConfig>) => void;
  isLoading: boolean;
}

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 24,
}));

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

const ColorInput = styled('input')(({ theme }) => ({
  width: 60,
  height: 48,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  cursor: 'pointer',
  background: 'none',
  padding: 0,
  
  '&::-webkit-color-swatch-wrapper': {
    padding: 0,
  },
  
  '&::-webkit-color-swatch': {
    border: 'none',
    borderRadius: 6,
  },
}));

const ControlSection: React.FC<ControlSectionProps> = ({
  youtubeUrl,
  onUrlChange,
  onLoadVideo,
  isVisualizerActive,
  onToggleVisualizer,
  visualizationConfig,
  onConfigChange,
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
              onKeyPress={handleKeyPress}
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

      {/* Visualization Controls Section */}
      <Box>
        <SectionHeader>
          <SectionIcon>
            <TuneIcon />
          </SectionIcon>
          <Typography variant="h5" component="h2">
            Visualization Controls
          </Typography>
        </SectionHeader>
        
        <ControlGroup>
          <Fab
            color="primary"
            onClick={onToggleVisualizer}
            sx={{
              backgroundColor: isVisualizerActive ? 'error.main' : 'primary.main',
              '&:hover': {
                backgroundColor: isVisualizerActive ? 'error.dark' : 'primary.dark',
                transform: 'scale(1.05)',
              },
            }}
          >
            {isVisualizerActive ? <StopIcon /> : <GraphicEqIcon />}
          </Fab>
          <ControlText>
            {isVisualizerActive ? 'Stop Visualization' : 'Start Visualization'}
          </ControlText>
        </ControlGroup>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box>
              <Typography 
                variant="body2" 
                component="label" 
                sx={{ 
                  display: 'block', 
                  mb: 1, 
                  fontWeight: 500,
                  color: 'text.secondary'
                }}
              >
                Sphere Color
              </Typography>
              <ColorInput
                type="color"
                value={visualizationConfig.color}
                onChange={(e) => onConfigChange({ color: e.target.value })}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ControlSection;