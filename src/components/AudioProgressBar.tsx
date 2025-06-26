import React, { useState, useEffect } from 'react';
import { Box, LinearProgress, Typography, styled } from '@mui/material';

interface AudioProgressBarProps {
  getCurrentTime: () => number;
  getDuration: () => number;
  isPlaying: boolean;
  onSeek?: (time: number) => void;
}

const ProgressContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: '16px 0',
});

const ProgressBarContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const TimeDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  minWidth: '40px',
  textAlign: 'center',
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  flex: 1,
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.action.disabled,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 3,
  },
  cursor: 'pointer',
}));

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioProgressBar: React.FC<AudioProgressBarProps> = ({
  getCurrentTime,
  getDuration,
  isPlaying,
  onSeek,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let intervalId: number;

    if (isPlaying) {
      intervalId = setInterval(() => {
        const time = getCurrentTime();
        const dur = getDuration();
        setCurrentTime(time);
        setDuration(dur);
      }, 1000);
    } else {
      // Update once when paused to get current state
      const time = getCurrentTime();
      const dur = getDuration();
      setCurrentTime(time);
      setDuration(dur);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, getCurrentTime, getDuration]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || duration === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const seekTime = percentage * duration;
    
    onSeek(seekTime);
  };

  if (duration === 0) {
    return null;
  }

  return (
    <ProgressContainer>
      <ProgressBarContainer>
        <TimeDisplay variant="body2">
          {formatTime(currentTime)}
        </TimeDisplay>
        <StyledLinearProgress
          variant="determinate"
          value={progress}
          onClick={handleProgressClick}
        />
        <TimeDisplay variant="body2">
          {formatTime(duration)}
        </TimeDisplay>
      </ProgressBarContainer>
    </ProgressContainer>
  );
};

export default AudioProgressBar;