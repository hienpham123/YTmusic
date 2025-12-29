import { create } from "zustand";
import { Track } from "@/types/track";

interface AppState {
  // Modal states
  isCreatePlaylistOpen: boolean;
  isEditPlaylistOpen: boolean;
  isDeletePlaylistOpen: boolean;
  isDeleteTrackOpen: boolean;
  isSelectPlaylistOpen: boolean;

  // Data for modals
  playlistToEdit: { id: string; name: string } | null;
  playlistToDelete: { id: string; name: string } | null;
  trackToDelete: { id: string; title: string } | null;
  trackToAdd: Track | null;

  // Actions
  setIsCreatePlaylistOpen: (open: boolean) => void;
  setIsEditPlaylistOpen: (open: boolean) => void;
  setIsDeletePlaylistOpen: (open: boolean) => void;
  setIsDeleteTrackOpen: (open: boolean) => void;
  setIsSelectPlaylistOpen: (open: boolean) => void;
  setPlaylistToEdit: (playlist: { id: string; name: string } | null) => void;
  setPlaylistToDelete: (playlist: { id: string; name: string } | null) => void;
  setTrackToDelete: (track: { id: string; title: string } | null) => void;
  setTrackToAdd: (track: Track | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial states
  isCreatePlaylistOpen: false,
  isEditPlaylistOpen: false,
  isDeletePlaylistOpen: false,
  isDeleteTrackOpen: false,
  isSelectPlaylistOpen: false,
  playlistToEdit: null,
  playlistToDelete: null,
  trackToDelete: null,
  trackToAdd: null,

  // Actions
  setIsCreatePlaylistOpen: (open) => set({ isCreatePlaylistOpen: open }),
  setIsEditPlaylistOpen: (open) => set({ isEditPlaylistOpen: open }),
  setIsDeletePlaylistOpen: (open) => set({ isDeletePlaylistOpen: open }),
  setIsDeleteTrackOpen: (open) => set({ isDeleteTrackOpen: open }),
  setIsSelectPlaylistOpen: (open) => set({ isSelectPlaylistOpen: open }),
  setPlaylistToEdit: (playlist) => set({ playlistToEdit: playlist }),
  setPlaylistToDelete: (playlist) => set({ playlistToDelete: playlist }),
  setTrackToDelete: (track) => set({ trackToDelete: track }),
  setTrackToAdd: (track) => set({ trackToAdd: track }),
  reset: () =>
    set({
      isCreatePlaylistOpen: false,
      isEditPlaylistOpen: false,
      isDeletePlaylistOpen: false,
      isDeleteTrackOpen: false,
      isSelectPlaylistOpen: false,
      playlistToEdit: null,
      playlistToDelete: null,
      trackToDelete: null,
      trackToAdd: null,
    }),
}));
