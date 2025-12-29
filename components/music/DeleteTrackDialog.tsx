"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteTrackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trackTitle: string;
}

export function DeleteTrackDialog({
  isOpen,
  onClose,
  onConfirm,
  trackTitle,
}: DeleteTrackDialogProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

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

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative z-50 w-full max-w-md mx-4"
        >
          <Card className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold flex-1">
                  Xóa bài hát
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-sm sm:text-base text-muted-foreground">
                Bạn có chắc muốn xóa bài hát{" "}
                <span className="font-semibold text-foreground">
                  &quot;{trackTitle}&quot;
                </span>{" "}
                khỏi playlist?
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirm}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                Xóa
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
