import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/getUserFromRequest";

// DELETE /api/tracks/[id] - Remove a track from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // First, get the track
    const { data: track, error: trackError } = await supabase
      .from("tracks")
      .select("playlist_id")
      .eq("id", id)
      .single();

    if (trackError || !track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 });
    }

    // Verify user owns the playlist
    const { data: playlist, error: playlistError } = await supabase
      .from("playlists")
      .select("id, user_id")
      .eq("id", track.playlist_id)
      .eq("user_id", user.id)
      .single();

    if (playlistError || !playlist) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the track
    const { error } = await supabase.from("tracks").delete().eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete track",
      },
      { status: 500 }
    );
  }
}
