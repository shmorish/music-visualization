import { useState, useCallback, useEffect } from 'react';
import { AudioContextData, VisualizationData } from '@/types/audio';
import { YouTubePlayerInstance } from '@/types/youtube';

export type AudioSourceType = 'video';

export const useAudioContext = () => {
  const [audioContextData, setAudioContextData] = useState<AudioContextData>({
    audioContext: null,
    analyserNode: null,
    sourceNode: null,
  });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<AudioSourceType>('video');
  const [connectionMethod, setConnectionMethod] = useState<string | null>(null);

  const initializeAudioContext = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      
      setAudioContextData(prev => ({
        ...prev,
        audioContext,
      }));
      
      setError(null);
      return audioContext;
    } catch (err) {
      const errorMessage = 'Web Audio API is not supported in this browser';
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    }
  }, []);

  const tryMultipleAudioExtractionMethods = useCallback(async (
    audioContext: AudioContext, 
    player: YouTubePlayerInstance
  ): Promise<boolean> => {
    // Method 1: Try to access iframe video element directly
    try {
      const success = await tryDirectVideoAccess(audioContext);
      if (success) return true;
    } catch (err) {
      console.log('Method 1 (Direct Video Access) failed:', err);
    }

    // Method 2: Try cross-frame video access
    try {
      const success = await tryCrossFrameAccess(audioContext);
      if (success) return true;
    } catch (err) {
      console.log('Method 2 (Cross-frame Access) failed:', err);
    }

    // Method 3: Use YouTube Player API for pseudo-audio data
    try {
      const success = await setupPlayerAPIBasedVisualization(audioContext, player);
      if (success) return true;
    } catch (err) {
      console.log('Method 3 (Player API Based) failed:', err);
    }

    return false;
  }, []);

  const tryDirectVideoAccess = useCallback(async (audioContext: AudioContext): Promise<boolean> => {
    // Find YouTube iframe
    const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
    if (!iframe) throw new Error('YouTube iframe not found');

    // Try to access the video element inside iframe
    try {
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDocument) throw new Error('Cannot access iframe document');

      const video = iframeDocument.querySelector('video') as HTMLVideoElement;
      if (!video) throw new Error('Video element not found in iframe');

      // Create audio source from video element
      const sourceNode = audioContext.createMediaElementSource(video);
      const analyserNode = audioContext.createAnalyser();
      
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.85;
      
      sourceNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
      
      setAudioContextData(prev => ({
        ...prev,
        analyserNode,
        sourceNode,
      }));
      
      setIsReady(true);
      setError(null);
      setConnectionMethod('Direct Video Access');
      return true;
    } catch (err) {
      throw new Error(`Direct video access failed: ${err}`);
    }
  }, []);

  const tryCrossFrameAccess = useCallback(async (audioContext: AudioContext): Promise<boolean> => {
    // Alternative method: Try to find video elements in different ways
    const videoElements = document.querySelectorAll('video');
    
    for (const video of videoElements) {
      try {
        if (video.src && (video.src.includes('youtube') || video.currentSrc.includes('youtube'))) {
          const sourceNode = audioContext.createMediaElementSource(video);
          const analyserNode = audioContext.createAnalyser();
          
          analyserNode.fftSize = 2048;
          analyserNode.smoothingTimeConstant = 0.85;
          
          sourceNode.connect(analyserNode);
          analyserNode.connect(audioContext.destination);
          
          setAudioContextData(prev => ({
            ...prev,
            analyserNode,
            sourceNode,
          }));
          
          setIsReady(true);
          setError(null);
          setConnectionMethod('Cross-frame Access');
          return true;
        }
      } catch (err) {
        console.warn('Failed to connect to video element:', err);
        continue;
      }
    }
    
    throw new Error('No accessible YouTube video elements found');
  }, []);

  const setupPlayerAPIBasedVisualization = useCallback(async (
    audioContext: AudioContext, 
    player: YouTubePlayerInstance
  ): Promise<boolean> => {
    try {
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.85;
      
      // Create a gain node for pseudo-audio generation
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      // Create oscillators for different frequency ranges with better variation
      const oscillators: Array<{ osc: OscillatorNode; gain: GainNode }> = [];
      const frequencies = [60, 120, 240, 480, 960, 1920, 3840]; // Bass to treble
      
      for (const freq of frequencies) {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        osc.type = 'sine';
        oscGain.gain.setValueAtTime(0.01, audioContext.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(analyserNode);
        osc.start();
        
        oscillators.push({ osc, gain: oscGain });
      }
      
      // Set up more dynamic updates based on YouTube player state
      const updateInterval = setInterval(() => {
        try {
          const currentTime = player.getCurrentTime();
          const volume = player.getVolume() / 100;
          const state = player.getPlayerState();
          
          if (state === 1) { // Playing
            // Create more dynamic pseudo-audio data
            oscillators.forEach(({ gain }, index) => {
              // More complex wave patterns for better visualization
              const timeVar = currentTime * (0.5 + index * 0.3);
              const intensity1 = Math.sin(timeVar) * Math.cos(timeVar * 1.3);
              const intensity2 = Math.sin(timeVar * 2.1) * Math.cos(timeVar * 0.7);
              const combinedIntensity = (intensity1 + intensity2 * 0.5) / 1.5;
              
              const finalIntensity = Math.abs(combinedIntensity) * volume * (0.1 + index * 0.05);
              gain.gain.setValueAtTime(finalIntensity, audioContext.currentTime);
            });
          } else {
            // Mute when not playing
            oscillators.forEach(({ gain }) => {
              gain.gain.setValueAtTime(0, audioContext.currentTime);
            });
          }
        } catch (err) {
          console.warn('Player API update failed:', err);
        }
      }, 33); // 30 FPS updates for smoother animation
      
      // Store cleanup function
      const cleanup = () => {
        clearInterval(updateInterval);
        oscillators.forEach(({ osc }) => {
          try {
            osc.stop();
          } catch (err) {
            // Oscillator might already be stopped
          }
        });
      };
      
      setAudioContextData(prev => ({
        ...prev,
        analyserNode,
        sourceNode: gainNode,
      }));
      
      setIsReady(true);
      setError(null);
      setConnectionMethod('YouTube Player API');
      
      // Store cleanup function for later use
      (audioContext as any)._youtubeCleanup = cleanup;
      
      return true;
    } catch (err) {
      throw new Error(`Player API based visualization failed: ${err}`);
    }
  }, []);


  const connectToYouTubePlayer = useCallback(async (player: YouTubePlayerInstance): Promise<boolean> => {
    const audioContext = audioContextData.audioContext || initializeAudioContext();
    if (!audioContext) return false;

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    try {
      const success = await tryMultipleAudioExtractionMethods(audioContext, player);
      if (success) {
        setCurrentSource('video');
        console.log('Successfully connected to YouTube audio');
        return true;
      }
      throw new Error('All video audio extraction methods failed');
    } catch (err) {
      console.error('Failed to connect to YouTube player:', err);
      setError('Failed to connect to YouTube player');
      return false;
    }
  }, [audioContextData.audioContext, initializeAudioContext, tryMultipleAudioExtractionMethods]);


  const getVisualizationData = useCallback((): VisualizationData | null => {
    const { analyserNode } = audioContextData;
    if (!analyserNode) {
      console.warn('getVisualizationData: No analyser node available');
      return null;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    analyserNode.getByteFrequencyData(frequencyData);
    analyserNode.getByteTimeDomainData(timeData);
    
    // Debug: Check if we're getting actual audio data
    const avgFreq = Array.from(frequencyData).reduce((a, b) => a + b, 0) / frequencyData.length;
    const avgTime = Array.from(timeData).reduce((a, b) => a + b, 0) / timeData.length;
    
    // Log occasionally
    if (Math.random() < 0.01) {
      console.log('getVisualizationData:', {
        bufferLength,
        avgFrequency: avgFreq.toFixed(2),
        avgTime: avgTime.toFixed(2),
        connectionMethod,
        currentSource,
        maxFreq: Math.max(...frequencyData),
        minFreq: Math.min(...frequencyData)
      });
    }

    return {
      frequencyData,
      timeData,
      bufferLength,
    };
  }, [audioContextData.analyserNode, connectionMethod, currentSource]);

  const cleanup = useCallback(() => {
    const { audioContext, sourceNode } = audioContextData;
    
    if (sourceNode && 'disconnect' in sourceNode) {
      try {
        sourceNode.disconnect();
      } catch (err) {
        console.warn('Error disconnecting source node:', err);
      }
    }
    
    if (audioContext) {
      try {
        audioContext.close();
      } catch (err) {
        console.warn('Error closing audio context:', err);
      }
    }
    
    setAudioContextData({
      audioContext: null,
      analyserNode: null,
      sourceNode: null,
    });
    setIsReady(false);
    setError(null);
  }, [audioContextData]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    audioContextData,
    isReady,
    error,
    currentSource,
    connectionMethod,
    initializeAudioContext,
    connectToYouTubePlayer,
    getVisualizationData,
    cleanup,
  };
};