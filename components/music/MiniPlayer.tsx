"use client";

import { useRef } from "react";
import { Track } from "@/types/track";
import { Button } from "@/components/ui/button";
import { Repeat, Repeat1 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerInfo } from "./player/PlayerInfo";
import { PlayerControls } from "./player/PlayerControls";
import { VolumeControl } from "./player/VolumeControl";
import { ProgressBar } from "./player/ProgressBar";
import { SpeedControl } from "./player/SpeedControl";
import { useYouTubePlayer } from "@/hooks/player/useYouTubePlayer";

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (volume: number) => void;
  onToggleMute?: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
  onToggleFavorite?: (track: Track) => void;
  isFavorite?: (track: Track) => boolean;
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
  volume = 100,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  playbackSpeed = 1,
  onSpeedChange,
  onToggleFavorite,
  isFavorite,
}: MiniPlayerProps) {
  // Touch gestures for swipe left/right
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeThreshold = 50; // Minimum distance for swipe

  const { playerRef } = useYouTubePlayer({
    track,
    isPlaying,
    onPlayerReady,
    onVideoEnd,
  });

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle touch start for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  // Handle touch end for swipe gestures
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Only process swipe if horizontal movement is greater than vertical (more horizontal swipe)
    if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > swipeThreshold
    ) {
      if (deltaX > 0) {
        // Swipe right - previous track
        if (hasPrevious || repeatMode !== "off") {
          onPrevious();
        }
      } else {
        // Swipe left - next track
        if (hasNext || repeatMode !== "off") {
          onNext();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="hidden">
          <div ref={playerRef} />
        </div>
        <div className="mx-auto max-w-7xl px-2 sm:px-4 py-2 sm:py-3">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            {/* Progress Bar - Top on Mobile */}
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
              isMobile
            />

            {/* Track Info Row */}
            <div className="mb-2">
              <PlayerInfo
                track={track}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
                isMobile
              />
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              <PlayerControls
                isPlaying={isPlaying}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                repeatMode={repeatMode}
                onPlay={onPlay}
                onPause={onPause}
                onNext={onNext}
                onPrevious={onPrevious}
                isMobile
              />

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div className="flex items-center gap-1">
                {onSpeedChange && (
                  <SpeedControl
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={onSpeedChange}
                  />
                )}
                {onToggleMute && onVolumeChange && (
                  <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onVolumeChange={onVolumeChange}
                    onToggleMute={onToggleMute}
                    isMobile
                  />
                )}
                {onToggleRepeat && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggleRepeat}
                    className={`h-10 w-10 touch-manipulation ${repeatMode !== "off" ? "text-primary" : ""}`}
                  >
                    {repeatMode === "one" ? (
                      <Repeat1 className="h-5 w-5" />
                    ) : (
                      <Repeat className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:block">
            {/* Main Content - 3 columns layout */}
            <div className="flex items-center gap-4 mb-3">
              {/* Left: Track Info */}
              <PlayerInfo
                track={track}
                isFavorite={isFavorite}
                onToggleFavorite={onToggleFavorite}
              />

              {/* Center: Playback Controls */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <PlayerControls
                  isPlaying={isPlaying}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  repeatMode={repeatMode}
                  isShuffled={isShuffled}
                  onPlay={onPlay}
                  onPause={onPause}
                  onNext={onNext}
                  onPrevious={onPrevious}
                  onToggleRepeat={onToggleRepeat}
                  onToggleShuffle={onToggleShuffle}
                />
                {/* Progress Bar - Below Controls */}
                <ProgressBar
                  currentTime={currentTime}
                  duration={duration}
                  onSeek={onSeek}
                />
              </div>

              {/* Right: Speed & Volume Control */}
              <div className="flex items-center gap-2">
                {onSpeedChange && (
                  <SpeedControl
                    playbackSpeed={playbackSpeed}
                    onSpeedChange={onSpeedChange}
                  />
                )}
                {onToggleMute && onVolumeChange && (
                  <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onVolumeChange={onVolumeChange}
                    onToggleMute={onToggleMute}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
