"use client";

import { useCallback, useEffect, useRef } from "react";
import { Track } from "@/types/track";
import { useUserStore } from "@/stores/userStore";
import { useFavoritesStore } from "@/stores/favoritesStore";

export function useFavorites() {
  const user = useUserStore((state) => state.user);
  const {
    favorites,
    favoriteIds,
    isLoading,
    hasLoaded,
    setFavorites,
    addFavorite: addFavoriteToStore,
    removeFavorite: removeFavoriteFromStore,
    setIsLoading,
    setHasLoaded,
    reset,
  } = useFavoritesStore();

  const loadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const hasMountedRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Load favorites from Supabase DB only
  const loadFavorites = useCallback(async () => {
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
      setFavorites([]);
      setIsLoading(false);
      setHasLoaded(true);
      hasLoadedRef.current = true;
      loadingRef.current = false;
      return;
    }

    // Minimum delay to ensure skeleton shows
    const startTime = Date.now();
    const [response] = await Promise.all([
      fetch("/api/favorites"),
      new Promise((resolve) => setTimeout(resolve, 500)), // Increased to 500ms
    ]);

    try {
      if (!response.ok) {
        throw new Error("Failed to load favorites");
      }
      const data = await response.json();

      const tracks: Track[] = data.map(
        (fav: {
          id: string;
          youtube_video_id: string;
          title: string;
          thumbnail: string;
          channel_name: string;
          duration?: string;
          mood?: string;
          created_at?: string;
        }) => ({
          id: fav.id,
          youtubeVideoId: fav.youtube_video_id,
          title: fav.title,
          thumbnail: fav.thumbnail,
          channelName: fav.channel_name,
          duration: fav.duration || "",
          mood: fav.mood || "Unknown",
          createdAt: fav.created_at ? new Date(fav.created_at) : undefined,
        })
      );

      setFavorites(tracks);
    } catch (error) {
      console.error("Error loading favorites:", error);
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
  }, [setFavorites, setIsLoading, setHasLoaded]);

  // Load favorites on mount and when user changes
  useEffect(() => {
    // Initial load
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      loadFavorites();
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
          loadFavorites();
        }
      }
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add to favorites - DB only
  const addFavorite = useCallback(
    async (track: Track) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) {
        console.warn("User must be logged in to add favorites");
        return false;
      }

      try {
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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
          throw new Error("Failed to add favorite");
        }

        const data = await response.json();
        const newTrack: Track = {
          id: data.id,
          youtubeVideoId: data.youtube_video_id,
          title: data.title,
          thumbnail: data.thumbnail,
          channelName: data.channel_name,
          duration: data.duration || "",
          mood: data.mood || "Unknown",
          createdAt: data.created_at ? new Date(data.created_at) : undefined,
        };

        addFavoriteToStore(newTrack);
        return true;
      } catch (error) {
        console.error("Error adding favorite:", error);
        return false;
      }
    },
    [user]
  );

  // Remove from favorites - DB only
  const removeFavorite = useCallback(
    async (track: Track) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) {
        console.warn("User must be logged in to remove favorites");
        return false;
      }

      try {
        const response = await fetch(
          `/api/favorites?userId=${currentUser.id}&youtubeVideoId=${track.youtubeVideoId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to remove favorite");
        }

        removeFavoriteFromStore(track.youtubeVideoId);
        return true;
      } catch (error) {
        console.error("Error removing favorite:", error);
        return false;
      }
    },
    [user]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (track: Track) => {
      const currentFavoriteIds = useFavoritesStore.getState().favoriteIds;
      if (currentFavoriteIds.has(track.youtubeVideoId)) {
        return await removeFavorite(track);
      } else {
        return await addFavorite(track);
      }
    },
    [addFavorite, removeFavorite]
  );

  // Check if track is favorited
  const isFavorite = useCallback(
    (track: Track) => {
      return favoriteIds.has(track.youtubeVideoId);
    },
    [favoriteIds]
  );

  return {
    favorites,
    favoriteIds,
    isLoading: isLoading || !hasLoaded, // Show loading if loading or hasn't loaded yet
    hasLoaded, // Export hasLoaded for component to check
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loadFavorites,
  };
}
