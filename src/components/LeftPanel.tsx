import React from 'react';
import { Box, Typography, styled } from '@mui/material';
import { GraphicEq } from '@mui/icons-material';
import BeatVisualization3D from './BeatVisualization3D';
import { VisualizationData } from '@/types/audio';

interface LeftPanelProps {
  isVisualizerActive: boolean;
  audioData?: VisualizationData;
  sphereColor?: string;
}

const Panel = styled(Box)(({ theme }) => ({
  flex: 1,
  background: theme.palette.mode === 'light' 
    ? 'linear-gradient(135deg, rgba(239, 134, 107, 0.9) 0%, rgba(247, 180, 107, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(40, 56, 94, 0.9) 0%, rgba(81, 108, 141, 0.9) 100%)',
  padding: '48px 32px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  position: 'relative',
  overflow: 'hidden',
  
  [theme.breakpoints.down('lg')]: {
    height: '50vh',
    padding: '32px 24px',
  },
  
  [theme.breakpoints.down('md')]: {
    height: '40vh',
    padding: '24px 16px',
  },
}));

const BrandSection = styled(Box)({
  zIndex: 2,
});

const BrandTitle = styled(Typography)(({ theme }) => ({
  fontSize: '3.5rem',
  fontWeight: 300,
  color: '#ffffff',
  lineHeight: 1.1,
  marginBottom: 16,
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  
  [theme.breakpoints.down('lg')]: {
    fontSize: '3rem',
  },
  
  [theme.breakpoints.down('md')]: {
    fontSize: '2.25rem',
  },
  
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

const BrandSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 300,
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: 24,
  
  [theme.breakpoints.down('md')]: {
    fontSize: '1.125rem',
  },
}));

const AudioOnlyBadge = styled(Box)(() => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  borderRadius: 20,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  marginBottom: 24,
  
  '& .MuiSvgIcon-root': {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
}));

const BadgeText = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: 'rgba(255, 255, 255, 0.9)',
});

const LeftPanel: React.FC<LeftPanelProps> = ({
  isVisualizerActive,
  audioData,
  sphereColor = '#ffffff',
}) => {
  console.log('LeftPanel - isVisualizerActive:', isVisualizerActive, 'audioData:', audioData);
  
  return (
    <Panel>
      <BrandSection>
        <BrandTitle variant="h1">
          Music<br />Visualizer
        </BrandTitle>
        <BrandSubtitle variant="h4">
          Experience your music in a new way
        </BrandSubtitle>
        
        <AudioOnlyBadge>
          <GraphicEq />
          <BadgeText>Audio-Reactive Visualization</BadgeText>
        </AudioOnlyBadge>
      </BrandSection>
      
      <BeatVisualization3D
        isActive={isVisualizerActive}
        audioData={audioData?.frequencyData}
        sphereColor={sphereColor}
      />
    </Panel>
  );
};

export default LeftPanel;