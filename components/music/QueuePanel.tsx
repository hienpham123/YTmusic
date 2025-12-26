"use client";

import { Track } from "@/types/track";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="space-y-2 p-4">
      <h3 className="font-semibold text-sm text-muted-foreground mb-3">
        Hàng đợi phát ({tracks.length})
      </h3>
      {tracks.map((track, index) => (
        <motion.div
          key={track.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={`p-3 cursor-pointer transition-colors ${
              currentTrackId === track.id
                ? "bg-primary/10 border-primary"
                : "hover:bg-accent"
            }`}
            onClick={() => onPlayTrack(track)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 text-xs text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate text-sm">{track.title}</h4>
                <p className="text-xs text-muted-foreground truncate">
                  {track.channelName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(track);
                  }}
                >
                  <Play className="h-3 w-3" />
                </Button>
                {onRemoveTrack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(track.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

