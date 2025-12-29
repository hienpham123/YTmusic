import { NextRequest, NextResponse } from "next/server";
import { fetchVideoMetadata } from "@/lib/youtube";
import { detectMood } from "@/lib/mood";
import { Track } from "@/types/track";

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
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

    const metadata = await fetchVideoMetadata(videoId, apiKey);
    if (!metadata) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const mood = detectMood(metadata.title);

    const track: Track = {
      id: crypto.randomUUID(),
      youtubeVideoId: metadata.videoId,
      title: metadata.title,
      thumbnail: metadata.thumbnail,
      channelName: metadata.channelName,
      duration: metadata.duration,
      mood,
      createdAt: new Date(),
    };

    return NextResponse.json(track);
  } catch (error) {
    console.error("Error in metadata API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
