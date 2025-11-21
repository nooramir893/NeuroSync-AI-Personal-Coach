import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Mic, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { WaveformAnimation } from './WaveformAnimation';

interface RecordingScreenProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function RecordingScreen({ onComplete, onCancel }: RecordingScreenProps) {
  const [transcription, setTranscription] = useState('');

  useEffect(() => {
    // Simulate transcription appearing
    const transcriptionTimer = setTimeout(() => {
      setTranscription('I feel pretty energized today but a bit anxious about my presentation...');
    }, 2000);

    return () => {
      clearTimeout(transcriptionTimer);
    };
  }, []);

  const handleStopRecording = () => {
    onComplete();
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
          className="flex items-center justify-center gap-3 mb-12"
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
          <h1 className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            NeuroSync AI
          </h1>
        </motion.div>

        {/* Cancel button */}
        <div className="flex justify-end mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="rounded-full"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Recording button - clickable to stop */}
        <button
          onClick={handleStopRecording}
          className="relative w-64 h-64 mx-auto mb-8 cursor-pointer group"
        >
          {/* Animated pulse rings */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 opacity-20"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />

          {/* Main button */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 shadow-2xl group-hover:scale-105 transition-transform flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Mic className="size-16 text-white mb-4" />
            </motion.div>
            <div className="text-white text-xl">Recording...</div>
            <div className="text-white/80 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              Tap to stop
            </div>
          </div>
        </button>

        {/* Waveform */}
        <div className="mb-6">
          <WaveformAnimation isActive={true} />
        </div>

        {/* Microcopy */}
        <p className="text-slate-500 text-sm">Speak naturally • Tap circle to stop recording</p>
      </motion.div>
    </div>
  );
}