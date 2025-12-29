"use client";

import { useCallback, useEffect } from "react";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { useSupabase } from "@/contexts/SupabaseContext";
import { playlistService } from "@/services/playlistService";
import { usePlaylistStore } from "@/stores/playlistStore";
import { useUserStore } from "@/stores/userStore";

export function usePlaylist() {
  const {
    playlists,
    currentPlaylist,
    isLoading,
    hasLoaded,
    setPlaylists,
    setCurrentPlaylist,
    addPlaylist,
    updatePlaylist: updatePlaylistInStore,
    removePlaylist: removePlaylistFromStore,
    addTrackToPlaylist: addTrackToPlaylistInStore,
    removeTrackFromPlaylist: removeTrackFromPlaylistInStore,
    reorderTracks: reorderTracksInStore,
    setIsLoading,
    setHasLoaded,
    reset,
  } = usePlaylistStore();

  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);

  const {
    loadPlaylists,
    savePlaylist,
    addTrackToPlaylist: addTrackToSupabase,
    removeTrackFromPlaylist: removeTrackFromSupabase,
  } = useSupabase();

  // Refetch playlists function for pull to refresh
  const refetchPlaylists = useCallback(async () => {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const loadedPlaylists = await loadPlaylists();
      setPlaylists(loadedPlaylists);
      if (loadedPlaylists.length > 0) {
        const current = usePlaylistStore.getState().currentPlaylist;
        if (!current) {
          setCurrentPlaylist(loadedPlaylists[0]);
        } else {
          const updatedCurrent = loadedPlaylists.find(
            (p) => p.id === current.id
          );
          setCurrentPlaylist(updatedCurrent || loadedPlaylists[0]);
        }
      }
    } catch (error) {
      console.error("Error refetching playlists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [loadPlaylists, setPlaylists, setCurrentPlaylist, setIsLoading]);

  // Reset hasLoaded when user changes
  useEffect(() => {
    const unsubscribe = useUserStore.subscribe((state) => {
      const user = state.user;
      setHasLoaded(false);
      if (!user?.id) {
        reset();
      }
    });
    return unsubscribe;
  }, [setHasLoaded, reset]);

  // Load playlists from Supabase on mount and when user changes
  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    const currentUser = useUserStore.getState().user;
    if (currentUser?.id && !hasLoaded) {
      const userId = currentUser.id;
      setIsLoading(true);
      setHasLoaded(true); // Prevent multiple loads

      loadPlaylists()
        .then((loadedPlaylists) => {
          setPlaylists(loadedPlaylists);
          if (loadedPlaylists.length > 0) {
            // Always set first playlist as current when loading from Supabase
            // This ensures currentPlaylist is always set after refresh
            const current = usePlaylistStore.getState().currentPlaylist;
            if (!current) {
              setCurrentPlaylist(loadedPlaylists[0]);
            } else {
              // Update currentPlaylist with fresh data from Supabase if it still exists
              const updatedCurrent = loadedPlaylists.find(
                (p) => p.id === current.id
              );
              if (updatedCurrent) {
                setCurrentPlaylist(updatedCurrent);
              } else {
                // If current playlist no longer exists, use first one
                setCurrentPlaylist(loadedPlaylists[0]);
              }
            }
          } else {
            // Create default playlist if user has none
            const newPlaylist: Playlist = {
              id: crypto.randomUUID(),
              userId: currentUser.id,
              name: "My Playlist",
              tracks: [],
              createdAt: new Date(),
            };

            // Save to Supabase
            savePlaylist(newPlaylist)
              .then((saved) => {
                setPlaylists([saved]);
                setCurrentPlaylist(saved);
              })
              .catch((error) => {
                console.error("❌ Error creating default playlist:", error);
                // Still add locally
                setPlaylists([newPlaylist]);
                setCurrentPlaylist(newPlaylist);
              });
          }
        })
        .catch((error) => {
          console.error("❌ Error loading playlists:", error);
          setHasLoaded(false); // Allow retry on error
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      const currentUser = useUserStore.getState().user;
      if (!currentUser?.id) {
        // Clear playlists when user logs out
        reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasLoaded]);

  const createPlaylist = useCallback(
    async (name: string, userId?: string) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) {
        console.warn("User must be logged in to create playlists");
        throw new Error("User must be logged in to create playlists");
      }

      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        userId: userId || currentUser.id,
        name,
        tracks: [], // Always initialize as empty array
        createdAt: new Date(),
      };

      try {
        const saved = await savePlaylist(newPlaylist);
        // Update store immediately for instant UI feedback
        addPlaylist(saved);
        return saved;
      } catch (error) {
        console.error("❌ Error saving playlist to Supabase:", error);
        throw error;
      }
    },
    [savePlaylist]
  );

  const updatePlaylist = useCallback(
    async (playlistId: string, updates: Partial<Playlist>) => {
      // Update store immediately
      const playlist = playlists.find((p) => p.id === playlistId);
      if (!playlist) {
        throw new Error("Playlist not found");
      }

      const updatedPlaylist = { ...playlist, ...updates };
      updatePlaylistInStore(playlistId, updates);

      // Save to Supabase if user is logged in
      if (user) {
        try {
          await savePlaylist(updatedPlaylist);
        } catch (error) {
          console.error("Error updating playlist:", error);
          throw error;
        }
      }
    },
    [savePlaylist, playlists, updatePlaylistInStore]
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) {
        console.warn("User must be logged in to delete playlists");
        throw new Error("User must be logged in");
      }

      try {
        await playlistService.deletePlaylist(playlistId);
      } catch (error) {
        console.error("❌ Error deleting playlist:", error);
        throw error;
      }

      // Update store immediately
      removePlaylistFromStore(playlistId);
    },
    [removePlaylistFromStore]
  );

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, track: Track) => {
      // Check if track already exists
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) {
        const tracks = playlist.tracks || [];
        if (tracks.some((t) => t.youtubeVideoId === track.youtubeVideoId)) {
          return;
        }
      }

      // Save to Supabase first if user is logged in
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        try {
          const savedTrack = await addTrackToSupabase(playlistId, track);

          // Update store with the saved track (which may have a new ID from Supabase)
          let trackToAdd = track;
          if (
            savedTrack &&
            Array.isArray(savedTrack) &&
            savedTrack.length > 0
          ) {
            const savedTrackData = savedTrack[0] as { id?: string };
            if (savedTrackData?.id) {
              trackToAdd = {
                ...track,
                id: savedTrackData.id,
              };
            }
          }

          addTrackToPlaylistInStore(playlistId, trackToAdd);
        } catch (error) {
          console.error("❌ Lỗi khi lưu vào Supabase:", error);
          throw error; // Re-throw to let caller handle
        }
      } else {
        // User not logged in, just update store
        addTrackToPlaylistInStore(playlistId, track);
      }
    },
    [addTrackToSupabase, playlists, addTrackToPlaylistInStore]
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      // Update store immediately for instant UI feedback
      removeTrackFromPlaylistInStore(playlistId, trackId);

      // Remove from Supabase if user is logged in
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        try {
          await removeTrackFromSupabase(playlistId, trackId);
        } catch (error) {
          console.error("Error removing track from Supabase:", error);
          // If Supabase fails, we could optionally revert the UI change here
          // For now, we'll keep the optimistic update
        }
      }
    },
    [removeTrackFromSupabase, removeTrackFromPlaylistInStore]
  );

  const reorderTracks = useCallback(
    async (playlistId: string, trackIds: string[]) => {
      // Update store immediately for instant UI feedback
      reorderTracksInStore(playlistId, trackIds);

      // Save to Supabase if user is logged in
      const currentUser = useUserStore.getState().user;
      if (currentUser) {
        try {
          const playlist = playlists.find((p) => p.id === playlistId);
          if (playlist) {
            // Reorder tracks based on trackIds
            const trackMap = new Map(
              (playlist.tracks || []).map((t) => [t.id, t])
            );
            const reorderedTracks = trackIds
              .map((id) => trackMap.get(id))
              .filter((t): t is Track => t !== undefined);

            // Save updated playlist with new order
            await savePlaylist({ ...playlist, tracks: reorderedTracks });
          }
        } catch (error) {
          console.error("Error reordering tracks in Supabase:", error);
          // If Supabase fails, we could optionally revert the UI change here
          // For now, we'll keep the optimistic update
        }
      }
    },
    [playlists, savePlaylist, reorderTracksInStore]
  );

  return {
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    reorderTracks,
    isLoading,
    refetchPlaylists,
  };
}
