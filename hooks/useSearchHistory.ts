"use client";

import { useState, useEffect, useCallback } from "react";
import { searchHistoryStorage } from "@/lib/storage/searchHistoryStorage";

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>(() =>
    searchHistoryStorage.getAll()
  );

  // Load search history on mount (if needed for sync)
  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously in effect
    const timer = setTimeout(() => {
      setSearchHistory(searchHistoryStorage.getAll());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const addToHistory = useCallback((query: string) => {
    searchHistoryStorage.add(query);
    setSearchHistory(searchHistoryStorage.getAll());
  }, []);

  const clearHistory = useCallback(() => {
    searchHistoryStorage.clear();
    setSearchHistory([]);
  }, []);

  return {
    searchHistory,
    addToHistory,
    clearHistory,
  };
}
