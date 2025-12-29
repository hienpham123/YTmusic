"use client";

import { useState, useCallback, useEffect } from "react";
import { Track } from "@/types/track";
import { useUserStore } from "@/stores/userStore";

export interface Statistics {
  mostPlayed: Array<Track & { playCount: number }>;
  totalPlays: number;
  totalListeningTime: number; // in seconds
  topArtists: Array<{ name: string; plays: number }>;
}

type Period = "all" | "week" | "month";

export function useStatistics() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  const loadStatistics = useCallback(
    async (period: Period = "all") => {
      if (!user) {
        setStatistics(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/statistics?period=${period}`);
        if (!response.ok) {
          throw new Error("Failed to load statistics");
        }
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load statistics";
        setError(errorMessage);
        console.error("Error loading statistics:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadStatistics("all");
    } else {
      setStatistics(null);
    }
  }, [user, loadStatistics]);

  const formatListeningTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`;
    }
    return `${minutes} phút`;
  }, []);

  return {
    statistics,
    isLoading,
    error,
    loadStatistics,
    formatListeningTime,
  };
}
