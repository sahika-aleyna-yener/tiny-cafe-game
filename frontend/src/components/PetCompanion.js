import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Pet activities during focus sessions (Focus Friend style)
const PET_ACTIVITIES = [
  {
    id: 'reading',
    emoji: '📚',
    name_tr: 'Kitap okuyor',
    name_en: 'Reading a book',
    animation: { rotate: [0, -5, 0, 5, 0], scale: [1, 1.05, 1] }
  },
  {
    id: 'drawing',
    emoji: '🎨',
    name_tr: 'Resim çiziyor',
    name_en: 'Drawing',
    animation: { x: [0, -10, 10, -5, 0], rotate: [0, 15, -15, 0] }
  },
  {
    id: 'gaming',
    emoji: '🎮',
    name_tr: 'Oyun oynuyor',
    name_en: 'Playing games',
    animation: { y: [0, -10, 0, -5, 0], scale: [1, 1.1, 1] }
  },
  {
    id: 'sleeping',
    emoji: '😴',
    name_tr: 'Uyuyor',
    name_en: 'Sleeping',
    animation: { scale: [1, 0.95, 1.02, 0.98, 1], opacity: [1, 0.8, 1] }
  },
  {
    id: 'music',
    emoji: '🎵',
    name_tr: 'Müzik dinliyor',
    name_en: 'Listening to music',
    animation: { rotate: [-5, 5, -5, 5, 0], y: [0, -5, 0] }
  },
  {
    id: 'thinking',
    emoji: '🤔',
    name_tr: 'Düşünüyor',
    name_en: 'Thinking',
    animation: { scale: [1, 1.05, 1], rotate: [0, 10, -10, 0] }
  }
];

// Thought bubbles (like Focus Friend's progress feedback)
const THOUGHT_BUBBLES = [
  { tr: 'Sen çalış, ben de çalışıyorum! 📚', en: 'You study, I study too! 📚' },
  { tr: 'Bu kitap çok güzel! 💫', en: 'This book is great! 💫' },
  { tr: 'Çok iyi gidiyorsun! 💪', en: 'You\'re doing great! 💪' },
  { tr: 'Beni bırakma, devam et! ✨', en: 'Don\'t leave me, keep going! ✨' },
  { tr: 'Biraz daha çalışalım mı? 🥺', en: 'Let\'s study a bit more? 🥺' },
  { tr: 'Seninle çalışmak çok eğlenceli! 🎉', en: 'Studying with you is fun! 🎉' },
];

// Sad messages when timer cancelled early (guilt mechanism)
const SAD_MESSAGES = [
  { tr: 'Üzüldüm... neden bıraktın? 😢', en: 'I\'m sad... why did you stop? 😢' },
  { tr: 'Beni yalnız bıraktın... 🥺', en: 'You left me alone... 🥺' },
  { tr: 'Daha bitmedi ki... 😔', en: 'We weren\'t finished yet... 😔' },
  { tr: 'Seninle daha çok çalışmak isterdim... 💔', en: 'I wanted to study more with you... 💔' },
];

export default function PetCompanion({
  selectedPet = null,
  isStudying = false,
  studyDuration = 0, // minutes
  onTimerCancelled = false,
  language = 'tr'
}) {
  const [currentActivity, setCurrentActivity] = useState(null);
  const [showThought, setShowThought] = useState(false);
  const [thoughtText, setThoughtText] = useState('');
  const [showSadness, setShowSadness] = useState(false);

  // Change activity based on study duration
  useEffect(() => {
    if (!isStudying || !selectedPet) {
      setCurrentActivity(null);
      return;
    }

    // Choose activity based on duration
    const selectActivity = () => {
      let activity;
      if (studyDuration < 10) {
        // Short sessions: reading or thinking
        activity = Math.random() > 0.5 
          ? PET_ACTIVITIES.find(a => a.id === 'reading')
          : PET_ACTIVITIES.find(a => a.id === 'thinking');
      } else if (studyDuration < 30) {
        // Medium sessions: drawing, gaming, or music
        const options = PET_ACTIVITIES.filter(a => 
          ['drawing', 'gaming', 'music'].includes(a.id)
        );
        activity = options[Math.floor(Math.random() * options.length)];
      } else {
        // Long sessions: might get sleepy
        if (Math.random() > 0.7) {
          activity = PET_ACTIVITIES.find(a => a.id === 'sleeping');
        } else {
          activity = PET_ACTIVITIES[Math.floor(Math.random() * PET_ACTIVITIES.length)];
        }
      }
      
      setCurrentActivity(activity);
    };

    selectActivity();

    // Change activity every 3-5 minutes
    const activityInterval = setInterval(() => {
      selectActivity();
    }, (3 + Math.random() * 2) * 60 * 1000);

    return () => clearInterval(activityInterval);
  }, [isStudying, studyDuration, selectedPet]);

  // Show encouraging thoughts during study
  useEffect(() => {
    if (!isStudying || !currentActivity) return;

    const showThoughts = () => {
      const bubble = THOUGHT_BUBBLES[Math.floor(Math.random() * THOUGHT_BUBBLES.length)];
      setThoughtText(language === 'tr' ? bubble.tr : bubble.en);
      setShowThought(true);

      // Hide after 4 seconds
      setTimeout(() => setShowThought(false), 4000);
    };

    // First thought after 2 minutes
    const initialTimeout = setTimeout(showThoughts, 2 * 60 * 1000);

    // Then every 5-8 minutes
    const thoughtInterval = setInterval(showThoughts, (5 + Math.random() * 3) * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(thoughtInterval);
    };
  }, [isStudying, currentActivity, language]);

  // Handle timer cancellation (guilt mechanism)
  useEffect(() => {
    if (onTimerCancelled && selectedPet) {
      const sadMessage = SAD_MESSAGES[Math.floor(Math.random() * SAD_MESSAGES.length)];
      setThoughtText(language === 'tr' ? sadMessage.tr : sadMessage.en);
      setShowSadness(true);
      setShowThought(true);

      // Show sadness for 5 seconds
      setTimeout(() => {
        setShowSadness(false);
        setShowThought(false);
      }, 5000);
    }
  }, [onTimerCancelled, selectedPet, language]);

  // Don't render if no pet selected
  if (!selectedPet) return null;

  // Get pet emoji (fallback if no image)
  const petEmoji = selectedPet.emoji || '🐾';

  return (
    <div className="absolute bottom-24 right-8 z-20 pointer-events-none">
      <AnimatePresence>
        {/* Pet with current activity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            ...((isStudying && currentActivity) ? currentActivity.animation : {})
          }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            repeat: isStudying ? Infinity : 0,
            repeatDelay: 1
          }}
          className="relative"
        >
          {/* Pet avatar */}
          <div className={`text-6xl ${showSadness ? 'grayscale' : ''} transition-all duration-300`}>
            {selectedPet.image ? (
              <img
                src={selectedPet.image}
                alt={selectedPet.name}
                className="w-20 h-20 object-contain drop-shadow-lg"
              />
            ) : (
              <span className="drop-shadow-lg">{petEmoji}</span>
            )}
          </div>

          {/* Activity indicator */}
          {isStudying && currentActivity && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute -top-2 -right-2 text-3xl bg-white rounded-full p-1 shadow-lg"
            >
              {currentActivity.emoji}
            </motion.div>
          )}

          {/* Activity label */}
          {isStudying && currentActivity && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-medium text-purple-600 bg-white/80 px-3 py-1 rounded-full shadow-sm"
            >
              {language === 'tr' ? currentActivity.name_tr : currentActivity.name_en}
            </motion.div>
          )}
        </motion.div>

        {/* Thought bubble */}
        {showThought && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className={`absolute -top-20 right-0 max-w-xs px-4 py-2 rounded-2xl shadow-lg text-sm font-medium ${
              showSadness
                ? 'bg-gray-100 text-gray-700 border-2 border-gray-300'
                : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
            }`}
          >
            {thoughtText}
            
            {/* Speech bubble tail */}
            <div
              className={`absolute -bottom-2 right-8 w-4 h-4 rotate-45 ${
                showSadness ? 'bg-gray-100 border-r-2 border-b-2 border-gray-300' : 'bg-pink-100'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
