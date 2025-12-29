"use client";

import { useState, useCallback } from "react";
import { Track } from "@/types/track";
import { useFavorites } from "./useFavorites";

export function useFavoriteWithConfirm() {
  const { toggleFavorite, isFavorite, removeFavorite, loadFavorites, ...rest } =
    useFavorites();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [trackToRemove, setTrackToRemove] = useState<Track | null>(null);

  const handleToggleFavorite = useCallback(
    async (track: Track): Promise<boolean> => {
      // If already favorite, show confirm dialog before removing
      if (isFavorite(track)) {
        setTrackToRemove(track);
        setShowRemoveConfirm(true);
        return true; // Return true since it's already favorite
      } else {
        // Add favorite directly
        return await toggleFavorite(track);
      }
    },
    [isFavorite, toggleFavorite]
  );

  const handleConfirmRemove = useCallback(async () => {
    if (trackToRemove) {
      await toggleFavorite(trackToRemove);
    }
    setShowRemoveConfirm(false);
    setTrackToRemove(null);
  }, [trackToRemove, toggleFavorite]);

  return {
    ...rest,
    toggleFavorite: handleToggleFavorite,
    isFavorite,
    removeFavorite,
    loadFavorites,
    showRemoveConfirm,
    trackToRemove,
    setShowRemoveConfirm,
    setTrackToRemove,
    handleConfirmRemove,
  };
}
