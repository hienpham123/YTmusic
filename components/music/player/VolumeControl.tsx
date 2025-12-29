"use client";

import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  isMobile?: boolean;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  isMobile = false,
}: VolumeControlProps) {
  if (isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className="h-10 w-10 touch-manipulation"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleMute}
        className="h-9 w-9 sm:h-10 sm:w-10 touch-manipulation"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted || volume === 0 ? (
          <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
        )}
      </Button>
      <input
        type="range"
        min="0"
        max="100"
        value={isMuted ? 0 : volume}
        onChange={(e) => onVolumeChange(parseInt(e.target.value))}
        className="w-20 sm:w-24 h-1.5 sm:h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-white touch-manipulation"
        style={{
          background: `linear-gradient(to right, white 0%, white ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) ${isMuted ? 0 : volume}%, rgba(255,255,255,0.3) 100%)`,
        }}
      />
    </div>
  );
}
