# Audio Recording Feature - Setup Instructions

## Prerequisites

Before using the audio recording feature, you need to set up:

1. **Supabase Database Table**
2. **Supabase Storage Bucket**
3. **OpenAI API Key**
4. **Environment Variables**

---

## 1. Supabase Database Setup

### Create the `audio_recordings` Table

Go to your Supabase Dashboard → SQL Editor and run this SQL:

```sql
CREATE TABLE audio_recordings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  transcription TEXT,
  status TEXT DEFAULT 'pending',
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster queries by user_id
CREATE INDEX idx_audio_recordings_user_id ON audio_recordings(user_id);

-- Enable Row Level Security (Optional but recommended)
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access only their own recordings
CREATE POLICY "Users can view own recordings"
  ON audio_recordings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own recordings"
  ON audio_recordings FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
```

---

## 2. Supabase Storage Setup

### Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New Bucket"**
3. Bucket name: `audio-recordings`
4. Set to **Public** bucket (or configure policies for authenticated users)
5. Click **Create Bucket**

### Configure Storage Policies (If using private bucket)

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-recordings');

-- Allow users to read their own files
CREATE POLICY "Allow users to read own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'audio-recordings');
```

---

## 3. OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up / Log in
3. Navigate to **API Keys**
4. Click **"Create new secret key"**
5. Copy the API key (you won't see it again!)

---

## 4. Environment Variables

### Frontend `.env`

Ensure your frontend `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend `.env`

Add to your backend `.env` file:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

> **Note**: Use the **service role key** for the backend (not the anon key) for full database access.

---

## 5. Install Backend Dependencies

Navigate to the backend directory and install new dependencies:

```bash
cd backend
pip install -r requirements.txt
```

---

## 6. Usage

### Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Test the Feature

1. Navigate to the Recording Screen in your app
2. Click **"Start Recording"**
3. Grant microphone permissions when prompted
4. Speak for 5-10 seconds
5. Click **"Stop Recording"**
6. Play back the recorded audio
7. Click **"Upload & Process"**
8. Wait for transcription to complete
9. Transcription will appear on the screen

---

## Troubleshooting

### Microphone Access Denied
- Ensure your browser has permission to access the microphone
- Check browser settings

### Upload Failed
- Verify Supabase storage bucket exists and is named `audio-recordings`
- Check storage policies allow uploads
- Verify environment variables are correct

### Transcription Failed
- Ensure OpenAI API key is valid and has credits
- Check that the audio file format is supported (WebM/Opus)
- Review backend console for error messages

### CORS Issues
- Ensure backend CORS is configured to allow your frontend origin
- Check that both servers are running

---

## Next Steps

- Implement user authentication to link recordings to actual user accounts
- Add real-time transcription status updates using Supabase Realtime
- Implement audio file cleanup/deletion functionality
- Add transcription history viewing
- Enhance error handling and user feedback
