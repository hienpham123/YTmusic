"use client";

import { useState, useCallback, useRef } from "react";
import { TrackMetadata } from "@/types/track";

export function useYouTubeSearch() {
  const [searchResults, setSearchResults] = useState<TrackMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const lastQueryRef = useRef<string | null>(null);

  const performSearch = useCallback(
    async (query: string, onSuccess?: (query: string) => void) => {
      const trimmedQuery = query.trim();

      if (!trimmedQuery) {
        setSearchResults([]);
        setIsSearching(false);
        loadingRef.current = false;
        lastQueryRef.current = null;
        return;
      }

      // Prevent duplicate calls - check if already loading or same query
      if (loadingRef.current) {
        return;
      }

      // If same query was just searched, don't search again
      if (lastQueryRef.current === trimmedQuery) {
        return;
      }

      loadingRef.current = true;
      lastQueryRef.current = trimmedQuery;
      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/youtube/search?q=${encodeURIComponent(trimmedQuery)}&maxResults=20`
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Không thể tìm kiếm video");
        }

        const data = await response.json();
        setSearchResults(data.tracks || []);
        if (onSuccess) {
          onSuccess(trimmedQuery);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        loadingRef.current = false;
      }
    },
    []
  );

  const clearResults = useCallback(() => {
    setSearchResults([]);
    setError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    error,
    performSearch,
    clearResults,
    setError,
    setSearchResults,
    setIsSearching,
  };
}
