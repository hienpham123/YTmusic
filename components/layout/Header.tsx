"use client";

import { AuthStatus } from "@/components/auth/AuthStatus";

export function Header() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 sm:py-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent truncate">
              🎧 YT Music Hub
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">
              Tìm kiếm và nghe nhạc YouTube
            </p>
          </div>
          <div className="flex-shrink-0 ml-2">
            <AuthStatus />
          </div>
        </div>
      </div>
    </header>
  );
}

