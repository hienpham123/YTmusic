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
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">
          Kết quả tìm kiếm
          <span className="text-muted-foreground font-normal ml-2">
            ({searchResults.length})
          </span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearResults}
          className="self-start sm:self-auto h-9 sm:h-9 px-4 touch-manipulation hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <X className="h-4 w-4 mr-2" />
          Xóa kết quả
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
