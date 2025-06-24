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
  const currentTheme = getThemeByMode(themeMode);

  // Custom hooks
  const {
    playerStatus,
    videoId,
    error: playerError,
    loadVideo,
    handlePlayerReady,
    handlePlayerStateChange,
    handlePlayerError,
    getPlayerInstance,
  } = useYouTubePlayer();

  const {
    audioContextData,
    isReady: audioReady,
    error: audioError,
    connectToYouTubePlayer,
    getVisualizationData,
  } = useAudioContext();

  const {
    isActive: isVisualizerActive,
    config: visualizationConfig,
    currentData: visualizationData,
    updateConfig: updateVisualizationConfig,
    start: startVisualization,
    stop: stopVisualization,
    toggle: toggleVisualization,
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
    
    // Try to connect audio context to player
    const connected = await connectToYouTubePlayer(player);
    if (connected) {
      setNotification({
        open: true,
        message: 'Audio visualization ready!',
        severity: 'success',
      });
    } else {
      setNotification({
        open: true,
        message: 'Using demo mode for visualization',
        severity: 'info',
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

  // Handle visualization toggle
  const onToggleVisualizer = useCallback(() => {
    if (isVisualizerActive) {
      stopVisualization();
    } else {
      if (audioReady && getVisualizationData) {
        startVisualization(getVisualizationData);
      } else {
        // Start in demo mode
        startVisualization();
      }
      
      setNotification({
        open: true,
        message: audioReady ? 'Visualization started' : 'Demo visualization started',
        severity: 'success',
      });
    }
  }, [isVisualizerActive, audioReady, getVisualizationData, startVisualization, stopVisualization]);

  const handleCloseNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  const isLoading = playerStatus === 'loading';

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <AppContainer>
        <LeftPanel
          isVisualizerActive={isVisualizerActive}
          visualizationConfig={visualizationConfig}
          audioData={visualizationData || undefined}
        />
        
        <RightPanel
          youtubeUrl={youtubeUrl}
          onUrlChange={setYoutubeUrl}
          onLoadVideo={onLoadVideo}
          videoId={videoId}
          isVisualizerActive={isVisualizerActive}
          onToggleVisualizer={onToggleVisualizer}
          visualizationConfig={visualizationConfig}
          onConfigChange={updateVisualizationConfig}
          isLoading={isLoading}
          onPlayerReady={onPlayerReady}
          onPlayerStateChange={handlePlayerStateChange}
          onPlayerError={handlePlayerError}
          playerRef={playerRef}
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