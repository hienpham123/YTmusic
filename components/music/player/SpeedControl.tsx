"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Gauge } from "lucide-react";

interface SpeedControlProps {
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function SpeedControl({
  playbackSpeed,
  onSpeedChange,
}: SpeedControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatSpeed = (speed: number) => {
    if (speed === 1) return "Bình thường";
    return `${speed}x`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-9 w-9 sm:h-10 sm:w-10 touch-manipulation ${
            playbackSpeed !== 1 ? "text-primary" : ""
          }`}
          title={`Tốc độ phát: ${formatSpeed(playbackSpeed)}`}
        >
          <Gauge className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SPEED_OPTIONS.map((speed) => (
          <DropdownMenuItem
            key={speed}
            onClick={() => {
              onSpeedChange(speed);
              setIsOpen(false);
            }}
            className={`cursor-pointer ${
              playbackSpeed === speed ? "bg-accent font-semibold" : ""
            }`}
          >
            {formatSpeed(speed)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
