"use client";

import { createContext, useContext, ReactNode } from "react";
import { Track } from "@/types/track";
import { useAppStore } from "@/stores/appStore";

interface AppContextType {
  isCreatePlaylistOpen: boolean;
  setIsCreatePlaylistOpen: (open: boolean) => void;
  isEditPlaylistOpen: boolean;
  setIsEditPlaylistOpen: (open: boolean) => void;
  isDeletePlaylistOpen: boolean;
  setIsDeletePlaylistOpen: (open: boolean) => void;
  playlistToEdit: { id: string; name: string } | null;
  setPlaylistToEdit: (playlist: { id: string; name: string } | null) => void;
  playlistToDelete: { id: string; name: string } | null;
  setPlaylistToDelete: (playlist: { id: string; name: string } | null) => void;
  trackToDelete: { id: string; title: string } | null;
  setTrackToDelete: (track: { id: string; title: string } | null) => void;
  isDeleteTrackOpen: boolean;
  setIsDeleteTrackOpen: (open: boolean) => void;
  isSelectPlaylistOpen: boolean;
  setIsSelectPlaylistOpen: (open: boolean) => void;
  trackToAdd: Track | null;
  setTrackToAdd: (track: Track | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const {
    isCreatePlaylistOpen,
    setIsCreatePlaylistOpen,
    isEditPlaylistOpen,
    setIsEditPlaylistOpen,
    isDeletePlaylistOpen,
    setIsDeletePlaylistOpen,
    playlistToEdit,
    setPlaylistToEdit,
    playlistToDelete,
    setPlaylistToDelete,
    trackToDelete,
    setTrackToDelete,
    isDeleteTrackOpen,
    setIsDeleteTrackOpen,
    isSelectPlaylistOpen,
    setIsSelectPlaylistOpen,
    trackToAdd,
    setTrackToAdd,
  } = useAppStore();

  return (
    <AppContext.Provider
      value={{
        isCreatePlaylistOpen,
        setIsCreatePlaylistOpen,
        isEditPlaylistOpen,
        setIsEditPlaylistOpen,
        isDeletePlaylistOpen,
        setIsDeletePlaylistOpen,
        playlistToEdit,
        setPlaylistToEdit,
        playlistToDelete,
        setPlaylistToDelete,
        trackToDelete,
        setTrackToDelete,
        isDeleteTrackOpen,
        setIsDeleteTrackOpen,
        isSelectPlaylistOpen,
        setIsSelectPlaylistOpen,
        trackToAdd,
        setTrackToAdd,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
