import { useState, useCallback, useRef, useEffect } from 'react';
import { VisualizationConfig, VisualizationData } from '@/types/audio';

export const useVisualization = () => {
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<VisualizationConfig>({
    type: 'waveform',
    smoothing: 0.85,
    fftSize: 2048,
    color: '#1976d2',
  });
  const [currentData, setCurrentData] = useState<VisualizationData | null>(null);

  const animationFrameRef = useRef<number>();
  const getVisualizationDataRef = useRef<(() => VisualizationData | null) | null>(null);

  const updateConfig = useCallback((newConfig: Partial<VisualizationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const start = useCallback((getDataFn?: () => VisualizationData | null) => {
    if (getDataFn) {
      getVisualizationDataRef.current = getDataFn;
    }
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setCurrentData(null);
  }, []);

  const toggle = useCallback(() => {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }, [isActive, start, stop]);

  // Animation loop for continuous data updates
  useEffect(() => {
    if (!isActive) return;

    const updateData = () => {
      if (getVisualizationDataRef.current) {
        const newData = getVisualizationDataRef.current();
        if (newData) {
          setCurrentData(newData);
          // Audio data updated successfully
        } else {
          // No audio data received
        }
      } else {
        // No getVisualizationData function available
      }

      if (isActive) {
        animationFrameRef.current = requestAnimationFrame(updateData);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateData);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    isActive,
    config,
    currentData,
    updateConfig,
    start,
    stop,
    toggle,
  };
};