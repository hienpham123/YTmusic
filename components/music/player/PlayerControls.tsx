"use client";

import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Sparkles,
} from "lucide-react";

type RepeatMode = "off" | "one" | "all";

interface PlayerControlsProps {
  isPlaying: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  repeatMode?: RepeatMode;
  isShuffled?: boolean;
  autoQueue?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleRepeat?: () => void;
  onToggleShuffle?: () => void;
  onToggleAutoQueue?: () => void;
  isMobile?: boolean;
}

export function PlayerControls({
  isPlaying,
  hasNext,
  hasPrevious,
  repeatMode = "off",
  isShuffled = false,
  autoQueue = false,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onToggleRepeat,
  onToggleShuffle,
  onToggleAutoQueue,
  isMobile = false,
}: PlayerControlsProps) {
  if (isMobile) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={!hasPrevious && repeatMode === "off"}
          className="h-12 w-12 touch-manipulation"
        >
          <SkipBack className="h-6 w-6" />
        </Button>
        <Button
          variant="default"
          size="icon"
          className="h-14 w-14 rounded-full touch-manipulation shadow-lg"
          onClick={isPlaying ? onPause : onPlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6 fill-current" />
          ) : (
            <Play className="h-6 w-6 fill-current" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={!hasNext && repeatMode === "off"}
          className="h-12 w-12 touch-manipulation"
        >
          <SkipForward className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {onToggleShuffle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleShuffle}
          className={`h-9 w-9 sm:h-10 sm:w-10 touch-manipulation ${isShuffled ? "text-primary" : ""}`}
          title="Shuffle"
        >
          <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!hasPrevious && repeatMode === "off"}
        className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
        title="Previous"
      >
        <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      <Button
        variant="default"
        size="icon"
        className="h-11 w-11 sm:h-12 sm:w-12 rounded-full touch-manipulation"
        onClick={isPlaying ? onPause : onPlay}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
        ) : (
          <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!hasNext && repeatMode === "off"}
        className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
        title="Next"
      >
        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
      </Button>
      {onToggleRepeat && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleRepeat}
          className={`h-9 w-9 sm:h-10 sm:w-10 touch-manipulation ${repeatMode !== "off" ? "text-primary" : ""}`}
          title={
            repeatMode === "one"
              ? "Repeat one"
              : repeatMode === "all"
                ? "Repeat all"
                : "Repeat off"
          }
        >
          {repeatMode === "one" ? (
            <Repeat1 className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </Button>
      )}
      {onToggleAutoQueue && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAutoQueue}
          className={`h-9 w-9 sm:h-10 sm:w-10 touch-manipulation ${autoQueue ? "text-primary" : ""}`}
          title={autoQueue ? "Auto Queue: On" : "Auto Queue: Off"}
        >
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
    </div>
  );
}
