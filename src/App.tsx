import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Box, styled, Snackbar, Alert, ThemeProvider, CssBaseline } from '@mui/material';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import ThemeToggle from './components/ThemeToggle';
import { YouTubePlayerRef } from './components/YouTubePlayer';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { useAudioContext } from './hooks/useAudioContext';
import { useVisualization } from './hooks/useVisualization';
import { useThemeMode } from './hooks/useThemeMode';
import { YouTubePlayerInstance } from './types/youtube';
import { getThemeByMode } from './theme';

const AppContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  maxWidth: 1400,
  margin: '0 auto',
  
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
  },
}));

const App: React.FC = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const playerRef = useRef<YouTubePlayerRef>(null);
  
  // Theme management
  const { isDarkMode, toggleTheme, themeMode } = useThemeMode();
  const currentTheme = getThemeByMode(themeMode as 'light' | 'dark');

  // Custom hooks
  const {
    playerStatus,
    videoId,
    error: playerError,
    loadVideo,
    handlePlayerReady,
    handlePlayerStateChange,
    handlePlayerError,
    playVideo,
    pauseVideo,
    getCurrentTime,
    getDuration,
    seekTo,
  } = useYouTubePlayer();

  const {
    isReady: audioReady,
    error: audioError,
    currentSource: audioSource,
    connectionMethod,
    connectToYouTubePlayer,
    getVisualizationData,
  } = useAudioContext();

  const {
    currentData: visualizationData,
    start: startVisualization,
    stop: stopVisualization,
  } = useVisualization();

  // Show notifications for errors
  useEffect(() => {
    if (playerError) {
      setNotification({
        open: true,
        message: `Player Error: ${playerError}`,
        severity: 'error',
      });
    }
  }, [playerError]);

  useEffect(() => {
    if (audioError) {
      setNotification({
        open: true,
        message: `Audio Error: ${audioError}`,
        severity: 'warning',
      });
    }
  }, [audioError]);

  // Handle player ready event
  const onPlayerReady = useCallback(async (player: YouTubePlayerInstance) => {
    handlePlayerReady(player);
    
    // Automatically try to connect to YouTube audio
    try {
      const connected = await connectToYouTubePlayer(player);
      if (connected) {
        setNotification({
          open: true,
          message: 'Connected to YouTube audio',
          severity: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: 'Failed to connect to YouTube audio',
          severity: 'warning',
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: `Error connecting to YouTube: ${err}`,
        severity: 'error',
      });
    }
  }, [handlePlayerReady, connectToYouTubePlayer]);

  // Handle load video
  const onLoadVideo = useCallback(() => {
    const success = loadVideo(youtubeUrl);
    if (success) {
      setNotification({
        open: true,
        message: 'Loading video...',
        severity: 'info',
      });
    }
  }, [youtubeUrl, loadVideo]);

  // Handle playback toggle
  const onTogglePlayback = useCallback(() => {
    if (playerStatus === 'playing') {
      pauseVideo();
      stopVisualization();
    } else if (playerStatus === 'paused' || playerStatus === 'ready') {
      playVideo();
      // Start visualization when playing
      if (audioReady && getVisualizationData) {
        startVisualization(getVisualizationData);
      } else {
        startVisualization();
      }
      
      setNotification({
        open: true,
        message: audioReady ? 'Playing with visualization' : 'Playing with demo visualization',
        severity: 'success',
      });
    }
  }, [playerStatus, playVideo, pauseVideo, audioReady, getVisualizationData, startVisualization, stopVisualization]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const isLoading = playerStatus === 'loading';
  const isPlaying = playerStatus === 'playing';
  
  // Fixed sphere colors based on theme
  const sphereColor = isDarkMode ? '#ef866b' : '#28385E'; // Light blue for dark mode, dark blue for light mode
  
  // Debug: Log visualization data periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('App.tsx - Visualization Status:', {
        isPlaying,
        playerStatus,
        audioReady,
        audioSource,
        connectionMethod,
        hasVisualizationData: !!visualizationData,
        visualizationDataType: visualizationData ? 'VisualizationData' : 'null',
        audioError,
        playerError
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isPlaying, playerStatus, audioReady, audioSource, connectionMethod, visualizationData, audioError, playerError]);

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AppContainer>
        <LeftPanel
          isVisualizerActive={isPlaying}
          audioData={visualizationData || undefined}
          sphereColor={sphereColor}
        />
        
        <RightPanel
          youtubeUrl={youtubeUrl}
          onUrlChange={setYoutubeUrl}
          onLoadVideo={onLoadVideo}
          videoId={videoId}
          isPlaying={isPlaying}
          onTogglePlayback={onTogglePlayback}
          isLoading={isLoading}
          playerStatus={playerStatus}
          hasAudio={audioReady}
          connectionMethod={connectionMethod || undefined}
          onPlayerReady={onPlayerReady}
          onPlayerStateChange={handlePlayerStateChange}
          onPlayerError={handlePlayerError}
          playerRef={playerRef}
          getCurrentTime={getCurrentTime}
          getDuration={getDuration}
          seekTo={seekTo}
        />
      </AppContainer>

      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;