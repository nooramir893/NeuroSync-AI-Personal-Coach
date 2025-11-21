# 🎤 Audio Recording & Transcription Setup Guide

This guide will help you set up the complete audio recording and transcription system using **Groq Whisper API**.

## 📋 Quick Overview

**What's been done:**
- ✅ Backend updated to use Groq Whisper (faster & free)
- ✅ Sentiment analysis & crisis detection added
- ✅ AudioRecorder component enhanced
- ✅ Database schema SQL created
- ✅ Environment files configured

**What you need to do:**
1. Update environment variables
2. Install backend dependencies
3. Run database setup SQL in Supabase
4. Create storage bucket in Supabase
5. Test the system!

---

## 🔧 Step 1: Configure Environment Variables

### Frontend `.env` (root folder)
Add your Supabase credentials (you should already have these):

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Backend `.env` (backend folder)
Create a new file `backend/.env` with:

```bash
# ============================================
# GROQ API (Whisper Transcription)
# ============================================
GROQ_API_KEY=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

# ============================================
# SUPABASE (Database & Storage)
# ============================================
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your_supabase_service_key_here
```

**⚠️ Important:** 
- Frontend uses `VITE_` prefix
- Backend uses regular names (no prefix)
- Backend needs **Service Key** (not anon key) - Find it in Supabase Dashboard → Settings → API

---

## 🐍 Step 2: Install Backend Dependencies

Open Git Bash and run:

```bash
cd "/c/Users/Faiq Ul Hassan/Documents/STUDY/NeuroSync/NeuroSync-AI-Personal-Coach/backend"

# Install updated dependencies
pip install -r requirements.txt
```

This will install the **Groq SDK** and other required packages.

---

## 🗄️ Step 3: Set Up Supabase Database

### A. Create Database Table

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `supabase-setup.sql` file
6. Paste and click **Run**
7. Wait for "Success" message

### B. Create Storage Bucket

1. In Supabase Dashboard, click **Storage** (left sidebar)
2. Click **Create a new bucket**
3. Configure:
   - **Name**: `audio-recordings`
   - **Public bucket**: Toggle **ON** ✅
   - **File size limit**: 10 MB
4. Click **Create bucket**

### C. Set Storage Policies

1. Click on the `audio-recordings` bucket
2. Click **Policies** tab
3. The SQL from `supabase-setup.sql` should have already created these
4. Verify you see policies for:
   - Users can upload their own audio
   - Users can read their own audio
   - Public can read audio files

---

## 🚀 Step 4: Run the Application

### Terminal 1: Start Backend

```bash
cd "/c/Users/Faiq Ul Hassan/Documents/STUDY/NeuroSync/NeuroSync-AI-Personal-Coach/backend"
uvicorn main:app --reload
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2: Start Frontend

```bash
cd "/c/Users/Faiq Ul Hassan/Documents/STUDY/NeuroSync/NeuroSync-AI-Personal-Coach"
npm run dev
```

You should see:
```
VITE ready in XXXms
Local: http://localhost:5173/
```

---

## 🧪 Step 5: Test the System

1. **Open** http://localhost:5173 in your browser
2. **Navigate** to the page with AudioRecorder component
3. **Click** "Start Recording"
4. **Allow** microphone access
5. **Speak** for 5-10 seconds (e.g., "I'm feeling happy today")
6. **Click** "Stop Recording"
7. **Click** "Upload & Process"
8. **Wait** for transcription (1-3 seconds)
9. **Check** the result shows:
   - Transcript text
   - Mood score
   - Crisis detection status

### Verify in Supabase

1. Go to Supabase Dashboard
2. **Storage** → `audio-recordings` → Should see your `.webm` file
3. **Table Editor** → `audio_recordings` → Should see record with:
   - `status`: `completed`
   - `transcript_text`: Your words
   - `mood_score`: JSON object
   - `crisis_detected`: true/false

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Make sure you're in the backend folder
cd backend

# Install dependencies again
pip install -r requirements.txt

# Check .env file exists
ls -la .env
```

### Frontend can't connect to backend
- Make sure backend is running on port 8000
- Check browser console for errors
- Verify CORS is enabled in `backend/main.py`

### Upload fails
- Verify storage bucket exists and is public
- Check `.env` has correct Supabase credentials
- Look at browser Network tab for error details

### Transcription fails
- Check backend terminal for error messages
- Verify Groq API key is correct
- Check audio file uploaded successfully

---

## 📂 Files Created/Modified

### Created:
- `supabase-setup.sql` - Database schema
- `backend/.env.example` - Backend env template
- `.env.example` - Frontend env template

### Modified:
- `backend/main.py` - Updated to use Groq Whisper
- `backend/requirements.txt` - Replaced OpenAI with Groq
- `components/AudioRecorder.tsx` - Enhanced with mood display

---

## 🎯 Next Steps

After testing, you can:
1. **Add WhatsApp alerts** for crisis detection
2. **Integrate Spotify API** for mood-based playlists
3. **Improve sentiment analysis** with more keywords
4. **Add multi-language support** (change `language="en"` in backend)
5. **Create dashboard** to view all recordings and analytics

---

## 🆘 Need Help?

If something isn't working:
1. Check backend terminal for errors
2. Check browser console for errors
3. Verify all environment variables are set
4. Make sure both frontend and backend are running
5. Test the backend API directly: http://localhost:8000 (should show a message)

Happy coding! 🚀
