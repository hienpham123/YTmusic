"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePlayer } from "@/hooks/usePlayer";

interface PlayerContextType {
  currentTrack: ReturnType<typeof usePlayer>["currentTrack"];
  isPlaying: ReturnType<typeof usePlayer>["isPlaying"];
  sourcePlaylist: ReturnType<typeof usePlayer>["sourcePlaylist"];
  sourceIndex: ReturnType<typeof usePlayer>["sourceIndex"];
  currentTime: ReturnType<typeof usePlayer>["currentTime"];
  duration: ReturnType<typeof usePlayer>["duration"];
  repeatMode: ReturnType<typeof usePlayer>["repeatMode"];
  isShuffled: ReturnType<typeof usePlayer>["isShuffled"];
  volume: ReturnType<typeof usePlayer>["volume"];
  isMuted: ReturnType<typeof usePlayer>["isMuted"];
  playbackSpeed: ReturnType<typeof usePlayer>["playbackSpeed"];
  play: ReturnType<typeof usePlayer>["play"];
  pause: ReturnType<typeof usePlayer>["pause"];
  playTrackOnly: ReturnType<typeof usePlayer>["playTrackOnly"];
  next: ReturnType<typeof usePlayer>["next"];
  previous: ReturnType<typeof usePlayer>["previous"];
  setPlayer: ReturnType<typeof usePlayer>["setPlayer"];
  seekTo: ReturnType<typeof usePlayer>["seekTo"];
  handleVideoEnd: ReturnType<typeof usePlayer>["handleVideoEnd"];
  toggleRepeat: ReturnType<typeof usePlayer>["toggleRepeat"];
  setVolumeLevel: ReturnType<typeof usePlayer>["setVolumeLevel"];
  toggleMute: ReturnType<typeof usePlayer>["toggleMute"];
  setPlaybackSpeedLevel: ReturnType<typeof usePlayer>["setPlaybackSpeedLevel"];
  autoQueue: ReturnType<typeof usePlayer>["autoQueue"];
  toggleAutoQueue: ReturnType<typeof usePlayer>["toggleAutoQueue"];
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const player = usePlayer();

  return (
    <PlayerContext.Provider value={player}>{children}</PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayerContext must be used within a PlayerProvider");
  }
  return context;
}
