"use client";

import { useState } from "react";
import { Track } from "@/types/track";
import { MusicCard } from "./MusicCard";
import { MusicCardSkeleton } from "./MusicCardSkeleton";
import { Card } from "@/components/ui/card";
import { History, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "vừa xong";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
}

interface PlayHistorySectionProps {
  playHistory: Track[];
  currentTrack: Track | null;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => Promise<void>;
  onToggleFavorite?: (track: Track) => Promise<boolean>;
  isFavorite?: (track: Track) => boolean;
  onClearHistory?: () => void;
  isLoading?: boolean;
  hasLoaded?: boolean;
}

export function PlayHistorySection({
  playHistory,
  onPlay,
  onAddToPlaylist,
  onToggleFavorite,
  isFavorite,
  onClearHistory,
  isLoading = false,
  hasLoaded = false,
}: PlayHistorySectionProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Show skeleton if loading or hasn't loaded yet
  if (isLoading || !hasLoaded) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <History className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="hidden sm:inline">Lịch sử phát</span>
            <span className="sm:hidden">Lịch sử</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <MusicCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  if (playHistory.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Lịch sử phát
          </h2>
        </div>
        <Card className="p-8 text-center border-dashed">
          <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Chưa có lịch sử phát</p>
          <p className="text-sm text-muted-foreground mt-2">
            Các bài hát bạn phát sẽ xuất hiện ở đây
          </p>
        </Card>
      </section>
    );
  }

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <History className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="hidden sm:inline">
            Lịch sử phát ({playHistory.length})
          </span>
          <span className="sm:hidden">Lịch sử ({playHistory.length})</span>
        </h2>
        {onClearHistory && playHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearConfirm(true)}
            className="text-destructive hover:text-destructive h-9 sm:h-8 px-2 sm:px-3 touch-manipulation"
          >
            <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Xóa tất cả</span>
            <span className="sm:hidden">Xóa</span>
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {playHistory.map((track) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <MusicCard
                track={track}
                onPlay={onPlay}
                onAddToPlaylist={onAddToPlaylist}
                onToggleFavorite={onToggleFavorite}
                isFavorite={isFavorite ? isFavorite(track) : false}
              />
              {track.createdAt && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1 text-xs text-white">
                  <Clock className="h-3 w-3" />
                  <span>{getTimeAgo(new Date(track.createdAt))}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          if (onClearHistory) {
            onClearHistory();
          }
        }}
        title="Xóa tất cả lịch sử phát"
        description={`Bạn có chắc muốn xóa tất cả ${playHistory.length} bài hát trong lịch sử phát? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tất cả"
        variant="destructive"
      />
    </section>
  );
}
