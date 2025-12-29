"use client";

import { Track } from "@/types/track";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import Image from "next/image";
import { parseDurationToSeconds, formatDuration } from "@/lib/duration";

interface QueuePanelProps {
  tracks: Track[];
  currentTrackId?: string;
  onPlayTrack: (track: Track) => void;
  onRemoveTrack?: (trackId: string) => void;
}

export function QueuePanel({
  tracks,
  currentTrackId,
  onPlayTrack,
  onRemoveTrack,
}: QueuePanelProps) {
  if (tracks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Chưa có bài hát trong hàng đợi
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {tracks.map((track, index) => {
        const isPlaying = currentTrackId === track.id;
        // Display duration directly if it's already formatted, otherwise parse and format
        const displayDuration =
          track.duration &&
          typeof track.duration === "string" &&
          track.duration.includes(":")
            ? track.duration
            : track.duration
              ? formatDuration(parseDurationToSeconds(track.duration))
              : null;

        return (
          <div
            key={track.id}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer ${
              isPlaying
                ? "bg-primary/10 hover:bg-primary/15"
                : "hover:bg-accent/50"
            }`}
            onClick={() => onPlayTrack(track)}
          >
            {/* Play Icon or Index */}
            <div className="flex-shrink-0 w-5 flex items-center justify-center">
              {isPlaying ? (
                <Play className="h-3 w-3 text-primary fill-primary" />
              ) : (
                <span className="text-[10px] text-muted-foreground group-hover:hidden">
                  {index + 1}
                </span>
              )}
              <Play
                className={`h-3 w-3 text-muted-foreground hidden group-hover:block ${
                  isPlaying ? "hidden" : ""
                }`}
              />
            </div>

            {/* Thumbnail */}
            <div className="relative flex-shrink-0 w-12 aspect-video rounded overflow-hidden bg-muted">
              <Image
                src={track.thumbnail}
                alt={track.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4
                className={`font-medium truncate text-xs ${
                  isPlaying ? "text-primary" : "text-foreground"
                }`}
              >
                {track.title}
              </h4>
              <p className="text-[10px] text-muted-foreground truncate">
                {track.channelName}
              </p>
            </div>

            {/* Duration */}
            {displayDuration && displayDuration !== "0:00" && (
              <div className="flex-shrink-0 text-[10px] text-muted-foreground">
                {displayDuration}
              </div>
            )}

            {/* Remove Button */}
            {onRemoveTrack && (
              <div
                className="flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTrack(track.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
