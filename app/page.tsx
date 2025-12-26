"use client";

import { useState, useEffect, useMemo } from "react";
import { PasteLinkInput } from "@/components/music/PasteLinkInput";
import { MusicCard } from "@/components/music/MusicCard";
import { MiniPlayer } from "@/components/music/MiniPlayer";
import { PlaylistPanel } from "@/components/music/PlaylistPanel";
import { QueuePanel } from "@/components/music/QueuePanel";
import { CreatePlaylistModal } from "@/components/music/CreatePlaylistModal";
import { EditPlaylistModal } from "@/components/music/EditPlaylistModal";
import { DeletePlaylistDialog } from "@/components/music/DeletePlaylistDialog";
import { PlaylistMenu } from "@/components/music/PlaylistMenu";
import { AuthStatus } from "@/components/auth/AuthStatus";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlaylist } from "@/hooks/usePlaylist";
import { Track } from "@/types/track";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [currentTrackData, setCurrentTrackData] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isEditPlaylistOpen, setIsEditPlaylistOpen] = useState(false);
  const [isDeletePlaylistOpen, setIsDeletePlaylistOpen] = useState(false);
  const [playlistToEdit, setPlaylistToEdit] = useState<{ id: string; name: string } | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<{ id: string; name: string } | null>(null);
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
    playTrack,
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

  const handlePaste = async (videoId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/youtube/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể tải thông tin video");
      }

      const track: Track = await response.json();
      setCurrentTrackData(track);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      console.error("Error fetching metadata:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (track: Track) => {
    // Just play the track, don't add to queue
    playTrackOnly(track);
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                🎧 Paste & Play
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dán link YouTube, nghe nhạc ngay
              </p>
            </div>
            <div className="flex-shrink-0">
              <AuthStatus />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Paste Input Section */}
        <section className="flex flex-col items-center justify-center min-h-[30vh] space-y-6 mb-12">
          <PasteLinkInput onPaste={handlePaste} isLoading={isLoading} />

          {error && (
            <div className="w-full max-w-2xl text-destructive text-center text-sm p-3 rounded-md bg-destructive/10 animate-in fade-in">
              {error}
            </div>
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải thông tin video...</span>
            </div>
          )}

          {/* Music Card */}
          {currentTrackData && (
            <div className="w-full max-w-md">
              <MusicCard
                track={currentTrackData}
                onPlay={handlePlay}
                onAddToQueue={handleAddToQueue}
                onAddToPlaylist={handleAddToPlaylist}
              />
            </div>
          )}
        </section>

        {/* Playlists List Section */}
        <section className="mt-12">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Playlists của bạn</h2>
              <Button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Tạo playlist mới
              </Button>
            </div>
            {playlists.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {playlists.map((pl) => (
                      <div
                        key={pl.id}
                        className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
                          currentPlaylist?.id === pl.id
                            ? "bg-primary/10 border-primary"
                            : "bg-card hover:bg-accent border-border"
                        }`}
                        onClick={() => {
                          setCurrentPlaylist(pl);
                        }}
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
                            onEdit={() => {
                              setPlaylistToEdit({ id: pl.id, name: pl.name });
                              setIsEditPlaylistOpen(true);
                            }}
                            onDelete={() => {
                              setPlaylistToDelete({ id: pl.id, name: pl.name });
                              setIsDeletePlaylistOpen(true);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                <p>Chưa có playlist nào</p>
                <p className="text-sm mt-2">Tạo playlist mới để bắt đầu!</p>
              </div>
            )}
          </div>
        </section>

        {/* Playlist Section */}
        {currentPlaylist && (
          <section className="mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Playlist Grid */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-6">Playlist của bạn</h2>
                {currentPlaylist.tracks && currentPlaylist.tracks.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tracksToDisplay.map((track) => (
                        <MusicCard
                          key={track.id}
                          track={track}
                          onPlay={handlePlay}
                          onAddToQueue={handleAddToQueue}
                        />
                      ))}
                    </div>
                    {currentPlaylist.tracks.length > 4 && (
                      <div className="flex justify-center mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowAllTracks(!showAllTracks)}
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
                <div className="sticky top-24 space-y-6">
                  {/* Queue Panel */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Hàng đợi phát</h2>
                    <div className="border border-border rounded-lg bg-card/50 backdrop-blur-sm max-h-[400px] overflow-y-auto">
                      <QueuePanel
                        tracks={playlist}
                        currentTrackId={currentTrack?.id}
                        onPlayTrack={handlePlay}
                        onRemoveTrack={(trackId) => {
                          const index = playlist.findIndex((t) => t.id === trackId);
                          if (index !== -1) {
                            setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
                          }
                        }}
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
                        onPlayTrack={handlePlay}
                        onRemoveTrack={(trackId) =>
                          removeTrackFromPlaylist(currentPlaylist.id, trackId)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
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
    </div>
  );
}
