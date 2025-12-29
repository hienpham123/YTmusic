"use client";

import { FavoritesSection } from "@/components/music/FavoritesSection";
import { usePlayerContext } from "@/contexts/PlayerContext";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useFavoriteWithConfirm } from "@/hooks/useFavoriteWithConfirm";
import { usePlayHistory } from "@/hooks/usePlayHistory";
import { useAppContext } from "@/contexts/AppContext";
import { Track } from "@/types/track";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function FavoritesPage() {
  const { playTrackOnly } = usePlayerContext();
  const { currentPlaylist } = usePlaylist();
  const {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    loadFavorites,
    isLoading,
    hasLoaded,
    showRemoveConfirm,
    trackToRemove,
    setShowRemoveConfirm,
    setTrackToRemove,
    handleConfirmRemove,
  } = useFavoriteWithConfirm();
  const { addToHistory } = usePlayHistory();
  const { setIsSelectPlaylistOpen, setTrackToAdd } = useAppContext();

  const handlePlay = (track: Track) => {
    const sourceTracks = currentPlaylist?.tracks || [];
    playTrackOnly(track, sourceTracks);
    addToHistory(track);
  };

  const handleAddToPlaylist = async (track: Track) => {
    setTrackToAdd(track);
    setIsSelectPlaylistOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            Bài Hát Yêu Thích
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Danh sách các bài hát bạn đã yêu thích
          </p>
        </div>
        <FavoritesSection
          favorites={favorites}
          currentTrack={null}
          onPlay={handlePlay}
          onAddToPlaylist={handleAddToPlaylist}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          isLoading={isLoading}
          hasLoaded={hasLoaded}
          onClearFavorites={async () => {
            for (const track of favorites) {
              await removeFavorite(track);
            }
            await loadFavorites();
          }}
        />
      </div>

      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setTrackToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        title="Bỏ yêu thích"
        description={`Bạn có chắc muốn bỏ yêu thích bài hát "${trackToRemove?.title}"?`}
        confirmText="Bỏ yêu thích"
        variant="destructive"
      />
    </div>
  );
}
