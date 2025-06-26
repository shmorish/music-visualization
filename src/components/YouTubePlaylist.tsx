import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Typography,
  Paper,
  styled,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { extractVideoId, getVideoTitle } from '@/utils/youtube';

interface PlaylistItem {
  id: string;
  url: string;
  videoId: string;
  title: string;
}

interface YouTubePlaylistProps {
  onSelectVideo: (url: string) => void;
  currentVideoId?: string;
}

const PlaylistContainer = styled(Paper)(({ theme }) => ({
  padding: 16,
  backgroundColor: theme.palette.background.paper,
  borderRadius: 12,
  boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
}));

const PlaylistHeader = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  marginBottom: 16,
});

const AddUrlContainer = styled(Box)({
  display: 'flex',
  gap: 8,
  alignItems: 'flex-end',
});

const PlaylistList = styled(List)({
  maxHeight: 300,
  overflow: 'auto',
  '& .MuiListItem-root': {
    borderRadius: 8,
    marginBottom: 4,
    border: '1px solid transparent',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&.active': {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
      borderColor: 'rgba(25, 118, 210, 0.2)',
    },
  },
});

const YouTubePlaylist: React.FC<YouTubePlaylistProps> = ({
  onSelectVideo,
  currentVideoId,
}) => {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addToPlaylist = async () => {
    if (!newUrl.trim()) return;

    setIsLoading(true);
    try {
      const videoId = extractVideoId(newUrl);
      if (!videoId) {
        alert('Invalid YouTube URL');
        setIsLoading(false);
        return;
      }

      // Check if already exists
      if (playlist.some(item => item.videoId === videoId)) {
        alert('This video is already in the playlist');
        setIsLoading(false);
        return;
      }

      const title = await getVideoTitle(videoId);
      const newItem: PlaylistItem = {
        id: Date.now().toString(),
        url: newUrl,
        videoId,
        title: title || `Video ${videoId}`,
      };

      setPlaylist(prev => [...prev, newItem]);
      setNewUrl('');
    } catch (error) {
      console.error('Error adding to playlist:', error);
      alert('Failed to add video to playlist');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromPlaylist = (id: string) => {
    setPlaylist(prev => prev.filter(item => item.id !== id));
  };

  const selectVideo = (item: PlaylistItem) => {
    onSelectVideo(item.url);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      addToPlaylist();
    }
  };

  return (
    <PlaylistContainer>
      <PlaylistHeader>
        <Typography variant="h6" component="h3">
          YouTube Playlist
        </Typography>
        <AddUrlContainer>
          <TextField
            fullWidth
            size="small"
            label="YouTube URL"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isLoading}
          />
          <Button
            variant="contained"
            onClick={addToPlaylist}
            disabled={!newUrl.trim() || isLoading}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </AddUrlContainer>
      </PlaylistHeader>

      {playlist.length > 0 && (
        <>
          <Divider />
          <PlaylistList>
            {playlist.map((item) => (
              <ListItem
                key={item.id}
                className={item.videoId === currentVideoId ? 'active' : ''}
                dense
              >
                <DragIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <ListItemText
                  primary={item.title}
                  secondary={item.videoId}
                  primaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.875rem',
                  }}
                  secondaryTypographyProps={{
                    noWrap: true,
                    fontSize: '0.75rem',
                  }}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => selectVideo(item)}
                    size="small"
                    color={item.videoId === currentVideoId ? 'primary' : 'default'}
                  >
                    <PlayIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => removeFromPlaylist(item.id)}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </PlaylistList>
        </>
      )}

      {playlist.length === 0 && (
        <Box textAlign="center" py={3}>
          <Typography variant="body2" color="text.secondary">
            No videos in playlist. Add a YouTube URL to get started.
          </Typography>
        </Box>
      )}
    </PlaylistContainer>
  );
};

export default YouTubePlaylist;