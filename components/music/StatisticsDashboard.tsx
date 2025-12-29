"use client";

import { useState } from "react";
import { useStatistics } from "@/hooks/useStatistics";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Clock, TrendingUp, BarChart3 } from "lucide-react";
import { Track } from "@/types/track";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface StatisticsDashboardProps {
  onPlayTrack?: (track: Track) => void;
}

export function StatisticsDashboard({ onPlayTrack }: StatisticsDashboardProps) {
  const { statistics, isLoading, loadStatistics, formatListeningTime } =
    useStatistics();
  const [period, setPeriod] = useState<"all" | "week" | "month">("all");

  const handlePeriodChange = (newPeriod: "all" | "week" | "month") => {
    setPeriod(newPeriod);
    loadStatistics(newPeriod);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (!statistics) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Chưa có dữ liệu thống kê</p>
        <p className="text-sm text-muted-foreground mt-2">
          Nghe nhạc để xem thống kê của bạn
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Thống kê nghe nhạc
        </h2>
        <div className="flex gap-2">
          <Button
            variant={period === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={period === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("month")}
          >
            Tháng này
          </Button>
          <Button
            variant={period === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => handlePeriodChange("week")}
          >
            Tuần này
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Music className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-muted-foreground">
              Tổng số lần phát
            </h3>
          </div>
          <p className="text-3xl font-bold">
            {statistics.totalPlays.toLocaleString()}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-muted-foreground">
              Thời gian nghe
            </h3>
          </div>
          <p className="text-3xl font-bold">
            {formatListeningTime(statistics.totalListeningTime)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-sm text-muted-foreground">
              Nghệ sĩ yêu thích
            </h3>
          </div>
          <p className="text-3xl font-bold">{statistics.topArtists.length}</p>
        </Card>
      </div>

      {/* Most Played Tracks */}
      {statistics.mostPlayed.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Bài hát nghe nhiều nhất</h3>
          <div className="space-y-2">
            {statistics.mostPlayed.map((track, index) => (
              <div
                key={track.youtubeVideoId}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => onPlayTrack?.(track)}
              >
                <div className="flex-shrink-0 w-8 text-center text-muted-foreground font-semibold">
                  {index + 1}
                </div>
                <div className="relative flex-shrink-0 w-16 h-16 rounded overflow-hidden bg-muted">
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{track.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {track.channelName}
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-muted-foreground">
                  {track.playCount} lần
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top Artists */}
      {statistics.topArtists.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Nghệ sĩ yêu thích</h3>
          <div className="space-y-2">
            {statistics.topArtists.map((artist, index) => (
              <div
                key={artist.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 text-center text-muted-foreground font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{artist.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {artist.plays} lần phát
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
