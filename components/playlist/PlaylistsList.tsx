"use client";

import { Playlist } from "@/types/playlist";
import { Button } from "@/components/ui/button";
import { Plus, Play, MoreVertical } from "lucide-react";
import { PlaylistMenu } from "@/components/music/PlaylistMenu";
import { Skeleton } from "@/components/ui/skeleton";

interface PlaylistsListProps {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: () => void;
  onEditPlaylist: (playlist: { id: string; name: string }) => void;
  onDeletePlaylist: (playlist: { id: string; name: string }) => void;
  isLoading?: boolean;
}

export function PlaylistsList({
  playlists,
  currentPlaylist,
  onSelectPlaylist,
  onCreatePlaylist,
  onEditPlaylist,
  onDeletePlaylist,
  isLoading = false,
}: PlaylistsListProps) {
  return (
    <section className="mt-10 sm:mt-12">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          Playlists của bạn
          <span className="text-xs font-normal text-muted-foreground">
            ({playlists.length})
          </span>
        </h2>
        <Button
          onClick={onCreatePlaylist}
          className="gap-2 h-10 sm:h-9 w-full sm:w-auto touch-manipulation"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4" />
          <span className="text-sm sm:text-base">Tạo playlist mới</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border bg-card aspect-square"
            >
              <Skeleton className="absolute inset-0" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-background/80 via-background/40 to-transparent">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : playlists.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {playlists.map((pl) => {
            const firstThumb = pl.tracks?.[0]?.thumbnail;
            return (
              <div
                key={pl.id}
                className={`group relative overflow-hidden rounded-xl border aspect-square cursor-pointer touch-manipulation active:scale-[0.98] transition-all ${
                  currentPlaylist?.id === pl.id
                    ? "border-primary shadow-[0_0_0_2px_rgba(59,130,246,0.35)]"
                    : "border-border bg-card hover:border-primary/60"
                }`}
                onClick={() => onSelectPlaylist(pl)}
              >
                <div className="absolute inset-0">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-background/70 via-background/40 to-background/10 ${
                      !firstThumb ? "bg-card/80" : ""
                    }`}
                  />
                  {firstThumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firstThumb}
                      alt={pl.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/30 via-primary/20 to-background" />
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none" />

                <div
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PlaylistMenu
                    triggerClassName="h-9 w-9 rounded-full bg-background/70 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    triggerIcon={<MoreVertical className="h-5 w-5" />}
                    onEdit={() => onEditPlaylist({ id: pl.id, name: pl.name })}
                    onDelete={() =>
                      onDeletePlaylist({ id: pl.id, name: pl.name })
                    }
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg line-clamp-2 drop-shadow">
                        {pl.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground drop-shadow">
                        {pl.tracks?.length || 0} bài hát
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlaylist(pl);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <p>Chưa có playlist nào</p>
          <p className="text-sm mt-2">Tạo playlist mới để bắt đầu!</p>
        </div>
      )}
    </section>
  );
}
