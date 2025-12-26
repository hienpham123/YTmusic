"use client";

import { Track } from "@/types/track";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, ListMusic } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MusicCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
}

const moodColors: Record<Track["mood"], string> = {
  Chill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Sad: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Night: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Focus: "bg-green-500/20 text-green-300 border-green-500/30",
  Unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export function MusicCard({ track, onPlay, onAddToPlaylist, onAddToQueue }: MusicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all">
        <div className="relative aspect-video w-full">
          <Image
            src={track.thumbnail}
            alt={track.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 hover:opacity-100 transition-opacity rounded-full h-12 w-12"
              onClick={() => onPlay(track)}
            >
              <Play className="h-6 w-6 fill-current" />
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {track.title}
            </h3>
            <p className="text-sm text-muted-foreground">{track.channelName}</p>
          </div>
          <div className="flex items-center justify-between">
            {/* <Badge
              variant="outline"
              className={moodColors[track.mood]}
            >
              {track.mood}
            </Badge> */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPlay(track)}
              >
                <Play className="h-4 w-4 mr-2" />
                Phát
              </Button>
              {onAddToQueue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToQueue(track)}
                  title="Thêm vào hàng đợi"
                >
                  <ListMusic className="h-4 w-4 mr-1" />
                  Hàng đợi
                </Button>
              )}
              {onAddToPlaylist && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToPlaylist(track)}
                  title="Thêm vào danh sách phát"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

