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
  onSeekForward?: () => void;
  onSeekBackward?: () => void;
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
  onSeekForward,
  onSeekBackward,
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
        album: "YouTube Music",
        artwork: [
          {
            src: currentTrack.thumbnail,
            sizes: "96x96",
            type: "image/jpeg",
          },
          {
            src: currentTrack.thumbnail,
            sizes: "128x128",
            type: "image/jpeg",
          },
          {
            src: currentTrack.thumbnail,
            sizes: "192x192",
            type: "image/jpeg",
          },
          {
            src: currentTrack.thumbnail,
            sizes: "256x256",
            type: "image/jpeg",
          },
          {
            src: currentTrack.thumbnail,
            sizes: "384x384",
            type: "image/jpeg",
          },
          {
            src: currentTrack.thumbnail,
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    }

    // Set up action handlers
    mediaSession.setActionHandler("play", () => {
      onPlay();
    });
    mediaSession.setActionHandler("pause", () => {
      onPause();
    });
    mediaSession.setActionHandler("previoustrack", () => {
      onPrevious();
    });
    mediaSession.setActionHandler("nexttrack", () => {
      onNext();
    });

    // Add seek handlers if available
    if (onSeekForward) {
      try {
        mediaSession.setActionHandler("seekforward", () => {
          onSeekForward();
        });
      } catch {
        // seekforward might not be supported
      }
    }

    if (onSeekBackward) {
      try {
        mediaSession.setActionHandler("seekbackward", () => {
          onSeekBackward();
        });
      } catch {
        // seekbackward might not be supported
      }
    }

    // Update playback state
    mediaSession.playbackState = isPlaying ? "playing" : "paused";

    // Update position state regularly for background playback
    if (currentTrack && duration > 0) {
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

    // Cleanup function
    return () => {
      // Clear action handlers on unmount
      try {
        mediaSession.setActionHandler("play", null);
        mediaSession.setActionHandler("pause", null);
        mediaSession.setActionHandler("previoustrack", null);
        mediaSession.setActionHandler("nexttrack", null);
        if (onSeekForward) {
          mediaSession.setActionHandler("seekforward", null);
        }
        if (onSeekBackward) {
          mediaSession.setActionHandler("seekbackward", null);
        }
      } catch {
        // Ignore errors during cleanup
      }
    };
  }, [
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    onPlay,
    onPause,
    onPrevious,
    onNext,
    onSeekForward,
    onSeekBackward,
  ]);
}
