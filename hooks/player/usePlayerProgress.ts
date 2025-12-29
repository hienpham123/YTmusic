"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export function usePlayerProgress(
  playerRef: React.RefObject<YT.Player | null>
) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const time = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setCurrentTime(time);
          setDuration(dur);
        } catch {
          // Player not ready yet
        }
      }
    }, 1000);
  }, [playerRef]);

  const seekTo = useCallback(
    (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      }
    },
    [playerRef]
  );

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    startProgressTracking,
    seekTo,
  };
}
