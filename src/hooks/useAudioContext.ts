import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioContextData, VisualizationData } from '@/types/audio';
import { YouTubePlayerInstance } from '@/types/youtube';

export type AudioSourceType = 'video' | 'microphone' | 'demo';

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
      
      // Create oscillators for different frequency ranges
      const oscillators = [];
      const frequencies = [60, 120, 240, 480, 960, 1920]; // Bass to treble
      
      for (const freq of frequencies) {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();
        
        osc.frequency.setValueAtTime(freq, audioContext.currentTime);
        osc.type = 'sine';
        oscGain.gain.setValueAtTime(0.02, audioContext.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(analyserNode);
        osc.start();
        
        oscillators.push({ osc, gain: oscGain, baseFreq: freq });
      }
      
      // Set up periodic updates based on YouTube player state
      const updateInterval = setInterval(() => {
        try {
          const currentTime = player.getCurrentTime();
          const volume = player.getVolume() / 100;
          const state = player.getPlayerState();
          
          if (state === 1) { // Playing
            // Create pseudo-audio data based on time and volume
            oscillators.forEach(({ gain, baseFreq }, index) => {
              const intensity = Math.sin(currentTime * (index + 1) * 0.5) * volume * 0.1;
              gain.gain.setValueAtTime(Math.abs(intensity), audioContext.currentTime);
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
      }, 50); // 20 FPS updates
      
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

  const connectToYouTubePlayer = useCallback(async (player: YouTubePlayerInstance) => {
    try {
      const audioContext = audioContextData.audioContext || initializeAudioContext();
      if (!audioContext) return false;

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Enhanced YouTube audio extraction attempts
      const success = await tryMultipleAudioExtractionMethods(audioContext, player);
      if (success) {
        console.log('Successfully connected to YouTube audio');
        return true;
      }

      console.warn('All YouTube audio extraction methods failed, using fallback');
      return await setupAlternativeAudioCapture(audioContext);

    } catch (err) {
      console.error('Failed to connect to YouTube player:', err);
      return await setupAlternativeAudioCapture(audioContextData.audioContext);
    }
  }, [audioContextData.audioContext, initializeAudioContext]);

  const connectToAudioSource = useCallback(async (
    source: AudioSourceType,
    player?: YouTubePlayerInstance
  ): Promise<boolean> => {
    const audioContext = audioContextData.audioContext || initializeAudioContext();
    if (!audioContext) return false;

    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    try {
      switch (source) {
        case 'video':
          if (!player) {
            throw new Error('YouTube player required for video audio source');
          }
          const videoSuccess = await tryMultipleAudioExtractionMethods(audioContext, player);
          if (videoSuccess) {
            setCurrentSource('video');
            return true;
          }
          throw new Error('All video audio extraction methods failed');

        case 'microphone':
          const micSuccess = await setupMicrophoneCapture(audioContext);
          if (micSuccess) {
            setCurrentSource('microphone');
            return true;
          }
          throw new Error('Microphone access failed');

        case 'demo':
          const demoSuccess = await createDummyAnalyser(audioContext);
          if (demoSuccess) {
            setCurrentSource('demo');
            return true;
          }
          throw new Error('Demo mode setup failed');

        default:
          throw new Error(`Unknown audio source: ${source}`);
      }
    } catch (err) {
      console.error(`Failed to connect to ${source} audio source:`, err);
      setError(`Failed to connect to ${source} audio source`);
      return false;
    }
  }, [audioContextData.audioContext, initializeAudioContext]);

  const setupMicrophoneCapture = useCallback(async (audioContext: AudioContext): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } 
      });
      
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      
      analyserNode.fftSize = 2048;
      analyserNode.smoothingTimeConstant = 0.85;
      
      sourceNode.connect(analyserNode);
      
      setAudioContextData(prev => ({
        ...prev,
        analyserNode,
        sourceNode,
      }));
      
      setIsReady(true);
      setError(null);
      setConnectionMethod('Microphone Input');
      return true;
    } catch (err) {
      throw new Error(`Microphone access failed: ${err}`);
    }
  }, []);

  const setupAlternativeAudioCapture = useCallback(async (audioContext: AudioContext | null) => {
    if (!audioContext) return false;

    // Try microphone first, then demo mode
    try {
      return await setupMicrophoneCapture(audioContext);
    } catch (micError) {
      console.warn('Microphone access failed, creating dummy analyser:', micError);
      return createDummyAnalyser(audioContext);
    }
  }, [setupMicrophoneCapture]);

  const createDummyAnalyser = useCallback((audioContext: AudioContext) => {
    try {
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 2048;
      
      // Create a dummy oscillator for demo purposes
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(analyserNode);
      oscillator.start();
      
      setAudioContextData(prev => ({
        ...prev,
        analyserNode,
        sourceNode: gainNode,
      }));
      
      setIsReady(true);
      setError(null);
      setConnectionMethod('Demo Mode');
      return true;
    } catch (err) {
      console.error('Failed to create dummy analyser:', err);
      setError('Failed to initialize audio visualization');
      return false;
    }
  }, []);

  const getVisualizationData = useCallback((): VisualizationData | null => {
    const { analyserNode } = audioContextData;
    if (!analyserNode) return null;

    const bufferLength = analyserNode.frequencyBinCount;
    const frequencyData = new Uint8Array(bufferLength);
    const timeData = new Uint8Array(bufferLength);
    
    analyserNode.getByteFrequencyData(frequencyData);
    analyserNode.getByteTimeDomainData(timeData);

    return {
      frequencyData,
      timeData,
      bufferLength,
    };
  }, [audioContextData.analyserNode]);

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
    connectToAudioSource,
    getVisualizationData,
    cleanup,
  };
};