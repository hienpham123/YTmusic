"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { YouTubeSearchSection } from "@/components/search/YouTubeSearchSection";
import { usePlayerContext } from "@/contexts/PlayerContext";
import { usePlaylist } from "@/hooks/usePlaylist";
import { useFavorites } from "@/hooks/useFavorites";
import { usePlayHistory } from "@/hooks/usePlayHistory";
import { useAppContext } from "@/contexts/AppContext";
import { Track } from "@/types/track";

function HomePageContent() {
  const searchParams = useSearchParams();
  const { playTrackOnly } = usePlayerContext();
  const { currentPlaylist } = usePlaylist();
  const { toggleFavorite, isFavorite } = useFavorites();
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Khám Phá</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Tìm kiếm và khám phá nhạc mới từ YouTube
          </p>
        </div>
        <YouTubeSearchSection
          onSelectTrack={handlePlay}
          onAddToPlaylist={handleAddToPlaylist}
          onToggleFavorite={toggleFavorite}
          isFavorite={isFavorite}
          initialQuery={searchParams.get("q") || undefined}
        />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Khám Phá</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tìm kiếm và khám phá nhạc mới từ YouTube
              </p>
            </div>
          </div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
