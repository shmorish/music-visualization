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
    
    // Calculate deformation based on intensity
    const deformationStrength = intensity * 0.5;
    const waveFrequency = 2 + intensity * 3;
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
      
      // Create spikes and waves based on audio intensity
      const noise = Math.sin(time * waveFrequency + originalX * 5) * 
                   Math.cos(time * waveFrequency * 0.7 + originalY * 3) *
                   Math.sin(time * waveFrequency * 0.5 + originalZ * 4);
      
      const spikeAmount = deformationStrength * (1 + noise * 0.5);
      const newLength = size * (1 + spikeAmount);
      
      positions[i] = normalizedX * newLength;
      positions[i + 1] = normalizedY * newLength;
      positions[i + 2] = normalizedZ * newLength;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    
    // Scale effect based on intensity
    const scale = 1 + intensity * 0.3;
    mesh.scale.setScalar(scale);
    
    // Rotation effect
    mesh.rotation.x += delta * intensity * 0.5;
    mesh.rotation.y += delta * intensity * 0.3;
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
        emissiveIntensity={intensity * 0.3}
        transparent
        opacity={0.8 + intensity * 0.2}
        shininess={100}
      />
    </mesh>
  );
};

export default AudioReactiveSphere3D;