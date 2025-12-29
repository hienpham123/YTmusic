"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "default",
}: ConfirmDialogProps) {
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
                <div
                  className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    variant === "destructive"
                      ? "bg-destructive/10"
                      : "bg-primary/10"
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      variant === "destructive"
                        ? "text-destructive"
                        : "text-primary"
                    }`}
                  />
                </div>
                <h2 className="text-lg sm:text-xl font-bold flex-1">{title}</h2>
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
                {description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                variant={variant === "destructive" ? "destructive" : "default"}
                onClick={handleConfirm}
                className="w-full sm:w-auto h-11 sm:h-10"
              >
                {confirmText}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
