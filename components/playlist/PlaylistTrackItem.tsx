"use client";

import { Track } from "@/types/track";
import { Button } from "@/components/ui/button";
import { Play, MoreVertical } from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, ListMusic, Plus } from "lucide-react";
import {
  parseDurationToSeconds,
  formatDuration as formatDurationUtil,
} from "@/lib/duration";

interface PlaylistTrackItemProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onRemove?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  formatDuration?: (seconds: number) => string;
}

export function PlaylistTrackItem({
  track,
  index,
  isPlaying,
  onPlay,
  onRemove,
  onAddToQueue,
  onAddToPlaylist,
  formatDuration,
}: PlaylistTrackItemProps) {
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Parse duration string to seconds, or use directly if it's already a number
  const durationInSeconds = track.duration
    ? parseDurationToSeconds(track.duration)
    : 0;

  // Display duration - use track.duration directly if it's already formatted, otherwise format from seconds
  const displayDuration =
    track.duration &&
    typeof track.duration === "string" &&
    track.duration.includes(":")
      ? track.duration
      : formatDuration
        ? formatDuration(durationInSeconds)
        : formatTime(durationInSeconds);

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer touch-manipulation ${
        isPlaying ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-accent/50"
      }`}
      onClick={() => onPlay(track)}
    >
      {/* Play Icon - Only visible when playing or on hover */}
      <div className="flex-shrink-0 w-6 flex items-center justify-center">
        {isPlaying ? (
          <Play className="h-4 w-4 text-primary fill-primary" />
        ) : (
          <span className="text-xs text-muted-foreground group-hover:hidden">
            {index + 1}
          </span>
        )}
        <Play
          className={`h-4 w-4 text-muted-foreground hidden group-hover:block ${
            isPlaying ? "hidden" : ""
          }`}
        />
      </div>

      {/* Thumbnail */}
      <div className="relative flex-shrink-0 w-[100px] xs:w-[120px] sm:w-[160px] aspect-video rounded overflow-hidden bg-muted">
        <Image
          src={track.thumbnail}
          alt={track.title}
          fill
          className="object-cover"
          unoptimized
        />
        {/* Duration overlay */}
        {displayDuration && displayDuration !== "0:00" && (
          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] xs:text-[10px] sm:text-xs px-1 py-0.5 rounded">
            {displayDuration}
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0 pr-2">
        <h4
          className={`font-medium truncate text-xs xs:text-sm sm:text-base ${
            isPlaying ? "text-primary" : "text-foreground"
          }`}
        >
          {track.title}
        </h4>
        <p className="text-[10px] xs:text-xs sm:text-sm text-muted-foreground truncate">
          {track.channelName}
        </p>
      </div>

      {/* Actions */}
      {(onRemove || onAddToQueue || onAddToPlaylist) && (
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 min-w-[200px]">
              {onAddToQueue && (
                <DropdownMenuItem
                  className="cursor-pointer py-3 text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToQueue(track);
                  }}
                >
                  <ListMusic className="h-5 w-5 mr-3" />
                  <span>Thêm vào hàng đợi</span>
                </DropdownMenuItem>
              )}
              {onAddToPlaylist && (
                <DropdownMenuItem
                  className="cursor-pointer py-3 text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToPlaylist(track);
                  }}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  <span>Thêm vào playlist</span>
                </DropdownMenuItem>
              )}
              {onRemove && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-3 text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(track);
                  }}
                >
                  <Trash2 className="h-5 w-5 mr-3" />
                  <span>Xóa khỏi playlist</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
