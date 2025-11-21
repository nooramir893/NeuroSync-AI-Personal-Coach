import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Calendar, Play, X, Zap, Target, Music, Wind, Clock, Lightbulb, Mic } from 'lucide-react';
import { Button } from './ui/button';
import { MoodGraph } from './MoodGraph';
import { useState } from 'react';

interface HistoryScreenProps {
  onRerunCheckIn: () => void;
}

const historyData = [
  {
    date: 'Today, Nov 20',
    mood: 'Energized & Anxious',
    emoji: '⚡',
    plan: 'Energy surge workout + presentation prep',
    completed: false,
    energyLevel: 75,
    details: {
      timeOfDay: '2:30 PM',
      duration: '45 minutes',
      voiceAnalysis: 'Your voice showed signs of nervous anticipation mixed with determination.',
      recommendations: [
        { icon: 'Zap', title: 'Energy Surge Workout', description: '20 jumping jacks, 10 power squats, 30s plank, 15 shoulder rolls' },
        { icon: 'Target', title: 'Habit Tracker', description: 'Practice presentation opening 3× with power poses' },
        { icon: 'Wind', title: 'Box Breathing', description: '4-4-4-4 breathing exercise to calm nerves' }
      ],
      notes: 'Plan designed to transform nervous energy into focused confidence.'
    }
  },
  {
    date: 'Yesterday, Nov 19',
    mood: 'Calm & Focused',
    emoji: '🧘',
    plan: 'Gentle stretching + deep work session',
    completed: true,
    energyLevel: 60,
    details: {
      timeOfDay: '9:15 AM',
      duration: '60 minutes',
      voiceAnalysis: 'Your voice was steady and composed, indicating a balanced state.',
      recommendations: [
        { icon: 'Wind', title: 'Gentle Stretching', description: '10-minute morning stretch routine for flexibility' },
        { icon: 'Target', title: 'Deep Work Session', description: '90-minute focused work block with ambient music' },
        { icon: 'Music', title: 'Ambient Focus Playlist', description: 'Calm instrumental background music' }
      ],
      notes: 'You maintained excellent focus throughout the day.'
    }
  },
  {
    date: 'Nov 18',
    mood: 'Tired & Overwhelmed',
    emoji: '😴',
    plan: 'Restorative yoga + early rest',
    completed: true,
    energyLevel: 35,
    details: {
      timeOfDay: '7:45 PM',
      duration: '30 minutes',
      voiceAnalysis: 'Your voice showed fatigue and signs of mental exhaustion.',
      recommendations: [
        { icon: 'Wind', title: 'Restorative Yoga', description: 'Gentle 20-minute yin yoga session' },
        { icon: 'Music', title: 'Sleep Sounds', description: 'Calming nature sounds for better rest' },
        { icon: 'Target', title: 'Early Bedtime', description: 'Aim for 9 PM bedtime to recover energy' }
      ],
      notes: 'Rest and recovery were prioritized to restore your energy levels.'
    }
  },
  {
    date: 'Nov 17',
    mood: 'Happy & Motivated',
    emoji: '😊',
    plan: 'HIIT workout + creative project time',
    completed: true,
    energyLevel: 85,
    details: {
      timeOfDay: '10:00 AM',
      duration: '75 minutes',
      voiceAnalysis: 'Your voice was upbeat and energetic, showing high motivation.',
      recommendations: [
        { icon: 'Zap', title: 'HIIT Workout', description: '30-minute high-intensity interval training' },
        { icon: 'Target', title: 'Creative Project', description: 'Dedicate 2 hours to passion project' },
        { icon: 'Music', title: 'Upbeat Mix', description: 'High-energy playlist to maintain momentum' }
      ],
      notes: 'Excellent day to tackle challenging tasks and creative work.'
    }
  },
  {
    date: 'Nov 16',
    mood: 'Stressed & Scattered',
    emoji: '😰',
    plan: 'Box breathing + task prioritization',
    completed: true,
    energyLevel: 50,
    details: {
      timeOfDay: '3:20 PM',
      duration: '40 minutes',
      voiceAnalysis: 'Your voice indicated stress and a scattered mental state.',
      recommendations: [
        { icon: 'Wind', title: 'Box Breathing', description: '10 minutes of 4-4-4-4 breathing exercise' },
        { icon: 'Target', title: 'Task Prioritization', description: 'Create a focused to-do list with top 3 priorities' },
        { icon: 'Music', title: 'Calming Playlist', description: 'Gentle instrumental to reduce stress' }
      ],
      notes: 'Breathing exercises helped reduce stress and improve clarity.'
    }
  },
];

export function HistoryScreen({ onRerunCheckIn }: HistoryScreenProps) {
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'Zap': return <Zap className="size-5 text-orange-500" />;
      case 'Target': return <Target className="size-5 text-teal-500" />;
      case 'Music': return <Music className="size-5 text-purple-500" />;
      case 'Wind': return <Wind className="size-5 text-cyan-500" />;
      default: return <Zap className="size-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-slate-900 mb-2">Your Journey</h2>
            <p className="text-slate-600">Track your emotional patterns over time</p>
          </div>
          <Button
            onClick={onRerunCheckIn}
            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-2xl px-6"
          >
            <Play className="size-4 mr-2" />
            New Check-In
          </Button>
        </div>

        {/* Mood timeline graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500">
              <TrendingUp className="size-6 text-white" />
            </div>
            <div>
              <h3 className="text-slate-900">Energy Timeline</h3>
              <p className="text-slate-500 text-sm">Last 7 days</p>
            </div>
          </div>
          <MoodGraph />
        </motion.div>

        {/* History cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="size-5 text-slate-600" />
            <h3 className="text-slate-900">Check-In History</h3>
          </div>

          {historyData.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => setSelectedEntry(index)}
              className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{entry.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-slate-900">{entry.mood}</p>
                      {entry.completed && (
                        <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-700 text-xs">
                          Completed
                        </span>
                      )}
                      {!entry.completed && (
                        <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 text-sm mb-2">{entry.date}</p>
                    <p className="text-slate-700 text-sm">{entry.plan}</p>
                  </div>
                </div>

                {/* Energy level indicator */}
                <div className="flex items-center gap-3 md:min-w-32">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-600 text-xs">Energy</span>
                      <span className="text-slate-900 text-sm">{entry.energyLevel}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${entry.energyLevel}%` }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={`h-full rounded-full ${
                          entry.energyLevel > 70
                            ? 'bg-gradient-to-r from-teal-500 to-green-500'
                            : entry.energyLevel > 40
                            ? 'bg-gradient-to-r from-blue-500 to-teal-500'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Modal Popup */}
      <AnimatePresence>
        {selectedEntry !== null && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEntry(null)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-y-auto"
              >
                {/* Close Button */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{historyData[selectedEntry].emoji}</div>
                    <div>
                      <h3 className="text-slate-900 mb-1">{historyData[selectedEntry].mood}</h3>
                      <p className="text-slate-500 text-sm">{historyData[selectedEntry].date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 rounded-xl bg-slate-100/80 hover:bg-slate-200/80 transition-colors"
                  >
                    <X className="size-5 text-slate-600" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-6">
                  {/* Time and Duration */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/50">
                      <Clock className="size-5 text-teal-600" />
                      <div>
                        <p className="text-slate-500 text-xs">Time</p>
                        <p className="text-slate-900 text-sm">{historyData[selectedEntry].details.timeOfDay}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50/50">
                      <Clock className="size-5 text-blue-600" />
                      <div>
                        <p className="text-slate-500 text-xs">Duration</p>
                        <p className="text-slate-900 text-sm">{historyData[selectedEntry].details.duration}</p>
                      </div>
                    </div>
                  </div>

                  {/* Voice Analysis */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Mic className="size-5 text-purple-600" />
                      <h4 className="text-slate-900">Voice Analysis</h4>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {historyData[selectedEntry].details.voiceAnalysis}
                    </p>
                  </div>

                  {/* Energy Level */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/50 to-blue-50/50 border border-teal-100/50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-slate-900">Energy Level</h4>
                      <span className="text-2xl text-slate-900">{historyData[selectedEntry].energyLevel}%</span>
                    </div>
                    <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${historyData[selectedEntry].energyLevel}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          historyData[selectedEntry].energyLevel > 70
                            ? 'bg-gradient-to-r from-teal-500 to-green-500'
                            : historyData[selectedEntry].energyLevel > 40
                            ? 'bg-gradient-to-r from-blue-500 to-teal-500'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-slate-900 mb-4">Personalized Recommendations</h4>
                    <div className="space-y-3">
                      {historyData[selectedEntry].details.recommendations.map((rec, recIndex) => (
                        <motion.div
                          key={recIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: recIndex * 0.1 }}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-2 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50">
                            {getIcon(rec.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-900 mb-1">{rec.title}</p>
                            <p className="text-slate-600 text-sm">{rec.description}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-50/50 to-orange-50/50 border border-yellow-100/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="size-5 text-yellow-600" />
                      <h4 className="text-slate-900">Insight</h4>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {historyData[selectedEntry].details.notes}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}