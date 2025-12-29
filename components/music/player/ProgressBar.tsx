"use client";

import { useState, useEffect } from "react";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  isMobile?: boolean;
}

export function ProgressBar({
  currentTime,
  duration,
  onSeek,
  isMobile = false,
}: ProgressBarProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Update seek value when currentTime changes (if not seeking)
  useEffect(() => {
    if (!isSeeking) {
      setTimeout(() => {
        setSeekValue(currentTime);
      }, 0);
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

  const handleSeekEnd = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
      | React.TouchEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value);
    onSeek(value);
    setIsSeeking(false);
  };

  if (isMobile) {
    return (
      <div className="mb-2 relative">
        <div className="relative w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
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
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer z-10 touch-manipulation"
          style={{ WebkitAppearance: "none", appearance: "none" }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <span className="text-xs text-muted-foreground min-w-[2.5rem] text-right">
        {formatTime(seekValue)}
      </span>
      <div className="relative flex-1">
        <div className="relative w-full h-1 bg-muted/50 rounded-full overflow-hidden">
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
          className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer z-10 touch-manipulation"
          style={{ WebkitAppearance: "none", appearance: "none" }}
        />
      </div>
      <span className="text-xs text-muted-foreground min-w-[2.5rem]">
        {formatTime(duration)}
      </span>
    </div>
  );
}
