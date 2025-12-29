"use client";

import { PlayHistorySection } from "@/components/music/PlayHistorySection";
import { usePlayerContext } from "@/contexts/PlayerContext";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlayHistory } from "@/hooks/usePlayHistory";
import { useAppContext } from "@/contexts/AppContext";
import { Track } from "@/types/track";

export default function HistoryPage() {
  const { playTrackOnly } = usePlayerContext();
  const { currentPlaylist } = usePlaylist();
  const { toggleFavorite, isFavorite } = useFavorites();
  const {
    playHistory,
    addToHistory,
    clearHistory,
    loadPlayHistory,
    isLoading,
    hasLoaded,
  } = usePlayHistory();
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Lịch Sử Phát</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Xem lại các bài hát bạn đã nghe
          </p>
        </div>
        <PlayHistorySection
          playHistory={playHistory}
          currentTrack={null}
          onPlay={handlePlay}
          onAddToPlaylist={handleAddToPlaylist}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          isLoading={isLoading}
          hasLoaded={hasLoaded}
          onClearHistory={async () => {
            await clearHistory();
            await loadPlayHistory();
          }}
        />
      </div>
    </div>
  );
}
