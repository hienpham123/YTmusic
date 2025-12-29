"use client";

import { useState, useCallback, useEffect } from "react";
import { Track } from "@/types/track";
import { useUserStore } from "@/stores/userStore";

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);

  const loadRecommendations = useCallback(
    async (limit: number = 10, trackId?: string) => {
      if (!user) {
        setRecommendations([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
        });
        if (trackId) {
          params.append("trackId", trackId);
        }

        const response = await fetch(
          `/api/recommendations?${params.toString()}`
        );
        if (!response.ok) {
          throw new Error("Failed to load recommendations");
        }
        const data = await response.json();
        setRecommendations(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load recommendations";
        setError(errorMessage);
        console.error("Error loading recommendations:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user) {
      loadRecommendations(10);
    } else {
      setRecommendations([]);
    }
  }, [user, loadRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    loadRecommendations,
  };
}
