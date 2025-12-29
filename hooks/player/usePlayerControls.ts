import { useCallback } from "react";

interface UsePlayerControlsProps {
  playerRef: React.MutableRefObject<YT.Player | null>;
  isPlaying: boolean;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  volume: number;
  isMuted: boolean;
  previousVolume: number;
  setVolume: (value: number) => void;
  setIsMuted: (value: boolean) => void;
  setPreviousVolume: (value: number) => void;
  setCurrentTime: (value: number) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (value: number) => void;
}

export function usePlayerControls({
  playerRef,
  isPlaying,
  setIsPlaying,
  volume,
  isMuted,
  previousVolume,
  setVolume,
  setIsMuted,
  setPreviousVolume,
  setCurrentTime,
  playbackSpeed,
  setPlaybackSpeed,
}: UsePlayerControlsProps) {
  const play = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [playerRef, setIsPlaying]);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, [playerRef, setIsPlaying]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (playerRef.current) {
        const wasPlaying = isPlaying;
        // Seek to position
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);

        // If was paused, ensure it stays paused after seek
        // YouTube player might auto-play after seek, so we need to pause it multiple times
        if (!wasPlaying) {
          // Pause immediately and check multiple times to ensure it stays paused
          setTimeout(() => {
            if (playerRef.current) {
              try {
                playerRef.current.pauseVideo();
                setIsPlaying(false);

                // Check again after a short delay
                setTimeout(() => {
                  if (playerRef.current) {
                    try {
                      const state = playerRef.current.getPlayerState();
                      // If player started playing after seek, pause it again
                      if (state === 1) {
                        // YT.PlayerState.PLAYING
                        playerRef.current.pauseVideo();
                        setIsPlaying(false);
                      }
                    } catch {
                      // Ignore errors
                    }
                  }
                }, 200);
              } catch {
                // Ignore errors
              }
            }
          }, 50);

          // Also check after longer delay to catch any delayed auto-play
          setTimeout(() => {
            if (playerRef.current) {
              try {
                const state = playerRef.current.getPlayerState();
                if (state === YT.PlayerState.PLAYING) {
                  playerRef.current.pauseVideo();
                  setIsPlaying(false);
                }
              } catch {
                // Ignore errors
              }
            }
          }, 500);
        }
      }
    },
    [isPlaying, playerRef, setIsPlaying, setCurrentTime]
  );

  const setVolumeLevel = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      setVolume(clampedVolume);
      if (playerRef.current) {
        try {
          playerRef.current.setVolume(clampedVolume);
          if (clampedVolume > 0 && isMuted) {
            setIsMuted(false);
          }
        } catch {
          // Player not ready yet
        }
      }
    },
    [isMuted, playerRef, setVolume, setIsMuted]
  );

  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Unmute: restore previous volume
      setIsMuted(false);
      setVolume(previousVolume);
      if (playerRef.current) {
        try {
          playerRef.current.unMute();
          playerRef.current.setVolume(previousVolume);
        } catch {
          // Player not ready yet
        }
      }
    } else {
      // Mute: save current volume and set to 0
      setPreviousVolume(volume);
      setIsMuted(true);
      if (playerRef.current) {
        try {
          playerRef.current.mute();
        } catch {
          // Player not ready yet
        }
      }
    }
  }, [
    isMuted,
    volume,
    previousVolume,
    playerRef,
    setIsMuted,
    setVolume,
    setPreviousVolume,
  ]);

  const setPlaybackSpeedLevel = useCallback(
    (speed: number) => {
      const validSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const clampedSpeed = validSpeeds.includes(speed) ? speed : 1;
      setPlaybackSpeed(clampedSpeed);
      if (playerRef.current) {
        try {
          playerRef.current.setPlaybackRate(clampedSpeed);
        } catch {
          // Player not ready yet
        }
      }
    },
    [playerRef, setPlaybackSpeed]
  );

  return {
    play,
    pause,
    seekTo,
    setVolumeLevel,
    toggleMute,
    setPlaybackSpeedLevel,
  };
}
