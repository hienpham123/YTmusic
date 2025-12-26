"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Track } from "@/types/track";

type RepeatMode = "off" | "one" | "all";

export function usePlayer() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState<Track[]>([]); // Queue
  const [sourcePlaylist, setSourcePlaylist] = useState<Track[]>([]); // Playlist containing current track
  const [sourceIndex, setSourceIndex] = useState<number>(-1); // Index in source playlist
  const [originalPlaylist, setOriginalPlaylist] = useState<Track[]>([]); // For shuffle
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [isShuffled, setIsShuffled] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadPlayer = useCallback((videoId: string, onReady?: () => void) => {
    if (!playerRef.current) return;

    // Load the video
    playerRef.current.loadVideoById(videoId);
    
    // Give the video time to load before trying to play
    // Check player state after a short delay
    setTimeout(() => {
      if (!playerRef.current) return;

      // Try to check if video is ready, if not, try anyway after a bit more time
      const tryPlay = () => {
        if (!playerRef.current) return;
        
        try {
          const state = playerRef.current.getPlayerState();
          // CUED (5), PAUSED (2), or PLAYING (1) means video is ready
          if (state === 5 || state === 2 || state === 1 || state === 3) {
            if (onReady) {
              onReady();
            } else {
              playerRef.current.playVideo();
              setIsPlaying(true);
            }
          } else {
            // If not ready yet, try again after a short delay
            setTimeout(() => {
              if (playerRef.current) {
                if (onReady) {
                  onReady();
                } else {
                  playerRef.current.playVideo();
                  setIsPlaying(true);
                }
              }
            }, 300);
          }
        } catch (error) {
          // On error, just try to play anyway
          if (onReady) {
            onReady();
          } else {
            if (playerRef.current) {
              playerRef.current.playVideo();
              setIsPlaying(true);
            }
          }
        }
      };

      tryPlay();
    }, 100); // Initial delay of 100ms
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
      loadPlayer(track.youtubeVideoId, () => {
        play();
      });
    },
    [loadPlayer, play, playlist]
  );

  // Play track without adding to queue
  // Accepts optional sourcePlaylist to know which playlist this track belongs to
  const playTrackOnly = useCallback(
    (track: Track, sourcePlaylistTracks?: Track[]) => {
      setCurrentTrack(track);
      
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
          const srcIndex = sourcePlaylistTracks.findIndex((t) => t.id === track.id);
          setSourcePlaylist(sourcePlaylistTracks);
          setSourceIndex(srcIndex !== -1 ? srcIndex : -1);
        } else {
          setSourcePlaylist([]);
          setSourceIndex(-1);
        }
      }
      loadPlayer(track.youtubeVideoId, () => {
        play();
      });
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
    if (repeatMode === "one") {
      // Repeat current track
      if (currentTrack) {
        playTrack(currentTrack);
      }
      return;
    }

    // Priority 1: If there are tracks in queue, play from queue
    if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      playTrack(playlist[nextIndex]);
      return;
    }

    // If queue is finished or empty, check source playlist
    if (sourcePlaylist.length > 0 && sourceIndex >= 0 && sourceIndex < sourcePlaylist.length - 1) {
      const nextIndex = sourceIndex + 1;
      setSourceIndex(nextIndex);
      playTrackOnly(sourcePlaylist[nextIndex], sourcePlaylist);
      return;
    }

    // Handle repeat mode
    if (repeatMode === "all") {
      if (playlist.length > 0) {
        // Loop back to start of queue
        setCurrentIndex(0);
        playTrack(playlist[0]);
      } else if (sourcePlaylist.length > 0) {
        // Loop back to start of source playlist
        setSourceIndex(0);
        playTrackOnly(sourcePlaylist[0], sourcePlaylist);
      }
    }
  }, [playlist, currentIndex, sourcePlaylist, sourceIndex, currentTrack, repeatMode, playTrack, playTrackOnly]);

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
  }, [playlist, currentIndex, sourcePlaylist, sourceIndex, currentTrack, repeatMode, playTrack, playTrackOnly]);

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

    // Priority 1: Check queue first
    if (playlist.length > 0 && currentIndex >= 0 && currentIndex < playlist.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextTrack = playlist[nextIndex];
      if (nextTrack && playerRef.current) {
        setCurrentTrack(nextTrack);
        setCurrentIndex(nextIndex);
        playerRef.current.loadVideoById(nextTrack.youtubeVideoId, 0);
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 500);
      }
      return;
    }

    // Priority 2: If queue is finished or empty, check source playlist
    if (sourcePlaylist.length > 0 && sourceIndex >= 0 && sourceIndex < sourcePlaylist.length - 1) {
      const nextIndex = sourceIndex + 1;
      const nextTrack = sourcePlaylist[nextIndex];
      if (nextTrack && playerRef.current) {
        setCurrentTrack(nextTrack);
        setSourceIndex(nextIndex);
        playerRef.current.loadVideoById(nextTrack.youtubeVideoId, 0);
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.playVideo();
            setIsPlaying(true);
          }
        }, 500);
      }
      return;
    }

    // Handle repeat mode
    if (repeatMode === "all") {
      if (playlist.length > 0 && playerRef.current) {
        // Loop back to start of queue
        const firstTrack = playlist[0];
        if (firstTrack) {
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
      } else if (sourcePlaylist.length > 0 && playerRef.current) {
        // Loop back to start of source playlist
        const firstTrack = sourcePlaylist[0];
        if (firstTrack) {
          setCurrentTrack(firstTrack);
          setSourceIndex(0);
          playerRef.current.loadVideoById(firstTrack.youtubeVideoId, 0);
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.playVideo();
              setIsPlaying(true);
            }
          }, 500);
        }
      }
      return;
    }

    // No more tracks, stop playing
    setIsPlaying(false);
  }, [repeatMode, currentTrack, playlist, currentIndex, sourcePlaylist, sourceIndex]);

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

  // Setup Media Session API for background playback on mobile
  useEffect(() => {
    if (!("mediaSession" in navigator)) {
      // Media Session API not supported
      return;
    }

    const mediaSession = navigator.mediaSession;

    // Update metadata when track changes
    if (currentTrack) {
      mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.channelName || "Unknown Artist",
        artwork: [
          {
            src: currentTrack.thumbnail,
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });
    }

    // Set up action handlers
    mediaSession.setActionHandler("play", () => {
      play();
    });

    mediaSession.setActionHandler("pause", () => {
      pause();
    });

    mediaSession.setActionHandler("previoustrack", () => {
      previous();
    });

    mediaSession.setActionHandler("nexttrack", () => {
      next();
    });

    // Update playback state
    if (isPlaying) {
      mediaSession.playbackState = "playing";
    } else {
      mediaSession.playbackState = "paused";
    }

    // Update position state
    if (currentTrack && duration > 0 && isPlaying) {
      try {
        mediaSession.setPositionState({
          duration: duration,
          playbackRate: 1.0,
          position: currentTime,
        });
      } catch (e) {
        // Position state might not be supported on all browsers
      }
    }
  }, [currentTrack, isPlaying, currentTime, duration, play, pause, next, previous]);

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

