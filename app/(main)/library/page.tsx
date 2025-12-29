"use client";

import { useState, useEffect, useMemo } from "react";
import { PlaylistsList } from "@/components/playlist/PlaylistsList";
import { PlaylistDetail } from "@/components/playlist/PlaylistDetail";
import { StatisticsDashboard } from "@/components/music/StatisticsDashboard";
import { useAppContext } from "@/contexts/AppContext";
import { usePlayerContext } from "@/contexts/PlayerContext";
import { usePlaylist } from "@/hooks/usePlaylist";
import { usePlayHistory } from "@/hooks/usePlayHistory";
import { Track } from "@/types/track";

export default function LibraryPage() {
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const {
    setIsCreatePlaylistOpen,
    setIsEditPlaylistOpen,
    setPlaylistToEdit,
    setIsDeletePlaylistOpen,
    setPlaylistToDelete,
    setTrackToDelete,
    setIsDeleteTrackOpen,
    setIsSelectPlaylistOpen,
    setTrackToAdd,
  } = useAppContext();
  const { playTrackOnly, playlist, setPlaylist, addToPlaylist } =
    usePlayerContext();
  const {
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    createPlaylist,
    reorderTracks,
    isLoading: isLoadingPlaylists,
  } = usePlaylist();
  const { addToHistory } = usePlayHistory();

  const tracksToDisplay = useMemo(() => {
    if (!currentPlaylist?.tracks || !Array.isArray(currentPlaylist.tracks))
      return [];
    const count = showAllTracks
      ? currentPlaylist.tracks.length
      : Math.min(4, currentPlaylist.tracks.length);
    return currentPlaylist.tracks.slice(0, count);
  }, [currentPlaylist?.tracks, showAllTracks]);

  const handlePlay = (track: Track) => {
    const sourceTracks = currentPlaylist?.tracks || [];
    playTrackOnly(track, sourceTracks);
    addToHistory(track);
  };

  const handleAddToQueue = (track: Track) => {
    const index = playlist.findIndex((t) => t.id === track.id);
    if (index === -1) {
      addToPlaylist(track);
    }
  };

  const handleAddToPlaylist = async (track: Track) => {
    setTrackToAdd(track);
    setIsSelectPlaylistOpen(true);
  };

  // Initialize default playlist if none exists (only for logged in users)
  useEffect(() => {
    // Only create default playlist if user is logged in and has no playlists
    // This is handled in usePlaylist hook when loading from Supabase
  }, [playlists.length]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Thư Viện</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Quản lý playlists và bài hát của bạn
              </p>
            </div>
            <button
              onClick={() => setShowStatistics(!showStatistics)}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-accent transition-colors"
            >
              {showStatistics ? "Ẩn thống kê" : "Xem thống kê"}
            </button>
          </div>
        </div>

        {showStatistics && (
          <div className="mb-8">
            <StatisticsDashboard onPlayTrack={handlePlay} />
          </div>
        )}

        <PlaylistsList
          playlists={playlists}
          currentPlaylist={currentPlaylist}
          onSelectPlaylist={setCurrentPlaylist}
          onCreatePlaylist={() => {
            setIsCreatePlaylistOpen(true);
          }}
          onEditPlaylist={(playlist) => {
            setPlaylistToEdit(playlist);
            setIsEditPlaylistOpen(true);
          }}
          onDeletePlaylist={(playlist) => {
            setPlaylistToDelete(playlist);
            setIsDeletePlaylistOpen(true);
          }}
          isLoading={isLoadingPlaylists}
        />

        {currentPlaylist && (
          <PlaylistDetail
            currentPlaylist={currentPlaylist}
            queueTracks={playlist}
            currentTrack={null}
            tracksToDisplay={tracksToDisplay}
            showAllTracks={showAllTracks}
            onToggleShowAll={() => setShowAllTracks(!showAllTracks)}
            onPlayTrack={handlePlay}
            onAddToQueue={handleAddToQueue}
            onAddToPlaylist={handleAddToPlaylist}
            onRemoveFromQueue={(trackId) => {
              const index = playlist.findIndex((t) => t.id === trackId);
              if (index !== -1) {
                setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
              }
            }}
            onRemoveFromPlaylist={(trackId) => {
              const track = currentPlaylist.tracks.find(
                (t) => t.id === trackId
              );
              if (track) {
                setTrackToDelete({ id: trackId, title: track.title });
                setIsDeleteTrackOpen(true);
              }
            }}
            onReorderPlaylistTracks={async (trackIds) => {
              if (currentPlaylist) {
                await reorderTracks(currentPlaylist.id, trackIds);
              }
            }}
            onReorderQueueTracks={(newTracks) => {
              setPlaylist(newTracks);
            }}
            isLoading={isLoadingPlaylists}
          />
        )}
      </div>
    </div>
  );
}
