"use client";

import { Track } from "@/types/track";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Plus,
  ListMusic,
  Trash2,
  MoreVertical,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MusicCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onRemove?: (track: Track) => void;
  onToggleFavorite?: (track: Track) => void;
  isFavorite?: boolean;
}

export function MusicCard({
  track,
  onPlay,
  onAddToPlaylist,
  onAddToQueue,
  onRemove,
  onToggleFavorite,
  isFavorite,
}: MusicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all relative">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={track.thumbnail}
            alt={track.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 active:bg-black/30 transition-colors flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 hover:opacity-100 active:opacity-100 sm:active:opacity-100 transition-opacity rounded-full h-14 w-14 sm:h-12 sm:w-12 touch-manipulation"
              onClick={() => onPlay(track)}
            >
              <Play className="h-7 w-7 sm:h-6 sm:w-6 fill-current" />
            </Button>
          </div>
        </div>
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-hidden">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm sm:text-lg line-clamp-2 mb-1">
              {track.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {track.channelName}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleFavorite(track)}
                title={isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                className={`h-10 w-10 sm:h-9 sm:w-10 p-0 flex-shrink-0 rounded-full touch-manipulation ${isFavorite ? "text-red-500 hover:text-red-600" : ""}`}
              >
                <Heart
                  className={`h-5 w-5 sm:h-4 sm:w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => onPlay(track)}
              className="flex-shrink-0 text-xs sm:text-sm h-10 sm:h-9 px-3 sm:px-4 touch-manipulation"
            >
              <Play className="h-4 w-4 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Phát</span>
            </Button>

            {onAddToQueue && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToQueue(track)}
                title="Thêm vào hàng đợi"
                className="h-10 w-10 sm:h-9 sm:w-24 p-0 sm:px-3 flex-shrink-0 touch-manipulation"
              >
                <ListMusic className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-2">Hàng đợi</span>
              </Button>
            )}

            {onAddToPlaylist && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToPlaylist(track)}
                title="Thêm vào danh sách phát"
                className="h-10 w-10 sm:h-9 sm:w-20 p-0 sm:px-3 flex-shrink-0 touch-manipulation"
              >
                <Plus className="h-5 w-5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-2">Thêm</span>
              </Button>
            )}

            {onRemove && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    title="Tùy chọn"
                    className="h-10 w-10 sm:h-9 sm:w-9 p-0 touch-manipulation"
                  >
                    <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-56 min-w-[200px]"
                  onClick={(e) => e.stopPropagation()}
                >
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
