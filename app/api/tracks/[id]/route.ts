import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

// DELETE /api/tracks/[id] - Remove a track from playlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("tracks")
      .delete()
      .eq("id", params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting track:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete track" },
      { status: 500 }
    );
  }
}

