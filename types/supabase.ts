// Types for Supabase database records

export interface SupabaseFavorite {
  id: string;
  youtube_video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  duration?: string;
  mood?: string;
  created_at?: string;
}

export interface SupabasePlayHistory {
  id: string;
  youtube_video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  duration?: string;
  mood?: string;
  played_at?: string;
  play_count?: number;
}

export interface SupabasePlaylist {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  tracks?: SupabaseTrack[];
}

export interface SupabaseTrack {
  id: string;
  playlist_id: string;
  youtube_video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  duration?: string;
  mood?: string;
  created_at?: string;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  created_at?: string;
}
