import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AudioReactiveSphere3DProps {
  position: [number, number, number];
  intensity: number;
  baseColor: string;
  size: number;
  frequencyRange: [number, number];
  audioData?: Uint8Array; // Add audio frequency data
}

const AudioReactiveSphere3D: React.FC<AudioReactiveSphere3DProps> = ({
  position,
  intensity,
  baseColor,
  size,
  frequencyRange,
  audioData,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  
  // Create spiky sphere geometry with more vertices for sharp spikes
  const originalPositions = useMemo(() => {
    const geometry = new THREE.SphereGeometry(size, 32, 32); // Higher resolution for sharper spikes
    return geometry.attributes.position.array.slice();
  }, [size]);

  // Calculate frequency-based spike intensity
  const getFrequencyIntensity = (vertexIndex: number): number => {
    if (!audioData || audioData.length === 0) return intensity;
    
    const [startFreq, endFreq] = frequencyRange;
    const freqBinCount = Math.min(endFreq - startFreq, audioData.length - startFreq);
    
    if (freqBinCount <= 0) return intensity;
    
    // Map vertex to frequency bin
    const vertexRatio = (vertexIndex % 100) / 100; // Cycle through vertices
    const freqBin = startFreq + Math.floor(vertexRatio * freqBinCount);
    const freqValue = audioData[Math.min(freqBin, audioData.length - 1)] / 255;
    
    // Higher frequencies get moderate multiplier for gentle waves
    const freqNormalized = (freqBin - startFreq) / freqBinCount; // 0-1 range
    const freqMultiplier = 1 + freqNormalized * 1.5; // 1x to 2.5x multiplier
    
    // Linear scaling for natural wave motion
    return intensity * freqValue * freqMultiplier * 0.8;
  };

  useFrame((state, delta) => {
    if (!meshRef.current || !geometryRef.current) return;

    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Calculate gentle wave deformation based on intensity
    const waveStrength = intensity * 0.3; // Gentle waves
    const waveFrequency = 1 + intensity * 2; // Smooth frequency response
    const time = state.clock.elapsedTime;
    
    // Enhanced debug log
    if (Math.floor(time * 10) % 30 === 0) { // Log every 3 seconds
      const hasAudioData = audioData && audioData.length > 0;
      const avgAudioLevel = hasAudioData ? 
        Array.from(audioData).reduce((a, b) => a + b, 0) / audioData.length : 0;
      
      console.log('AudioReactiveSphere3D Debug:', {
        intensity,
        waveStrength,
        hasAudioData,
        audioDataLength: audioData?.length || 0,
        avgAudioLevel,
        frequencyRange,
        baseScale: 0.5 + intensity * 0.5
      });
    }

    // Apply deformation to each vertex
    for (let i = 0; i < positions.length; i += 3) {
      const originalX = originalPositions[i];
      const originalY = originalPositions[i + 1];
      const originalZ = originalPositions[i + 2];
      
      // Normalize the vertex position to get direction
      const length = Math.sqrt(originalX * originalX + originalY * originalY + originalZ * originalZ);
      const normalizedX = originalX / length;
      const normalizedY = originalY / length;
      const normalizedZ = originalZ / length;
      
      // Create smooth, flowing waves across the surface based on frequency data
      const vertexIndex = Math.floor(i / 3);
      
      // Get frequency-based intensity for this vertex
      const freqIntensity = getFrequencyIntensity(vertexIndex);
      
      // Use vertex position as seed for consistent wave pattern
      const wavePhase = originalX * 2 + originalY * 1.5 + originalZ * 1.7;
      
      // Create smooth, flowing waves across the surface
      // All vertices participate in wave motion for fluid effect
      const wavePhase1 = Math.sin(time * waveFrequency + wavePhase);
      const wavePhase2 = Math.cos(time * waveFrequency * 0.7 + wavePhase * 0.8);
      const combinedWave = (wavePhase1 + wavePhase2 * 0.5) / 1.5;
      
      const waveIntensity = freqIntensity * waveStrength * (0.5 + 0.5 * combinedWave);
      
      const newLength = size * (1 + waveIntensity * 0.4); // Gentle wave extension
      
      positions[i] = normalizedX * newLength;
      positions[i + 1] = normalizedY * newLength;
      positions[i + 2] = normalizedZ * newLength;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Moderate scale based on intensity for natural breathing effect
    const baseScale = 0.5 + intensity * 0.5; // Scale from 0.5x to 1.0x for gentle size changes
    mesh.scale.setScalar(baseScale);
    
    // Slow, steady rotation for dramatic effect
    mesh.rotation.x += delta * 0.1;
    mesh.rotation.y += delta * 0.15;
    mesh.rotation.z += delta * 0.05;
  });

  // Convert hex color to RGB values and create enhanced colors
  const baseColorObj = new THREE.Color(baseColor);
  const brightColor = baseColorObj.clone().multiplyScalar(1.5); // Brighter version
  const glowColor = baseColorObj.clone().multiplyScalar(2.0);   // Glow version

  return (
    <group>
      {/* Main wireframe sphere */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry 
          ref={geometryRef}
          args={[size, 64, 32]} 
        />
        <meshBasicMaterial
          color={brightColor}
          wireframe={true}
          wireframeLinewidth={2}
          wireframeLinecap='round'
          wireframeLinejoin='round'
          transparent
          opacity={0.8 + intensity * 0.2} // Gentle opacity changes
        />
      </mesh>
      
      {/* Bright glow overlay for better visibility */}
      <mesh position={position}>
        <sphereGeometry args={[size * 1.01, 16, 8]} />
        <meshBasicMaterial
          color={glowColor}
          wireframe={true}
          transparent
          opacity={0.3 + intensity * 0.4} // Moderate glow variation
        />
      </mesh>
      
      {/* Dark outline for contrast */}
      <mesh position={position}>
        <sphereGeometry args={[size * 0.99, 16, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(0x000000)}
          wireframe={true}
          transparent
          opacity={0.2 + intensity * 0.2} // Subtle outline variation
        />
      </mesh>
    </group>
  );
};

export default AudioReactiveSphere3D;