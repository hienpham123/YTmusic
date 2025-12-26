import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

// DELETE /api/tracks/[id] - Remove a track from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from("tracks")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete track" },
      { status: 500 }
    );
  }
}

