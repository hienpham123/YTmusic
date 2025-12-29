import { useCallback } from "react";
import { Track } from "@/types/track";

interface UsePlaybackQueueProps {
  playlist: Track[];
  currentIndex: number;
  sourcePlaylist: Track[];
  sourceIndex: number;
  originalPlaylist: Track[];
  currentTrack: Track | null;
  repeatMode: "off" | "one" | "all";
  isShuffled: boolean;
  setPlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
  setSourcePlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setSourceIndex: (value: number | ((prev: number) => number)) => void;
  setOriginalPlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setIsShuffled: (value: boolean) => void;
  setCurrentTrack: (value: Track | null) => void;
  playTrack: (track: Track) => void;
  playTrackOnly: (track: Track, sourcePlaylistTracks?: Track[]) => void;
}

export function usePlaybackQueue({
  playlist,
  currentIndex,
  sourcePlaylist,
  sourceIndex,
  originalPlaylist,
  currentTrack,
  repeatMode,
  isShuffled,
  setPlaylist,
  setCurrentIndex,
  setSourcePlaylist,
  setSourceIndex,
  setOriginalPlaylist,
  setIsShuffled,
  setCurrentTrack,
  playTrack,
  playTrackOnly,
}: UsePlaybackQueueProps) {
  const addToPlaylist = useCallback(
    (track: Track) => {
      setPlaylist((prev) => {
        // Check if track already exists
        if (prev.some((t) => t.youtubeVideoId === track.youtubeVideoId)) {
          return prev;
        }
        return [...prev, track];
      });
    },
    [setPlaylist]
  );

  const removeFromPlaylist = useCallback(
    (trackId: string) => {
      setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
    },
    [setPlaylist]
  );

  const shufflePlaylist = useCallback(() => {
    if (playlist.length === 0) return;

    if (!isShuffled) {
      // Save original order
      setOriginalPlaylist([...playlist]);
      // Shuffle
      const shuffled = [...playlist];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Update current index in shuffled array
      const currentTrackId = currentTrack?.id;
      if (currentTrackId) {
        const newIndex = shuffled.findIndex((t) => t.id === currentTrackId);
        setCurrentIndex(newIndex !== -1 ? newIndex : 0);
      } else {
        setCurrentIndex(0);
      }
      setPlaylist(shuffled);
      setIsShuffled(true);
    } else {
      // Unshuffle - restore original order
      setPlaylist([...originalPlaylist]);
      const currentTrackId = currentTrack?.id;
      if (currentTrackId) {
        const newIndex = originalPlaylist.findIndex(
          (t) => t.id === currentTrackId
        );
        setCurrentIndex(newIndex !== -1 ? newIndex : 0);
      } else {
        setCurrentIndex(0);
      }
      setIsShuffled(false);
    }
  }, [
    playlist,
    isShuffled,
    originalPlaylist,
    currentTrack,
    setPlaylist,
    setCurrentIndex,
    setOriginalPlaylist,
    setIsShuffled,
  ]);

  const next = useCallback(() => {
    if (repeatMode === "one") {
      // Repeat current track
      if (currentTrack) {
        playTrack(currentTrack);
      }
      return;
    }

    // Use functional updates to get latest state values to avoid stale closures
    setCurrentIndex((latestCurrentIndex) => {
      setPlaylist((latestPlaylist) => {
        setSourcePlaylist((latestSourcePlaylist) => {
          setSourceIndex((latestSourceIndex) => {
            // Priority 1: Always check queue first, regardless of where we're currently playing from
            if (latestPlaylist.length > 0) {
              // If currently playing from queue, continue to next in queue
              if (
                latestCurrentIndex >= 0 &&
                latestCurrentIndex < latestPlaylist.length - 1
              ) {
                const nextIndex = latestCurrentIndex + 1;
                setCurrentIndex(nextIndex);
                // Don't clear source playlist when continuing in queue - keep it for when queue is empty
                playTrack(latestPlaylist[nextIndex]);
                return latestSourceIndex;
              }
              // If not playing from queue but queue has tracks, start from queue
              if (
                latestCurrentIndex < 0 ||
                latestCurrentIndex >= latestPlaylist.length
              ) {
                setCurrentIndex(0);
                // Don't clear source playlist - keep it for when queue is empty
                // This allows returning to source playlist after queue finishes
                playTrack(latestPlaylist[0]);
                return latestSourceIndex;
              }
            }

            // Priority 2: If queue is empty or finished, check source playlist
            if (latestSourcePlaylist.length > 0) {
              // If we have a sourceIndex and there's a next track
              if (
                latestSourceIndex >= 0 &&
                latestSourceIndex < latestSourcePlaylist.length - 1
              ) {
                const nextIndex = latestSourceIndex + 1;
                playTrackOnly(
                  latestSourcePlaylist[nextIndex],
                  latestSourcePlaylist
                );
                return nextIndex;
              }
              // If sourceIndex is not set (< 0), start from beginning of source playlist
              if (latestSourceIndex < 0) {
                playTrackOnly(latestSourcePlaylist[0], latestSourcePlaylist);
                return 0;
              }
              // If sourceIndex is at the end, handle repeat mode or stop
              // This will be handled by repeat mode check below
            }

            // Handle repeat mode
            if (repeatMode === "all") {
              if (latestPlaylist.length > 0) {
                // Loop back to start of queue
                setCurrentIndex(0);
                setSourcePlaylist([]);
                playTrack(latestPlaylist[0]);
                return -1;
              } else if (latestSourcePlaylist.length > 0) {
                // Loop back to start of source playlist
                playTrackOnly(latestSourcePlaylist[0], latestSourcePlaylist);
                return 0;
              }
            }
            // If repeat mode is "off" and no more tracks, do nothing (will stop naturally)
            return latestSourceIndex;
          });
          return latestSourcePlaylist;
        });
        return latestPlaylist;
      });
      return latestCurrentIndex;
    });
  }, [
    currentTrack,
    repeatMode,
    playTrack,
    playTrackOnly,
    setCurrentIndex,
    setSourcePlaylist,
    setSourceIndex,
  ]);

  const previous = useCallback(() => {
    if (repeatMode === "one") {
      // Repeat current track
      if (currentTrack) {
        playTrack(currentTrack);
      }
      return;
    }

    // Priority 1: If playing from queue and not at start, go to previous in queue
    if (playlist.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playTrack(playlist[prevIndex]);
      return;
    }

    // If at start of queue or not in queue, check source playlist
    if (sourcePlaylist.length > 0 && sourceIndex > 0) {
      const prevIndex = sourceIndex - 1;
      setSourceIndex(prevIndex);
      playTrackOnly(sourcePlaylist[prevIndex], sourcePlaylist);
      return;
    }

    // Handle repeat mode
    if (repeatMode === "all") {
      if (playlist.length > 0) {
        // Loop to end of queue
        const lastIndex = playlist.length - 1;
        setCurrentIndex(lastIndex);
        playTrack(playlist[lastIndex]);
      } else if (sourcePlaylist.length > 0) {
        // Loop to end of source playlist
        const lastIndex = sourcePlaylist.length - 1;
        setSourceIndex(lastIndex);
        playTrackOnly(sourcePlaylist[lastIndex], sourcePlaylist);
      }
    }
  }, [
    playlist,
    currentIndex,
    sourcePlaylist,
    sourceIndex,
    currentTrack,
    repeatMode,
    playTrack,
    playTrackOnly,
    setCurrentIndex,
    setSourceIndex,
  ]);

  return {
    addToPlaylist,
    removeFromPlaylist,
    shufflePlaylist,
    next,
    previous,
  };
}
