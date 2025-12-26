"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SearchBar } from "./SearchBar";
import { MusicCard } from "./MusicCard";
import { Track } from "@/types/track";
import { TrackMetadata } from "@/types/track";
import { detectMood } from "@/lib/mood";
import { Button } from "@/components/ui/button";
import { Loader2, X, History } from "lucide-react";
import { Card } from "@/components/ui/card";

interface YouTubeSearchProps {
  onSelectTrack: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
}

const SEARCH_HISTORY_KEY = "youtube_search_history";
const MAX_HISTORY_ITEMS = 10;

export function YouTubeSearch({ onSelectTrack, onAddToPlaylist }: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TrackMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;

    setSearchHistory((prev) => {
      const newHistory = [query.trim(), ...prev.filter((q) => q !== query.trim())].slice(0, MAX_HISTORY_ITEMS);
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Error saving search history:", error);
      }
      return newHistory;
    });
  }, []);

  // Clear search history
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  }, []);

  // Perform search
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);
    setShowSuggestions(false); // Hide suggestions when searching

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}&maxResults=20`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Không thể tìm kiếm video");
      }

      const data = await response.json();
      setSearchResults(data.tracks || []);
      saveToHistory(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [saveToHistory]);

  // Handle search input with debounce
  useEffect(() => {
    // Clear previous timeout whenever searchQuery changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // If search query is empty, clear results
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
      // Don't auto-show suggestions here - only show on focus
      return;
    }

    // Don't set loading state yet - wait for debounce
    setError(null);

    // Debounce search - wait 1000ms (1 second) after user stops typing
    // Only then will we call the API
    searchTimeoutRef.current = setTimeout(() => {
      // Only call search if query still has value
      if (searchQuery.trim()) {
        setIsSearching(true);
        performSearch(searchQuery);
      }
    }, 1500); // 1000ms debounce - wait 1 second after user stops typing

    // Cleanup function - clear timeout if component unmounts or query changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
  }, [searchQuery, performSearch]);

  // Convert TrackMetadata to Track
  const convertToTrack = useCallback((metadata: TrackMetadata): Track => {
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
  }, []);

  // Handle track selection
  const handleSelectTrack = useCallback((track: Track) => {
    onSelectTrack(track);
  }, [onSelectTrack]);

  // Handle search from history
  const handleHistoryClick = useCallback((query: string) => {
    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
    setSearchQuery(query);
    setIsSearching(true);
    performSearch(query);
    setShowSuggestions(false);
    // Remove focus from input
    if (searchContainerRef.current) {
      const input = searchContainerRef.current.querySelector('input');
      if (input) {
        input.blur();
      }
    }
  }, [performSearch]);

  // Filter history for suggestions
  const filteredHistory = searchHistory.filter((q) =>
    q.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative" ref={searchContainerRef}>
        <div onClick={(e) => e.stopPropagation()}>
          <SearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
            }}
            onFocus={() => {
              // Show suggestions when input is focused and we have history
              if (searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding to allow mousedown events on suggestions
              // The delay ensures click events on dropdown items work
              setTimeout(() => {
                setShowSuggestions(false);
              }, 150);
            }}
            placeholder="Tìm kiếm video YouTube..."
            className="w-full"
          />
        </div>
        {error && (
          <div className="mt-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Search Suggestions/History - Only show when not searching */}
        {showSuggestions && !isSearching && searchQuery.trim() === "" && searchHistory.length > 0 && (
          <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-medium text-muted-foreground">Lịch sử tìm kiếm</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                }}
                className="h-6 px-2 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Xóa
              </Button>
            </div>
            {searchHistory.map((query, index) => (
              <button
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  e.stopPropagation();
                  handleHistoryClick(query);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent flex items-center gap-2 text-sm"
              >
                <History className="h-4 w-4 text-muted-foreground" />
                {query}
              </button>
            ))}
          </Card>
        )}

        {/* Search suggestions while typing - Only show when not searching and not showing results */}
        {showSuggestions && !isSearching && searchQuery.trim() !== "" && searchResults.length === 0 && filteredHistory.length > 0 && (
          <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Gợi ý từ lịch sử</div>
            {filteredHistory.map((query, index) => (
              <button
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent input blur
                  e.stopPropagation();
                  handleHistoryClick(query);
                }}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent flex items-center gap-2 text-sm"
              >
                <History className="h-4 w-4 text-muted-foreground" />
                {query}
              </button>
            ))}
          </Card>
        )}
      </div>

      {/* Loading indicator */}
      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Đang tìm kiếm...</span>
        </div>
      )}

      {/* Search Results */}
      {!isSearching && searchResults.length > 0 && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
            <h4 className="font-semibold">Kết quả tìm kiếm ({searchResults.length})</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setShowSuggestions(false);
              }}
              className="self-start sm:self-auto"
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
                  onPlay={handleSelectTrack}
                  onAddToPlaylist={onAddToPlaylist}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {!isSearching && searchQuery.trim() && searchResults.length === 0 && !error && (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          <p>Không tìm thấy video nào</p>
          <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
        </div>
      )}
    </div>
  );
}

