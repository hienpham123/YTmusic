"use client";

import { Track } from "@/types/track";
import { Button } from "@/components/ui/button";
import { Heart, MoreVertical } from "lucide-react";
import Image from "next/image";

interface PlayerInfoProps {
  track: Track;
  isFavorite?: (track: Track) => boolean;
  onToggleFavorite?: (track: Track) => void;
  isMobile?: boolean;
}

export function PlayerInfo({
  track,
  isFavorite,
  onToggleFavorite,
  isMobile = false,
}: PlayerInfoProps) {
  return (
    <div
      className={`flex items-center gap-3 ${isMobile ? "sm:gap-2" : "sm:gap-3"} ${isMobile ? "" : "flex-1 min-w-0"}`}
    >
      <div
        className={`relative ${isMobile ? "h-14 w-14" : "h-12 w-12 sm:h-14 sm:w-14"} flex-shrink-0 overflow-hidden rounded-lg`}
      >
        <Image
          src={track.thumbnail}
          alt={track.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className={`flex-1 min-w-0 ${isMobile ? "" : ""}`}>
        <h4
          className={`truncate font-semibold ${isMobile ? "text-sm" : "text-xs sm:text-sm"}`}
        >
          {track.title}
        </h4>
        <p
          className={`truncate ${isMobile ? "text-xs" : "text-xs"} text-muted-foreground mt-0.5`}
        >
          {track.channelName}
        </p>
      </div>
      {onToggleFavorite && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorite(track)}
          className={`${isMobile ? "h-11 w-11" : "h-7 w-7 sm:h-8 sm:w-8"} flex-shrink-0 touch-manipulation ${isFavorite && isFavorite(track) ? "text-red-500" : ""}`}
          title={isFavorite && isFavorite(track) ? "Bỏ yêu thích" : "Yêu thích"}
        >
          <Heart
            className={`${isMobile ? "h-5 w-5" : "h-3.5 w-3.5 sm:h-4 sm:w-4"} ${isFavorite && isFavorite(track) ? "fill-current" : ""}`}
          />
        </Button>
      )}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
          title="Tùy chọn"
        >
          <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      )}
    </div>
  );
}
