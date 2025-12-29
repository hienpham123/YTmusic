"use client";

import { useEffect, useRef, useState } from "react";
import { Track } from "@/types/track";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface UseYouTubePlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlayerReady?: (player: YT.Player) => void;
  onVideoEnd: () => void;
}

export function useYouTubePlayer({
  track,
  isPlaying,
  onPlayerReady,
  onVideoEnd,
}: UseYouTubePlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YT.Player | null>(null);
  const [apiReady, setApiReady] = useState(false);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setApiReady(true);
      };
    } else {
      // API already loaded, set ready in next tick to avoid cascading renders
      setTimeout(() => setApiReady(true), 0);
    }
  }, []);

  // Initialize or update player
  useEffect(() => {
    if (!apiReady || !track || !playerRef.current) return;

    if (!ytPlayerRef.current) {
      const playerOptions: YT.PlayerOptions = {
        videoId: track.youtubeVideoId,
        playerVars: {
          autoplay: 0 as const,
          controls: 0 as const,
          modestbranding: 1 as const,
          rel: 0 as const,
        },
        events: {
          onReady: (event: { target: YT.Player }) => {
            if (onPlayerReady) {
              onPlayerReady(event.target);
            }
            // Auto-play when video is ready if isPlaying is true
            if (isPlaying && event.target) {
              setTimeout(() => {
                try {
                  event.target.playVideo();
                } catch {
                  // Ignore errors
                }
              }, 100);
            }
          },
          onStateChange: (
            event: YT.OnStateChangeEvent & { target?: YT.Player }
          ) => {
            // Auto next when video ends
            if (event.data === YT.PlayerState.ENDED) {
              onVideoEnd();
            }
            // Sync playing state
            if (event.data === YT.PlayerState.CUED) {
              // Video is cued and ready - auto-play if isPlaying is true
              if (isPlaying && event.target && ytPlayerRef.current) {
                setTimeout(() => {
                  try {
                    if (ytPlayerRef.current) {
                      ytPlayerRef.current.playVideo();
                    }
                  } catch {
                    // Ignore errors
                  }
                }, 150);
              }
            }
          },
        },
      };
      ytPlayerRef.current = new window.YT.Player(
        playerRef.current,
        playerOptions
      );
    } else {
      // Load new video and auto-play if isPlaying is true
      ytPlayerRef.current.loadVideoById(track.youtubeVideoId);
      if (isPlaying) {
        // Try to play after video loads
        setTimeout(() => {
          if (ytPlayerRef.current) {
            try {
              const state = ytPlayerRef.current.getPlayerState();
              if (
                state === YT.PlayerState.CUED ||
                state === YT.PlayerState.PAUSED
              ) {
                ytPlayerRef.current.playVideo();
              }
            } catch {
              // Ignore errors, will retry in onStateChange
            }
          }
        }, 300);
      }
    }

    return () => {
      // Don't destroy on track change, just load new video
    };

    // onPlayerReady is intentionally excluded - it's only called once on initialization
  }, [track, apiReady]); // Don't include onPlayerReady to prevent reload when volume changes

  // Handle play/pause state changes
  useEffect(() => {
    if (!ytPlayerRef.current) return;

    if (isPlaying) {
      // Try to play immediately
      try {
        const state = ytPlayerRef.current.getPlayerState();
        if (
          state === YT.PlayerState.CUED ||
          state === YT.PlayerState.PAUSED ||
          state === YT.PlayerState.ENDED
        ) {
          ytPlayerRef.current.playVideo();
        } else if (
          state === YT.PlayerState.UNSTARTED ||
          state === YT.PlayerState.BUFFERING
        ) {
          // Video is loading, wait a bit and try again
          setTimeout(() => {
            if (ytPlayerRef.current && isPlaying) {
              try {
                ytPlayerRef.current.playVideo();
              } catch {
                // Ignore errors
              }
            }
          }, 500);
        }
      } catch {
        // If error, just try to play anyway
        try {
          ytPlayerRef.current.playVideo();
        } catch {
          // Ignore errors
        }
      }
    } else {
      ytPlayerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  return { playerRef };
}
