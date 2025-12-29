"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlaylistMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function PlaylistMenu({ onEdit, onDelete }: PlaylistMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
          }}
          title="Tùy chọn"
        >
          <MoreHorizontal className="h-5 w-5 sm:h-4 sm:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 min-w-[200px]"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DropdownMenuItem
          className="cursor-pointer py-3 text-base sm:text-sm touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-5 w-5 sm:h-4 sm:w-4 mr-3" />
          <span>Sửa tên playlist</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer py-3 text-base sm:text-sm touch-manipulation"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-5 w-5 sm:h-4 sm:w-4 mr-3" />
          <span>Xóa playlist</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
