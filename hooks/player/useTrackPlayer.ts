import { useCallback } from "react";
import { Track } from "@/types/track";

interface UseTrackPlayerProps {
  playerRef: React.MutableRefObject<YT.Player | null>;
  playlist: Track[];
  currentIndex: number;
  sourcePlaylist: Track[];
  sourceIndex: number;
  setCurrentTrack: (value: Track | null) => void;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
  setSourcePlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setSourceIndex: (value: number | ((prev: number) => number)) => void;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
  setPlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  loadPlayer: (
    videoId: string,
    onReady?: () => void,
    autoPlay?: boolean
  ) => void;
  play: () => void;
}

export function useTrackPlayer({
  playerRef,
  playlist,
  currentIndex,
  sourcePlaylist,
  sourceIndex,
  setCurrentTrack,
  setCurrentIndex,
  setSourcePlaylist,
  setSourceIndex,
  setIsPlaying,
  setPlaylist,
  loadPlayer,
  play,
}: UseTrackPlayerProps) {
  const playTrack = useCallback(
    (track: Track) => {
      setCurrentTrack(track);
      // Find index in playlist (queue)
      const index = playlist.findIndex((t) => t.id === track.id);
      if (index !== -1) {
        // Track is in queue, set index to continue from there
        setCurrentIndex(index);
        // Don't clear source playlist when continuing in queue - keep it for when queue is empty
      } else {
        // Track is not in queue, add it to queue first
        setPlaylist((prev) => {
          // Check if track already exists (by youtubeVideoId to avoid duplicates)
          const existingIndex = prev.findIndex(
            (t) => t.youtubeVideoId === track.youtubeVideoId
          );
          if (existingIndex !== -1) {
            // Track already exists, set index to existing position
            setCurrentIndex(existingIndex);
            return prev;
          }
          // Track doesn't exist, add it and set index to the new position
          const newIndex = prev.length;
          setCurrentIndex(newIndex);
          return [...prev, track];
        });
        // Don't clear source playlist when adding new track to queue - keep it for when queue is empty
        // Source playlist will be cleared only when explicitly starting fresh from queue
      }
      loadPlayer(track.youtubeVideoId, () => {
        play();
      });
    },
    [
      playlist,
      loadPlayer,
      play,
      setCurrentTrack,
      setCurrentIndex,
      setSourcePlaylist,
      setSourceIndex,
      setPlaylist,
    ]
  );

  // Play track without adding to queue
  // Accepts optional sourcePlaylist to know which playlist this track belongs to
  const playTrackOnly = useCallback(
    (track: Track, sourcePlaylistTracks?: Track[]) => {
      setCurrentTrack(track);
      setIsPlaying(true); // Set playing state immediately

      // If track is already in queue, prioritize queue
      const queueIndex = playlist.findIndex((t) => t.id === track.id);
      if (queueIndex !== -1) {
        setCurrentIndex(queueIndex);
        setSourcePlaylist([]);
        setSourceIndex(-1);
      } else {
        // Not in queue, use source playlist if provided
        setCurrentIndex(-1);
        if (sourcePlaylistTracks && sourcePlaylistTracks.length > 0) {
          const srcIndex = sourcePlaylistTracks.findIndex(
            (t) => t.id === track.id
          );
          setSourcePlaylist(sourcePlaylistTracks);
          setSourceIndex(srcIndex !== -1 ? srcIndex : -1);
        } else {
          setSourcePlaylist([]);
          setSourceIndex(-1);
        }
      }
      // Load and auto-play the video
      loadPlayer(
        track.youtubeVideoId,
        () => {
          // Callback when video is ready - ensure it plays
          if (playerRef.current) {
            try {
              playerRef.current.playVideo();
              setIsPlaying(true);
            } catch {
              // Ignore errors, state is already set
            }
          }
        },
        true
      ); // Enable auto-play
    },
    [
      playlist,
      loadPlayer,
      playerRef,
      setIsPlaying,
      setCurrentTrack,
      setCurrentIndex,
      setSourcePlaylist,
      setSourceIndex,
    ]
  );

  return {
    playTrack,
    playTrackOnly,
  };
}
