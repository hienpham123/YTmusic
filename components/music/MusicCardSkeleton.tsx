"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MusicCardSkeleton() {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="relative aspect-video w-full overflow-hidden">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </Card>
  );
}
