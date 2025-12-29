"use client";

import { useState, useCallback, useEffect } from "react";

export function usePlayerVolume(playerRef: React.RefObject<YT.Player | null>) {
  const [volume, setVolume] = useState(100); // Volume 0-100
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(100); // Store volume before mute

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
  }, [volume, isMuted, playerRef]);

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
    [isMuted, playerRef]
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
  }, [isMuted, volume, previousVolume, playerRef]);

  const initializeVolume = useCallback(
    (player: YT.Player) => {
      try {
        player.setVolume(volume);
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
      } catch {
        // Player not ready yet
      }
    },
    [volume, isMuted]
  );

  return {
    volume,
    isMuted,
    setVolumeLevel,
    toggleMute,
    initializeVolume,
  };
}
