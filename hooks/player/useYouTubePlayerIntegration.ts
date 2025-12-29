import { useCallback, useRef, useEffect } from "react";
import { volumeStorage } from "@/lib/storage/volumeStorage";
import { playbackSpeedStorage } from "@/lib/storage/playbackSpeedStorage";

interface UseYouTubePlayerIntegrationProps {
  playerRef: React.MutableRefObject<YT.Player | null>;
  volume: number;
  isMuted: boolean;
  isPlaying: boolean;
  playbackSpeed: number;
  setCurrentTime: (value: number) => void;
  setDuration: (value: number) => void;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function useYouTubePlayerIntegration({
  playerRef,
  volume,
  isMuted,
  isPlaying,
  playbackSpeed,
  setCurrentTime,
  setDuration,
  setIsPlaying,
}: UseYouTubePlayerIntegrationProps) {
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const setPlayer = useCallback(
    (player: YT.Player) => {
      playerRef.current = player;

      // Set initial volume (use current volume state at the time of initialization)
      try {
        player.setVolume(volume);
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
        // Set initial playback speed
        player.setPlaybackRate(playbackSpeed);
      } catch {
        // Player not ready yet
      }

      // Start progress tracking with state sync
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      progressIntervalRef.current = setInterval(() => {
        if (playerRef.current) {
          try {
            const time = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            const state = playerRef.current.getPlayerState();

            setCurrentTime(time);
            setDuration(dur);

            // Sync playing state with actual player state
            // YT.PlayerState.PLAYING = 1, YT.PlayerState.PAUSED = 2, etc.
            // Use functional updates to get latest state
            setIsPlaying((currentIsPlaying) => {
              if (state === 1 && !currentIsPlaying) {
                // YT.PlayerState.PLAYING - Player is playing but React state says paused - sync it
                return true;
              } else if (state === 2 && currentIsPlaying) {
                // YT.PlayerState.PAUSED - Player is paused but React state says playing - sync it
                return false;
              } else if (state === 0 && currentIsPlaying) {
                // YT.PlayerState.ENDED - Video ended
                // Video ended
                return false;
              }
              return currentIsPlaying;
            });
          } catch {
            // Player not ready yet
          }
        }
      }, 500); // Check more frequently (500ms) for better sync
    },
    [
      volume,
      isMuted,
      playbackSpeed,
      playerRef,
      setCurrentTime,
      setDuration,
      setIsPlaying,
    ]
  );

  // Update volume when it changes (without reloading video)
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(volume);
        if (isMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
        }
      } catch {
        // Player not ready yet
      }
    }
    // Save volume to localStorage
    volumeStorage.setVolume(volume);
  }, [volume, isMuted, playerRef]);

  // Save muted state to localStorage
  useEffect(() => {
    volumeStorage.setMuted(isMuted);
  }, [isMuted]);

  // Update playback speed when it changes
  useEffect(() => {
    if (playerRef.current) {
      try {
        playerRef.current.setPlaybackRate(playbackSpeed);
      } catch {
        // Player not ready yet
      }
    }
    // Save speed to localStorage
    playbackSpeedStorage.setSpeed(playbackSpeed);
  }, [playbackSpeed, playerRef]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    setPlayer,
  };
}
