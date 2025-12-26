"use client";

import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { MusicCard } from "@/components/music/MusicCard";
import { QueuePanel } from "@/components/music/QueuePanel";
import { PlaylistPanel } from "@/components/music/PlaylistPanel";
import { Button } from "@/components/ui/button";

interface PlaylistDetailProps {
  currentPlaylist: Playlist;
  queueTracks: Track[];
  currentTrack: Track | null;
  tracksToDisplay: Track[];
  showAllTracks: boolean;
  onToggleShowAll: () => void;
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onRemoveFromQueue: (trackId: string) => void;
  onRemoveFromPlaylist: (trackId: string) => void;
}

export function PlaylistDetail({
  currentPlaylist,
  queueTracks,
  currentTrack,
  tracksToDisplay,
  showAllTracks,
  onToggleShowAll,
  onPlayTrack,
  onAddToQueue,
  onRemoveFromQueue,
  onRemoveFromPlaylist,
}: PlaylistDetailProps) {
  return (
    <section className="mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Playlist Grid */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Playlist của bạn</h2>
          </div>
          {currentPlaylist.tracks && currentPlaylist.tracks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tracksToDisplay.map((track) => (
                  <MusicCard
                    key={track.id}
                    track={track}
                    onPlay={onPlayTrack}
                    onAddToQueue={onAddToQueue}
                    onRemove={(track) => onRemoveFromPlaylist(track.id)}
                  />
                ))}
              </div>
              {currentPlaylist.tracks.length > 4 && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={onToggleShowAll}
                    className="gap-2"
                  >
                    {showAllTracks ? (
                      <span>Thu gọn</span>
                    ) : (
                      <span>Xem thêm ({currentPlaylist.tracks.length - 4} bài hát)</span>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-lg">
              <p>Chưa có bài hát nào trong playlist</p>
              <p className="text-sm mt-2">Thêm bài hát để bắt đầu!</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6 hidden lg:block">
            {/* Queue Panel */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Hàng đợi phát</h2>
              <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm max-h-[400px] overflow-y-auto">
                <QueuePanel
                  tracks={queueTracks}
                  currentTrackId={currentTrack?.id}
                  onPlayTrack={onPlayTrack}
                  onRemoveTrack={onRemoveFromQueue}
                />
              </div>
            </div>

            {/* Playlist Panel */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Playlist của tôi</h2>
              <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm max-h-[400px] overflow-y-auto">
                <PlaylistPanel
                  playlist={currentPlaylist}
                  currentTrackId={currentTrack?.id}
                  onPlayTrack={onPlayTrack}
                  onRemoveTrack={onRemoveFromPlaylist}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

