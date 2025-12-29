import { TrackMetadata } from "@/types/track";

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}

/**
 * Fetch video metadata from YouTube Data API v3
 */
export async function fetchVideoMetadata(
  videoId: string,
  apiKey: string
): Promise<TrackMetadata | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet,contentDetails`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch video metadata");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;

    // Parse duration (ISO 8601 format: PT1H2M10S)
    const duration = parseDuration(contentDetails.duration);

    return {
      videoId,
      title: snippet.title,
      thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
      channelName: snippet.channelTitle,
      duration,
    };
  } catch (error) {
    console.error("Error fetching video metadata:", error);
    return null;
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
