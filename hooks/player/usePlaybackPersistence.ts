import { useCallback, useRef, useEffect } from "react";
import { Track } from "@/types/track";
import { useUserStore } from "@/stores/userStore";
import { supabase } from "@/lib/supabase/client";

type RepeatMode = "off" | "one" | "all";

interface UsePlaybackPersistenceProps {
  playerRef: React.MutableRefObject<YT.Player | null>;
  currentTrack: Track | null;
  currentTime: number;
  playlist: Track[];
  currentIndex: number;
  sourcePlaylist: Track[];
  sourceIndex: number;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  setCurrentTrack: (value: Track | null) => void;
  setPlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
  setSourcePlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setSourceIndex: (value: number | ((prev: number) => number)) => void;
  setRepeatMode: (
    value: RepeatMode | ((prev: RepeatMode) => RepeatMode)
  ) => void;
  setIsShuffled: (value: boolean | ((prev: boolean) => boolean)) => void;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  setCurrentTime: (value: number) => void;
}

export function usePlaybackPersistence({
  playerRef,
  currentTrack,
  currentTime,
  playlist,
  currentIndex,
  sourcePlaylist,
  sourceIndex,
  repeatMode,
  isShuffled,
  setCurrentTrack,
  setPlaylist,
  setCurrentIndex,
  setSourcePlaylist,
  setSourceIndex,
  setRepeatMode,
  setIsShuffled,
  setIsPlaying,
  setCurrentTime,
}: UsePlaybackPersistenceProps) {
  const savePlaybackStateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedStateRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const savePlaybackState = useCallback(async () => {
    const user = useUserStore.getState().user;
    if (!user) return;

    // Don't save during initial load (first 2 seconds)
    if (isInitialLoadRef.current) return;

    // Clear previous timeout
    if (savePlaybackStateTimeoutRef.current) {
      clearTimeout(savePlaybackStateTimeoutRef.current);
    }

    // Debounce: save after 1 second of no changes
    savePlaybackStateTimeoutRef.current = setTimeout(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.log("No session token for saving playback state");
          return;
        }

        const stateToSave = {
          currentTrack,
          currentTime,
          playlist,
          currentIndex,
          sourcePlaylist,
          sourceIndex,
          repeatMode,
          isShuffled,
        };

        console.log("Saving playback state:", stateToSave);

        const response = await fetch("/api/playback-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(stateToSave),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error saving playback state:", errorData);
        } else {
          console.log("Playback state saved successfully");
        }
      } catch (error) {
        console.error("Error saving playback state:", error);
      }
    }, 1000);
  }, [
    currentTrack,
    currentTime,
    playlist,
    currentIndex,
    sourcePlaylist,
    sourceIndex,
    repeatMode,
    isShuffled,
  ]);

  // Save playback state when it changes
  useEffect(() => {
    savePlaybackState();
  }, [savePlaybackState]);

  // Load playback state from DB on mount and when user changes
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const loadPlaybackState = async () => {
      if (!user) {
        hasLoadedStateRef.current = true;
        isInitialLoadRef.current = false;
        return;
      }

      try {
        console.log("Loading playback state for user:", user.id);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.log("No session token for loading playback state");
          hasLoadedStateRef.current = true;
          isInitialLoadRef.current = false;
          return;
        }

        const response = await fetch("/api/playback-state", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          console.log("No playback state found or error:", response.status);
          hasLoadedStateRef.current = true;
          isInitialLoadRef.current = false;
          return;
        }

        const data = await response.json();
        if (!data || !data.current_track) {
          console.log("No playback state data found");
          hasLoadedStateRef.current = true;
          isInitialLoadRef.current = false;
          return;
        }

        console.log("Loaded playback state:", data);

        // Restore playback state
        if (data.current_track) {
          setCurrentTrack(data.current_track as Track);
        }
        if (
          data.playlist &&
          Array.isArray(data.playlist) &&
          data.playlist.length > 0
        ) {
          setPlaylist(data.playlist as Track[]);
        }
        if (
          data.source_playlist &&
          Array.isArray(data.source_playlist) &&
          data.source_playlist.length > 0
        ) {
          setSourcePlaylist(data.source_playlist as Track[]);
        }
        if (data.current_index !== undefined) {
          setCurrentIndex(data.current_index);
        }
        if (data.source_index !== undefined) {
          setSourceIndex(data.source_index);
        }
        if (data.repeat_mode) {
          setRepeatMode(data.repeat_mode as RepeatMode);
        }
        if (data.is_shuffled !== undefined) {
          setIsShuffled(data.is_shuffled);
        }

        // Wait for player to be ready, then restore track
        const restoreTrack = () => {
          if (!data.current_track) return;

          const track = data.current_track as Track;
          const savedTime = data.playback_time || 0;

          if (playerRef.current) {
            console.log("Restoring track:", track.title, "at time:", savedTime);

            // Use cueVideoById instead of loadVideoById to prevent auto-play
            // cueVideoById loads the video but doesn't start playing
            try {
              playerRef.current.cueVideoById(track.youtubeVideoId, savedTime);

              // Set state immediately - video is cued but not playing
              setIsPlaying(false);
              setCurrentTime(savedTime);

              // Also pause immediately to be safe (in case video somehow starts)
              setTimeout(() => {
                if (playerRef.current) {
                  try {
                    const state = playerRef.current.getPlayerState();
                    // If somehow playing, pause it
                    if (state === 1) {
                      // PLAYING
                      playerRef.current.pauseVideo();
                    }
                    setIsPlaying(false);
                    setCurrentTime(savedTime);
                  } catch (err) {
                    console.error("Error ensuring pause:", err);
                  }
                }
              }, 100);
            } catch (err) {
              console.error("Error cueing video:", err);
              // Fallback: try loadVideoById and pause immediately
              try {
                playerRef.current.loadVideoById(
                  track.youtubeVideoId,
                  savedTime
                );
                setIsPlaying(false);
                setCurrentTime(savedTime);
                // Pause immediately
                setTimeout(() => {
                  if (playerRef.current) {
                    try {
                      playerRef.current.pauseVideo();
                      setIsPlaying(false);
                    } catch (e) {
                      // Ignore
                    }
                  }
                }, 50);
              } catch (fallbackErr) {
                console.error("Error loading video (fallback):", fallbackErr);
              }
            }
          } else {
            // Player not ready yet, try again
            setTimeout(restoreTrack, 500);
          }
        };

        // Wait a bit for player to initialize, then restore
        setTimeout(() => {
          restoreTrack();
        }, 1500);

        hasLoadedStateRef.current = true;
        // Mark initial load as complete after 2 seconds
        setTimeout(() => {
          isInitialLoadRef.current = false;
        }, 2000);
      } catch (error) {
        console.error("Error loading playback state:", error);
        hasLoadedStateRef.current = true;
        isInitialLoadRef.current = false;
      }
    };

    // Wait a bit for user to be available and player to be initialized
    const timer = setTimeout(() => {
      loadPlaybackState();
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    user?.id,
    playerRef,
    setCurrentTrack,
    setPlaylist,
    setCurrentIndex,
    setSourcePlaylist,
    setSourceIndex,
    setRepeatMode,
    setIsShuffled,
    setIsPlaying,
    setCurrentTime,
  ]);

  // Also save when page is about to unload (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save immediately without debounce
      const user = useUserStore.getState().user;
      if (!user) return;

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token) return;

        // Use sendBeacon for reliable save on page unload
        const state = JSON.stringify({
          currentTrack,
          currentTime,
          playlist,
          currentIndex,
          sourcePlaylist,
          sourceIndex,
          repeatMode,
          isShuffled,
        });

        fetch("/api/playback-state", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: state,
          keepalive: true, // Important for beforeunload
        }).catch(() => {
          // Ignore errors during unload
        });
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    currentTrack,
    currentTime,
    playlist,
    currentIndex,
    sourcePlaylist,
    sourceIndex,
    repeatMode,
    isShuffled,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (savePlaybackStateTimeoutRef.current) {
        clearTimeout(savePlaybackStateTimeoutRef.current);
      }
    };
  }, []);
}
