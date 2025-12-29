import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { supabase } from "@/lib/supabase/client";

interface SupabasePlaylistData {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  tracks?: Array<{
    id: string;
    youtube_video_id: string;
    title: string;
    thumbnail: string;
    channel_name: string;
    duration?: string;
    mood?: string;
    created_at: string;
  }>;
}

export const playlistService = {
  /**
   * Load all playlists for a user from Supabase
   */
  loadPlaylists: async (userId: string): Promise<Playlist[]> => {
    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        *,
        tracks (*)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading playlists:", error);
      return [];
    }

    // Transform data to match our Playlist type
    return (
      data?.map((p: SupabasePlaylistData) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        tracks: Array.isArray(p.tracks)
          ? p.tracks.map((t) => ({
              id: t.id,
              youtubeVideoId: t.youtube_video_id,
              title: t.title,
              thumbnail: t.thumbnail,
              channelName: t.channel_name,
              duration: t.duration || "",
              mood: (t.mood || "Unknown") as Track["mood"],
              createdAt: new Date(t.created_at),
            }))
          : [],
        createdAt: new Date(p.created_at),
      })) || []
    );
  },

  /**
   * Save a playlist to Supabase (create or update)
   */
  savePlaylist: async (
    playlist: Playlist,
    userId: string
  ): Promise<Playlist> => {
    // Create or update playlist
    const { data: playlistData, error: playlistError } = await (
      supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("playlists") as any
    )
      .upsert(
        {
          id: playlist.id,
          user_id: userId,
          name: playlist.name,
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    if (playlistError) {
      throw playlistError;
    }

    // Save tracks
    if (playlist.tracks.length > 0) {
      const tracksToInsert = playlist.tracks.map((track) => ({
        id: track.id,
        playlist_id: playlistData?.id || playlist.id,
        youtube_video_id: track.youtubeVideoId,
        title: track.title,
        thumbnail: track.thumbnail,
        channel_name: track.channelName,
        duration: track.duration,
        mood: track.mood,
      }));

      // Delete existing tracks first
      await supabase.from("tracks").delete().eq("playlist_id", playlistData.id);

      // Insert new tracks
      const { error: tracksError } = await (
        supabase
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .from("tracks") as any
      ).insert(tracksToInsert);

      if (tracksError) throw tracksError;
    }

    return {
      ...playlist,
      id: (playlistData as { id: string }).id,
    };
  },

  /**
   * Delete a playlist from Supabase
   */
  deletePlaylist: async (playlistId: string): Promise<void> => {
    // Delete tracks first (API route handles this, but we do it here too for safety)
    const { error: tracksError } = await supabase
      .from("tracks")
      .delete()
      .eq("playlist_id", playlistId);

    if (tracksError) {
      throw tracksError;
    }

    // Delete playlist
    const { error } = await supabase
      .from("playlists")
      .delete()
      .eq("id", playlistId);

    if (error) {
      throw error;
    }
  },

  /**
   * Add a track to a playlist in Supabase
   */
  addTrack: async (playlistId: string, track: Track): Promise<unknown> => {
    const { data, error } = await (
      supabase
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .from("tracks") as any
    )
      .insert({
        playlist_id: playlistId,
        youtube_video_id: track.youtubeVideoId,
        title: track.title,
        thumbnail: track.thumbnail,
        channel_name: track.channelName,
        duration: track.duration || "",
        mood: track.mood || "Unknown",
      })
      .select();

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Remove a track from a playlist in Supabase
   */
  removeTrack: async (playlistId: string, trackId: string): Promise<void> => {
    const { error } = await supabase
      .from("tracks")
      .delete()
      .eq("playlist_id", playlistId)
      .eq("id", trackId);

    if (error) {
      throw error;
    }
  },
};
