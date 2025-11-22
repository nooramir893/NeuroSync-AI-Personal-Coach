import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, X, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { supabase } from '../lib/supabase';

interface AudioRecorderProps {
    userId: string;
    onTranscriptionComplete?: (transcription: string) => void;
    onError?: (error: string) => void;
}

export function AudioRecorder({ userId, onTranscriptionComplete, onError }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            onError?.('Please allow microphone access to record audio');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const uploadAudio = async () => {
        if (!audioBlob) return;

        setIsUploading(true);

        try {
            // 1. Upload audio file to Supabase Storage
            const fileName = `${userId}_${Date.now()}.webm`;
            const { data: storageData, error: storageError } = await supabase.storage
                .from('audio-recordings')
                .upload(fileName, audioBlob);

            if (storageError) throw storageError;

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('audio-recordings')
                .getPublicUrl(fileName);

            // 3. Create record in database
            const { data: audioRecord, error: dbError } = await supabase
                .from('audio_recordings')
                .insert({
                    user_id: userId,
                    file_path: storageData.path,
                    file_url: publicUrl,
                    status: 'pending',
                    duration_seconds: recordingTime
                })
                .select()
                .single();

            if (dbError) throw dbError;

            console.log('Audio uploaded successfully:', audioRecord);

            // 4. Trigger transcription
            await triggerTranscription(audioRecord.id, publicUrl);

            // Reset state
            setAudioBlob(null);
            setRecordingTime(0);

        } catch (error) {
            console.error('Upload error:', error);
            onError?.('Failed to upload audio. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const triggerTranscription = async (audioId: string, audioUrl: string) => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/transcribe/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioId, audioUrl })
            });

            if (!response.ok) throw new Error('Transcription failed');

            const result = await response.json();
            console.log('Transcription result:', result);

            // Show success message with mood analysis
            if (result.transcript) {
                const moodEmoji = result.moodScore.overall >= 4 ? '😊' :
                    result.moodScore.overall >= 3 ? '😐' :
                        result.moodScore.overall >= 2 ? '😔' : '😢';

                onTranscriptionComplete?.(
                    `${result.transcript}\n\n` +
                    `Mood Analysis: ${moodEmoji} ${result.moodScore.overall}/5\n` +
                    `Positive: ${result.moodScore.positive} | Negative: ${result.moodScore.negative}`
                );
            }

            // Show crisis alert if detected
            if (result.crisisDetected) {
                onError?.('🚨 Crisis keywords detected. If you need help, please reach out to someone you trust or contact a mental health professional.');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            onError?.('Transcription failed. The audio was saved but not transcribed.');
        }
    };

    const discardRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="audio-recorder w-full max-w-md mx-auto">
            {!isRecording && !audioBlob && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Button
                        onClick={startRecording}
                        size="lg"
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                    >
                        <Mic className="mr-2 size-5" />
                        Start Recording
                    </Button>
                </motion.div>
            )}

            {isRecording && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="recording-indicator flex items-center gap-3 text-red-500 font-medium">
                        <motion.div
                            className="pulse-dot w-3 h-3 bg-red-500 rounded-full"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [1, 0.5, 1],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        <span>Recording... {formatTime(recordingTime)}</span>
                    </div>

                    <Button
                        onClick={stopRecording}
                        variant="destructive"
                        size="lg"
                        className="w-full"
                    >
                        <X className="mr-2 size-5" />
                        Stop Recording
                    </Button>
                </motion.div>
            )}

            {audioBlob && !isRecording && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                >
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            Recording duration: {formatTime(recordingTime)}
                        </div>
                        <audio
                            controls
                            src={URL.createObjectURL(audioBlob)}
                            className="w-full"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={uploadAudio}
                            disabled={isUploading}
                            className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                        >
                            <Upload className="mr-2 size-4" />
                            {isUploading ? 'Uploading...' : 'Upload & Process'}
                        </Button>
                        <Button
                            onClick={discardRecording}
                            variant="outline"
                            disabled={isUploading}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
