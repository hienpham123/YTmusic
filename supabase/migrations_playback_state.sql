-- Migration: Add playback_state table to save player state

-- Playback state table - saves current playback state for users
CREATE TABLE IF NOT EXISTS playback_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_track JSONB,
  playback_time REAL DEFAULT 0, -- Renamed from current_time (reserved keyword)
  playlist JSONB DEFAULT '[]'::jsonb, -- Queue
  current_index INTEGER DEFAULT -1,
  source_playlist JSONB DEFAULT '[]'::jsonb,
  source_index INTEGER DEFAULT -1,
  repeat_mode TEXT DEFAULT 'off',
  is_shuffled BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- One playback state per user
  UNIQUE(user_id)
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_playback_state_user_id ON playback_state(user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE playback_state ENABLE ROW LEVEL SECURITY;

-- Playback state policies
CREATE POLICY "Users can view their own playback state"
  ON playback_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playback state"
  ON playback_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playback state"
  ON playback_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playback state"
  ON playback_state FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE TRIGGER update_playback_state_updated_at
  BEFORE UPDATE ON playback_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

