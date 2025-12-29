import { useState } from "react";
import { Track } from "@/types/track";
import { volumeStorage } from "@/lib/storage/volumeStorage";
import { playbackSpeedStorage } from "@/lib/storage/playbackSpeedStorage";
import { autoQueueStorage } from "@/lib/storage/autoQueueStorage";

type RepeatMode = "off" | "one" | "all";

export function usePlayerState() {
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
  const [volume, setVolume] = useState(() => volumeStorage.getVolume()); // Load from localStorage
  const [isMuted, setIsMuted] = useState(() => volumeStorage.getMuted()); // Load from localStorage
  const [previousVolume, setPreviousVolume] = useState(() =>
    volumeStorage.getPreviousVolume()
  ); // Load from localStorage
  const [playbackSpeed, setPlaybackSpeed] = useState(() =>
    playbackSpeedStorage.getSpeed()
  ); // Load from localStorage
  const [autoQueue, setAutoQueue] = useState(() =>
    autoQueueStorage.getAutoQueue()
  ); // Load from localStorage

  return {
    // State
    currentTrack,
    isPlaying,
    playlist,
    sourcePlaylist,
    sourceIndex,
    originalPlaylist,
    currentIndex,
    currentTime,
    duration,
    repeatMode,
    isShuffled,
    volume,
    isMuted,
    previousVolume,
    playbackSpeed,
    autoQueue,
    // Setters
    setCurrentTrack,
    setIsPlaying,
    setPlaylist,
    setSourcePlaylist,
    setSourceIndex,
    setOriginalPlaylist,
    setCurrentIndex,
    setCurrentTime,
    setDuration,
    setRepeatMode,
    setIsShuffled,
    setVolume,
    setIsMuted,
    setPreviousVolume,
    setPlaybackSpeed,
    setAutoQueue,
  };
}
