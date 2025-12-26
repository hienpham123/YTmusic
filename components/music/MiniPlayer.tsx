"use client";

import { useEffect, useRef, useState } from "react";
import { Track } from "@/types/track";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Shuffle } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type RepeatMode = "off" | "one" | "all";

interface MiniPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onVideoEnd: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  repeatMode?: RepeatMode;
  isShuffled?: boolean;
  onToggleRepeat?: () => void;
  onToggleShuffle?: () => void;
  onPlayerReady?: (player: YT.Player) => void;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function MiniPlayer({
  track,
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onSeek,
  onVideoEnd,
  hasNext,
  hasPrevious,
  repeatMode = "off",
  isShuffled = false,
  onToggleRepeat,
  onToggleShuffle,
  onPlayerReady,
}: MiniPlayerProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Update seek value when currentTime changes (if not seeking)
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setSeekValue(value);
  };

  const handleSeekEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onSeek(value);
    setIsSeeking(false);
  };
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<YT.Player | null>(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    // Load YouTube IFrame API
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

  useEffect(() => {
    if (!apiReady || !track || !playerRef.current) return;

    if (!ytPlayerRef.current) {
      ytPlayerRef.current = new window.YT.Player(playerRef.current, {
        videoId: track.youtubeVideoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            if (onPlayerReady) {
              onPlayerReady(event.target);
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
            // Auto next when video ends
            if (event.data === YT.PlayerState.ENDED) {
              onVideoEnd();
            }
            // Sync playing state
            if (event.data === YT.PlayerState.PLAYING) {
              // Video is playing
            } else if (event.data === YT.PlayerState.PAUSED) {
              // Video is paused
            }
          },
        },
      });
    } else {
      ytPlayerRef.current.loadVideoById(track.youtubeVideoId);
    }

    return () => {
      // Don't destroy on track change, just load new video
    };
  }, [track, apiReady, onPlayerReady]);

  useEffect(() => {
    if (!ytPlayerRef.current) return;

    if (isPlaying) {
      ytPlayerRef.current.playVideo();
    } else {
      ytPlayerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md"
      >
        <div className="hidden">
          <div ref={playerRef} />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Progress Bar */}
          <div className="mb-2 relative">
            <div className="relative w-full h-1 bg-muted/50 rounded-full overflow-hidden">
              {/* Progress fill - white bar */}
              <div
                className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width: `${duration > 0 ? (seekValue / duration) * 100 : 0}%`,
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={seekValue}
              step="1"
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer z-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={track.thumbnail}
                alt={track.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate font-medium">{track.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{formatTime(seekValue)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {onToggleShuffle && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleShuffle}
                  className={`h-9 w-9 ${isShuffled ? "text-primary" : ""}`}
                  title="Shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onPrevious}
                disabled={!hasPrevious && repeatMode === "off"}
                className="h-9 w-9"
                title="Previous"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={isPlaying ? onPause : onPlay}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="h-5 w-5 fill-current" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                disabled={!hasNext && repeatMode === "off"}
                className="h-9 w-9"
                title="Next"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              {onToggleRepeat && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleRepeat}
                  className={`h-9 w-9 ${repeatMode !== "off" ? "text-primary" : ""}`}
                  title={
                    repeatMode === "one"
                      ? "Repeat one"
                      : repeatMode === "all"
                      ? "Repeat all"
                      : "Repeat off"
                  }
                >
                  {repeatMode === "one" ? (
                    <Repeat1 className="h-4 w-4" />
                  ) : (
                    <Repeat className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

