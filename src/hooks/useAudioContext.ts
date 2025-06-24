import { useState, useCallback, useRef, useEffect } from 'react';
import { AudioContextData, VisualizationData } from '@/types/audio';
import { YouTubePlayerInstance } from '@/types/youtube';

export const useAudioContext = () => {
  const [audioContextData, setAudioContextData] = useState<AudioContextData>({
    audioContext: null,
    analyserNode: null,
    sourceNode: null,
  });
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const connectToYouTubePlayer = useCallback(async (player: YouTubePlayerInstance) => {
    try {
      const audioContext = audioContextData.audioContext || initializeAudioContext();
      if (!audioContext) return false;

      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Try to get the iframe and video element
      const iframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement;
      if (!iframe) {
        throw new Error('YouTube iframe not found');
      }

      // Due to CORS restrictions, we cannot directly access the YouTube video element
      // We'll set up a fallback method using microphone or dummy audio
      console.warn('Direct YouTube audio access not possible due to CORS restrictions');
      return await setupAlternativeAudioCapture(audioContext);

    } catch (err) {
      console.error('Failed to connect to YouTube player:', err);
      return await setupAlternativeAudioCapture(audioContextData.audioContext);
    }
  }, [audioContextData.audioContext, initializeAudioContext]);

  const setupAlternativeAudioCapture = useCallback(async (audioContext: AudioContext | null) => {
    if (!audioContext) return false;

    try {
      // Try to use microphone as alternative
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
      return true;
    } catch (micError) {
      console.warn('Microphone access failed, creating dummy analyser:', micError);
      return createDummyAnalyser(audioContext);
    }
  }, []);

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
    initializeAudioContext,
    connectToYouTubePlayer,
    getVisualizationData,
    cleanup,
  };
};