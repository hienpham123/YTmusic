"use client";

import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { PlaylistTrackItem } from "./PlaylistTrackItem";
import { QueueTrackItem } from "./QueueTrackItem";
import { SortablePlaylistTrackItem } from "./SortablePlaylistTrackItem";
import { SortableQueueTrackItem } from "./SortableQueueTrackItem";
import { QueuePanel } from "@/components/music/QueuePanel";
import { PlaylistPanel } from "@/components/music/PlaylistPanel";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

interface PlaylistDetailProps {
  currentPlaylist: Playlist;
  queueTracks: Track[];
  currentTrack: Track | null;
  tracksToDisplay: Track[];
  showAllTracks: boolean;
  onToggleShowAll: () => void;
  onPlayTrack: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onRemoveFromQueue: (trackId: string) => void;
  onRemoveFromPlaylist: (trackId: string) => void;
  onReorderPlaylistTracks?: (trackIds: string[]) => void;
  onReorderQueueTracks?: (tracks: Track[]) => void;
  isLoading?: boolean;
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
  onAddToPlaylist,
  onRemoveFromQueue,
  onRemoveFromPlaylist,
  onReorderPlaylistTracks,
  onReorderQueueTracks,
  isLoading = false,
}: PlaylistDetailProps) {
  const [activeTab, setActiveTab] = useState<"playlist" | "queue">("playlist");
  const [localPlaylistTracks, setLocalPlaylistTracks] =
    useState<Track[]>(tracksToDisplay);
  const [localQueueTracks, setLocalQueueTracks] =
    useState<Track[]>(queueTracks);

  // Update local state when props change
  useEffect(() => {
    setLocalPlaylistTracks(tracksToDisplay);
  }, [tracksToDisplay]);

  useEffect(() => {
    setLocalQueueTracks(queueTracks);
  }, [queueTracks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handlePlaylistDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localPlaylistTracks.findIndex((t) => t.id === active.id);
    const newIndex = localPlaylistTracks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTracks = arrayMove(localPlaylistTracks, oldIndex, newIndex);
      setLocalPlaylistTracks(newTracks);

      if (onReorderPlaylistTracks) {
        const trackIds = newTracks.map((t) => t.id);
        onReorderPlaylistTracks(trackIds);
      }
    }
  };

  const handleQueueDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localQueueTracks.findIndex((t) => t.id === active.id);
    const newIndex = localQueueTracks.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newTracks = arrayMove(localQueueTracks, oldIndex, newIndex);
      setLocalQueueTracks(newTracks);

      if (onReorderQueueTracks) {
        onReorderQueueTracks(newTracks);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className="mt-8 sm:mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("playlist")}
              className={`px-4 py-2 text-sm font-medium transition-colors touch-manipulation ${
                activeTab === "playlist"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {currentPlaylist.name} ({currentPlaylist.tracks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`px-4 py-2 text-sm font-medium transition-colors touch-manipulation ${
                activeTab === "queue"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Hàng đợi ({queueTracks.length})
            </button>
          </div>

          {/* Playlist Content */}
          {activeTab === "playlist" && (
            <Card className="p-3 sm:p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border">
              {/* Header */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                  {currentPlaylist.name}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {currentPlaylist.tracks?.length || 0} bài hát
                </p>
              </div>

              {/* Playlist Tracks List */}
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <Skeleton className="w-6 h-6 flex-shrink-0" />
                      <Skeleton className="w-[120px] sm:w-[160px] aspect-video rounded flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : currentPlaylist.tracks &&
                currentPlaylist.tracks.length > 0 ? (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePlaylistDragEnd}
                  >
                    <SortableContext
                      items={localPlaylistTracks.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-1">
                        {localPlaylistTracks.map((track, index) => (
                          <SortablePlaylistTrackItem
                            key={track.id}
                            track={track}
                            index={index}
                            isPlaying={currentTrack?.id === track.id}
                            onPlay={onPlayTrack}
                            onAddToQueue={onAddToQueue}
                            onAddToPlaylist={onAddToPlaylist}
                            onRemove={(track) => onRemoveFromPlaylist(track.id)}
                            formatDuration={formatDuration}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                  {currentPlaylist.tracks.length > tracksToDisplay.length && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={onToggleShowAll}
                        className="text-sm text-primary hover:text-primary/80 font-medium py-2 px-4 touch-manipulation"
                      >
                        {showAllTracks
                          ? "Thu gọn"
                          : `Xem thêm ${currentPlaylist.tracks.length - tracksToDisplay.length} bài hát`}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>Chưa có bài hát nào trong playlist</p>
                  <p className="text-sm mt-2">Thêm bài hát để bắt đầu!</p>
                </div>
              )}
            </Card>
          )}

          {/* Queue Content */}
          {activeTab === "queue" && (
            <Card className="p-3 sm:p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border">
              {/* Header */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">
                  Hàng đợi phát
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {queueTracks.length} bài hát trong hàng đợi
                </p>
              </div>

              {/* Queue Tracks List */}
              {localQueueTracks.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleQueueDragEnd}
                >
                  <SortableContext
                    items={localQueueTracks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {localQueueTracks.map((track, index) => (
                        <SortableQueueTrackItem
                          key={track.id}
                          track={track}
                          index={index}
                          isPlaying={currentTrack?.id === track.id}
                          onPlay={onPlayTrack}
                          onRemove={(track) => onRemoveFromQueue(track.id)}
                          formatDuration={formatDuration}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <p>Chưa có bài hát nào trong hàng đợi</p>
                  <p className="text-sm mt-2">
                    Thêm bài hát vào hàng đợi để phát tiếp theo
                  </p>
                </div>
              )}
            </Card>
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
