"use client";

import { useState, useEffect, useRef } from "react";
import { SearchBar } from "./SearchBar";
import { Track } from "@/types/track";
import { Loader2 } from "lucide-react";
import { SearchHistoryDropdown } from "@/components/search/SearchHistoryDropdown";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";
import { useYouTubeSuggestions } from "@/hooks/useYouTubeSuggestions";

interface YouTubeSearchProps {
  onSelectTrack: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onToggleFavorite?: (track: Track) => void;
  isFavorite?: (track: Track) => boolean;
  initialQuery?: string;
}

export function YouTubeSearch({
  onSelectTrack,
  onAddToPlaylist,
  onToggleFavorite,
  isFavorite,
  initialQuery,
}: YouTubeSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const initialQueryProcessedRef = useRef(false);
  const isInitialQueryRef = useRef(false);
  const lastSearchedQueryRef = useRef<string | null>(null);

  const { searchHistory, addToHistory, removeFromHistory } = useSearchHistory();
  const {
    searchResults,
    isSearching,
    error,
    performSearch,
    clearResults,
    setError,
    setSearchResults,
    setIsSearching,
  } = useYouTubeSearch();

  // Get YouTube suggestions when user is typing
  const { suggestions: youtubeSuggestions, isLoading: isLoadingSuggestions } =
    useYouTubeSuggestions({
      query: searchQuery,
      enabled: showSuggestions && searchQuery.trim().length > 0,
      debounceMs: 300,
    });

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

  // Handle initial query - only process once when initialQuery changes from undefined to a value
  useEffect(() => {
    const trimmedInitialQuery = initialQuery?.trim();

    if (trimmedInitialQuery && !initialQueryProcessedRef.current) {
      initialQueryProcessedRef.current = true;
      isInitialQueryRef.current = true;
      lastSearchedQueryRef.current = trimmedInitialQuery;

      // Set query and search immediately
      setSearchQuery(trimmedInitialQuery);
      performSearch(trimmedInitialQuery, addToHistory);

      // Reset flag after delay to allow debounce effect to work normally
      setTimeout(() => {
        isInitialQueryRef.current = false;
      }, 2000);
    } else if (!initialQuery) {
      initialQueryProcessedRef.current = false;
      isInitialQueryRef.current = false;
      lastSearchedQueryRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Handle manual search (when user clicks search button or presses Enter)
  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim();

    // Skip if empty
    if (!trimmedQuery) {
      return;
    }

    // Skip if same query was just searched
    if (lastSearchedQueryRef.current === trimmedQuery) {
      return;
    }

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Perform search
    lastSearchedQueryRef.current = trimmedQuery;
    performSearch(trimmedQuery, addToHistory);
    setShowSuggestions(false);

    // Remove focus from input
    if (searchContainerRef.current) {
      const input = searchContainerRef.current.querySelector("input");
      if (input) {
        input.blur();
      }
    }
  };

  // Clear results when query is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
      lastSearchedQueryRef.current = null;
    }
  }, [searchQuery, setSearchResults, setIsSearching, setError]);

  // Handle search from history or suggestions
  const handleHistoryClick = (query: string) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Update query first
    setSearchQuery(trimmedQuery);

    // Always perform search, even if it's the same query
    // This allows users to refresh results or re-search
    lastSearchedQueryRef.current = trimmedQuery;
    performSearch(trimmedQuery, addToHistory);
    setShowSuggestions(false);

    // Remove focus from input
    if (searchContainerRef.current) {
      const input = searchContainerRef.current.querySelector("input");
      if (input) {
        input.blur();
      }
    }
  };

  const handleClearResults = () => {
    setSearchQuery("");
    clearResults();
    setShowSuggestions(false);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      <div className="relative" ref={searchContainerRef}>
        <div onClick={(e) => e.stopPropagation()}>
          <SearchBar
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              // Show suggestions when typing
              if (value.trim().length > 0 || searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onSearch={handleSearch}
            onFocus={() => {
              // Show suggestions when input is focused
              if (searchQuery.trim().length > 0 || searchHistory.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={(e) => {
              // Only delay on desktop, immediate on mobile
              const isMobile = window.innerWidth < 640;
              if (isMobile) {
                // On mobile, close immediately to avoid blocking clicks
                setShowSuggestions(false);
              } else {
                // Delay hiding to allow mousedown events on suggestions (desktop)
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 150);
              }
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

        {/* Search Suggestions/History */}
        <SearchHistoryDropdown
          searchHistory={searchHistory}
          searchQuery={searchQuery}
          onSelectQuery={handleHistoryClick}
          onRemoveFromHistory={removeFromHistory}
          showSuggestions={showSuggestions && !isSearching}
          youtubeSuggestions={youtubeSuggestions}
          isLoadingSuggestions={isLoadingSuggestions}
        />
      </div>

      {/* Search Results with loading skeleton */}
      <SearchResults
        searchResults={searchResults}
        searchQuery={searchQuery}
        onSelectTrack={onSelectTrack}
        onAddToPlaylist={onAddToPlaylist}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
        onClearResults={handleClearResults}
        isLoading={isSearching}
      />

      {/* No results */}
      {!isSearching &&
        searchQuery.trim() &&
        searchResults.length === 0 &&
        !error && (
          <div className="text-center py-16 sm:py-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-muted-foreground/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Không tìm thấy video nào
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
