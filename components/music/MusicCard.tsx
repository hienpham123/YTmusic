"use client";

import { useState, useRef, useEffect } from "react";
import { Track } from "@/types/track";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, ListMusic, Trash2, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface MusicCardProps {
  track: Track;
  onPlay: (track: Track) => void;
  onAddToPlaylist?: (track: Track) => void;
  onAddToQueue?: (track: Track) => void;
  onRemove?: (track: Track) => void;
}

const moodColors: Record<Track["mood"], string> = {
  Chill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Sad: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Night: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Focus: "bg-green-500/20 text-green-300 border-green-500/30",
  Unknown: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export function MusicCard({ track, onPlay, onAddToPlaylist, onAddToQueue, onRemove }: MusicCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all relative">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={track.thumbnail}
            alt={track.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
            <Button
              size="icon"
              className="opacity-0 hover:opacity-100 transition-opacity rounded-full h-12 w-12"
              onClick={() => onPlay(track)}
            >
              <Play className="h-6 w-6 fill-current" />
            </Button>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {track.title}
            </h3>
            <p className="text-sm text-muted-foreground">{track.channelName}</p>
          </div>
          <div className="flex items-center justify-between">
            {/* <Badge
              variant="outline"
              className={moodColors[track.mood]}
            >
              {track.mood}
            </Badge> */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPlay(track)}
              >
                <Play className="h-4 w-4 mr-2" />
                Phát
              </Button>
              {onAddToQueue && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToQueue(track)}
                  title="Thêm vào hàng đợi"
                >
                  <ListMusic className="h-4 w-4 mr-1" />
                  Hàng đợi
                </Button>
              )}
              {onAddToPlaylist && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToPlaylist(track)}
                  title="Thêm vào danh sách phát"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm
                </Button>
              )}
              {onRemove && (
                <div className="relative" ref={menuRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    title="Tùy chọn"
                    className="h-9 w-9 p-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  <AnimatePresence>
                    {isMenuOpen && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setIsMenuOpen(false)}
                        />

                        {/* Menu */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 top-full mt-1 z-50 min-w-[200px]"
                        >
                          <Card className="p-1 shadow-lg border-border bg-card">
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-3 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsMenuOpen(false);
                                onRemove(track);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span>Xóa khỏi playlist</span>
                            </Button>
                          </Card>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

