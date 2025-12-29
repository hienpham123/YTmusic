"use client";

import { useState, useEffect, useRef } from "react";
import { SearchBar } from "./SearchBar";
import { Track } from "@/types/track";
import { Loader2 } from "lucide-react";
import { SearchHistoryDropdown } from "@/components/search/SearchHistoryDropdown";
import { SearchResults } from "@/components/search/SearchResults";
import { useSearchHistory } from "@/hooks/useSearchHistory";
import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";

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

  const { searchHistory, addToHistory, clearHistory } = useSearchHistory();
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

  // Handle search input with debounce (skip if this is initial query)
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    // Skip if this is the initial query being set
    if (isInitialQueryRef.current) {
      return;
    }

    // Skip if this query was just searched (to avoid duplicate)
    if (lastSearchedQueryRef.current === trimmedQuery && trimmedQuery) {
      return;
    }

    // Skip if searchQuery matches initialQuery (to avoid duplicate)
    if (
      initialQuery &&
      trimmedQuery === initialQuery.trim() &&
      initialQueryProcessedRef.current
    ) {
      return;
    }

    // Clear previous timeout whenever searchQuery changes
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // If search query is empty, clear results
    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
      lastSearchedQueryRef.current = null;
      return;
    }

    // Don't set loading state yet - wait for debounce
    setError(null);

    // Debounce search - wait 1500ms (1.5 seconds) after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      // Triple check before calling
      if (
        !isInitialQueryRef.current &&
        trimmedQuery &&
        lastSearchedQueryRef.current !== trimmedQuery
      ) {
        lastSearchedQueryRef.current = trimmedQuery;
        performSearch(trimmedQuery, addToHistory);
      }
    }, 1500);

    // Cleanup function - clear timeout if component unmounts or query changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Handle search from history
  const handleHistoryClick = (query: string) => {
    const trimmedQuery = query.trim();

    // Skip if same query
    if (lastSearchedQueryRef.current === trimmedQuery) {
      return;
    }

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    lastSearchedQueryRef.current = trimmedQuery;
    setSearchQuery(trimmedQuery);
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

        {/* Search Suggestions/History */}
        <SearchHistoryDropdown
          searchHistory={searchHistory}
          searchQuery={searchQuery}
          onSelectQuery={handleHistoryClick}
          onClearHistory={clearHistory}
          showSuggestions={showSuggestions && !isSearching}
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
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <p>Không tìm thấy video nào</p>
            <p className="text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
    </div>
  );
}
