import { create } from "zustand";
import { Track } from "@/types/track";

interface PlayHistoryState {
  playHistory: Track[];
  isLoading: boolean;
  hasLoaded: boolean;

  // Actions
  setPlayHistory: (history: Track[]) => void;
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasLoaded: (hasLoaded: boolean) => void;
  reset: () => void;
}

export const usePlayHistoryStore = create<PlayHistoryState>((set) => ({
  playHistory: [],
  isLoading: true,
  hasLoaded: false,

  setPlayHistory: (history) => set({ playHistory: history }),

  addToHistory: (track) =>
    set((state) => {
      // Remove if already exists to avoid duplicates
      const filtered = state.playHistory.filter((t) => t.id !== track.id);
      // Add to beginning
      return { playHistory: [track, ...filtered] };
    }),

  clearHistory: () => set({ playHistory: [] }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setHasLoaded: (hasLoaded) => set({ hasLoaded }),

  reset: () =>
    set({
      playHistory: [],
      isLoading: true,
      hasLoaded: false,
    }),
}));
