import { NextRequest, NextResponse } from "next/server";
import { TrackMetadata } from "@/types/track";

interface YouTubeSearchItem {
  id: {
    videoId: string;
    kind: string;
  };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    publishedAt: string;
  };
}

interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
}

/**
 * Fetch video duration from YouTube API
 */
async function fetchVideoDuration(
  videoId: string,
  apiKey: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=contentDetails`
    );

    if (!response.ok) {
      return "0:00";
    }

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      return "0:00";
    }

    const duration = data.items[0].contentDetails.duration;
    return parseDuration(duration);
  } catch (error) {
    console.error("Error fetching video duration:", error);
    return "0:00";
  }
}

/**
 * Parse ISO 8601 duration to readable format
 */
function parseDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const maxResults = parseInt(searchParams.get("maxResults") || "20", 10);

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 500 }
      );
    }

    // Search YouTube videos
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set(
      "maxResults",
      Math.min(maxResults, 50).toString()
    );
    searchUrl.searchParams.set("key", apiKey);

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}));
      console.error("YouTube API error:", errorData);
      return NextResponse.json(
        { error: "Failed to search YouTube videos" },
        { status: searchResponse.status }
      );
    }

    const searchData: YouTubeSearchResponse = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json({ tracks: [] });
    }

    // Fetch durations for all videos in parallel
    const videoIds = searchData.items.map((item) => item.id.videoId);
    const durationPromises = videoIds.map((id) =>
      fetchVideoDuration(id, apiKey)
    );
    const durations = await Promise.all(durationPromises);

    // Convert to TrackMetadata format
    const tracks: TrackMetadata[] = searchData.items.map((item, index) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default.url,
      channelName: item.snippet.channelTitle,
      duration: durations[index] || "0:00",
    }));

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("Error in YouTube search API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
