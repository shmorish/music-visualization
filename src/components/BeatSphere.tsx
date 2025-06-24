import React from 'react';
import { Box, styled } from '@mui/material';
import { BeatSphere as BeatSphereType } from '@/types/audio';

interface BeatSphereProps {
  sphere: BeatSphereType;
  isActive: boolean;
  intensity?: number;
}

const StyledSphere = styled(Box)<{ 
  size: number; 
  x: number; 
  y: number; 
  delay: number; 
  isActive: boolean;
  intensity: number;
}>(({ theme, size, x, y, delay, isActive, intensity }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: `radial-gradient(circle at 30% 30%, 
    rgba(255, 255, 255, ${0.4 * intensity}), 
    rgba(255, 255, 255, ${0.1 * intensity}))`,
  backdropFilter: 'blur(10px)',
  border: `1px solid rgba(255, 255, 255, ${0.2 * intensity})`,
  top: y,
  left: x,
  transform: 'translate(-50%, -50%)',
  animation: isActive 
    ? `beatActive 0.5s ease-out ${delay}s` 
    : `beatPulse 2s ease-in-out infinite ${delay}s`,
  
  '@keyframes beatPulse': {
    '0%, 100%': {
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 0.7 * intensity,
    },
    '50%': {
      transform: 'translate(-50%, -50%) scale(1.2)',
      opacity: intensity,
    },
  },
  
  '@keyframes beatActive': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(1)',
      boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)',
    },
    '50%': {
      transform: `translate(-50%, -50%) scale(${1.3 * intensity})`,
      boxShadow: '0 0 0 10px rgba(255, 255, 255, 0.1)',
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(1)',
      boxShadow: '0 0 0 20px rgba(255, 255, 255, 0)',
    },
  },
}));

const BeatSphere: React.FC<BeatSphereProps> = ({ 
  sphere, 
  isActive, 
  intensity = 1 
}) => {
  return (
    <StyledSphere
      size={sphere.size}
      x={sphere.position.x}
      y={sphere.position.y}
      delay={sphere.animationDelay}
      isActive={isActive}
      intensity={Math.max(0.3, intensity)}
    />
  );
};

export default BeatSphere;