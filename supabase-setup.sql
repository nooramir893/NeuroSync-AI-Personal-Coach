-- ============================================
-- AUDIO RECORDINGS TABLE
-- Stores audio files and transcription results
-- ============================================

CREATE TABLE IF NOT EXISTS audio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', 
  -- Status values: 'pending', 'processing', 'completed', 'failed'
  duration_seconds INTEGER DEFAULT 0,
  transcript_text TEXT,
  mood_score JSONB DEFAULT '{}', 
  -- Example: {"overall": 3.5, "positive": 2, "negative": 5}
  crisis_detected BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  -- Stores transcription time, model used, etc.
  created_at TIMESTAMP DEFAULT now(),
  processed_at TIMESTAMP
);

-- ============================================
-- INDEXES (for faster queries)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_audio_recordings_user_id 
ON audio_recordings(user_id);

CREATE INDEX IF NOT EXISTS idx_audio_recordings_status 
ON audio_recordings(status);

CREATE INDEX IF NOT EXISTS idx_audio_recordings_crisis 
ON audio_recordings(crisis_detected);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own recordings
-- ============================================

ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own recordings
DROP POLICY IF EXISTS "Users can view own recordings" ON audio_recordings;
CREATE POLICY "Users can view own recordings"
ON audio_recordings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can insert their own recordings
DROP POLICY IF EXISTS "Users can insert own recordings" ON audio_recordings;
CREATE POLICY "Users can insert own recordings"
ON audio_recordings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recordings
DROP POLICY IF EXISTS "Users can update own recordings" ON audio_recordings;
CREATE POLICY "Users can update own recordings"
ON audio_recordings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKET POLICIES
-- Run these in Supabase Dashboard > Storage > Policies
-- ============================================

-- Note: First create a bucket called 'audio-recordings' with Public = ON
-- Then apply these policies:

-- Policy 1: Allow users to upload their own audio
CREATE POLICY "Users can upload their own audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow users to read their own audio
CREATE POLICY "Users can read their own audio"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow public access to audio files (needed for transcription API)
CREATE POLICY "Public can read audio files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'audio-recordings');
