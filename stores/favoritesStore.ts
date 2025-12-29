import { create } from "zustand";
import { Track } from "@/types/track";

interface FavoritesState {
  favorites: Track[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  hasLoaded: boolean;

  // Actions
  setFavorites: (favorites: Track[]) => void;
  addFavorite: (track: Track) => void;
  removeFavorite: (youtubeVideoId: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasLoaded: (hasLoaded: boolean) => void;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: true,
  hasLoaded: false,

  setFavorites: (favorites) =>
    set({
      favorites,
      favoriteIds: new Set(favorites.map((t) => t.youtubeVideoId)),
    }),

  addFavorite: (track) =>
    set((state) => {
      // Check if already exists by youtubeVideoId
      if (state.favoriteIds.has(track.youtubeVideoId)) {
        return state;
      }
      const newFavorites = [...state.favorites, track];
      const newFavoriteIds = new Set(state.favoriteIds);
      newFavoriteIds.add(track.youtubeVideoId);
      return {
        favorites: newFavorites,
        favoriteIds: newFavoriteIds,
      };
    }),

  removeFavorite: (youtubeVideoId) =>
    set((state) => {
      const newFavorites = state.favorites.filter(
        (t) => t.youtubeVideoId !== youtubeVideoId
      );
      const newFavoriteIds = new Set(state.favoriteIds);
      newFavoriteIds.delete(youtubeVideoId);
      return {
        favorites: newFavorites,
        favoriteIds: newFavoriteIds,
      };
    }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),

  reset: () =>
    set({
      favorites: [],
      favoriteIds: new Set(),
      isLoading: true,
      hasLoaded: false,
    }),
}));
