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
      // Return very low intensity when no audio data
      console.log('No audio data - returning low intensity');
      return 0.1;
    }

    // Calculate intensity based on different frequency ranges for more dynamic effect
    const lowFreq = audioData.slice(0, 32); // Bass range
    const midFreq = audioData.slice(32, 128); // Mid range
    const highFreq = audioData.slice(128, 256); // High range

    const lowAvg = lowFreq.reduce((sum, val) => sum + val, 0) / lowFreq.length;
    const midAvg = midFreq.reduce((sum, val) => sum + val, 0) / midFreq.length;
    const highAvg = highFreq.reduce((sum, val) => sum + val, 0) / highFreq.length;

    // Check if audio is essentially silent
    const overallAvg = (lowAvg + midAvg + highAvg) / 3;
    if (overallAvg < 3) {
      console.log('Silent audio detected - returning low intensity');
      return 0.05;
    }
    
    // EXTREME weight for dramatic effect - bass gets huge emphasis
    const weightedIntensity = (lowAvg * 8 + midAvg * 5 + highAvg * 3) / (16 * 255);
    const rawIntensity = Math.min(weightedIntensity, 1);
    
    console.log('Audio intensity:', rawIntensity.toFixed(3), 'from', audioData.length, 'samples');
    console.log('Frequency averages - Low:', lowAvg.toFixed(1), 'Mid:', midAvg.toFixed(1), 'High:', highAvg.toFixed(1));
    
    // MASSIVE amplification for extreme visual effect
    const amplified = Math.pow(rawIntensity, 0.6) * 8; // Power curve + 8x amplification
    return Math.max(0.05, Math.min(amplified, 4.0)); // Range: 0.05 to 4.0 (huge range!)
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
            audioData={audioData}
          />
          
          {/* Controls for user interaction */}
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={3}
            maxDistance={50}
            autoRotate={isActive}
            autoRotateSpeed={1 + (getIntensity() * 3)} // Moderate camera rotation speed
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </CanvasContainer>
  );
};

export default BeatVisualization3D;