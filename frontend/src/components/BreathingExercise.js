import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wind, Heart, Circle } from 'lucide-react';

// Breathing exercises
const BREATHING_PATTERNS = [
  {
    id: 'box',
    name_tr: '4-4-4-4 (Kutu Nefes)',
    name_en: '4-4-4-4 (Box Breathing)',
    icon: '⬜',
    description_tr: 'Stres azaltma için harika. Strateji: İç çek 4sn, Tut 4sn, Ver 4sn, Tut 4sn',
    description_en: 'Great for stress reduction. Breathe in 4s, Hold 4s, Out 4s, Hold 4s',
    phases: [
      { type: 'inhale', duration: 4, text_tr: 'İçeri Çek', text_en: 'Breathe In' },
      { type: 'hold', duration: 4, text_tr: 'Tut', text_en: 'Hold' },
      { type: 'exhale', duration: 4, text_tr: 'Dışarı Ver', text_en: 'Breathe Out' },
      { type: 'hold', duration: 4, text_tr: 'Tut', text_en: 'Hold' }
    ]
  },
  {
    id: '478',
    name_tr: '4-7-8 (Rahatlatıcı)',
    name_en: '4-7-8 (Relaxing)',
    icon: '💤',
    description_tr: 'Uyku ve sakinleşme için mükemmel. İç çek 4sn, Tut 7sn, Ver 8sn',
    description_en: 'Perfect for sleep and calmness. In 4s, Hold 7s, Out 8s',
    phases: [
      { type: 'inhale', duration: 4, text_tr: 'İçeri Çek', text_en: 'Breathe In' },
      { type: 'hold', duration: 7, text_tr: 'Tut', text_en: 'Hold' },
      { type: 'exhale', duration: 8, text_tr: 'Dışarı Ver', text_en: 'Breathe Out' }
    ]
  },
  {
    id: 'energizing',
    name_tr: '4-0-4 (Enerji)',
    name_en: '4-0-4 (Energizing)',
    icon: '⚡',
    description_tr: 'Enerji ve odaklanma için. İç çek 4sn, Hemen ver 4sn',
    description_en: 'For energy and focus. In 4s, Out 4s immediately',
    phases: [
      { type: 'inhale', duration: 4, text_tr: 'İçeri Çek', text_en: 'Breathe In' },
      { type: 'exhale', duration: 4, text_tr: 'Dışarı Ver', text_en: 'Breathe Out' }
    ]
  },
  {
    id: 'deep',
    name_tr: '6-6-6 (Derin)',
    name_en: '6-6-6 (Deep)',
    icon: '🧘',
    description_tr: 'Derin rahatlatma ve meditasyon için. İç çek 6sn, Tut 6sn, Ver 6sn',
    description_en: 'For deep relaxation and meditation. In 6s, Hold 6s, Out 6s',
    phases: [
      { type: 'inhale', duration: 6, text_tr: 'İçeri Çek', text_en: 'Breathe In' },
      { type: 'hold', duration: 6, text_tr: 'Tut', text_en: 'Hold' },
      { type: 'exhale', duration: 6, text_tr: 'Dışarı Ver', text_en: 'Breathe Out' }
    ]
  }
];

// Phase colors
const PHASE_COLORS = {
  inhale: {
    bg: 'from-blue-400 to-cyan-400',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-600'
  },
  hold: {
    bg: 'from-yellow-400 to-amber-400',
    glow: 'shadow-yellow-500/50',
    text: 'text-yellow-600'
  },
  exhale: {
    bg: 'from-purple-400 to-pink-400',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-600'
  }
};

export default function BreathingExercise({
  isOpen = false,
  onClose,
  language = 'tr'
}) {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      setSelectedPattern(null);
      setCurrentPhaseIndex(0);
      setCycleCount(0);
    }
  }, [isOpen]);

  // Breathing cycle logic
  useEffect(() => {
    if (!isActive || !selectedPattern) return;

    const phases = selectedPattern.phases;
    const currentPhase = phases[currentPhaseIndex];
    setCountdown(currentPhase.duration);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Move to next phase
          clearInterval(interval);
          const nextIndex = (currentPhaseIndex + 1) % phases.length;
          
          if (nextIndex === 0) {
            // Completed one cycle
            setCycleCount((c) => c + 1);
          }
          
          setCurrentPhaseIndex(nextIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, selectedPattern, currentPhaseIndex]);

  const handleStart = (pattern) => {
    setSelectedPattern(pattern);
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setCycleCount(0);
  };

  const handleStop = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setCycleCount(0);
  };

  const currentPhase = selectedPattern?.phases[currentPhaseIndex];
  const phaseColors = currentPhase ? PHASE_COLORS[currentPhase.type] : PHASE_COLORS.inhale;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? '🌬️ Nefes Egzersizi' : '🌬️ Breathing Exercise'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {!isActive ? (
              <>
                {/* Description */}
                <p className="text-gray-600 mb-6 text-center">
                  {language === 'tr'
                    ? 'Stresini azalt, odaklanmanı artır ve sakinleş. Bir teknik seç ve başla! 🧘‍♀️'
                    : 'Reduce stress, increase focus, and calm down. Choose a technique and start! 🧘‍♀️'}
                </p>

                {/* Pattern Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BREATHING_PATTERNS.map((pattern) => (
                    <motion.button
                      key={pattern.id}
                      onClick={() => handleStart(pattern)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all text-left"
                    >
                      {/* Icon */}
                      <div className="text-4xl mb-3">{pattern.icon}</div>

                      {/* Name */}
                      <h3 className="font-bold text-lg text-gray-800 mb-2">
                        {language === 'tr' ? pattern.name_tr : pattern.name_en}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600">
                        {language === 'tr' ? pattern.description_tr : pattern.description_en}
                      </p>

                      {/* Start indicator */}
                      <div className="absolute top-4 right-4">
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-full">
                          <Wind className="w-5 h-5" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Tips */}
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-2">
                    💡 {language === 'tr' ? 'İpuçları' : 'Tips'}
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• {language === 'tr' ? 'Rahat bir pozisyonda otur' : 'Sit in a comfortable position'}</li>
                    <li>• {language === 'tr' ? 'Gözlerini kapat veya sabit bir noktaya bak' : 'Close your eyes or focus on one point'}</li>
                    <li>• {language === 'tr' ? 'Burnundan nefes al, ağzından ver' : 'Breathe through nose, out through mouth'}</li>
                    <li>• {language === 'tr' ? 'En az 5-10 döngü yap' : 'Do at least 5-10 cycles'}</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* Active Breathing Session */}
                <div className="text-center">
                  {/* Pattern Name */}
                  <h3 className="text-xl font-bold text-gray-800 mb-6">
                    {language === 'tr' ? selectedPattern.name_tr : selectedPattern.name_en}
                  </h3>

                  {/* Breathing Circle Animation */}
                  <div className="relative flex items-center justify-center mb-8">
                    <motion.div
                      animate={{
                        scale: currentPhase?.type === 'inhale' ? [1, 1.5] : currentPhase?.type === 'exhale' ? [1.5, 1] : [1, 1],
                        opacity: [0.8, 1]
                      }}
                      transition={{
                        duration: currentPhase?.duration || 4,
                        ease: 'easeInOut'
                      }}
                      className={`w-64 h-64 rounded-full bg-gradient-to-br ${phaseColors.bg} ${phaseColors.glow} shadow-2xl flex items-center justify-center`}
                    >
                      <div className="text-center">
                        {/* Countdown */}
                        <motion.div
                          key={countdown}
                          initial={{ scale: 1.2, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-7xl font-bold text-white mb-2"
                        >
                          {countdown}
                        </motion.div>

                        {/* Phase Text */}
                        <div className="text-xl font-bold text-white">
                          {language === 'tr' ? currentPhase?.text_tr : currentPhase?.text_en}
                        </div>
                      </div>
                    </motion.div>

                    {/* Outer Ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                      className="absolute w-80 h-80 rounded-full border-4 border-dashed border-purple-300 opacity-30"
                    />
                  </div>

                  {/* Cycle Counter */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Circle className="w-5 h-5 text-purple-500" />
                    <span className="text-lg font-semibold text-gray-700">
                      {language === 'tr' ? 'Döngü' : 'Cycle'}: {cycleCount}
                    </span>
                  </div>

                  {/* Progress Dots */}
                  <div className="flex justify-center gap-2 mb-8">
                    {selectedPattern.phases.map((phase, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          scale: index === currentPhaseIndex ? [1, 1.3, 1] : 1,
                          opacity: index === currentPhaseIndex ? 1 : 0.3
                        }}
                        transition={{ duration: 0.5 }}
                        className={`w-3 h-3 rounded-full ${
                          index === currentPhaseIndex
                            ? `bg-gradient-to-r ${PHASE_COLORS[phase.type].bg}`
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Stop Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStop}
                    className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {language === 'tr' ? '⏸️ Durdur' : '⏸️ Stop'}
                  </motion.button>

                  {/* Encouragement */}
                  {cycleCount >= 5 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border-2 border-green-300"
                    >
                      <p className="text-green-700 font-semibold">
                        {language === 'tr'
                          ? '🎉 Harika! 5+ döngü tamamladın. Kendini daha sakin hissediyor musun?'
                          : '🎉 Great! You completed 5+ cycles. Feeling calmer?'}
                      </p>
                    </motion.div>
                  )}
                </div>
              </>
            )}

            {/* Close button (when not active) */}
            {!isActive && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                {language === 'tr' ? 'Kapat' : 'Close'}
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
