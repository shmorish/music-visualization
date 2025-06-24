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

  // Vocal detection based on human voice frequency characteristics
  const detectVocalContent = (): number => {
    if (!audioData || audioData.length === 0) return 0;
    
    const sampleRate = 44100; // Assume standard sample rate
    const nyquist = sampleRate / 2;
    const binSize = nyquist / audioData.length;
    
    // Define vocal frequency ranges (Hz to bin conversion)
    const fundamentalMale = [85, 180].map(hz => Math.floor(hz / binSize)); // Male fundamental
    const fundamentalFemale = [165, 255].map(hz => Math.floor(hz / binSize)); // Female fundamental
    const vocalClarity = [250, 4000].map(hz => Math.floor(hz / binSize)); // Vocal clarity range
    const harmonics = [1000, 4000].map(hz => Math.floor(hz / binSize)); // Most sensitive hearing range
    
    // Calculate energy in different frequency bands
    const getEnergyInRange = (startBin: number, endBin: number): number => {
      let energy = 0;
      for (let i = Math.max(0, startBin); i < Math.min(audioData.length, endBin); i++) {
        energy += audioData[i] * audioData[i]; // Power (energy)
      }
      return energy / (endBin - startBin);
    };
    
    const maleFundamentalEnergy = getEnergyInRange(fundamentalMale[0], fundamentalMale[1]);
    const femaleFundamentalEnergy = getEnergyInRange(fundamentalFemale[0], fundamentalFemale[1]);
    const vocalClarityEnergy = getEnergyInRange(vocalClarity[0], vocalClarity[1]);
    const harmonicsEnergy = getEnergyInRange(harmonics[0], harmonics[1]);
    
    // Calculate energy in non-vocal ranges for comparison
    const lowBassEnergy = getEnergyInRange(0, Math.floor(80 / binSize)); // Below vocal range
    const highTrebleEnergy = getEnergyInRange(Math.floor(5000 / binSize), audioData.length); // Above vocal range
    
    // Vocal score calculation
    const fundamentalEnergy = Math.max(maleFundamentalEnergy, femaleFundamentalEnergy);
    const totalVocalEnergy = vocalClarityEnergy + harmonicsEnergy + fundamentalEnergy;
    const totalNonVocalEnergy = lowBassEnergy + highTrebleEnergy;
    
    // Vocal presence ratio (higher when vocals are present)
    const vocalRatio = totalNonVocalEnergy > 0 ? totalVocalEnergy / (totalVocalEnergy + totalNonVocalEnergy) : 0;
    
    // Extra weight for the most important vocal clarity range (1kHz-4kHz)
    const clarityBonus = harmonicsEnergy > 1000 ? 0.3 : 0;
    
    return Math.min(vocalRatio + clarityBonus, 1.0);
  };

  // Calculate frequency-based spike intensity with vocal enhancement
  const getFrequencyIntensity = (vertexIndex: number): number => {
    if (!audioData || audioData.length === 0) return intensity;
    
    const [startFreq, endFreq] = frequencyRange;
    const freqBinCount = Math.min(endFreq - startFreq, audioData.length - startFreq);
    
    if (freqBinCount <= 0) return intensity;
    
    // Map vertex to frequency bin
    const vertexRatio = (vertexIndex % 100) / 100; // Cycle through vertices
    const freqBin = startFreq + Math.floor(vertexRatio * freqBinCount);
    const freqValue = audioData[Math.min(freqBin, audioData.length - 1)] / 255;
    
    // Higher frequencies get EXTREME multiplier for dramatic waves
    const freqNormalized = (freqBin - startFreq) / freqBinCount; // 0-1 range
    const freqMultiplier = 1 + freqNormalized * 4; // 1x to 5x multiplier
    
    // Vocal enhancement: moderate boost when vocals are detected
    const vocalPresence = detectVocalContent();
    const vocalBoost = 1 + vocalPresence * 0.8; // Reduced from 2 to 0.8 (max 1.8x)
    
    // Moderate scaling for controlled wave motion
    return Math.pow(intensity * freqValue * freqMultiplier * vocalBoost, 1.1) * 0.8; // Reduced power and multiplier
  };

  useFrame((state, delta) => {
    if (!meshRef.current || !geometryRef.current) return;

    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Calculate moderate wave deformation based on intensity
    const waveStrength = Math.pow(intensity, 0.7) * 0.4; // Reduced from 1.5 to 0.4
    const waveFrequency = 0.5 + intensity * 3; // Reduced from 6 to 3
    const time = state.clock.elapsedTime;
    
    // Enhanced debug log with vocal detection
    if (Math.floor(time * 10) % 3000 === 0) { // Log every 3 seconds
      const hasAudioData = audioData && audioData.length > 0;
      const avgAudioLevel = hasAudioData ? 
        Array.from(audioData).reduce((a, b) => a + b, 0) / audioData.length : 0;
      const vocalPresence = detectVocalContent();
      
      console.log('AudioReactiveSphere3D Debug:', {
        intensity,
        waveStrength,
        hasAudioData,
        audioDataLength: audioData?.length || 0,
        avgAudioLevel,
        vocalPresence: vocalPresence.toFixed(3),
        vocalBoost: (1 + vocalPresence * 2).toFixed(2),
        frequencyRange,
        baseScale: (0.2 + Math.pow(intensity, 0.8) * 2.3).toFixed(2)
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
      
      const waveIntensity = freqIntensity * waveStrength * (0.2 + 0.8 * combinedWave);
      
      const newLength = size * (1 + waveIntensity * 0.5); // Reduced from 1.8 to 0.5
      
      positions[i] = normalizedX * newLength;
      positions[i + 1] = normalizedY * newLength;
      positions[i + 2] = normalizedZ * newLength;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Moderate scale based on intensity with vocal enhancement
    const vocalPresence = detectVocalContent();
    const vocalScaleBoost = 1 + vocalPresence * 0.2; // Reduced from 0.5 to 0.2
    const baseScale = (0.4 + Math.pow(intensity, 0.8) * 0.8) * vocalScaleBoost; // Scale from 0.4x to 1.44x
    mesh.scale.setScalar(baseScale);
    
    // Dynamic rotation based on intensity
    const rotationSpeed = 0.1 + intensity * 0.8; // More intense = faster rotation
    mesh.rotation.x += delta * rotationSpeed;
    mesh.rotation.y += delta * rotationSpeed * 1.2;
    mesh.rotation.z += delta * rotationSpeed * 0.7;
  });

  // Convert hex color to RGB values and create enhanced colors with vocal detection
  const vocalPresence = audioData ? detectVocalContent() : 0;
  const vocalColorBoost = 1 + vocalPresence * 0.3; // Reduced from 0.8 to 0.3
  
  const baseColorObj = new THREE.Color(baseColor);
  const brightColor = baseColorObj.clone().multiplyScalar(1.2 * vocalColorBoost); // Reduced from 1.5
  const glowColor = baseColorObj.clone().multiplyScalar(1.5 * vocalColorBoost);   // Reduced from 2.0

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
          opacity={0.6 + intensity * 0.3 + vocalPresence * 0.15} // Reduced opacity ranges
        />
      </mesh>
      
      {/* Bright glow overlay for better visibility */}
      <mesh position={position}>
        <sphereGeometry args={[size * 1.01, 16, 8]} />
        <meshBasicMaterial
          color={glowColor}
          wireframe={true}
          transparent
          opacity={0.3 + intensity * 0.4 + vocalPresence * 0.2} // Reduced glow ranges
        />
      </mesh>
      
      {/* Dark outline for contrast */}
      <mesh position={position}>
        <sphereGeometry args={[size * 0.99, 16, 8]} />
        <meshBasicMaterial
          color={new THREE.Color(0x000000)}
          wireframe={true}
          transparent
          opacity={0.1 + intensity * 0.4} // Dynamic outline variation
        />
      </mesh>
    </group>
  );
};

export default AudioReactiveSphere3D;