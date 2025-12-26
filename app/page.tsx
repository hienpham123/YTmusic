"use client";

import { useState, useEffect, useMemo } from "react";
import { MiniPlayer } from "@/components/music/MiniPlayer";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";
import { EditPlaylistModal } from "@/components/music/EditPlaylistModal";
import { DeletePlaylistDialog } from "@/components/music/DeletePlaylistDialog";
import { DeleteTrackDialog } from "@/components/music/DeleteTrackDialog";
import { Header } from "@/components/layout/Header";
import { YouTubeSearchSection } from "@/components/search/YouTubeSearchSection";
import { PlaylistsList } from "@/components/playlist/PlaylistsList";
import { PlaylistDetail } from "@/components/playlist/PlaylistDetail";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlaylist } from "@/hooks/usePlaylist";
import { Track } from "@/types/track";

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isEditPlaylistOpen, setIsEditPlaylistOpen] = useState(false);
  const [isDeletePlaylistOpen, setIsDeletePlaylistOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<{ id: string; name: string } | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<{ id: string; name: string } | null>(null);
  const [trackToDelete, setTrackToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleteTrackOpen, setIsDeleteTrackOpen] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);


  // Check for OAuth error in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const {
    currentTrack,
    isPlaying,
    playlist,
    currentIndex,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    play,
    pause,
    playTrackOnly,
    next,
    previous,
    addToPlaylist,
    setPlaylist,
    setPlayer,
    seekTo,
    handleVideoEnd,
    toggleRepeat,
    shufflePlaylist,
  } = usePlayer();

  const {
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    createPlaylist,
    updatePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist,
    refetchPlaylists,
  } = usePlaylist();



  // Calculate tracks to display in current playlist
  const tracksToDisplay = useMemo(() => {
    if (!currentPlaylist?.tracks || !Array.isArray(currentPlaylist.tracks)) return [];
    const count = showAllTracks ? currentPlaylist.tracks.length : Math.min(4, currentPlaylist.tracks.length);
    return currentPlaylist.tracks.slice(0, count);
  }, [currentPlaylist?.tracks, showAllTracks]);

  const handleCreatePlaylist = async (name: string) => {
    const newPlaylist = await createPlaylist(name);
    if (newPlaylist) {
      setCurrentPlaylist(newPlaylist);
    }
  };

  const handleEditPlaylist = async (name: string) => {
    if (!playlistToEdit) return;
    await updatePlaylist(playlistToEdit.id, { name });
    // Update currentPlaylist if it's the one being edited
    if (currentPlaylist?.id === playlistToEdit.id) {
      setCurrentPlaylist((prev) => prev ? { ...prev, name } : null);
    }
    setPlaylistToEdit(null);
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    try {
      await deletePlaylist(playlistToDelete.id);
      if (currentPlaylist?.id === playlistToDelete.id) {
        // Switch to first remaining playlist or null
        const remaining = playlists.filter((p) => p.id !== playlistToDelete.id);
        setCurrentPlaylist(remaining[0] || null);
      }
    } catch (error) {
      console.error("Error deleting playlist:", error);
      throw error;
    }
  };


  // AuthStatus component handles user state internally

  const handlePlay = (track: Track) => {
    // Just play the track, don't add to queue
    // Pass currentPlaylist tracks as source if available
    const sourceTracks = currentPlaylist?.tracks || [];
    playTrackOnly(track, sourceTracks);
  };

  const handleAddToQueue = (track: Track) => {
    // Add to queue without playing
    const index = playlist.findIndex((t) => t.id === track.id);
    if (index === -1) {
      addToPlaylist(track);
    } else {
    }
  };

  const handleAddToPlaylist = async (track: Track) => {
    try {
      // Also add to queue
      handleAddToQueue(track);
      
      if (currentPlaylist) {
        // Add to current playlist
        await addTrackToPlaylist(currentPlaylist.id, track);
        
        // Update currentPlaylist state to reflect the new track
        setCurrentPlaylist((prev) => {
          if (!prev) return prev;
          // Check if track already exists
          if (prev.tracks?.some((t) => t.youtubeVideoId === track.youtubeVideoId)) {
            return prev;
          }
          return {
            ...prev,
            tracks: [...(prev.tracks || []), track],
          };
        });
        
      } else {
        // Create a default playlist if none exists
        const newPlaylist = await createPlaylist("My Playlist");
        if (newPlaylist) {
          setCurrentPlaylist(newPlaylist);
          
          // Add track to the new playlist
          await addTrackToPlaylist(newPlaylist.id, track);
          
          // Update currentPlaylist state
          setCurrentPlaylist((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              tracks: [...(prev.tracks || []), track],
            };
          });
          
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi thêm bài hát vào playlist:", error);
      setError("Không thể thêm bài hát vào playlist. Vui lòng thử lại.");
    }
  };

  // Initialize default playlist if none exists
  useEffect(() => {
    if (playlists.length === 0) {
      createPlaylist("My Playlist").then((defaultPlaylist) => {
        if (defaultPlaylist) {
          setCurrentPlaylist(defaultPlaylist);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlists.length]);

  const hasNext = currentIndex < playlist.length - 1;
  const hasPrevious = currentIndex > 0;

  // Update document title when currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      document.title = `${currentTrack.title} - YT Music Hub`;
    } else {
      document.title = "YT Music Hub – Notion for Music";
    }
  }, [currentTrack]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-32">
        <YouTubeSearchSection
          onSelectTrack={handlePlay}
          onAddToPlaylist={handleAddToPlaylist}
        />

        <PlaylistsList
          playlists={playlists}
          currentPlaylist={currentPlaylist}
          onSelectPlaylist={setCurrentPlaylist}
          onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          onEditPlaylist={(playlist) => {
            setPlaylistToEdit(playlist);
            setIsEditPlaylistOpen(true);
          }}
          onDeletePlaylist={(playlist) => {
            setPlaylistToDelete(playlist);
            setIsDeletePlaylistOpen(true);
          }}
        />

        {currentPlaylist && (
          <PlaylistDetail
            currentPlaylist={currentPlaylist}
            queueTracks={playlist}
            currentTrack={currentTrack}
            tracksToDisplay={tracksToDisplay}
            showAllTracks={showAllTracks}
            onToggleShowAll={() => setShowAllTracks(!showAllTracks)}
            onPlayTrack={handlePlay}
            onAddToQueue={handleAddToQueue}
            onRemoveFromQueue={(trackId) => {
              const index = playlist.findIndex((t) => t.id === trackId);
              if (index !== -1) {
                setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
              }
            }}
            onRemoveFromPlaylist={(trackId) => {
              const track = currentPlaylist.tracks.find((t) => t.id === trackId);
              if (track) {
                setTrackToDelete({ id: trackId, title: track.title });
                setIsDeleteTrackOpen(true);
              }
            }}
          />
        )}
      </main>

      {/* Mini Player */}
      <MiniPlayer
        track={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrevious={previous}
        onSeek={seekTo}
        onVideoEnd={handleVideoEnd}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        repeatMode={repeatMode}
        isShuffled={isShuffled}
        onToggleRepeat={toggleRepeat}
        onToggleShuffle={shufflePlaylist}
        onPlayerReady={setPlayer}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={isEditPlaylistOpen}
        onClose={() => {
          setIsEditPlaylistOpen(false);
          setPlaylistToEdit(null);
        }}
        onSave={handleEditPlaylist}
        currentName={playlistToEdit?.name || ""}
      />

      {/* Delete Playlist Dialog */}
      <DeletePlaylistDialog
        isOpen={isDeletePlaylistOpen}
        onClose={() => {
          setIsDeletePlaylistOpen(false);
          setPlaylistToDelete(null);
        }}
        onConfirm={handleDeletePlaylist}
        playlistName={playlistToDelete?.name || ""}
      />

      {/* Delete Track Dialog */}
      <DeleteTrackDialog
        isOpen={isDeleteTrackOpen}
        onClose={() => {
          setIsDeleteTrackOpen(false);
          setTrackToDelete(null);
        }}
        onConfirm={async () => {
          if (trackToDelete && currentPlaylist) {
            try {
              // removeTrackFromPlaylist will update UI immediately (optimistic update)
              await removeTrackFromPlaylist(currentPlaylist.id, trackToDelete.id);
            } catch (error) {
              console.error("Error deleting track:", error);
            }
          }
        }}
        trackTitle={trackToDelete?.title || ""}
      />
    </div>
  );
}
