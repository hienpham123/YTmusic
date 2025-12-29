import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const trackId = searchParams.get("trackId"); // Optional: get recommendations based on a specific track

    // Get user's play history
    const { data: playHistory, error: historyError } = await supabase
      .from("play_history")
      .select("*")
      .order("played_at", { ascending: false })
      .limit(100);

    if (historyError) {
      throw historyError;
    }

    if (!playHistory || playHistory.length === 0) {
      return NextResponse.json([]);
    }

    // Get user's favorites
    const { data: favorites, error: favoritesError } = await supabase
      .from("favorites")
      .select("*")
      .limit(50);

    if (favoritesError) {
      console.error("Error fetching favorites:", favoritesError);
    }

    // Strategy 1: Based on most played tracks (similar artists/channels)
    const channelFrequency = new Map<string, number>();
    const moodFrequency = new Map<string, number>();

    playHistory.forEach((item: any) => {
      const channel = item.channel_name || "";
      const mood = item.mood || "Unknown";

      const channelCount = channelFrequency.get(channel) || 0;
      channelFrequency.set(channel, channelCount + (item.play_count || 1));

      const moodCount = moodFrequency.get(mood) || 0;
      moodFrequency.set(mood, moodCount + (item.play_count || 1));
    });

    // Get top channels and moods
    const topChannels = Array.from(channelFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    const topMoods = Array.from(moodFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([mood]) => mood);

    // Strategy 2: Get tracks from playlists that user has
    const { data: playlists, error: playlistsError } = await supabase
      .from("playlists")
      .select(
        `
        tracks (*)
      `
      )
      .limit(10);

    if (playlistsError) {
      console.error("Error fetching playlists:", playlistsError);
    }

    // Collect all unique tracks from playlists
    const playlistTracks = new Map<string, any>();
    if (playlists) {
      playlists.forEach((playlist: any) => {
        if (playlist.tracks && Array.isArray(playlist.tracks)) {
          playlist.tracks.forEach((track: any) => {
            if (!playlistTracks.has(track.youtube_video_id)) {
              playlistTracks.set(track.youtube_video_id, {
                youtubeVideoId: track.youtube_video_id,
                title: track.title,
                thumbnail: track.thumbnail,
                channelName: track.channel_name || "",
                duration: track.duration || "",
                mood: track.mood || "Unknown",
                score: 1, // Base score for playlist tracks
              });
            }
          });
        }
      });
    }

    // Strategy 3: Get recently played tracks (for context)
    const recentTracks = playHistory.slice(0, 10).map((item: any) => ({
      youtubeVideoId: item.youtube_video_id,
      channelName: item.channel_name || "",
      mood: item.mood || "Unknown",
    }));

    // Build recommendations
    // For now, return tracks from playlists that match user preferences
    // In a real implementation, you'd use YouTube API to search for similar tracks
    const recommendations = Array.from(playlistTracks.values())
      .filter((track) => {
        // Filter by top channels or moods
        return (
          topChannels.includes(track.channelName) ||
          topMoods.includes(track.mood) ||
          recentTracks.some(
            (rt) =>
              rt.channelName === track.channelName || rt.mood === track.mood
          )
        );
      })
      .slice(0, limit);

    // If we don't have enough recommendations, add more from playlists
    if (recommendations.length < limit) {
      const remaining = limit - recommendations.length;
      const allPlaylistTracks = Array.from(playlistTracks.values());
      const existingIds = new Set(recommendations.map((r) => r.youtubeVideoId));

      allPlaylistTracks
        .filter((t) => !existingIds.has(t.youtubeVideoId))
        .slice(0, remaining)
        .forEach((t) => recommendations.push(t));
    }

    return NextResponse.json(recommendations);
  } catch (error: unknown) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recommendations",
      },
      { status: 500 }
    );
  }
}
