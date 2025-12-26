"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  disabled?: boolean;
  threshold?: number; // Distance in pixels to trigger refresh
}

export function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 80,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canPull, setCanPull] = useState(true);

  // Check if user is at the top of the page
  useEffect(() => {
    const checkScrollPosition = () => {
      setCanPull(window.scrollY === 0);
    };

    window.addEventListener("scroll", checkScrollPosition, { passive: true });
    checkScrollPosition(); // Initial check
    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !canPull) return;
    
    const touch = e.touches[0];
    startY.current = touch.clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !canPull || startY.current === null) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - startY.current;

    // Only allow pulling down (positive deltaY)
    if (deltaY > 0) {
      // Calculate pull distance with resistance
      const resistance = 0.5; // Makes it harder to pull further
      const distance = Math.min(deltaY * resistance, threshold * 1.5);
      setPullDistance(distance);

      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || startY.current === null) {
      setIsPulling(false);
      setPullDistance(0);
      startY.current = null;
      return;
    }

    // Trigger refresh if pulled far enough
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing:", error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    startY.current = null;
  };

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowIndicator = isPulling || isRefreshing;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
      style={{
        transform: shouldShowIndicator
          ? `translateY(${Math.min(pullDistance, threshold)}px)`
          : "translateY(0)",
        transition: isRefreshing ? "transform 0.2s" : "none",
      }}
    >
      {/* Pull to refresh indicator */}
      <AnimatePresence>
        {shouldShowIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-center py-2 z-10 pointer-events-none"
            style={{
              transform: `translateY(${-Math.min(pullDistance, threshold)}px)`,
            }}
          >
            <div className="flex items-center gap-2 text-muted-foreground bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border">
              {isRefreshing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Đang tải...</span>
                </>
              ) : (
                <>
                  <Loader2
                    className="h-5 w-5 transition-transform"
                    style={{
                      transform: `rotate(${pullProgress * 180}deg)`,
                    }}
                  />
                  <span className="text-sm">
                    {pullProgress >= 1 ? "Thả để làm mới" : "Kéo để làm mới"}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {children}
    </div>
  );
}

