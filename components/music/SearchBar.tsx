"use client";

import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  onFocus,
  onBlur,
  placeholder = "Tìm kiếm...",
  className,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`relative flex items-center gap-2 sm:gap-3 ${className}`}>
      <div className="relative flex-1 shadow-sm">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="pl-4 pr-10 h-12 sm:h-14 text-base sm:text-lg border-2 focus:border-primary/50 transition-colors"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 hover:bg-accent/80"
            onClick={() => onChange("")}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        type="button"
        size="icon"
        className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow"
        onClick={onSearch}
        disabled={!value.trim()}
      >
        <Search className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  );
}
