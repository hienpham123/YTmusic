"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MiniPlayer } from "@/components/music/MiniPlayer";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";
import { EditPlaylistModal } from "@/components/music/EditPlaylistModal";
import { DeletePlaylistDialog } from "@/components/music/DeletePlaylistDialog";
import { DeleteTrackDialog } from "@/components/music/DeleteTrackDialog";
import { SelectPlaylistModal } from "@/components/music/SelectPlaylistModal";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import { PlayerProvider, usePlayerContext } from "@/contexts/PlayerContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useFavorites } from "@/hooks/useFavorites";
import { createPlaylistHandlers } from "@/handlers/playlistHandlers";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
    isEditPlaylistOpen,
    setIsEditPlaylistOpen,
    isDeletePlaylistOpen,
    setIsDeletePlaylistOpen,
    playlistToEdit,
    setPlaylistToEdit,
    playlistToDelete,
    setPlaylistToDelete,
    trackToDelete,
    setTrackToDelete,
    isDeleteTrackOpen,
    setIsDeleteTrackOpen,
    isSelectPlaylistOpen,
    setIsSelectPlaylistOpen,
    trackToAdd,
    setTrackToAdd,
  } = useAppContext();
  const { isCollapsed } = useSidebar();

  const {
    currentTrack,
    isPlaying,
    playlist,
    currentIndex,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    volume,
    isMuted,
    playbackSpeed,
    play,
    pause,
    next,
    previous,
    setPlayer,
    seekTo,
    handleVideoEnd,
    toggleRepeat,
    shufflePlaylist,
    setVolumeLevel,
    toggleMute,
    setPlaybackSpeedLevel,
  } = usePlayerContext();

  const {
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    addTrackToPlaylist,
  } = usePlaylist();

  const { isFavorite, toggleFavorite } = useFavorites();

  const hasNext = currentIndex < playlist.length - 1;
  const hasPrevious = currentIndex > 0;

  // Update document title when currentTrack changes
  useEffect(() => {
    if (currentTrack) {
      document.title = `${currentTrack.title} - YT Music`;
    } else {
      document.title = "YT Music – Notion for Music";
    }
  }, [currentTrack]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (currentTrack) {
            if (isPlaying) {
              pause();
            } else {
              play();
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (currentTrack && currentTime > 5) {
            seekTo(currentTime - 5);
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          if (currentTrack && currentTime < duration - 5) {
            seekTo(currentTime + 5);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolumeLevel(Math.min(100, volume + 5));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolumeLevel(Math.max(0, volume - 5));
          break;
        case "n":
        case "N":
          e.preventDefault();
          if (hasNext || repeatMode !== "off") {
            next();
          }
          break;
        case "p":
        case "P":
          e.preventDefault();
          if (hasPrevious || repeatMode !== "off") {
            previous();
          }
          break;
        case "r":
        case "R":
          e.preventDefault();
          toggleRepeat();
          break;
        case "s":
        case "S":
          e.preventDefault();
          shufflePlaylist();
          break;
        case "m":
        case "M":
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    currentTrack,
    isPlaying,
    play,
    pause,
    next,
    previous,
    seekTo,
    currentTime,
    duration,
    hasNext,
    hasPrevious,
    repeatMode,
    toggleRepeat,
    shufflePlaylist,
    volume,
    setVolumeLevel,
    toggleMute,
  ]);

  const {
    handleCreatePlaylist,
    handleEditPlaylist,
    handleDeletePlaylist,
    handleDeleteTrack,
  } = createPlaylistHandlers({
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    removeTrackFromPlaylist,
    setCurrentPlaylist,
    playlistToEdit,
    playlistToDelete,
    trackToDelete,
    setIsCreatePlaylistOpen,
    setIsEditPlaylistOpen,
    setIsDeletePlaylistOpen,
    setIsDeleteTrackOpen,
    setPlaylistToEdit,
    setPlaylistToDelete,
    setTrackToDelete,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex flex-1 pt-14 relative">
        <Sidebar />
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-3.5rem)] transition-all duration-300",
            isCollapsed ? "md:ml-16" : "md:ml-64"
          )}
        >
          <div className="h-full overflow-y-auto pb-24 sm:pb-32">
            {children}
          </div>
        </main>
      </div>

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
        volume={volume}
        isMuted={isMuted}
        onVolumeChange={setVolumeLevel}
        onToggleMute={toggleMute}
        playbackSpeed={playbackSpeed}
        onSpeedChange={setPlaybackSpeedLevel}
        onToggleFavorite={toggleFavorite}
        isFavorite={isFavorite}
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
        onConfirm={handleDeleteTrack}
        trackTitle={trackToDelete?.title || ""}
      />

      {/* Select Playlist Modal */}
      <SelectPlaylistModal
        isOpen={isSelectPlaylistOpen}
        onClose={() => {
          setIsSelectPlaylistOpen(false);
          setTrackToAdd(null);
        }}
        playlists={playlists}
        track={trackToAdd}
        onSelectPlaylist={async (playlistId, track) => {
          await addTrackToPlaylist(playlistId, track);
        }}
        onCreatePlaylist={createPlaylist}
      />
    </div>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SupabaseProvider>
      <AppProvider>
        <SidebarProvider>
          <PlayerProvider>
            <MainLayoutContent>{children}</MainLayoutContent>
          </PlayerProvider>
        </SidebarProvider>
      </AppProvider>
    </SupabaseProvider>
  );
}
