"use client";

import { useEffect } from "react";
import { Track } from "@/types/track";

interface UseMediaSessionProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function useMediaSession({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onPrevious,
  onNext,
}: UseMediaSessionProps) {
  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return;
    }

    const mediaSession = navigator.mediaSession;

    // Update metadata when track changes
    if (currentTrack) {
      mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.channelName || "Unknown Artist",
        artwork: [
          {
            src: currentTrack.thumbnail,
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    }

    // Set up action handlers
    mediaSession.setActionHandler("play", onPlay);
    mediaSession.setActionHandler("pause", onPause);
    mediaSession.setActionHandler("previoustrack", onPrevious);
    mediaSession.setActionHandler("nexttrack", onNext);

    // Update playback state
    mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // Update position state
    if (currentTrack && duration > 0 && isPlaying) {
      try {
        mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1.0,
          position: currentTime,
        });
      } catch {
        // Position state might not be supported on all browsers
      }
    }
  }, [
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    onPlay,
    onPause,
    onPrevious,
    onNext,
  ]);
}
