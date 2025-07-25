export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const isValidYouTubeUrl = (url: string): boolean => {
  return extractVideoId(url) !== null;
};

export const getVideoTitle = async (videoId: string): Promise<string | null> => {
  try {
    // Since we can't access YouTube Data API directly, we'll use the video ID as fallback
    // In a real app, you'd use YouTube Data API with an API key
    return `Video ${videoId}`;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return null;
  }
};

export const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      window.onYouTubeIframeAPIReady = () => resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    
    window.onYouTubeIframeAPIReady = () => resolve();
    
    document.head.appendChild(script);
  });
};