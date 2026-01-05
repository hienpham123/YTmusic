import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/getUserFromRequest";

// GET /api/favorites - Get all favorites for current user
export async function GET(request: NextRequest) {
  try {
    // Get user from request
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Filter by user_id
    const { data: favorites, error } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(favorites || []);
  } catch (error: unknown) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch favorites",
      },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a track to favorites
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

    const { data: favorite, error } = await supabase
      .from("favorites")
      // @ts-expect-error - Supabase types are not fully generated for this table
      .insert({
        user_id: userId,
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
      // If duplicate, return existing favorite
      if (error.code === "23505") {
        const { data: existingFavorite } = await supabase
          .from("favorites")
          .select()
          .eq("user_id", userId)
          .eq("youtube_video_id", youtubeVideoId)
          .single();

        return NextResponse.json(existingFavorite);
      }
      throw error;
    }

    return NextResponse.json(favorite);
  } catch (error: unknown) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to add favorite",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a track from favorites
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const youtubeVideoId = searchParams.get("youtubeVideoId");

    if (!userId || !youtubeVideoId) {
      return NextResponse.json(
        { error: "userId and youtubeVideoId are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("youtube_video_id", youtubeVideoId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remove favorite",
      },
      { status: 500 }
    );
  }
}
