"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlaylistMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function PlaylistMenu({ onEdit, onDelete }: PlaylistMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title="Tùy chọn"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-1 z-50 min-w-[200px]"
            >
              <Card className="p-1 shadow-lg border-border bg-card">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onEdit();
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Sửa tên playlist</span>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-10 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onDelete();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Xóa playlist</span>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

