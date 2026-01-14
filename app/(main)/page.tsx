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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Khám Phá
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Tìm kiếm và khám phá nhạc mới từ YouTube
          </p>
        </div>

        {/* Search Section */}
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
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
            <div className="mb-8 sm:mb-12 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Khám Phá
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
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
