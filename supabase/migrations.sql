-- Migration: Add favorites and play history tables

-- Favorites table - tracks that users have favorited
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  youtube_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  duration TEXT,
  mood TEXT DEFAULT 'Unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate favorites for same user and video
  UNIQUE(user_id, youtube_video_id)
);

-- Play history table - tracks that users have played
CREATE TABLE IF NOT EXISTS play_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  youtube_video_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  duration TEXT,
  mood TEXT DEFAULT 'Unknown',
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  play_count INTEGER DEFAULT 1
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_youtube_video_id ON favorites(youtube_video_id);
CREATE INDEX IF NOT EXISTS idx_play_history_user_id ON play_history(user_id);
CREATE INDEX IF NOT EXISTS idx_play_history_played_at ON play_history(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_play_history_youtube_video_id ON play_history(youtube_video_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE play_history ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Play history policies
CREATE POLICY "Users can view their own play history"
  ON play_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own play history"
  ON play_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own play history"
  ON play_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own play history"
  ON play_history FOR DELETE
  USING (auth.uid() = user_id);

