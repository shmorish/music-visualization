import React, { useMemo } from 'react';
import { Box, styled } from '@mui/material';
import BeatSphere from './BeatSphere';
import { BeatSphere as BeatSphereType } from '@/types/audio';

interface BeatVisualizationProps {
  isActive: boolean;
  audioData?: Uint8Array;
  sphereColor?: string;
}

const Container = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  height: 400,
  zIndex: 1,
});

const BeatVisualization: React.FC<BeatVisualizationProps> = ({ 
  isActive, 
  audioData,
  sphereColor = '#ffffff'
}) => {
  const spheres = useMemo<BeatSphereType[]>(() => [
    // Large central spheres
    {
      id: 1,
      size: 120,
      position: { x: 200, y: 200 },
      animationDelay: 0,
      intensity: 1,
    },
    {
      id: 2,
      size: 90,
      position: { x: 120, y: 120 },
      animationDelay: 0.1,
      intensity: 1,
    },
    {
      id: 3,
      size: 100,
      position: { x: 280, y: 140 },
      animationDelay: 0.2,
      intensity: 1,
    },
    {
      id: 4,
      size: 80,
      position: { x: 80, y: 220 },
      animationDelay: 0.3,
      intensity: 1,
    },
    {
      id: 5,
      size: 70,
      position: { x: 320, y: 240 },
      animationDelay: 0.4,
      intensity: 1,
    },
    // Medium orbit spheres
    {
      id: 6,
      size: 60,
      position: { x: 160, y: 80 },
      animationDelay: 0.5,
      intensity: 1,
    },
    {
      id: 7,
      size: 55,
      position: { x: 240, y: 90 },
      animationDelay: 0.6,
      intensity: 1,
    },
    {
      id: 8,
      size: 65,
      position: { x: 50, y: 160 },
      animationDelay: 0.7,
      intensity: 1,
    },
    {
      id: 9,
      size: 50,
      position: { x: 350, y: 180 },
      animationDelay: 0.8,
      intensity: 1,
    },
    {
      id: 10,
      size: 75,
      position: { x: 140, y: 300 },
      animationDelay: 0.9,
      intensity: 1,
    },
    {
      id: 11,
      size: 55,
      position: { x: 260, y: 320 },
      animationDelay: 1.0,
      intensity: 1,
    },
    // Small accent spheres
    {
      id: 12,
      size: 40,
      position: { x: 100, y: 60 },
      animationDelay: 1.1,
      intensity: 1,
    },
    {
      id: 13,
      size: 35,
      position: { x: 300, y: 70 },
      animationDelay: 1.2,
      intensity: 1,
    },
    {
      id: 14,
      size: 45,
      position: { x: 30, y: 280 },
      animationDelay: 1.3,
      intensity: 1,
    },
    {
      id: 15,
      size: 40,
      position: { x: 370, y: 300 },
      animationDelay: 1.4,
      intensity: 1,
    },
  ], []);

  const getIntensityForSphere = (sphereId: number): number => {
    if (!audioData || !isActive) return 1;
    
    // Different frequency ranges for each sphere (15 spheres total)
    const ranges: Record<number, [number, number]> = {
      // Large central spheres - focus on different frequency bands
      1: [20, 80],    // Sub-bass and bass
      2: [0, 40],     // Deep bass
      3: [80, 160],   // Mid-bass
      4: [160, 320],  // Low mids
      5: [320, 640],  // Mids
      
      // Medium orbit spheres - more specific frequency bands
      6: [40, 100],   // Bass range
      7: [100, 200],  // Low-mid range
      8: [200, 400],  // Mid range
      9: [400, 800],  // Upper mid range
      10: [800, 1600], // High mids
      11: [1600, 3200], // Highs
      
      // Small accent spheres - high frequency details
      12: [60, 120],   // Bass harmonics
      13: [240, 480],  // Mid harmonics
      14: [480, 960],  // Upper harmonics
      15: [960, 1920], // High harmonics
    };
    
    const range = ranges[sphereId] || [0, 40];
    const [start, end] = range;
    
    let sum = 0;
    let count = 0;
    for (let i = start; i < Math.min(end, audioData.length); i++) {
      sum += audioData[i];
      count++;
    }
    
    if (count === 0) return 0.5;
    
    const average = sum / count;
    // More dynamic range for better visual impact
    return Math.max(0.3, Math.min(2.5, average / 100));
  };

  return (
    <Container>
      {spheres.map((sphere) => (
        <BeatSphere
          key={sphere.id}
          sphere={sphere}
          isActive={isActive}
          intensity={getIntensityForSphere(sphere.id)}
          baseColor={sphereColor}
        />
      ))}
    </Container>
  );
};

export default BeatVisualization;