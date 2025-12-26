"use client";

import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface PlaylistPanelProps {
  playlist: Playlist | null;
  currentTrackId?: string;
  onPlayTrack: (track: Track) => void;
  onRemoveTrack?: (trackId: string) => void;
}

export function PlaylistPanel({
  playlist,
  currentTrackId,
  onPlayTrack,
  onRemoveTrack,
}: PlaylistPanelProps) {
  if (!playlist) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Chưa có playlist nào
      </div>
    );
  }

  // Ensure tracks is always an array
  const tracks = playlist.tracks || [];

  if (tracks.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Playlist trống. Thêm bài hát để bắt đầu!
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="font-semibold text-lg mb-4">{playlist.name}</h3>
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
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{track.title}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {track.channelName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrack(track);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
                {onRemoveTrack && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(track.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
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

