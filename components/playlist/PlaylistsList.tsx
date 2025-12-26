"use client";

import { Playlist } from "@/types/playlist";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlaylistMenu } from "@/components/music/PlaylistMenu";

interface PlaylistsListProps {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  onSelectPlaylist: (playlist: Playlist) => void;
  onCreatePlaylist: () => void;
  onEditPlaylist: (playlist: { id: string; name: string }) => void;
  onDeletePlaylist: (playlist: { id: string; name: string }) => void;
}

export function PlaylistsList({
  playlists,
  currentPlaylist,
  onSelectPlaylist,
  onCreatePlaylist,
  onEditPlaylist,
  onDeletePlaylist,
}: PlaylistsListProps) {
  return (
    <section className="mt-12">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Playlists của bạn</h2>
          <Button onClick={onCreatePlaylist} className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo playlist mới
          </Button>
        </div>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
                  currentPlaylist?.id === pl.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-accent border-border"
                }`}
                onClick={() => onSelectPlaylist(pl)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate mb-1">
                      {pl.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {pl.tracks?.length || 0} bài hát
                    </p>
                  </div>
                  <PlaylistMenu
                    onEdit={() => onEditPlaylist({ id: pl.id, name: pl.name })}
                    onDelete={() => onDeletePlaylist({ id: pl.id, name: pl.name })}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <p>Chưa có playlist nào</p>
            <p className="text-sm mt-2">Tạo playlist mới để bắt đầu!</p>
          </div>
        )}
      </div>
    </section>
  );
}

