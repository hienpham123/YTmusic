import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all"; // all, week, month

    // Calculate date range
    let dateFrom: Date | null = null;
    if (period === "week") {
      dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "month") {
      dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all play history
    let query = supabase.from("play_history").select("*");

    if (dateFrom) {
      query = query.gte("played_at", dateFrom.toISOString());
    }

    const { data: allHistory, error: historyError } = await query;

    if (historyError) {
      throw historyError;
    }

    if (!allHistory || allHistory.length === 0) {
      return NextResponse.json({
        mostPlayed: [],
        totalPlays: 0,
        totalListeningTime: 0,
        topArtists: [],
      });
    }

    // Group tracks by youtube_video_id and sum play_count
    const trackMap = new Map<
      string,
      {
        youtubeVideoId: string;
        title: string;
        thumbnail: string;
        channelName: string;
        duration: string;
        mood: string;
        playCount: number;
      }
    >();

    allHistory.forEach((item: any) => {
      const key = item.youtube_video_id;
      const existing = trackMap.get(key);
      const playCount = item.play_count || 1;

      if (existing) {
        existing.playCount += playCount;
      } else {
        trackMap.set(key, {
          youtubeVideoId: item.youtube_video_id,
          title: item.title,
          thumbnail: item.thumbnail,
          channelName: item.channel_name || "",
          duration: item.duration || "",
          mood: item.mood || "Unknown",
          playCount,
        });
      }
    });

    // Get most played tracks (top 10)
    const mostPlayed = Array.from(trackMap.values())
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 10);

    // Calculate total plays
    const totalPlays = allHistory.reduce(
      (sum: number, item: { play_count?: number }) => {
        return sum + (item.play_count || 1);
      },
      0
    );

    // Group by channel/artist
    const channelMap = new Map<string, number>();
    allHistory.forEach(
      (item: { channel_name: string; play_count?: number }) => {
        const channelName = item.channel_name || "Unknown";
        const count = channelMap.get(channelName) || 0;
        channelMap.set(channelName, count + (item.play_count || 1));
      }
    );

    const topArtists = Array.from(channelMap.entries())
      .map(([name, plays]) => ({ name, plays }))
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10);

    // Calculate total listening time (approximate)
    const parseDuration = (duration: string): number => {
      if (!duration) return 0;
      const parts = duration.split(":").map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
      return 0;
    };

    const totalSeconds = allHistory.reduce(
      (sum: number, item: { duration?: string; play_count?: number }) => {
        const duration = item.duration || "0:00";
        const seconds = parseDuration(duration);
        return sum + seconds * (item.play_count || 1);
      },
      0
    );

    return NextResponse.json({
      mostPlayed,
      totalPlays,
      totalListeningTime: totalSeconds,
      topArtists,
    });
  } catch (error: unknown) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch statistics",
      },
      { status: 500 }
    );
  }
}
