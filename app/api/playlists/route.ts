import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

// GET /api/playlists - Get all playlists for current user
export async function GET(request: NextRequest) {
  try {
    // Get user from session (you'll need to implement auth)
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, we'll use a simple approach
    // In production, verify JWT token from Supabase
    const { data: playlists, error } = await supabase
      .from("playlists")
      .select(`
        *,
        tracks (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(playlists);
  } catch (error: any) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

// POST /api/playlists - Create a new playlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, userId } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Name and userId are required" },
        { status: 400 }
      );
    }

    const { data: playlist, error } = await supabase
      .from("playlists")
      .insert({
        name,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(playlist);
  } catch (error: any) {
    console.error("Error creating playlist:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create playlist" },
      { status: 500 }
    );
  }
}

