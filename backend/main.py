from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import httpx
from groq import Groq
import time
from datetime import datetime

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Request model for transcription
class TranscriptionRequest(BaseModel):
    audioId: str
    audioUrl: str

# ============================================
# HELPER FUNCTIONS
# ============================================

def analyze_sentiment(text: str) -> dict:
    """Analyze sentiment and mood from transcribed text"""
    positive_words = [
        'happy', 'good', 'great', 'better', 'joy', 'love', 
        'excited', 'wonderful', 'amazing', 'grateful', 'thankful',
        'hopeful', 'optimistic', 'peaceful', 'calm', 'blessed'
    ]
    
    negative_words = [
        'sad', 'bad', 'terrible', 'worse', 'depressed', 'anxious',
        'worried', 'hopeless', 'pain', 'hurt', 'crying', 'alone',
        'scared', 'fear', 'angry', 'frustrated', 'overwhelmed'
    ]
    
    words = text.lower().split()
    
    positive_count = sum(1 for word in words if any(pw in word for pw in positive_words))
    negative_count = sum(1 for word in words if any(nw in word for nw in negative_words))
    
    # Calculate overall score (1-5 scale)
    if len(words) > 0:
        sentiment_diff = positive_count - negative_count
        sentiment_ratio = sentiment_diff / len(words)
        overall = max(1, min(5, 3 + (sentiment_ratio * 20)))
    else:
        overall = 3
    
    return {
        "overall": round(overall, 1),
        "positive": positive_count,
        "negative": negative_count,
        "neutral": len(words) - positive_count - negative_count,
        "text_length": len(words)
    }

def detect_crisis(text: str) -> bool:
    """Detect crisis keywords in transcribed text"""
    crisis_keywords = [
        'suicide', 'kill myself', 'end it all', 'want to die',
        'no point living', 'harm myself', 'better off dead',
        'ending my life', "can't go on", 'nothing matters'
    ]
    
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in crisis_keywords)

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {"message": "NeuroSync Backend - Groq Whisper Transcription API"}

@app.post("/api/transcribe")
async def transcribe_audio(request: TranscriptionRequest):
    print(f"🎤 Starting transcription for audio: {request.audioId}")
    
    try:
        # STEP 1: Update status to processing
        supabase.table("audio_recordings").update({
            "status": "processing"
        }).eq("id", request.audioId).execute()
        
        # STEP 2: Download audio file from URL
        print(f"⬇️ Downloading audio from: {request.audioUrl}")
        async with httpx.AsyncClient() as client:
            response = await client.get(request.audioUrl, timeout=30.0)
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to download audio file")
            
            audio_content = response.content
            print(f"📊 Audio file size: {len(audio_content) / 1024:.2f} KB")

        # STEP 3: Save temporarily
        temp_audio_path = f"/tmp/{request.audioId}.webm"
        with open(temp_audio_path, "wb") as f:
            f.write(audio_content)

        # STEP 4: Transcribe using Groq Whisper Large v3 Turbo
        print("🤖 Sending to Groq Whisper...")
        start_time = time.time()
        
        with open(temp_audio_path, "rb") as audio_file:
            transcription = groq_client.audio.transcriptions.create(
                file=(f"{request.audioId}.webm", audio_file.read()),
                model="whisper-large-v3-turbo",
                language="en",  # Change to 'ur' for Urdu, or remove for auto-detect
                response_format="verbose_json",
                temperature=0.0  # Most accurate
            )
        
        transcription_time = int((time.time() - start_time) * 1000)
        transcript_text = transcription.text
        print(f"✅ Transcription completed in {transcription_time}ms")
        print(f"📝 Transcript: {transcript_text[:100]}...")

        # STEP 5: Analyze sentiment and detect crisis
        mood_score = analyze_sentiment(transcript_text)
        crisis_detected = detect_crisis(transcript_text)
        
        if crisis_detected:
            print("🚨 CRISIS DETECTED!")
        
        print(f"😊 Mood score: {mood_score['overall']}/5")

        # STEP 6: Update database with results
        update_result = supabase.table("audio_recordings").update({
            "status": "completed",
            "transcript_text": transcript_text,
            "mood_score": mood_score,
            "crisis_detected": crisis_detected,
            "processed_at": datetime.utcnow().isoformat(),
            "duration_seconds": int(transcription.duration) if hasattr(transcription, 'duration') else 0,
            "metadata": {
                "transcription_time_ms": transcription_time,
                "model": "whisper-large-v3-turbo",
                "language": transcription.language if hasattr(transcription, 'language') else "en"
            }
        }).eq("id", request.audioId).execute()

        # STEP 7: Clean up temporary file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
        
        print("✅ Transcription complete!")

        # STEP 8: Return success response
        return {
            "success": True,
            "audioId": request.audioId,
            "transcript": transcript_text,
            "moodScore": mood_score,
            "crisisDetected": crisis_detected,
            "transcriptionTimeMs": transcription_time
        }

    except Exception as e:
        print(f"❌ Transcription error: {str(e)}")
        
        # Update database with error status
        try:
            supabase.table("audio_recordings").update({
                "status": "failed",
                "metadata": {"error": str(e)}
            }).eq("id", request.audioId).execute()
        except Exception as db_error:
            print(f"Failed to update error status: {str(db_error)}")
        
        # Clean up temporary file if it exists
        temp_audio_path = f"/tmp/{request.audioId}.webm"
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
