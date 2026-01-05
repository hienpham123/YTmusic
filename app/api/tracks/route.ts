import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/getUserFromRequest";

// POST /api/tracks - Add a track to a playlist
export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      playlistId,
      youtubeVideoId,
      title,
      thumbnail,
      channelName,
      duration,
      mood,
    } = body;

    if (!playlistId || !youtubeVideoId || !title || !thumbnail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select("id, user_id")
      .eq("id", playlistId)
      .eq("user_id", user.id)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json(
        { error: "Playlist not found or access denied" },
        { status: 404 }
      );
    }

    const { data: track, error } = await supabase
      .from("tracks")
      // @ts-expect-error - Supabase types are not fully generated for this table
      .insert({
        playlist_id: playlistId,
        youtube_video_id: youtubeVideoId,
        title,
        thumbnail,
        channel_name: channelName || "",
        duration: duration || "",
        mood: mood || "Unknown",
      })
      .select()
      .single();

    if (error) {
      // If duplicate, return existing track
      if (error.code === "23505") {
        const { data: existingTrack } = await supabase
          .from("tracks")
          .select()
          .eq("playlist_id", playlistId)
          .eq("youtube_video_id", youtubeVideoId)
          .single();

        return NextResponse.json(existingTrack);
      }
      throw error;
    }

    return NextResponse.json(track);
  } catch (error: unknown) {
    console.error("Error adding track:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add track" },
      { status: 500 }
    );
  }
}
