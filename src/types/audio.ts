export interface AudioPlayerState {
  isPlaying: boolean;
  isReady: boolean;
  isVisualizerActive: boolean;
  volume: number;
  currentTime: number;
  duration: number;
}

export interface VisualizationConfig {
  type: 'waveform' | 'frequency';
  smoothing: number;
  fftSize: number;
}

export interface YouTubePlayerInstance {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
}

export interface AudioContextData {
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  sourceNode: AudioNode | null;
}

export interface VisualizationData {
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  bufferLength: number;
}

export type PlayerStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

export interface BeatSphere {
  id: number;
  size: number;
  position: { x: number; y: number };
  animationDelay: number;
  intensity: number;
}