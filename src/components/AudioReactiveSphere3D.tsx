import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AudioReactiveSphere3DProps {
  position: [number, number, number];
  intensity: number;
  baseColor: string;
  size: number;
  frequencyRange: [number, number];
}

const AudioReactiveSphere3D: React.FC<AudioReactiveSphere3DProps> = ({
  position,
  intensity,
  baseColor,
  size,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.SphereGeometry>(null);
  
  // Create spiky sphere geometry with more vertices for sharp spikes
  const originalPositions = useMemo(() => {
    const geometry = new THREE.SphereGeometry(size, 32, 32); // Higher resolution for sharper spikes
    return geometry.attributes.position.array.slice();
  }, [size]);

  useFrame((state, delta) => {
    if (!meshRef.current || !geometryRef.current) return;

    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Calculate sharp spike deformation based on intensity
    const spikeStrength = intensity * 2.0; // Strong spikes
    const spikeFrequency = 3 + intensity * 5; // High frequency for sharp details
    const time = state.clock.elapsedTime;
    
    // Debug log
    if (Math.floor(time * 10) % 30 === 0) { // Log every 3 seconds
      console.log('AudioReactiveSphere3D - intensity:', intensity, 'spikeStrength:', spikeStrength);
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
      
      // Create sharp, angular spikes based on vertex position and audio intensity
      const vertexIndex = Math.floor(i / 3);
      const spikeSeed = Math.sin(vertexIndex * 0.1) * Math.cos(vertexIndex * 0.07); // Deterministic per vertex
      
      // Use vertex position as seed for consistent spike pattern
      const spikePhase = originalX * 2 + originalY * 1.5 + originalZ * 1.7;
      const audioPhase = Math.sin(time * spikeFrequency + spikePhase);
      
      // Create sharp, defined spikes (not smooth waves)
      const spikeIntensity = Math.abs(spikeSeed) > 0.3 ? // Only certain vertices become spikes
        spikeStrength * (0.5 + 0.5 * audioPhase) : 0;
      
      const newLength = size * (1 + spikeIntensity * 0.8); // Sharp extension
      
      positions[i] = normalizedX * newLength;
      positions[i + 1] = normalizedY * newLength;
      positions[i + 2] = normalizedZ * newLength;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Scale based on intensity - smaller when quiet
    const baseScale = 0.3 + intensity * 0.7; // Scale from 0.3x to 1.0x based on audio
    mesh.scale.setScalar(baseScale);
    
    // Slow, steady rotation for dramatic effect
    mesh.rotation.x += delta * 0.1;
    mesh.rotation.y += delta * 0.15;
    mesh.rotation.z += delta * 0.05;
  });

  // Convert hex color to RGB values for material
  const color = new THREE.Color(baseColor);

  return (
    <group>
      {/* Main wireframe sphere */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry 
          ref={geometryRef}
          args={[size, 64, 32]} 
        />
        <meshBasicMaterial
          color={color}
          wireframe={true}
          wireframeLinewidth={2}
          wireframeLinecap='round'
          wireframeLinejoin='round'
          transparent
          opacity={0.8 + intensity * 0.2}
        />
      </mesh>
      
      {/* Thicker wireframe overlay for visibility */}
      <mesh position={position}>
        <sphereGeometry args={[size * 1.005, 32, 16]} />
        <meshBasicMaterial
          color={color}
          wireframe={true}
          transparent
          opacity={0.4 + intensity * 0.3}
        />
      </mesh>
    </group>
  );
};

export default AudioReactiveSphere3D;