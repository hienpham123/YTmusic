import { useCallback } from "react";

interface UseLoadPlayerProps {
  playerRef: React.MutableRefObject<YT.Player | null>;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function useLoadPlayer({ playerRef, setIsPlaying }: UseLoadPlayerProps) {
  const loadPlayer = useCallback(
    (videoId: string, onReady?: () => void, autoPlay: boolean = true) => {
      if (!playerRef.current) return;

      // Load the video
      playerRef.current.loadVideoById(videoId);

      // Function to try playing the video
      const tryPlay = () => {
        if (!playerRef.current) return;

        try {
          const state = playerRef.current.getPlayerState();
          // CUED (5), PAUSED (2), or PLAYING (1) means video is ready
          if (state === 5 || state === 2 || state === 1 || state === 3) {
            if (onReady) {
              onReady();
            } else if (autoPlay) {
              playerRef.current.playVideo();
              setIsPlaying(true);
            }
          } else {
            // If not ready yet, try again after a short delay
            setTimeout(() => {
              if (playerRef.current) {
                try {
                  const retryState = playerRef.current.getPlayerState();
                  if (
                    retryState === 5 ||
                    retryState === 2 ||
                    retryState === 1 ||
                    retryState === 3
                  ) {
                    if (onReady) {
                      onReady();
                    } else if (autoPlay) {
                      playerRef.current.playVideo();
                      setIsPlaying(true);
                    }
                  } else {
                    // Force play after another delay
                    setTimeout(() => {
                      if (playerRef.current) {
                        if (onReady) {
                          onReady();
                        } else if (autoPlay) {
                          try {
                            playerRef.current.playVideo();
                            setIsPlaying(true);
                          } catch {
                            // Ignore errors
                          }
                        }
                      }
                    }, 500);
                  }
                } catch {
                  // On error, just try to play anyway
                  if (onReady) {
                    onReady();
                  } else if (autoPlay && playerRef.current) {
                    try {
                      playerRef.current.playVideo();
                      setIsPlaying(true);
                    } catch {
                      // Ignore errors
                    }
                  }
                }
              }
            }, 300);
          }
        } catch {
          // On error, just try to play anyway
          if (onReady) {
            onReady();
          } else if (autoPlay && playerRef.current) {
            try {
              playerRef.current.playVideo();
              setIsPlaying(true);
            } catch {
              // Ignore errors
            }
          }
        }
      };

      // Give the video time to load before trying to play
      setTimeout(() => {
        tryPlay();
      }, 200); // Increased delay to 200ms for better reliability
    },
    [playerRef, setIsPlaying]
  );

  return {
    loadPlayer,
  };
}
