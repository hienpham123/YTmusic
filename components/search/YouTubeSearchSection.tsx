"use client";

import { Track } from "@/types/track";
import { YouTubeSearch } from "@/components/music/YouTubeSearch";

interface YouTubeSearchSectionProps {
  onSelectTrack: (track: Track) => void;
  onAddToPlaylist: (track: Track) => Promise<void>;
  onToggleFavorite?: (track: Track) => void;
  isFavorite?: (track: Track) => boolean;
  initialQuery?: string;
}

export function YouTubeSearchSection({
  onSelectTrack,
  onAddToPlaylist,
  onToggleFavorite,
  isFavorite,
  initialQuery,
}: YouTubeSearchSectionProps) {
  return (
    <section className="flex flex-col items-center justify-center min-h-[30vh] space-y-6 mb-12">
      <div className="w-full max-w-2xl">
        <YouTubeSearch
          onSelectTrack={onSelectTrack}
          onAddToPlaylist={onAddToPlaylist}
          onToggleFavorite={onToggleFavorite}
          isFavorite={isFavorite}
          initialQuery={initialQuery}
        />
      </div>
    </section>
  );
}
