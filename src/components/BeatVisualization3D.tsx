import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Box, styled } from '@mui/material';
import AudioReactiveSphere3D from './AudioReactiveSphere3D';

interface BeatVisualization3DProps {
  isActive: boolean;
  audioData?: Uint8Array;
  sphereColor?: string;
}

const CanvasContainer = styled(Box)({
  width: '100%',
  height: '100%',
  minHeight: '400px',
  position: 'relative',
  zIndex: 1,
});

const BeatVisualization3D: React.FC<BeatVisualization3DProps> = ({
  isActive,
  audioData,
  sphereColor = '#ffffff',
}) => {
  // Single sphere at center
  const sphere = React.useMemo(() => ({
    id: 0,
    position: [0, 0, 0] as [number, number, number],
    size: 2,
    frequencyRange: [20, 20000] as [number, number], // Full frequency range
  }), []);

  // Calculate intensity for the sphere based on audio data
  const getIntensity = (): number => {
    console.log('BeatVisualization3D - isActive:', isActive, 'audioData:', audioData?.length);
    
    if (!audioData || !isActive) {
      // Demo mode with sine wave
      const time = Date.now() * 0.001;
      const demoIntensity = 0.3 + 0.7 * Math.abs(Math.sin(time));
      console.log('Demo mode intensity:', demoIntensity);
      return demoIntensity;
    }

    // Calculate average intensity across all frequencies
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i];
    }
    
    const average = sum / audioData.length;
    const intensity = Math.min(average / 255, 1);
    console.log('Audio intensity:', intensity, 'from', audioData.length, 'samples');
    return intensity;
  };

  return (
    <CanvasContainer>
      <Canvas
        camera={{
          position: [0, 0, 15],
          fov: 45,
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <spotLight
            position={[0, 10, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            castShadow
          />
          
          {/* Environment for reflections */}
          <Environment preset="night" />
          
          {/* Single audio-reactive sphere */}
          <AudioReactiveSphere3D
            position={sphere.position}
            intensity={getIntensity()}
            baseColor={sphereColor}
            size={sphere.size}
            frequencyRange={sphere.frequencyRange}
          />
          
          {/* Controls for user interaction */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={30}
            autoRotate={isActive}
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
};

export default BeatVisualization3D;