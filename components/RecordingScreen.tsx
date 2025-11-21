import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { AudioRecorder } from './AudioRecorder';

interface RecordingScreenProps {
  onComplete: () => void;
  onCancel: () => void;
  userId?: string;
}

export function RecordingScreen({ onComplete, onCancel, userId = 'demo-user' }: RecordingScreenProps) {
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState('');

  const handleTranscriptionComplete = (text: string) => {
    setTranscription(text);
    // Automatically proceed to processing after 2 seconds
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-2xl w-full"
      >
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="p-3 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 shadow-lg"
          >
            <Brain className="size-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            NeuroSync AI
          </h1>
        </motion.div>

        {/* Cancel button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="rounded-full"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-slate-800 mb-2">
            Record Your Mental Health Check-In
          </h2>
          <p className="text-slate-600 text-sm">
            Speak naturally about how you're feeling. Your voice will be analyzed to provide personalized insights.
          </p>
        </motion.div>

        {/* Audio Recorder Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <AudioRecorder
            userId={userId}
            onTranscriptionComplete={handleTranscriptionComplete}
            onError={handleError}
          />
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Transcription Display */}
        {transcription && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg"
          >
            <h3 className="text-sm font-semibold text-teal-800 mb-2">Transcription:</h3>
            <p className="text-slate-700 text-sm italic">{transcription}</p>
            <p className="text-teal-600 text-xs mt-2">Processing your insights...</p>
          </motion.div>
        )}

        {/* Microcopy */}
        <p className="text-slate-500 text-xs mt-6">
          Your privacy is protected • Audio is securely stored
        </p>
      </motion.div>
    </div>
  );
}