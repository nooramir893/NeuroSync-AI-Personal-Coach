from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from pydantic import BaseModel
import os
from datetime import datetime
import assemblyai as aai

from pathlib import Path

# Load .env from the backend directory
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

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

# Initialize AssemblyAI client
aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

# Request model for transcription
class TranscriptionRequest(BaseModel):
    audioId: str
    audioUrl: str

# ============================================
# HELPER FUNCTIONS
# ============================================

def detect_crisis(text: str) -> bool:
    """Detect crisis keywords in transcribed text"""
    crisis_keywords = [
        'suicide', 'kill myself', 'end it all', 'want to die',
        'no point living', 'harm myself', 'better off dead',
        'ending my life', "can't go on", 'nothing matters'
    ]
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in crisis_keywords)

def convert_assemblyai_sentiment_to_mood_score(sentiment_results) -> dict:
    """Convert AssemblyAI sentiment analysis to mood score format"""
    if not sentiment_results:
        return {
            "overall": 3.0,
            "positive": 0,
            "negative": 0,
            "neutral": 0,
            "text_length": 0
        }
    
    # Count sentiment categories
    positive_count = sum(1 for s in sentiment_results if s.sentiment == "POSITIVE")
    negative_count = sum(1 for s in sentiment_results if s.sentiment == "NEGATIVE")
    neutral_count = sum(1 for s in sentiment_results if s.sentiment == "NEUTRAL")
    total_count = len(sentiment_results)
    
    # Calculate overall score (1-5 scale)
    if total_count > 0:
        positive_ratio = positive_count / total_count
        negative_ratio = negative_count / total_count
        # Map to 1-5 scale: more positive = higher score
        overall = 1 + (positive_ratio * 4) - (negative_ratio * 2)
        overall = max(1.0, min(5.0, overall))
    else:
        overall = 3.0
    
    return {
        "overall": round(overall, 1),
        "positive": positive_count,
        "negative": negative_count,
        "neutral": neutral_count,
        "text_length": total_count
    }

# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
async def root():
    return {"message": "NeuroSync Backend - AssemblyAI Transcription API"}

@app.post("/api/transcribe")
async def transcribe_audio(request: TranscriptionRequest):
    print(f"[DEBUG] Received transcription request for audio: {request.audioId}")
    print(f"[DEBUG] Audio URL: {request.audioUrl}")
    
    try:
        # STEP 1: Update status to processing
        supabase.table("audio_recordings").update({
            "status": "processing"
        }).eq("id", request.audioId).execute()
        
        # STEP 2: Configure AssemblyAI transcriber with sentiment analysis
        print("Configuring AssemblyAI transcriber...")
        config = aai.TranscriptionConfig(
            sentiment_analysis=True,
            language_code="en"  # Change to auto-detect by removing this line
        )
        
        # STEP 3: Transcribe audio from URL
        print(f"Transcribing audio from: {request.audioUrl}")
        transcriber = aai.Transcriber(config=config)
        
        import time
        start_time = time.time()
        
        transcript = transcriber.transcribe(request.audioUrl)
        
        transcription_time = int((time.time() - start_time) * 1000)
        
        # Check for errors
        if transcript.status == aai.TranscriptStatus.error:
            raise HTTPException(status_code=500, detail=f"Transcription failed: {transcript.error}")
        
        transcript_text = transcript.text
        print(f"Transcription completed in {transcription_time}ms")
        print(f"Transcript: {transcript_text[:100]}...")
        
        # STEP 4: Analyze sentiment and detect crisis
        mood_score = convert_assemblyai_sentiment_to_mood_score(transcript.sentiment_analysis)
        crisis_detected = detect_crisis(transcript_text)
        
        if crisis_detected:
            print("CRISIS DETECTED!")
        print(f"Mood score: {mood_score['overall']}/5")
        
        # STEP 5: Update database with results
        update_result = supabase.table("audio_recordings").update({
            "status": "completed",
            "transcript_text": transcript_text,
            "mood_score": mood_score,
            "crisis_detected": crisis_detected,
            "processed_at": datetime.utcnow().isoformat(),
            "duration_seconds": int(transcript.audio_duration) if transcript.audio_duration else 0,
            "metadata": {
                "transcription_time_ms": transcription_time,
                "model": "assemblyai",
                "language": "en",
                "confidence": transcript.confidence if hasattr(transcript, 'confidence') else None
            }
        }).eq("id", request.audioId).execute()
        
        print("Transcription complete!")
        
        # STEP 6: Return success response
        return {
            "success": True,
            "audioId": request.audioId,
            "transcript": transcript_text,
            "moodScore": mood_score,
            "crisisDetected": crisis_detected,
            "transcriptionTimeMs": transcription_time
        }
        
    except Exception as e:
        print(f"[ERROR] Transcription error details: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"[ERROR] Transcription error: {str(e)}")
        
        # Update database with error status
        try:
            supabase.table("audio_recordings").update({
                "status": "failed",
                "metadata": {"error": str(e)}
            }).eq("id", request.audioId).execute()
        except Exception as db_error:
            print(f"Failed to update error status: {str(db_error)}")
        
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
