"use client";

import { useCallback, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { useUserStore } from "@/stores/userStore";
import { usePlayHistoryStore } from "@/stores/playHistoryStore";
import { supabase } from "@/lib/supabase/client";

export function usePlayHistory() {
  const user = useUserStore((state) => state.user);
  const {
    playHistory,
    isLoading,
    hasLoaded,
    setPlayHistory,
    addToHistory: addToHistoryInStore,
    clearHistory: clearHistoryInStore,
    setIsLoading,
    setHasLoaded,
    reset,
  } = usePlayHistoryStore();

  const loadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const hasMountedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Load play history from Supabase DB only
  const loadPlayHistory = useCallback(
    async (limit: number = 50) => {
      const currentUser = useUserStore.getState().user;
      const userId = currentUser?.id || null;

      // Prevent duplicate calls - check if already loading or same user already loaded
      if (loadingRef.current) {
        return;
      }

      // If user hasn't changed and we already have data, don't reload
      if (
        userId === lastUserIdRef.current &&
        userId !== null &&
        hasLoadedRef.current
      ) {
        return;
      }

      // Set loading state immediately
      loadingRef.current = true;
      lastUserIdRef.current = userId;
      setIsLoading(true);
      setHasLoaded(false);

      // Only load if user is logged in
      if (!currentUser) {
        // Add delay to show skeleton first
        await new Promise((resolve) => setTimeout(resolve, 500));
        setPlayHistory([]);
        setIsLoading(false);
        setHasLoaded(true);
        hasLoadedRef.current = true;
        loadingRef.current = false;
        return;
      }

      // Get access token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        setPlayHistory([]);
        setIsLoading(false);
        setHasLoaded(true);
        hasLoadedRef.current = true;
        loadingRef.current = false;
        return;
      }

      // Minimum delay to ensure skeleton shows
      const startTime = Date.now();
      const [response] = await Promise.all([
        fetch(`/api/play-history?limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
        new Promise((resolve) => setTimeout(resolve, 500)), // Increased to 500ms
      ]);

      try {
        if (!response.ok) {
          throw new Error("Failed to load play history");
        }
        const data = await response.json();

        const tracks: Track[] = data.map(
          (item: {
            id: string;
            youtube_video_id: string;
            title: string;
            thumbnail: string;
            channel_name: string;
            duration?: string;
            mood?: string;
            played_at?: string;
          }) => ({
            id: item.id,
            youtubeVideoId: item.youtube_video_id,
            title: item.title,
            thumbnail: item.thumbnail,
            channelName: item.channel_name,
            duration: item.duration || "",
            mood: item.mood || "Unknown",
            createdAt: item.played_at ? new Date(item.played_at) : undefined,
          })
        );

        setPlayHistory(tracks);
      } catch (error) {
        console.error("Error loading play history:", error);
      } finally {
        const elapsed = Date.now() - startTime;
        // Ensure minimum display time for skeleton
        if (elapsed < 500) {
          await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
        }
        setIsLoading(false);
        setHasLoaded(true);
        hasLoadedRef.current = true;
        loadingRef.current = false;
      }
    },
    [setPlayHistory, setIsLoading, setHasLoaded]
  );

  // Load play history on mount and when user changes
  useEffect(() => {
    // Initial load
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      loadPlayHistory();
    }

    // Subscribe to user changes
    let prevUserId = useUserStore.getState().user?.id || null;
    const unsubscribe = useUserStore.subscribe((state) => {
      const userId = state.user?.id || null;
      if (userId !== prevUserId) {
        prevUserId = userId;
        lastUserIdRef.current = userId;
        setHasLoaded(false);
        setIsLoading(true);
        hasLoadedRef.current = false;
        loadingRef.current = false;
        if (userId === null) {
          reset();
        } else {
          loadPlayHistory();
        }
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add to play history - DB only
  const addToHistory = useCallback(
    async (track: Track) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) {
        // Only logged in users can save play history
        return;
      }

      try {
        // Get access token for authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;

        if (!accessToken) {
          throw new Error("Not authenticated");
        }

        const response = await fetch("/api/play-history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId: currentUser.id,
            youtubeVideoId: track.youtubeVideoId,
            title: track.title,
            thumbnail: track.thumbnail,
            channelName: track.channelName,
            duration: track.duration,
            mood: track.mood,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to play history");
        }

        // Add to store immediately
        addToHistoryInStore(track);

        // Reload history to get updated data from server
        loadingRef.current = false; // Reset loading flag to allow reload
        await loadPlayHistory();
      } catch (error) {
        console.error("Error adding to play history:", error);
      }
    },
    [loadPlayHistory, addToHistoryInStore]
  );

  // Clear play history - DB only
  const clearHistory = useCallback(async () => {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) {
      console.warn("User must be logged in to clear play history");
      return;
    }

    try {
      // Get access token for authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `/api/play-history?userId=${currentUser.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to clear play history");
      }

      clearHistoryInStore();
    } catch (error) {
      console.error("Error clearing play history:", error);
    }
  }, [clearHistoryInStore]);

  return {
    playHistory,
    isLoading: isLoading || !hasLoaded, // Show loading if loading or hasn't loaded yet
    hasLoaded, // Export hasLoaded for component to check
    addToHistory,
    clearHistory,
    loadPlayHistory,
  };
}
