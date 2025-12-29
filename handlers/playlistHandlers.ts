import { usePlaylistStore } from "@/stores/playlistStore";

export interface PlaylistHandlers {
  handleCreatePlaylist: (name: string) => Promise<void>;
  handleEditPlaylist: (name: string) => Promise<void>;
  handleDeletePlaylist: () => Promise<void>;
  handleDeleteTrack: () => Promise<void>;
}

export function createPlaylistHandlers({
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  removeTrackFromPlaylist,
  setCurrentPlaylist,
  playlistToEdit,
  playlistToDelete,
  trackToDelete,
  setIsCreatePlaylistOpen: _setIsCreatePlaylistOpen, // eslint-disable-line @typescript-eslint/no-unused-vars
  setIsEditPlaylistOpen: _setIsEditPlaylistOpen, // eslint-disable-line @typescript-eslint/no-unused-vars
  setIsDeletePlaylistOpen,
  setIsDeleteTrackOpen,
  setPlaylistToEdit,
  setPlaylistToDelete,
  setTrackToDelete,
}: {
  createPlaylist: (name: string) => Promise<any>;
  updatePlaylist: (playlistId: string, updates: any) => Promise<void>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string
  ) => Promise<void>;
  setCurrentPlaylist: (playlist: any) => void;
  playlistToEdit: { id: string; name: string } | null;
  playlistToDelete: { id: string; name: string } | null;
  trackToDelete: { id: string; title: string } | null;
  setIsCreatePlaylistOpen: (open: boolean) => void;
  setIsEditPlaylistOpen: (open: boolean) => void;
  setIsDeletePlaylistOpen: (open: boolean) => void;
  setIsDeleteTrackOpen: (open: boolean) => void;
  setPlaylistToEdit: (playlist: { id: string; name: string } | null) => void;
  setPlaylistToDelete: (playlist: { id: string; name: string } | null) => void;
  setTrackToDelete: (track: { id: string; title: string } | null) => void;
}): PlaylistHandlers {
  const handleCreatePlaylist = async (name: string) => {
    const newPlaylist = await createPlaylist(name);
    if (newPlaylist) {
      setCurrentPlaylist(newPlaylist);
    }
  };

  const handleEditPlaylist = async (name: string) => {
    if (!playlistToEdit) return;
    await updatePlaylist(playlistToEdit.id, { name });
    // updatePlaylist already updates store, including currentPlaylist if it matches
    setPlaylistToEdit(null);
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    try {
      await deletePlaylist(playlistToDelete.id);
      // deletePlaylist already updates store, including currentPlaylist if it was deleted
      // Close the dialog
      setIsDeletePlaylistOpen(false);
      setPlaylistToDelete(null);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      throw error;
    }
  };

  const handleDeleteTrack = async () => {
    const currentPlaylist = usePlaylistStore.getState().currentPlaylist;
    if (trackToDelete && currentPlaylist) {
      try {
        await removeTrackFromPlaylist(currentPlaylist.id, trackToDelete.id);
        // removeTrackFromPlaylist already updates store, including currentPlaylist if it matches
        setIsDeleteTrackOpen(false);
        setTrackToDelete(null);
      } catch (error) {
        console.error("Error deleting track:", error);
        throw error;
      }
    }
  };

  return {
    handleCreatePlaylist,
    handleEditPlaylist,
    handleDeletePlaylist,
    handleDeleteTrack,
  };
}
