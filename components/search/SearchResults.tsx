"use client";

import { TrackMetadata } from "@/types/track";
import { Track } from "@/types/track";
import { MusicCard } from "@/components/music/MusicCard";
import { MusicCardSkeleton } from "@/components/music/MusicCardSkeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { detectMood } from "@/lib/mood";

interface SearchResultsProps {
  searchResults: TrackMetadata[];
  searchQuery: string;
  onSelectTrack: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onToggleFavorite?: (track: Track) => void;
  isFavorite?: (track: Track) => boolean;
  onClearResults: () => void;
  isLoading?: boolean;
}

export function SearchResults({
  searchResults,
  onSelectTrack,
  onAddToPlaylist,
  onToggleFavorite,
  isFavorite,
  onClearResults,
  isLoading = false,
}: SearchResultsProps) {
  // Convert TrackMetadata to Track
  const convertToTrack = (metadata: TrackMetadata): Track => {
    return {
      id: crypto.randomUUID(),
      youtubeVideoId: metadata.videoId,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      channelName: metadata.channelName,
      duration: metadata.duration,
      mood: detectMood(metadata.title),
      createdAt: new Date(),
    };
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MusicCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (searchResults.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
        <h4 className="font-semibold">
          Kết quả tìm kiếm ({searchResults.length})
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearResults}
          className="self-start sm:self-auto h-9 sm:h-8 px-3 touch-manipulation"
        >
          <X className="h-4 w-4 mr-1" />
          Xóa
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((metadata) => {
          const track = convertToTrack(metadata);
          return (
            <MusicCard
              key={metadata.videoId}
              track={track}
              onPlay={onSelectTrack}
              onAddToPlaylist={onAddToPlaylist}
              onToggleFavorite={onToggleFavorite}
              isFavorite={isFavorite ? isFavorite(track) : false}
            />
          );
        })}
      </div>
    </div>
  );
}
