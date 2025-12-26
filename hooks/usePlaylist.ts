"use client";

import { useState, useCallback, useEffect } from "react";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { useSupabase } from "./useSupabase";
import { supabase } from "@/lib/supabase/client";

export function usePlaylist() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const {
    user,
    loading: authLoading,
    loadPlaylists,
    savePlaylist,
    addTrackToPlaylist: addTrackToSupabase,
    removeTrackFromPlaylist: removeTrackFromSupabase,
  } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Refetch playlists function for pull to refresh
  const refetchPlaylists = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const loadedPlaylists = await loadPlaylists();
      setPlaylists(loadedPlaylists);
      if (loadedPlaylists.length > 0) {
        setCurrentPlaylist((prev) => {
          if (!prev) {
            return loadedPlaylists[0];
          } else {
            const updatedCurrent = loadedPlaylists.find(p => p.id === prev.id);
            return updatedCurrent || loadedPlaylists[0];
          }
        });
      }
    } catch (error) {
      console.error("Error refetching playlists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, loadPlaylists]);

  // Reset hasLoaded when user changes
  useEffect(() => {
    setHasLoaded(false);
  }, [user?.id]);

  // Load playlists from Supabase on mount and when user changes
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (user && !hasLoaded) {
      console.log("🔄 Loading playlists for user:", user.email);
      setIsLoading(true);
      setHasLoaded(true); // Prevent multiple loads
      
      loadPlaylists()
        .then((loadedPlaylists) => {
          console.log("📥 Loaded playlists from Supabase:", loadedPlaylists.length);
          console.log("📋 Playlists data:", loadedPlaylists);
          setPlaylists(loadedPlaylists);
          if (loadedPlaylists.length > 0) {
            // Always set first playlist as current when loading from Supabase
            // This ensures currentPlaylist is always set after refresh
            setCurrentPlaylist((prev) => {
              if (!prev) {
                console.log("🎯 Setting first playlist as current:", loadedPlaylists[0].id);
                return loadedPlaylists[0];
              } else {
                // Update currentPlaylist with fresh data from Supabase if it still exists
                const updatedCurrent = loadedPlaylists.find(p => p.id === prev.id);
                if (updatedCurrent) {
                  console.log("🔄 Updating current playlist with fresh data:", updatedCurrent.id);
                  return updatedCurrent;
                } else {
                  // If current playlist no longer exists, use first one
                  console.log("🎯 Current playlist not found, setting first playlist:", loadedPlaylists[0].id);
                  return loadedPlaylists[0];
                }
              }
            });
          } else {
            // Create default playlist if user has none
            const newPlaylist: Playlist = {
              id: crypto.randomUUID(),
              userId: user.id,
              name: "My Playlist",
              tracks: [],
              createdAt: new Date(),
            };
            
            // Save to Supabase
            savePlaylist(newPlaylist)
              .then((saved) => {
                console.log("✅ Created default playlist:", saved.id);
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
    } else if (!user) {
      // Clear playlists when user logs out
      setPlaylists([]);
      setCurrentPlaylist(null);
      setHasLoaded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, hasLoaded]);

  // Debug: Log currentPlaylist changes
  useEffect(() => {
    console.log("🔍 currentPlaylist changed:", currentPlaylist?.id, currentPlaylist?.name);
  }, [currentPlaylist]);

  const createPlaylist = useCallback(
    async (name: string, userId?: string) => {
      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        userId: userId || user?.id || "guest",
        name,
        tracks: [], // Always initialize as empty array
        createdAt: new Date(),
      };

      console.log("📝 Creating playlist:", name, "User:", user?.id || "guest");

      // If user is logged in, save to Supabase
      if (user) {
        try {
          console.log("💾 Saving playlist to Supabase...");
          const saved = await savePlaylist(newPlaylist);
          console.log("✅ Playlist saved to Supabase:", saved.id);
          setPlaylists((prev) => [...prev, saved]);
          return saved;
        } catch (error) {
          console.error("❌ Error saving playlist to Supabase:", error);
          // Still add to local state even if Supabase fails
          setPlaylists((prev) => [...prev, newPlaylist]);
          return newPlaylist;
        }
      } else {
        console.log("ℹ️ User not logged in, saving locally only");
      }

      // Local state for guest users
      setPlaylists((prev) => [...prev, newPlaylist]);
      return newPlaylist;
    },
    [user, savePlaylist]
  );

  const updatePlaylist = useCallback(
    async (playlistId: string, updates: Partial<Playlist>) => {
      setPlaylists((prev) => {
        const updated = prev.map((p) =>
          p.id === playlistId ? { ...p, ...updates } : p
        );

        // Save to Supabase if user is logged in
        if (user) {
          const playlist = updated.find((p) => p.id === playlistId);
          if (playlist) {
            savePlaylist(playlist).catch((error) => {
              console.error("Error updating playlist:", error);
            });
          }
        }

        return updated;
      });
    },
    [user, savePlaylist]
  );

  const deletePlaylist = useCallback(
    async (playlistId: string) => {
      // Delete from Supabase if user is logged in
      if (user) {
        try {
          // Delete all tracks first (cascade should handle this, but let's be explicit)
          const playlist = playlists.find((p) => p.id === playlistId);
          if (playlist?.tracks && playlist.tracks.length > 0) {
            // Tracks will be deleted via CASCADE, but we can also delete explicitly
            console.log("🗑️ Deleting playlist from Supabase:", playlistId);
          }

          // Delete playlist from Supabase
          const { error } = await supabase
            .from("playlists")
            .delete()
            .eq("id", playlistId);

          if (error) {
            console.error("❌ Error deleting playlist from Supabase:", error);
            throw error;
          }

          console.log("✅ Playlist deleted from Supabase");
        } catch (error) {
          console.error("❌ Error deleting playlist:", error);
          throw error;
        }
      }

      // Update local state
      setPlaylists((prev) => prev.filter((p) => p.id !== playlistId));
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null);
      }
    },
    [user, currentPlaylist, playlists]
  );

  const addTrackToPlaylist = useCallback(
    async (playlistId: string, track: Track) => {
      console.log("🎵 Adding track to playlist:", track.title, "Playlist ID:", playlistId);
      
      // Check if track already exists
      const playlist = playlists.find((p) => p.id === playlistId);
      if (playlist) {
        const tracks = playlist.tracks || [];
        if (tracks.some((t) => t.youtubeVideoId === track.youtubeVideoId)) {
          console.log("⚠️ Bài hát đã có trong playlist");
          return;
        }
      }

      // Save to Supabase first if user is logged in
      if (user) {
        try {
          console.log("💾 Saving track to Supabase...");
          const savedTrack = await addTrackToSupabase(playlistId, track);
          console.log("✅ Track saved to Supabase:", savedTrack);
          
          // Update local state with the saved track (which may have a new ID from Supabase)
          let trackToAdd = track;
          if (savedTrack && Array.isArray(savedTrack) && savedTrack.length > 0) {
            const savedTrackData = savedTrack[0] as { id?: string };
            if (savedTrackData?.id) {
              trackToAdd = {
                ...track,
                id: savedTrackData.id,
              };
            }
          }

          setPlaylists((prev) =>
            prev.map((p) => {
              if (p.id === playlistId) {
                const tracks = p.tracks || [];
                return { ...p, tracks: [...tracks, trackToAdd] };
              }
              return p;
            })
          );
          
          // Also update currentPlaylist if it matches
          setCurrentPlaylist((prev) => {
            if (prev?.id === playlistId) {
              const tracks = prev.tracks || [];
              return {
                ...prev,
                tracks: [...tracks, trackToAdd],
              };
            }
            return prev;
          });
        } catch (error) {
          console.error("❌ Lỗi khi lưu vào Supabase:", error);
          throw error; // Re-throw to let caller handle
        }
      } else {
        // User not logged in, just update local state
        console.log("ℹ️ User not logged in, saving locally only");
        setPlaylists((prev) =>
          prev.map((p) => {
            if (p.id === playlistId) {
              const tracks = p.tracks || [];
              return { ...p, tracks: [...tracks, track] };
            }
            return p;
          })
        );
        
        // Also update currentPlaylist if it matches
        setCurrentPlaylist((prev) => {
          if (prev?.id === playlistId) {
            const tracks = prev.tracks || [];
            return {
              ...prev,
              tracks: [...tracks, track],
            };
          }
          return prev;
        });
      }
    },
    [user, addTrackToSupabase, playlists]
  );

  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      // Update local state immediately for instant UI feedback
      setPlaylists((prev) =>
        prev.map((p) => {
          if (p.id === playlistId) {
            return {
              ...p,
              tracks: p.tracks.filter((t) => t.id !== trackId),
            };
          }
          return p;
        })
      );

      // Also update currentPlaylist if it matches
      setCurrentPlaylist((prev) => {
        if (prev?.id === playlistId) {
          return {
            ...prev,
            tracks: prev.tracks.filter((t) => t.id !== trackId),
          };
        }
        return prev;
      });

      // Remove from Supabase if user is logged in
      if (user) {
        try {
          await removeTrackFromSupabase(playlistId, trackId);
        } catch (error) {
          console.error("Error removing track from Supabase:", error);
          // If Supabase fails, we could optionally revert the UI change here
          // For now, we'll keep the optimistic update
        }
      }
    },
    [user, removeTrackFromSupabase]
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
    isLoading,
    refetchPlaylists,
  };
}

