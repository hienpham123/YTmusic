import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

// GET /api/playlists/[id] - Get a specific playlist
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: playlist, error } = await supabase
      .from("playlists")
      .select(`
        *,
        tracks (*)
      `)
      .eq("id", params.id)
      .single();

    if (error) {
      throw error;
    }

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch playlist" },
      { status: 500 }
    );
  }
}

// PUT /api/playlists/[id] - Update a playlist
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const { data: playlist, error } = await supabase
      .from("playlists")
      .update({ name })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update playlist" },
      { status: 500 }
    );
  }
}

// DELETE /api/playlists/[id] - Delete a playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete playlist" },
      { status: 500 }
    );
  }
}

