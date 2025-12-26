import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
//@typescript-eslint.io/rules/no-explicit-any
// GET /api/playlists/[id] - Get a specific playlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: playlist, error } = await supabase
      .from("playlists")
      .select(`
        *,
        tracks (*)
      `)
      .eq("id", id)
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
  } catch (error: unknown) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch playlist" },
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
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const { data: playlist, error } = await (supabase
      .from("playlists") as any)
      .update({ name })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(playlist);
  } catch (error: unknown) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update playlist" },
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
    const { id } = await params;
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete playlist" },
      { status: 500 }
    );
  }
}

