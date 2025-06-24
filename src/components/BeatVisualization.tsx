import React, { useMemo } from 'react';
import { Box, styled } from '@mui/material';
import BeatSphere from './BeatSphere';
import { BeatSphere as BeatSphereType } from '@/types/audio';

interface BeatVisualizationProps {
  isActive: boolean;
  audioData?: Uint8Array;
}

const Container = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  height: 300,
  zIndex: 1,
});

const BeatVisualization: React.FC<BeatVisualizationProps> = ({ 
  isActive, 
  audioData 
}) => {
  const spheres = useMemo<BeatSphereType[]>(() => [
    {
      id: 1,
      size: 80,
      position: { x: 150, y: 70 },
      animationDelay: 0,
      intensity: 1,
    },
    {
      id: 2,
      size: 60,
      position: { x: 90, y: 130 },
      animationDelay: 0.2,
      intensity: 1,
    },
    {
      id: 3,
      size: 100,
      position: { x: 230, y: 150 },
      animationDelay: 0.4,
      intensity: 1,
    },
    {
      id: 4,
      size: 70,
      position: { x: 130, y: 230 },
      animationDelay: 0.6,
      intensity: 1,
    },
    {
      id: 5,
      size: 50,
      position: { x: 250, y: 270 },
      animationDelay: 0.8,
      intensity: 1,
    },
  ], []);

  const getIntensityForSphere = (sphereId: number): number => {
    if (!audioData || !isActive) return 1;
    
    // Different frequency ranges for each sphere
    const ranges = {
      1: [0, 8],     // Very low frequencies
      2: [8, 32],    // Low frequencies
      3: [32, 128],  // Mid frequencies
      4: [128, 512], // High frequencies
      5: [512, 1024] // Very high frequencies
    };
    
    const range = ranges[sphereId as keyof typeof ranges] || [0, 8];
    const [start, end] = range;
    
    let sum = 0;
    for (let i = start; i < Math.min(end, audioData.length); i++) {
      sum += audioData[i];
    }
    
    const average = sum / (end - start);
    return Math.max(0.5, Math.min(2, average / 128));
  };

  return (
    <Container>
      {spheres.map((sphere) => (
        <BeatSphere
          key={sphere.id}
          sphere={sphere}
          isActive={isActive}
          intensity={getIntensityForSphere(sphere.id)}
        />
      ))}
    </Container>
  );
};

export default BeatVisualization;