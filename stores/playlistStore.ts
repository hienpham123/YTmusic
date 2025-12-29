import { create } from "zustand";
import { Playlist } from "@/types/playlist";

interface PlaylistState {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  isLoading: boolean;
  hasLoaded: boolean;

  // Actions
  setPlaylists: (playlists: Playlist[]) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  removePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, track: any) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderTracks: (playlistId: string, trackIds: string[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasLoaded: (hasLoaded: boolean) => void;
  reset: () => void;
}

export const usePlaylistStore = create<PlaylistState>((set) => ({
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  hasLoaded: false,

  setPlaylists: (playlists) => set({ playlists }),

  setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),

  addPlaylist: (playlist) =>
    set((state) => {
      // Check if playlist already exists (prevent duplicates)
      if (state.playlists.some((p) => p.id === playlist.id)) {
        return state;
      }
      return { playlists: [...state.playlists, playlist] };
    }),

  updatePlaylist: (playlistId, updates) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((p) =>
        p.id === playlistId ? { ...p, ...updates } : p
      );

      const updatedCurrentPlaylist =
        state.currentPlaylist?.id === playlistId
          ? { ...state.currentPlaylist, ...updates }
          : state.currentPlaylist;

      return {
        playlists: updatedPlaylists,
        currentPlaylist: updatedCurrentPlaylist,
      };
    }),

  removePlaylist: (playlistId) =>
    set((state) => {
      const filtered = state.playlists.filter((p) => p.id !== playlistId);
      const updatedCurrentPlaylist =
        state.currentPlaylist?.id === playlistId
          ? filtered.length > 0
            ? filtered[0]
            : null
          : state.currentPlaylist;

      return {
        playlists: filtered,
        currentPlaylist: updatedCurrentPlaylist,
      };
    }),

  addTrackToPlaylist: (playlistId, track) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((p) => {
        if (p.id === playlistId) {
          const tracks = p.tracks || [];
          // Check if track already exists
          if (tracks.some((t) => t.youtubeVideoId === track.youtubeVideoId)) {
            return p;
          }
          return { ...p, tracks: [...tracks, track] };
        }
        return p;
      });

      const updatedCurrentPlaylist =
        state.currentPlaylist?.id === playlistId
          ? {
              ...state.currentPlaylist,
              tracks: [...(state.currentPlaylist.tracks || []), track],
            }
          : state.currentPlaylist;

      return {
        playlists: updatedPlaylists,
        currentPlaylist: updatedCurrentPlaylist,
      };
    }),

  removeTrackFromPlaylist: (playlistId, trackId) =>
    set((state) => {
      const updatedPlaylists = state.playlists.map((p) => {
        if (p.id === playlistId) {
          return {
            ...p,
            tracks: p.tracks.filter((t) => t.id !== trackId),
          };
        }
        return p;
      });

      const updatedCurrentPlaylist =
        state.currentPlaylist?.id === playlistId
          ? {
              ...state.currentPlaylist,
              tracks: state.currentPlaylist.tracks.filter(
                (t) => t.id !== trackId
              ),
            }
          : state.currentPlaylist;

      return {
        playlists: updatedPlaylists,
        currentPlaylist: updatedCurrentPlaylist,
      };
    }),

  reorderTracks: (playlistId, trackIds) =>
    set((state) => {
      const playlist = state.playlists.find((p) => p.id === playlistId);
      if (!playlist) return state;

      // Create a map for quick lookup
      const trackMap = new Map((playlist.tracks || []).map((t) => [t.id, t]));

      // Reorder tracks based on trackIds array
      const reorderedTracks = trackIds
        .map((id) => trackMap.get(id))
        .filter((t): t is NonNullable<typeof t> => t !== undefined);

      // Add any tracks that weren't in the reorder list (shouldn't happen, but safety)
      const existingIds = new Set(trackIds);
      const remainingTracks = (playlist.tracks || []).filter(
        (t) => !existingIds.has(t.id)
      );
      const finalTracks = [...reorderedTracks, ...remainingTracks];

      const updatedPlaylists = state.playlists.map((p) =>
        p.id === playlistId ? { ...p, tracks: finalTracks } : p
      );

      const updatedCurrentPlaylist =
        state.currentPlaylist?.id === playlistId
          ? { ...state.currentPlaylist, tracks: finalTracks }
          : state.currentPlaylist;

      return {
        playlists: updatedPlaylists,
        currentPlaylist: updatedCurrentPlaylist,
      };
    }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setHasLoaded: (hasLoaded) => set({ hasLoaded }),

  reset: () =>
    set({
      playlists: [],
      currentPlaylist: null,
      isLoading: false,
      hasLoaded: false,
    }),
}));
