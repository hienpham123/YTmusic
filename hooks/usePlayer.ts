"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Track } from "@/types/track";

type RepeatMode = "off" | "one" | "all";

export function usePlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [originalPlaylist, setOriginalPlaylist] = useState<Track[]>([]); // For shuffle
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPlayer = useCallback((videoId: string) => {
    if (playerRef.current) {
      playerRef.current.loadVideoById(videoId);
    }
  }, []);

  const play = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, []);

  const playTrack = useCallback(
    (track: Track) => {
      setCurrentTrack(track);
      // Find index in playlist (queue)
      const index = playlist.findIndex((t) => t.id === track.id);
      if (index !== -1) {
        // Track is in queue, set index to continue from there
        setCurrentIndex(index);
      } else {
        // Track is not in queue, add it and set as current
        setPlaylist((prev) => {
          const newPlaylist = [...prev, track];
          setCurrentIndex(newPlaylist.length - 1);
          return newPlaylist;
        });
      }
      loadPlayer(track.youtubeVideoId);
      play();
    },
    [loadPlayer, play, playlist]
  );

  // Play track without adding to queue
  const playTrackOnly = useCallback(
    (track: Track) => {
      setCurrentTrack(track);
      // Just play, don't add to queue or set index
      // If track is already in queue, find its index
      const index = playlist.findIndex((t) => t.id === track.id);
      if (index !== -1) {
        setCurrentIndex(index);
      } else {
        // Not in queue, set index to -1 to indicate it's not part of queue
        setCurrentIndex(-1);
      }
      loadPlayer(track.youtubeVideoId);
      play();
    },
    [loadPlayer, play, playlist]
  );

  // Shuffle playlist
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
        const newIndex = originalPlaylist.findIndex((t) => t.id === currentTrackId);
        setCurrentIndex(newIndex !== -1 ? newIndex : 0);
      } else {
        setCurrentIndex(0);
      }
      setIsShuffled(false);
    }
  }, [playlist, isShuffled, originalPlaylist, currentTrack]);

  // Toggle repeat mode: off -> all -> one -> off
  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const next = useCallback(() => {
    if (playlist.length === 0) return;
    
    if (repeatMode === "one") {
      // Repeat current track
      if (currentTrack) {
        playTrack(currentTrack);
      }
      return;
    }

    if (currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playTrack(playlist[nextIndex]);
    } else if (repeatMode === "all") {
      // Loop back to start
      setCurrentIndex(0);
      playTrack(playlist[0]);
    }
  }, [playlist, currentIndex, currentTrack, repeatMode, playTrack]);

  const previous = useCallback(() => {
    if (playlist.length === 0) return;
    
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      playTrack(playlist[prevIndex]);
    } else if (repeatMode === "all") {
      // Loop to end
      const lastIndex = playlist.length - 1;
      setCurrentIndex(lastIndex);
      playTrack(playlist[lastIndex]);
    }
  }, [playlist, currentIndex, repeatMode, playTrack]);

  const addToPlaylist = useCallback((track: Track) => {
    setPlaylist((prev) => {
      // Check if track already exists
      if (prev.some((t) => t.youtubeVideoId === track.youtubeVideoId)) {
        return prev;
      }
      return [...prev, track];
    });
  }, []);

  const removeFromPlaylist = useCallback((trackId: string) => {
    setPlaylist((prev) => prev.filter((t) => t.id !== trackId));
  }, []);

  const handleVideoEnd = useCallback(() => {
    // Handle repeat and shuffle
    if (repeatMode === "one") {
      // Repeat current track
      if (currentTrack && playerRef.current) {
        playerRef.current.loadVideoById(currentTrack.youtubeVideoId, 0);
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 500);
      }
      return;
    }

    // Auto next when video ends
    setPlaylist((prev) => {
      setCurrentIndex((idx) => {
        if (prev.length > 0 && idx < prev.length - 1) {
          const nextIndex = idx + 1;
          const nextTrack = prev[nextIndex];
          if (nextTrack && playerRef.current) {
            // Update track and index
            setCurrentTrack(nextTrack);
            setCurrentIndex(nextIndex);
            
            // Load next video (will start from beginning)
            playerRef.current.loadVideoById(nextTrack.youtubeVideoId, 0);
            
            // Auto play after video loads
            setTimeout(() => {
              if (playerRef.current) {
                playerRef.current.playVideo();
                setIsPlaying(true);
              }
            }, 500);
          }
          return nextIndex;
        } else if (repeatMode === "all") {
          // Loop back to start
          const firstTrack = prev[0];
          if (firstTrack && playerRef.current) {
            setCurrentTrack(firstTrack);
            setCurrentIndex(0);
            playerRef.current.loadVideoById(firstTrack.youtubeVideoId, 0);
            setTimeout(() => {
              if (playerRef.current) {
                playerRef.current.playVideo();
                setIsPlaying(true);
              }
            }, 500);
          }
          return 0;
        } else {
          // No more tracks, stop playing
          setIsPlaying(false);
        }
        return idx;
      });
      return prev;
    });
  }, [repeatMode, currentTrack]);

  const setPlayer = useCallback((player: YT.Player) => {
    playerRef.current = player;
    
    // Start progress tracking
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const time = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setCurrentTime(time);
          setDuration(dur);
        } catch (e) {
          // Player not ready yet
        }
      }
    }, 1000);
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return {
    currentTrack,
    isPlaying,
    playlist,
    currentIndex,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    play,
    pause,
    playTrack,
    playTrackOnly,
    next,
    previous,
    addToPlaylist,
    removeFromPlaylist,
    setPlayer,
    setPlaylist,
    seekTo,
    handleVideoEnd,
    toggleRepeat,
    shufflePlaylist,
  };
}

