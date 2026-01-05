import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/getUserFromRequest";

// GET /api/playlists - Get all playlists for current user
export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter by user_id
    const { data: playlists, error } = await supabase
      .from("playlists")
      .select(
        `
        *,
        tracks (*)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(playlists);
  } catch (error: unknown) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch playlists",
      },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create a new playlist
export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Use authenticated user's ID, not from request body
    const { data: playlist, error } = await supabase
      .from("playlists")
      // @ts-expect-error - Supabase types are not fully generated for this table
      .insert({
        name,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(playlist);
  } catch (error: unknown) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create playlist",
      },
      { status: 500 }
    );
  }
}
