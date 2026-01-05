import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/getUserFromRequest";

// GET /api/play-history - Get play history for current user
export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    // Filter by user_id
    const { data: history, error } = await supabase
      .from("play_history")
      .select("*")
      .eq("user_id", user.id)
      .order("played_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json(history || []);
  } catch (error: unknown) {
    console.error("Error fetching play history:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch play history",
      },
      { status: 500 }
    );
  }
}

// POST /api/play-history - Add a track to play history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      youtubeVideoId,
      title,
      thumbnail,
      channelName,
      duration,
      mood,
    } = body;

    if (!userId || !youtubeVideoId || !title || !thumbnail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if track already exists in history
    const { data: existing, error: checkError } = await supabase
      .from("play_history")
      .select("*")
      .eq("user_id", userId)
      .eq("youtube_video_id", youtubeVideoId)
      .maybeSingle();

    // If there's an error (not just "not found"), throw it
    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existing) {
      // Update play count and played_at
      const existingRecord = existing as { id: string; play_count?: number };
      const { data: updated, error: updateError } = await supabase
        .from("play_history")
        // @ts-expect-error - Supabase types are not fully generated for this table
        .update({
          played_at: new Date().toISOString(),
          play_count: (existingRecord.play_count || 1) + 1,
        })
        .eq("id", existingRecord.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json(updated);
    } else {
      // Insert new record
      const { data: history, error } = await supabase
        .from("play_history")
        // @ts-expect-error - Supabase types are not fully generated for this table
        .insert({
          user_id: userId,
          youtube_video_id: youtubeVideoId,
          title,
          thumbnail,
          channel_name: channelName || "",
          duration: duration || "",
          mood: mood || "Unknown",
          play_count: 1,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json(history);
    }
  } catch (error: unknown) {
    console.error("Error adding to play history:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add to play history",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/play-history - Clear play history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("play_history")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error clearing play history:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to clear play history",
      },
      { status: 500 }
    );
  }
}
