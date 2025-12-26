"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";

export function useSupabase() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        // Supabase not configured, user stays null
        console.warn("Supabase not configured:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes (only if Supabase is configured)
    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setUser(session?.user ?? null);
        
        // Ensure user record exists when user logs in
        if (session?.user) {
          // Small delay to ensure state is updated
          setTimeout(async () => {
            const tempUser = session.user;
            if (tempUser) {
              try {
                const { data: existingUser } = await supabase
                  .from("users")
                  .select("id")
                  .eq("id", tempUser.id)
                  .single();

                if (!existingUser) {
                  console.log("👤 Creating user record for:", tempUser.email);
                  await (supabase.from("users") as any).insert({
                    id: tempUser.id,
                    email: tempUser.email || "",
                    name: tempUser.user_metadata?.full_name || tempUser.user_metadata?.name || tempUser.email?.split("@")[0] || "User",
                  } as any);
                }
              } catch (error) {
                console.error("Error ensuring user exists on auth change:", error);
              }
            }
          }, 100);
        }
      });

      return () => subscription.unsubscribe();
    } catch (error) {
      // Supabase not configured
      return () => {};
    }
  }, []);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log("🔐 Attempting to sign in...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("❌ Sign in error:", error);
        throw error;
      }
      
      console.log("✅ Sign in successful:", data.user?.email);
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      console.error("❌ Sign in failed:", err);
      
      if (err.message?.includes("placeholder") || err.message?.includes("Failed to fetch")) {
        throw new Error("Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local");
      }
      
      if (err.message?.includes("Invalid login credentials")) {
        throw new Error("Email hoặc mật khẩu không đúng");
      }
      
      if (err.message?.includes("Email not confirmed")) {
        throw new Error("Vui lòng xác nhận email trước khi đăng nhập");
      }
      
      throw new Error(err.message || "Không thể đăng nhập. Vui lòng thử lại.");
    }
  }, []);

  // Sign up with email/password
  const signUp = useCallback(async (email: string, password: string) => {
    try {
      console.log("📝 Attempting to sign up...");
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error("❌ Sign up error:", error);
        throw error;
      }
      
      console.log("✅ Sign up successful:", data.user?.email);
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      console.error("❌ Sign up failed:", err);
      
      if (err.message?.includes("placeholder") || err.message?.includes("Failed to fetch")) {
        throw new Error("Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local");
      }
      
      if (err.message?.includes("User already registered")) {
        throw new Error("Email này đã được đăng ký. Vui lòng đăng nhập");
      }
      
      throw new Error(err.message || "Không thể đăng ký. Vui lòng thử lại.");
    }
  }, []);

  // Sign in with GitHub
  const signInWithGitHub = useCallback(async () => {
    try {
      console.log("🔐 Attempting to sign in with GitHub...");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        console.error("❌ GitHub sign in error:", error);
        throw error;
      }
      
      console.log("✅ GitHub OAuth initiated");
      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("❌ GitHub sign in failed:", err);
      
      if (err.message?.includes("placeholder") || err.message?.includes("Failed to fetch")) {
        throw new Error("Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local");
      }
      
      throw new Error(err.message || "Không thể đăng nhập với GitHub. Vui lòng thử lại.");
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: unknown) {
      const err = error as { message?: string };
      if (err.message?.includes("placeholder")) {
        console.warn("Supabase not configured");
      } else {
        throw error;
      }
    }
  }, []);

  // Ensure user record exists in users table
  const ensureUserExists = useCallback(async () => {
    if (!user) return;

    try {
      // Check if user record exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        console.error("Error checking user:", checkError);
        return;
      }

      // If user doesn't exist, create it
      if (!existingUser) {
        console.log("👤 Creating user record for:", user.email);
        const { error: insertError } = await (supabase.from("users") as any).insert({
          id: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "User",
        } as any);

        if (insertError) {
          console.error("❌ Error creating user record:", insertError);
        } else {
          console.log("✅ User record created");
        }
      }
    } catch (error) {
      console.error("❌ Error ensuring user exists:", error);
    }
  }, [user]);

  // Load playlists from Supabase
  const loadPlaylists = useCallback(async (): Promise<Playlist[]> => {
    if (!user) return [];

    // Ensure user exists first
    await ensureUserExists();

    const { data, error } = await supabase
      .from("playlists")
      .select(`
        *,
        tracks (*)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading playlists:", error);
      return [];
    }

    // Transform data to match our Playlist type
    return (
      data?.map((p: any) => ({
        id: p.id,
        userId: p.user_id,
        name: p.name,
        tracks: Array.isArray(p.tracks) 
          ? p.tracks.map((t: any) => ({
              id: t.id,
              youtubeVideoId: t.youtube_video_id,
              title: t.title,
              thumbnail: t.thumbnail,
              channelName: t.channel_name,
              duration: t.duration,
              mood: t.mood as Track["mood"],
              createdAt: new Date(t.created_at),
            }))
          : [], // Always ensure tracks is an array
        createdAt: new Date(p.created_at),
      })) || []
    );
  }, [user, ensureUserExists]);

  // Save playlist to Supabase
  const savePlaylist = useCallback(
    async (playlist: Playlist): Promise<Playlist> => {
      if (!user) {
        console.warn("⚠️ User not authenticated, cannot save to Supabase");
        throw new Error("User not authenticated");
      }

      // Ensure user exists first
      await ensureUserExists();

      console.log("💾 Saving playlist to Supabase:", playlist.name, playlist.id);

      // Create or update playlist
      const { data: playlistData, error: playlistError } = await (supabase
        .from("playlists") as any)
        .upsert({
          id: playlist.id,
          user_id: user.id,
          name: playlist.name,
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (playlistError) {
        console.error("❌ Error saving playlist to Supabase:", playlistError);
        throw playlistError;
      }

      console.log("✅ Playlist saved to Supabase:", playlistData);

      // Save tracks
      if (playlist.tracks.length > 0) {
        const tracksToInsert = playlist.tracks.map((track) => ({
          id: track.id,
          playlist_id: (playlistData as any).id,
          youtube_video_id: track.youtubeVideoId,
          title: track.title,
          thumbnail: track.thumbnail,
          channel_name: track.channelName,
          duration: track.duration,
          mood: track.mood,
        }));

        // Delete existing tracks first
        await supabase
          .from("tracks")
          .delete()
          .eq("playlist_id", playlistData.id);

        // Insert new tracks
        const { error: tracksError } = await (supabase
          .from("tracks") as any)
          .insert(tracksToInsert);

        if (tracksError) throw tracksError;
      }

      return {
        ...playlist,
        id: playlistData.id,
      };
    },
    [user]
  );

  // Add track to playlist
  const addTrackToPlaylist = useCallback(
    async (playlistId: string, track: Track) => {
      if (!user) throw new Error("User not authenticated");

      console.log("💾 Inserting track into Supabase:", {
        playlistId,
        youtubeVideoId: track.youtubeVideoId,
        title: track.title,
      });

      // Ensure user exists first
      await ensureUserExists();

      const { data, error } = await supabase
        .from("tracks")
        .insert({
          playlist_id: playlistId,
          youtube_video_id: track.youtubeVideoId,
          title: track.title,
          thumbnail: track.thumbnail,
          channel_name: track.channelName,
          duration: track.duration || "",
          mood: track.mood || "Unknown",
        } as any)
        .select(); // Return the inserted row

      if (error) {
        console.error("❌ Supabase insert error:", error);
        // If duplicate, return existing track
        if (error.code === "23505") {
          console.log("⚠️ Track already exists, fetching existing...");
          const { data: existing } = await supabase
            .from("tracks")
            .select()
            .eq("playlist_id", playlistId)
            .eq("youtube_video_id", track.youtubeVideoId)
            .single();
          return existing ? [existing] : null;
        }
        throw error;
      }

      console.log("✅ Track inserted successfully:", data);
      return data;
    },
    [user, ensureUserExists]
  );

  // Remove track from playlist
  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("tracks")
        .delete()
        .eq("id", trackId)
        .eq("playlist_id", playlistId);

      if (error) throw error;
    },
    [user]
  );

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithGitHub,
    signOut,
    loadPlaylists,
    savePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist,
  };
}

