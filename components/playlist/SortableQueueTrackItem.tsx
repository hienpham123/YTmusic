"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QueueTrackItem } from "./QueueTrackItem";
import { Track } from "@/types/track";
import { GripVertical } from "lucide-react";

interface SortableQueueTrackItemProps {
  track: Track;
  index: number;
  isPlaying: boolean;
  onPlay: (track: Track) => void;
  onRemove?: (track: Track) => void;
  formatDuration?: (seconds: number) => string;
}

export function SortableQueueTrackItem({
  track,
  index,
  isPlaying,
  onPlay,
  onRemove,
  formatDuration,
}: SortableQueueTrackItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="flex items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <QueueTrackItem
            track={track}
            index={index}
            isPlaying={isPlaying}
            onPlay={onPlay}
            onRemove={onRemove}
            formatDuration={formatDuration}
          />
        </div>
      </div>
    </div>
  );
}
