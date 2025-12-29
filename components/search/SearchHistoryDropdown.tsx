"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, History } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface SearchHistoryDropdownProps {
  searchHistory: string[];
  searchQuery: string;
  onSelectQuery: (query: string) => void;
  onClearHistory: () => void;
  showSuggestions?: boolean;
}

export function SearchHistoryDropdown({
  searchHistory,
  searchQuery,
  onSelectQuery,
  onClearHistory,
  showSuggestions = false,
}: SearchHistoryDropdownProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  // Filter history for suggestions
  const filteredHistory = searchHistory.filter((q) =>
    q.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show empty history dropdown when query is empty
  if (
    showSuggestions &&
    searchQuery.trim() === "" &&
    searchHistory.length > 0
  ) {
    return (
      <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-xs font-medium text-muted-foreground">
            Lịch sử tìm kiếm
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowClearConfirm(true);
            }}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Xóa
          </Button>
        </div>
        {searchHistory.map((query, index) => (
          <button
            key={index}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectQuery(query);
            }}
            className="w-full text-left px-3 py-3 sm:py-2 rounded-md hover:bg-accent active:bg-accent flex items-center gap-2 text-sm touch-manipulation"
          >
            <History className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{query}</span>
          </button>
        ))}
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={() => {
            onClearHistory();
            setShowClearConfirm(false);
          }}
          title="Xóa lịch sử tìm kiếm"
          description={`Bạn có chắc muốn xóa tất cả ${searchHistory.length} mục trong lịch sử tìm kiếm? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          variant="destructive"
        />
      </Card>
    );
  }

  // Show filtered suggestions while typing
  if (
    showSuggestions &&
    searchQuery.trim() !== "" &&
    filteredHistory.length > 0
  ) {
    return (
      <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Gợi ý từ lịch sử
        </div>
        {filteredHistory.map((query, index) => (
          <button
            key={index}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelectQuery(query);
            }}
            className="w-full text-left px-3 py-3 sm:py-2 rounded-md hover:bg-accent active:bg-accent flex items-center gap-2 text-sm touch-manipulation"
          >
            <History className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{query}</span>
          </button>
        ))}
      </Card>
    );
  }

  return null;
}
