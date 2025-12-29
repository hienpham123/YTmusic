"use client";

import { useState } from "react";
import { Track } from "@/types/track";
import { Card } from "@/components/ui/card";
import {
  Heart,
  Trash2,
  MoreVertical,
  Play,
  Plus,
  ListMusic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseDurationToSeconds, formatDuration } from "@/lib/duration";
import { Skeleton } from "@/components/ui/skeleton";

interface FavoritesSectionProps {
  favorites: Track[];
  currentTrack: Track | null;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => Promise<void>;
  onToggleFavorite: (track: Track) => Promise<boolean>;
  isFavorite: (track: Track) => boolean;
  onClearFavorites?: () => void;
  isLoading?: boolean;
  hasLoaded?: boolean;
}

export function FavoritesSection({
  favorites,
  currentTrack,
  onPlay,
  onAddToPlaylist,
  onToggleFavorite,
  isFavorite,
  onClearFavorites,
  isLoading = false,
  hasLoaded = false,
}: FavoritesSectionProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Show skeleton if loading or hasn't loaded yet
  if (isLoading || !hasLoaded) {
    return (
      <section className="mb-8 sm:mb-12">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">Bài hát yêu thích</span>
            <span className="sm:hidden">Yêu thích</span>
          </h2>
        </div>

        {/* Desktop Table Skeleton */}
        <div className="hidden sm:block border border-border rounded-lg overflow-hidden bg-card">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_200px_100px_50px] gap-4 px-4 py-3 border-b border-border bg-muted/30">
            <div className="font-semibold text-sm text-muted-foreground uppercase">
              Bài hát
            </div>
            <div className="font-semibold text-sm text-muted-foreground uppercase">
              Album
            </div>
            <div className="font-semibold text-sm text-muted-foreground uppercase">
              Thời lượng
            </div>
            <div></div>
          </div>

          {/* Table Body Skeleton */}
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_200px_100px_50px] gap-4 px-4 py-3"
              >
                {/* Song Column */}
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="w-14 h-14 rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>

                {/* Album Column */}
                <div className="flex items-center">
                  <Skeleton className="h-4 w-full" />
                </div>

                {/* Duration Column */}
                <div className="flex items-center">
                  <Skeleton className="h-4 w-12" />
                </div>

                {/* Actions Column */}
                <div className="flex items-center justify-end">
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Card Skeleton */}
        <div className="sm:hidden space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-3">
              <div className="flex items-start gap-3">
                <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex items-center justify-between pt-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-7 w-7 rounded" />
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                    <Skeleton className="h-8 flex-1 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  if (favorites.length === 0) {
    return (
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            Bài hát yêu thích
          </h2>
        </div>
        <Card className="p-8 text-center border-dashed">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Chưa có bài hát yêu thích nào</p>
          <p className="text-sm text-muted-foreground mt-2">
            Nhấn vào biểu tượng trái tim trên bài hát để thêm vào yêu thích
          </p>
        </Card>
      </section>
    );
  }

  const getDisplayDuration = (track: Track): string => {
    if (
      track.duration &&
      typeof track.duration === "string" &&
      track.duration.includes(":")
    ) {
      return track.duration;
    }
    const seconds = parseDurationToSeconds(track.duration);
    return formatDuration(seconds);
  };

  return (
    <section className="mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-red-500 fill-red-500" />
          <span className="hidden sm:inline">
            Bài hát yêu thích ({favorites.length})
          </span>
          <span className="sm:hidden">Yêu thích ({favorites.length})</span>
        </h2>
        {onClearFavorites && favorites.length > 0 && (
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

      {/* Desktop Table View */}
      <div className="hidden sm:block border border-border rounded-lg overflow-hidden bg-card">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_200px_100px_50px] gap-4 px-4 py-3 border-b border-border bg-muted/30">
          <div className="font-semibold text-sm text-muted-foreground uppercase">
            Bài hát
          </div>
          <div className="font-semibold text-sm text-muted-foreground uppercase">
            Album
          </div>
          <div className="font-semibold text-sm text-muted-foreground uppercase">
            Thời lượng
          </div>
          <div></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border">
          {favorites.map((track) => {
            const isPlaying = currentTrack?.id === track.id;
            const displayDuration = getDisplayDuration(track);

            return (
              <div
                key={track.id}
                className={`group grid grid-cols-[1fr_200px_100px_50px] gap-4 px-4 py-3 transition-colors hover:bg-accent/50 cursor-pointer ${
                  isPlaying ? "bg-primary/10" : ""
                }`}
                onClick={() => onPlay(track)}
              >
                {/* Song Column */}
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-14 h-14 rounded overflow-hidden bg-muted">
                    <Image
                      src={track.thumbnail}
                      alt={track.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-base truncate ${
                        isPlaying ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {track.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {track.channelName}
                    </p>
                  </div>
                </div>

                {/* Album Column */}
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground truncate">
                    {track.channelName} (Single)
                  </span>
                </div>

                {/* Duration Column */}
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    {displayDuration}
                  </span>
                </div>

                {/* Actions Column */}
                <div className="flex items-center justify-end">
                  <div className="flex items-center gap-2">
                    {/* Heart Icon */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-purple-500 hover:text-purple-600 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>

                    {/* Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {onAddToPlaylist && (
                          <>
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
                            <DropdownMenuItem
                              className="cursor-pointer py-3 text-base"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPlay(track);
                              }}
                            >
                              <Play className="h-5 w-5 mr-3" />
                              <span>Phát tiếp theo</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-3 text-base"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track);
                          }}
                        >
                          <Heart className="h-5 w-5 mr-3" />
                          <span>Bỏ yêu thích</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {favorites.map((track) => {
          const isPlaying = currentTrack?.id === track.id;
          const displayDuration = getDisplayDuration(track);

          return (
            <Card
              key={track.id}
              className={`p-3 transition-colors cursor-pointer ${
                isPlaying
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-accent/50"
              }`}
              onClick={() => onPlay(track)}
            >
              <div className="flex items-start gap-3">
                {/* Thumbnail */}
                <div className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-muted">
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-base leading-tight line-clamp-2 mb-1 ${
                      isPlaying ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {track.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {track.channelName}
                  </p>

                  {/* Duration and Heart */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {displayDuration}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-purple-500 hover:text-purple-600 p-0 -mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(track);
                      }}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlay(track);
                      }}
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Phát
                    </Button>
                    {onAddToPlaylist && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToPlaylist(track);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-3 text-base"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(track);
                          }}
                        >
                          <Heart className="h-5 w-5 mr-3" />
                          <span>Bỏ yêu thích</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          if (onClearFavorites) {
            onClearFavorites();
          }
        }}
        title="Xóa tất cả bài hát yêu thích"
        description={`Bạn có chắc muốn xóa tất cả ${favorites.length} bài hát yêu thích? Hành động này không thể hoàn tác.`}
        confirmText="Xóa tất cả"
        variant="destructive"
      />
    </section>
  );
}
