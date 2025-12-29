"use client";

import { useRef } from "react";
import { usePlayerState } from "./player/usePlayerState";
import { useLoadPlayer } from "./player/useLoadPlayer";
import { usePlayerControls } from "./player/usePlayerControls";
import { useTrackPlayer } from "./player/useTrackPlayer";
import { usePlaybackQueue } from "./player/usePlaybackQueue";
import { useVideoEndHandler } from "./player/useVideoEndHandler";
import { useYouTubePlayerIntegration } from "./player/useYouTubePlayerIntegration";
import { usePlaybackPersistence } from "./player/usePlaybackPersistence";
import { useMediaSession } from "./player/useMediaSession";
import { autoQueueStorage } from "@/lib/storage/autoQueueStorage";

export function usePlayer() {
  const playerRef = useRef<YT.Player | null>(null);

  // State management
  const state = usePlayerState();

  // Load player function
  const { loadPlayer } = useLoadPlayer({
    playerRef,
    setIsPlaying: state.setIsPlaying,
  });

  // Player controls (play, pause, seek, volume, speed)
  const controls = usePlayerControls({
    playerRef,
    isPlaying: state.isPlaying,
    setIsPlaying: state.setIsPlaying,
    volume: state.volume,
    isMuted: state.isMuted,
    previousVolume: state.previousVolume,
    setVolume: state.setVolume,
    setIsMuted: state.setIsMuted,
    setPreviousVolume: state.setPreviousVolume,
    setCurrentTime: state.setCurrentTime,
    playbackSpeed: state.playbackSpeed,
    setPlaybackSpeed: state.setPlaybackSpeed,
  });

  // Track player (playTrack, playTrackOnly)
  const { playTrack, playTrackOnly } = useTrackPlayer({
    playerRef,
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    sourcePlaylist: state.sourcePlaylist,
    sourceIndex: state.sourceIndex,
    setCurrentTrack: state.setCurrentTrack,
    setCurrentIndex: state.setCurrentIndex,
    setSourcePlaylist: state.setSourcePlaylist,
    setSourceIndex: state.setSourceIndex,
    setIsPlaying: state.setIsPlaying,
    setPlaylist: state.setPlaylist,
    loadPlayer,
    play: controls.play,
  });

  // Playback queue management
  const queue = usePlaybackQueue({
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    sourcePlaylist: state.sourcePlaylist,
    sourceIndex: state.sourceIndex,
    originalPlaylist: state.originalPlaylist,
    currentTrack: state.currentTrack,
    repeatMode: state.repeatMode,
    isShuffled: state.isShuffled,
    setPlaylist: state.setPlaylist,
    setCurrentIndex: state.setCurrentIndex,
    setSourcePlaylist: state.setSourcePlaylist,
    setSourceIndex: state.setSourceIndex,
    setOriginalPlaylist: state.setOriginalPlaylist,
    setIsShuffled: state.setIsShuffled,
    setCurrentTrack: state.setCurrentTrack,
    playTrack,
    playTrackOnly,
  });

  // Toggle repeat mode
  const toggleRepeat = () => {
    state.setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  };

  // Toggle auto queue
  const toggleAutoQueue = () => {
    state.setAutoQueue((prev) => {
      const newValue = !prev;
      autoQueueStorage.setAutoQueue(newValue);
      return newValue;
    });
  };

  // Video end handler
  const { handleVideoEnd } = useVideoEndHandler({
    playerRef,
    currentTrack: state.currentTrack,
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    sourcePlaylist: state.sourcePlaylist,
    sourceIndex: state.sourceIndex,
    repeatMode: state.repeatMode,
    autoQueue: state.autoQueue,
    setCurrentTrack: state.setCurrentTrack,
    setCurrentIndex: state.setCurrentIndex,
    setSourcePlaylist: state.setSourcePlaylist,
    setSourceIndex: state.setSourceIndex,
    setPlaylist: state.setPlaylist,
    setIsPlaying: state.setIsPlaying,
  });

  // YouTube player integration
  const { setPlayer } = useYouTubePlayerIntegration({
    playerRef,
    volume: state.volume,
    isMuted: state.isMuted,
    isPlaying: state.isPlaying,
    playbackSpeed: state.playbackSpeed,
    setCurrentTime: state.setCurrentTime,
    setDuration: state.setDuration,
    setIsPlaying: state.setIsPlaying,
  });

  // Playback persistence (save/load from DB)
  usePlaybackPersistence({
    playerRef,
    currentTrack: state.currentTrack,
    currentTime: state.currentTime,
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    sourcePlaylist: state.sourcePlaylist,
    sourceIndex: state.sourceIndex,
    repeatMode: state.repeatMode,
    isShuffled: state.isShuffled,
    setCurrentTrack: state.setCurrentTrack,
    setPlaylist: state.setPlaylist,
    setCurrentIndex: state.setCurrentIndex,
    setSourcePlaylist: state.setSourcePlaylist,
    setSourceIndex: state.setSourceIndex,
    setRepeatMode: state.setRepeatMode,
    setIsShuffled: state.setIsShuffled,
    setIsPlaying: state.setIsPlaying,
    setCurrentTime: state.setCurrentTime,
  });

  // Media Session API
  useMediaSession({
    currentTrack: state.currentTrack,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    onPlay: controls.play,
    onPause: controls.pause,
    onNext: queue.next,
    onPrevious: queue.previous,
  });

  return {
    currentTrack: state.currentTrack,
    isPlaying: state.isPlaying,
    playlist: state.playlist,
    currentIndex: state.currentIndex,
    currentTime: state.currentTime,
    duration: state.duration,
    repeatMode: state.repeatMode,
    isShuffled: state.isShuffled,
    volume: state.volume,
    isMuted: state.isMuted,
    playbackSpeed: state.playbackSpeed,
    play: controls.play,
    pause: controls.pause,
    playTrack,
    playTrackOnly,
    next: queue.next,
    previous: queue.previous,
    addToPlaylist: queue.addToPlaylist,
    removeFromPlaylist: queue.removeFromPlaylist,
    setPlayer,
    setPlaylist: state.setPlaylist,
    seekTo: controls.seekTo,
    handleVideoEnd,
    toggleRepeat,
    shufflePlaylist: queue.shufflePlaylist,
    setVolumeLevel: controls.setVolumeLevel,
    toggleMute: controls.toggleMute,
    setPlaybackSpeedLevel: controls.setPlaybackSpeedLevel,
    autoQueue: state.autoQueue,
    toggleAutoQueue,
  };
}
