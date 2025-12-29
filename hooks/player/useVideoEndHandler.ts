import { useCallback, useEffect, useRef } from "react";
import { Track } from "@/types/track";

interface UseVideoEndHandlerProps {
  playerRef: React.MutableRefObject<YT.Player | null>;
  currentTrack: Track | null;
  playlist: Track[];
  currentIndex: number;
  sourcePlaylist: Track[];
  sourceIndex: number;
  repeatMode: "off" | "one" | "all";
  autoQueue: boolean;
  setCurrentTrack: (value: Track | null) => void;
  setCurrentIndex: (value: number | ((prev: number) => number)) => void;
  setSourcePlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setSourceIndex: (value: number | ((prev: number) => number)) => void;
  setPlaylist: (value: Track[] | ((prev: Track[]) => Track[])) => void;
  setIsPlaying: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function useVideoEndHandler({
  playerRef,
  currentTrack,
  playlist,
  sourcePlaylist,
  sourceIndex,
  repeatMode,
  autoQueue,
  setCurrentTrack,
  setCurrentIndex,
  setSourcePlaylist,
  setSourceIndex,
  setPlaylist,
  setIsPlaying,
}: UseVideoEndHandlerProps) {
  const playlistRef = useRef<Track[]>(playlist);
  const sourceIndexRef = useRef<number>(sourceIndex);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    sourceIndexRef.current = sourceIndex;
  }, [sourceIndex]);

  const play = useCallback(
    (track: Track | null) => {
      if (!track || !playerRef.current) return;
      setCurrentTrack(track);
      playerRef.current.loadVideoById(track.youtubeVideoId, 0);
      setTimeout(() => {
        if (playerRef.current) {
          try {
            playerRef.current.playVideo();
            setIsPlaying(true);
          } catch {
            // ignore
          }
        }
      }, 300);
    },
    [playerRef, setCurrentTrack, setIsPlaying]
  );

  const handleVideoEnd = useCallback(() => {
    // 1. Repeat One
    if (repeatMode === "one") {
      play(currentTrack);
      return;
    }

    // 2. Play Next Queue (playlist as play-next)
    const latestPlaylist = playlistRef.current;
    if (latestPlaylist.length > 0) {
      const [nextTrack, ...rest] = latestPlaylist;
      setPlaylist(rest);
      setCurrentIndex(-1);
      play(nextTrack ?? null);
      return;
    }

    // 3. Normal Queue (sourcePlaylist)
    if (sourcePlaylist.length > 0) {
      const currentSrcIdx = sourceIndexRef.current;
      const nextIndex = currentSrcIdx >= 0 ? currentSrcIdx + 1 : 0;

      if (nextIndex < sourcePlaylist.length) {
        setSourceIndex(nextIndex);
        sourceIndexRef.current = nextIndex;
        setCurrentIndex(-1);
        play(sourcePlaylist[nextIndex]);
        return;
      }

      if (repeatMode === "all" && sourcePlaylist.length > 0) {
        setSourceIndex(0);
        sourceIndexRef.current = 0;
        setCurrentIndex(-1);
        play(sourcePlaylist[0]);
        return;
      }

      setIsPlaying(false);
      return;
    }

    // 4. Auto Queue (recommendations)
    if (autoQueue && currentTrack) {
      // Load recommendations and add to queue
      fetch(
        `/api/recommendations?limit=5&trackId=${currentTrack.youtubeVideoId}`
      )
        .then((res) => res.json())
        .then((recommendations: Track[]) => {
          if (recommendations.length > 0) {
            const nextTrack = recommendations[0];
            setPlaylist(recommendations.slice(1));
            setCurrentIndex(-1);
            play(nextTrack);
          } else {
            setIsPlaying(false);
          }
        })
        .catch((error) => {
          console.error("Error loading recommendations:", error);
          setIsPlaying(false);
        });
      return;
    }

    // 5. Stop if no auto queue
    setIsPlaying(false);
  }, [
    currentTrack,
    playlist,
    repeatMode,
    sourceIndex,
    sourcePlaylist,
    autoQueue,
    play,
    setCurrentIndex,
    setIsPlaying,
    setPlaylist,
    setSourceIndex,
  ]);

  return {
    handleVideoEnd,
  };
}
