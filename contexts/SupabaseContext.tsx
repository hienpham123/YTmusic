"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabase/client";
import { Playlist } from "@/types/playlist";
import { Track } from "@/types/track";
import { useUserStore } from "@/stores/userStore";
import { playlistService } from "@/services/playlistService";

interface SupabaseContextType {
  user: ReturnType<typeof useUserStore.getState>["user"];
  loading: ReturnType<typeof useUserStore.getState>["loading"];
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signInWithGitHub: () => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  loadPlaylists: () => Promise<Playlist[]>;
  savePlaylist: (playlist: Playlist) => Promise<Playlist>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<any>;
  removeTrackFromPlaylist: (
    playlistId: string,
    trackId: string
  ) => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const { user, loading, setUser, setLoading } = useUserStore();
  const hasInitializedRef = useRef(false);
  const getUserCalledRef = useRef(false);

  // Get current user - only call once
  useEffect(() => {
    // Prevent multiple calls
    if (getUserCalledRef.current) {
      return;
    }

    getUserCalledRef.current = true;

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
                  await supabase.from("users").insert({
                    id: tempUser.id,
                    email: tempUser.email || "",
                    name:
                      tempUser.user_metadata?.full_name ||
                      tempUser.user_metadata?.name ||
                      tempUser.email?.split("@")[0] ||
                      "User",
                  } as any);
                }
              } catch (error) {
                console.error(
                  "Error ensuring user exists on auth change:",
                  error
                );
              }
            }
          }, 100);
        }
      });

      return () => subscription.unsubscribe();
    } catch {
      // Supabase not configured
      return () => {};
    }
  }, []);

  // Ensure user record exists in users table
  const ensureUserExists = useCallback(async () => {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) return;

    try {
      // Check if user record exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", currentUser.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        console.error("Error checking user:", checkError);
        return;
      }

      // If user doesn't exist, create it
      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").insert({
          id: currentUser.id,
          email: currentUser.email || "",
          name:
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            currentUser.email?.split("@")[0] ||
            "User",
        } as any);

        if (insertError) {
          console.error("❌ Error creating user record:", insertError);
        }
      }
    } catch (error) {
      console.error("❌ Error ensuring user exists:", error);
    }
  }, [user?.id, user?.email, user?.user_metadata]);

  // Sign in with email/password
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        throw error;
      }

      return data;
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      console.error("❌ Sign in failed:", err);

      if (
        err.message?.includes("placeholder") ||
        err.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local"
        );
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign up error:", error);
        throw error;
      }

      return data;
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      console.error("❌ Sign up failed:", err);

      if (
        err.message?.includes("placeholder") ||
        err.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local"
        );
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

      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("❌ GitHub sign in failed:", err);

      if (
        err.message?.includes("placeholder") ||
        err.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local"
        );
      }

      throw new Error(
        err.message || "Không thể đăng nhập với GitHub. Vui lòng thử lại."
      );
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("❌ Google sign in error:", error);
        throw error;
      }

      return data;
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("❌ Google sign in failed:", err);

      if (
        err.message?.includes("placeholder") ||
        err.message?.includes("Failed to fetch")
      ) {
        throw new Error(
          "Supabase chưa được cấu hình. Vui lòng thêm credentials vào .env.local"
        );
      }

      throw new Error(
        err.message || "Không thể đăng nhập với Google. Vui lòng thử lại."
      );
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

  // Load playlists from Supabase
  const loadPlaylists = useCallback(async (): Promise<Playlist[]> => {
    const currentUser = useUserStore.getState().user;
    if (!currentUser) return [];

    // Ensure user exists first
    await ensureUserExists();

    const { data, error } = await supabase
      .from("playlists")
      .select(
        `
        *,
        tracks (*)
      `
      )
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading playlists:", error);
      return [];
    }

    // Transform data to match our Playlist type
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
              mood: t.mood as Track["mood"],
              createdAt: new Date(t.created_at),
            }))
          : [], // Always ensure tracks is an array
        createdAt: new Date(p.created_at),
      })) || []
    );
  }, [ensureUserExists]);

  // Save playlist to Supabase
  const savePlaylist = useCallback(
    async (playlist: Playlist): Promise<Playlist> => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) {
        console.warn("⚠️ User not authenticated, cannot save to Supabase");
        throw new Error("User not authenticated");
      }

      // Ensure user exists first
      await ensureUserExists();

      const saved = await playlistService.savePlaylist(
        playlist,
        currentUser.id
      );
      return saved;
    },
    [ensureUserExists]
  );

  // Add track to playlist
  const addTrackToPlaylist = useCallback(
    async (playlistId: string, track: Track) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) throw new Error("User not authenticated");

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

      return data;
    },
    [ensureUserExists]
  );

  // Remove track from playlist
  const removeTrackFromPlaylist = useCallback(
    async (playlistId: string, trackId: string) => {
      const currentUser = useUserStore.getState().user;
      if (!currentUser) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("tracks")
        .delete()
        .eq("id", trackId)
        .eq("playlist_id", playlistId);

      if (error) throw error;
    },
    []
  );

  return (
    <SupabaseContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signInWithGitHub,
        signInWithGoogle,
        signOut,
        loadPlaylists,
        savePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
      }}
    >
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
