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
  
  // Create spiky sphere geometry
  const originalPositions = useMemo(() => {
    const geometry = new THREE.SphereGeometry(size, 32, 16);
    return geometry.attributes.position.array.slice();
  }, [size]);

  useFrame((state, delta) => {
    if (!meshRef.current || !geometryRef.current) return;

    const mesh = meshRef.current;
    const geometry = geometryRef.current;
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Calculate EXTREME deformation based on intensity
    const deformationStrength = intensity * 3.0; // MASSIVE increase for violent movement
    const waveFrequency = 2 + intensity * 8; // Much higher frequency response
    const time = state.clock.elapsedTime;
    
    // Debug log
    if (Math.floor(time * 10) % 30 === 0) { // Log every 3 seconds
      console.log('AudioReactiveSphere3D - intensity:', intensity, 'deformationStrength:', deformationStrength);
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
      
      // Create VIOLENT spikes and waves based on audio intensity
      const noise1 = Math.sin(time * waveFrequency + originalX * 8) * 
                    Math.cos(time * waveFrequency * 1.3 + originalY * 6) *
                    Math.sin(time * waveFrequency * 0.8 + originalZ * 7);
      
      const noise2 = Math.sin(time * waveFrequency * 2.1 + originalX * 12) * 
                    Math.cos(time * waveFrequency * 1.7 + originalY * 9);
      
      const combinedNoise = (noise1 + noise2 * 0.5) / 1.5;
      
      const spikeAmount = deformationStrength * (1 + combinedNoise * 1.5); // EXTREME noise influence
      const newLength = size * (1 + spikeAmount * 1.2); // MASSIVE deformation
      
      positions[i] = normalizedX * newLength;
      positions[i + 1] = normalizedY * newLength;
      positions[i + 2] = normalizedZ * newLength;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // EXTREME scale effect based on intensity
    const scale = 0.5 + intensity * 1.5; // Wild scaling from 0.5x to 2x
    mesh.scale.setScalar(scale);
    
    // VIOLENT rotation effect
    mesh.rotation.x += delta * intensity * 3.0; // CRAZY fast rotation
    mesh.rotation.y += delta * intensity * 2.5;
    mesh.rotation.z += delta * intensity * 1.8; // Add Z-axis rotation for chaos
  });

  // Convert hex color to RGB values for material
  const color = new THREE.Color(baseColor);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry 
        ref={geometryRef}
        args={[size, 32, 16]} 
      />
      <meshPhongMaterial
        color={color}
        emissive={color}
        emissiveIntensity={intensity * 0.8} // INTENSE glow
        transparent
        opacity={0.6 + intensity * 0.4} // More dramatic transparency changes
        shininess={30 + intensity * 200} // Variable shininess for chaos
        wireframe={intensity > 0.8} // Switch to wireframe on high intensity
      />
    </mesh>
  );
};

export default AudioReactiveSphere3D;