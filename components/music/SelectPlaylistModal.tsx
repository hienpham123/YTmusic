"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Loader2, Plus, Music, Heart, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import Image from "next/image";

interface SelectPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
  track: Track | null;
  onSelectPlaylist: (playlistId: string, track: Track) => Promise<void>;
  onCreatePlaylist: (name: string) => Promise<Playlist | null>;
}

export function SelectPlaylistModal({
  isOpen,
  onClose,
  playlists,
  track,
  onSelectPlaylist,
  onCreatePlaylist,
}: SelectPlaylistModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [addingToPlaylistId, setAddingToPlaylistId] = useState<string | null>(
    null
  );
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery.trim()) return playlists;
    const query = searchQuery.toLowerCase();
    return playlists.filter((p) => p.name.toLowerCase().includes(query));
  }, [playlists, searchQuery]);

  const handleSelectPlaylist = async (playlistId: string) => {
    if (!track) return;

    setSelectedPlaylistId(playlistId);
    setAddingToPlaylistId(playlistId);
    setError(null);
    try {
      await onSelectPlaylist(playlistId, track);
      onClose();
      setAddingToPlaylistId(null);
      setSelectedPlaylistId(null);
      setSearchQuery("");
      setShowCreateForm(false);
    } catch (err) {
      const error = err as { message?: string };
      setError(
        error.message ||
          "Không thể thêm bài hát vào playlist. Vui lòng thử lại."
      );
      setAddingToPlaylistId(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPlaylistName.trim()) {
      setError("Vui lòng nhập tên playlist");
      return;
    }

    if (!track) return;

    setIsCreating(true);
    try {
      const newPlaylist = await onCreatePlaylist(newPlaylistName.trim());
      if (newPlaylist) {
        await handleSelectPlaylist(newPlaylist.id);
        setNewPlaylistName("");
        setShowCreateForm(false);
      }
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || "Không thể tạo playlist. Vui lòng thử lại.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDone = () => {
    if (selectedPlaylistId && track) {
      handleSelectPlaylist(selectedPlaylistId);
    } else {
      onClose();
    }
  };

  const getPlaylistThumbnail = (playlist: Playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      return playlist.tracks[0].thumbnail;
    }
    return null;
  };

  if (!isOpen || !track) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative z-50 w-full max-w-md max-h-[85vh] sm:max-h-[80vh] overflow-hidden mx-4"
        >
          <Card className="p-0 flex flex-col h-full max-h-[85vh] sm:max-h-[80vh] bg-card border-border">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <h2 className="text-xl font-semibold">Thêm vào danh sách phát</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Tìm một danh sách phát"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Create New Playlist Button */}
            {!showCreateForm && (
              <div className="px-6 py-3 border-b border-border flex-shrink-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-10 text-sm font-normal"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  Danh sách phát mới
                </Button>
              </div>
            )}

            {/* Create Form */}
            {showCreateForm && (
              <div className="px-6 py-3 border-b border-border flex-shrink-0">
                <form onSubmit={handleCreateAndAdd} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Tên danh sách phát"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    disabled={isCreating}
                    className="flex-1 h-10"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    disabled={isCreating || !newPlaylistName.trim()}
                    className="h-10 px-4"
                  >
                    {isCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Tạo"
                    )}
                  </Button>
                </form>
                {error && (
                  <p className="text-sm text-destructive mt-2">{error}</p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && !showCreateForm && (
              <div className="px-6 py-3 border-b border-border flex-shrink-0">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Playlists List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredPlaylists.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground px-6">
                  <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">
                    {searchQuery
                      ? "Không tìm thấy playlist nào"
                      : "Chưa có playlist nào"}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs mt-1">Tạo playlist mới ở trên</p>
                  )}
                </div>
              ) : (
                <div className="py-2">
                  {filteredPlaylists.map((playlist) => {
                    const thumbnail = getPlaylistThumbnail(playlist);
                    const isSelected = selectedPlaylistId === playlist.id;
                    const isAdding = addingToPlaylistId === playlist.id;

                    return (
                      <div
                        key={playlist.id}
                        className="px-6 py-3 hover:bg-accent/50 transition-colors cursor-pointer flex items-center gap-3"
                        onClick={() =>
                          !isAdding && setSelectedPlaylistId(playlist.id)
                        }
                      >
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-12 h-12 rounded overflow-hidden bg-muted">
                          {thumbnail ? (
                            <Image
                              src={thumbnail}
                              alt={playlist.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                              <Music className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Playlist Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {playlist.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {playlist.tracks?.length || 0} bài hát
                          </p>
                        </div>

                        {/* Radio Button */}
                        <div className="flex-shrink-0">
                          {isAdding ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${
                                isSelected
                                  ? "border-green-500 bg-green-500"
                                  : "border-muted-foreground"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isAdding) {
                                  setSelectedPlaylistId(playlist.id);
                                }
                              }}
                            >
                              {isSelected && (
                                <Check className="h-3.5 w-3.5 text-white stroke-[3]" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-border flex-shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="h-10 px-6"
              >
                Hủy
              </Button>
              <Button
                type="button"
                onClick={handleDone}
                disabled={!selectedPlaylistId || !!addingToPlaylistId}
                className="h-10 px-6"
              >
                {addingToPlaylistId ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Xong"
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
