"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, History, Search, Loader2 } from "lucide-react";

interface SearchHistoryDropdownProps {
  searchHistory: string[];
  searchQuery: string;
  onSelectQuery: (query: string) => void;
  onRemoveFromHistory: (query: string) => void;
  showSuggestions?: boolean;
  youtubeSuggestions?: string[];
  isLoadingSuggestions?: boolean;
}

export function SearchHistoryDropdown({
  searchHistory,
  searchQuery,
  onSelectQuery,
  onRemoveFromHistory,
  showSuggestions = false,
  youtubeSuggestions = [],
  isLoadingSuggestions = false,
}: SearchHistoryDropdownProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showRemovedMessage, setShowRemovedMessage] = useState(false);

  // Filter history for suggestions
  const filteredHistory = searchHistory.filter((q) =>
    q.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-hide removed message after 3 seconds
  useEffect(() => {
    if (showRemovedMessage) {
      const timer = setTimeout(() => {
        setShowRemovedMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRemovedMessage]);

  const handleRemove = (query: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Prevent blur event from closing dropdown
    e.nativeEvent.stopImmediatePropagation();
    onRemoveFromHistory(query);
    setShowRemovedMessage(true);
    setHoveredItem(null); // Reset hover state
  };

  // Show empty history dropdown when query is empty
  if (
    showSuggestions &&
    searchQuery.trim() === "" &&
    searchHistory.length > 0
  ) {
    return (
      <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
        {showRemovedMessage && (
          <div className="text-xs text-muted-foreground mb-2 px-2 py-1">
            Suggestion removed
          </div>
        )}
        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
          Lịch sử tìm kiếm
        </div>
        {searchHistory.map((query, index) => (
          <div
            key={index}
            className="group relative"
            onMouseEnter={() => setHoveredItem(query)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectQuery(query);
              }}
              className="w-full text-left px-3 py-3 sm:py-2 rounded-md hover:bg-accent active:bg-accent flex items-center gap-2 text-sm touch-manipulation pr-8"
            >
              <History className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{query}</span>
            </button>
            {hoveredItem === query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => handleRemove(query, e)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                type="button"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </Card>
    );
  }

  // When user is typing, show YouTube suggestions (like YouTube does)
  if (showSuggestions && searchQuery.trim() !== "") {
    // Show loading state
    if (isLoadingSuggestions) {
      return (
        <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        </Card>
      );
    }

    // Show YouTube suggestions if available
    if (youtubeSuggestions.length > 0 || filteredHistory.length > 0) {
      return (
        <Card className="absolute z-[100] w-full mt-2 p-2 max-h-60 overflow-y-auto bg-card border border-border shadow-lg">
          {showRemovedMessage && (
            <div className="text-xs text-muted-foreground mb-2 px-2 py-1">
              Suggestion removed
            </div>
          )}
          {youtubeSuggestions.length > 0 && (
            <>
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                Gợi ý
              </div>
              {youtubeSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelectQuery(suggestion);
                  }}
                  className="w-full text-left px-3 py-3 sm:py-2 rounded-md hover:bg-accent active:bg-accent flex items-center gap-2 text-sm touch-manipulation"
                >
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </button>
              ))}
            </>
          )}
          {/* Show filtered history if available */}
          {filteredHistory.length > 0 && (
            <>
              {youtubeSuggestions.length > 0 && (
                <div className="border-t border-border my-2" />
              )}
              <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                {youtubeSuggestions.length > 0
                  ? "Lịch sử tìm kiếm"
                  : "Gợi ý từ lịch sử"}
              </div>
              {filteredHistory.map((query, index) => (
                <div
                  key={`history-${index}`}
                  className="group relative"
                  onMouseEnter={() => setHoveredItem(query)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectQuery(query);
                    }}
                    className="w-full text-left px-3 py-3 sm:py-2 rounded-md hover:bg-accent active:bg-accent flex items-center gap-2 text-sm touch-manipulation pr-8"
                  >
                    <History className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate flex-1">{query}</span>
                  </button>
                  {hoveredItem === query && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleRemove(query, e)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      type="button"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </>
          )}
        </Card>
      );
    }
  }

  return null;
}
