export interface YouTubePlayerConfig {
  height: string;
  width: string;
  videoId: string;
  playerVars: {
    playsinline: number;
    controls: number;
    rel: number;
    enablejsapi: number;
    origin?: string;
  };
  events: {
    onReady: (event: YouTubePlayerEvent) => void;
    onStateChange: (event: YouTubePlayerEvent) => void;
    onError?: (event: YouTubePlayerErrorEvent) => void;
  };
}

export interface YouTubePlayerEvent {
  target: YouTubePlayerInstance;
  data?: number;
}

export interface YouTubePlayerErrorEvent {
  target: YouTubePlayerInstance;
  data: number;
}

export interface YouTubePlayerInstance {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  destroy?: () => void;
}

export enum YouTubePlayerState {
  UNSTARTED = -1,
  ENDED = 0,
  PLAYING = 1,
  PAUSED = 2,
  BUFFERING = 3,
  CUED = 5,
}

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: YouTubePlayerConfig
      ) => YouTubePlayerInstance;
      PlayerState: typeof YouTubePlayerState;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}