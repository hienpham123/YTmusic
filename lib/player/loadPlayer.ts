// YT namespace is declared globally in types/youtube.d.ts

/**
 * Loads a video into the YouTube player with retry logic
 */
export function loadVideoWithRetry(
  player: YT.Player,
  videoId: string,
  onReady?: () => void,
  autoPlay: boolean = true,
  setIsPlaying?: (playing: boolean) => void
) {
  // Load the video
  player.loadVideoById(videoId);

  // Function to try playing the video
  const tryPlay = () => {
    try {
      const state = player.getPlayerState();
      // CUED (5), PAUSED (2), or PLAYING (1) means video is ready
      if (state === 5 || state === 2 || state === 1 || state === 3) {
        if (onReady) {
          onReady();
        } else if (autoPlay) {
          player.playVideo();
          setIsPlaying?.(true);
        }
      } else {
        // If not ready yet, try again after a short delay
        setTimeout(() => {
          try {
            const retryState = player.getPlayerState();
            if (
              retryState === 5 ||
              retryState === 2 ||
              retryState === 1 ||
              retryState === 3
            ) {
              if (onReady) {
                onReady();
              } else if (autoPlay) {
                player.playVideo();
                setIsPlaying?.(true);
              }
            } else {
              // Force play after another delay
              setTimeout(() => {
                if (onReady) {
                  onReady();
                } else if (autoPlay) {
                  try {
                    player.playVideo();
                    setIsPlaying?.(true);
                  } catch {
                    // Ignore errors
                  }
                }
              }, 500);
            }
          } catch {
            // On error, just try to play anyway
            if (onReady) {
              onReady();
            } else if (autoPlay) {
              try {
                player.playVideo();
                setIsPlaying?.(true);
              } catch {
                // Ignore errors
              }
            }
          }
        }, 300);
      }
    } catch {
      // On error, just try to play anyway
      if (onReady) {
        onReady();
      } else if (autoPlay) {
        try {
          player.playVideo();
          setIsPlaying?.(true);
        } catch {
          // Ignore errors
        }
      }
    }
  };

  // Give the video time to load before trying to play
  setTimeout(() => {
    tryPlay();
  }, 200);
}
