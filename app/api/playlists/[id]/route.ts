import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/getUserFromRequest";

// GET /api/playlists/[id] - Get a specific playlist
export async function GET(
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
    const { data: playlist, error } = await supabase
      .from("playlists")
      .select(
        `
        *,
        tracks (*)
      `
      )
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns this playlist
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Playlist not found" },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error: unknown) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch playlist",
      },
      { status: 500 }
    );
  }
}

// PUT /api/playlists/[id] - Update a playlist
export async function PUT(
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
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // First check if playlist exists and user owns it
    const { data: existingPlaylist, error: checkError } = await supabase
      .from("playlists")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingPlaylist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const updateData = { name };
    const { data: playlist, error } = await supabase
      .from("playlists")
      // @ts-expect-error - Supabase types are not fully generated for this table
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id) // Ensure user owns this playlist
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(playlist);
  } catch (error: unknown) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update playlist",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id] - Delete a playlist
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

    // First check if playlist exists and user owns it
    const { data: existingPlaylist, error: checkError } = await supabase
      .from("playlists")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (checkError || !existingPlaylist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    // First, delete all tracks in this playlist
    const { error: tracksError } = await supabase
      .from("tracks")
      .delete()
      .eq("playlist_id", id);

    if (tracksError) {
      console.error("Error deleting tracks:", tracksError);
      throw tracksError;
    }

    // Then delete the playlist (with user_id check for extra security)
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete playlist",
      },
      { status: 500 }
    );
  }
}
