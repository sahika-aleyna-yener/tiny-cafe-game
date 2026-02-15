import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Coffee, Book, Target, Zap, Lightbulb, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const STUDY_TIPS_TR = [
  { icon: '📚', title: 'Pomodoro Tekniği', description: '25 dakika çalış, 5 dakika mola ver. Beynin için ideal!' },
  { icon: '💧', title: 'Su İç', description: 'Sık sık su içmeyi unutma. Hidrasyon konsantrasyonu artırır.' },
  { icon: '🌿', title: 'Temiz Hava', description: 'Odanı havalandır. Oksijen beynin için hayati önem taşır.' },
  { icon: '🧘', title: 'Derin Nefes Al', description: 'Stresli hissettiğinde 3 derin nefes al.' },
  { icon: '🎵', title: 'Müzik Seç', description: 'Lo-fi veya klasik müzik konsantrasyonu artırabilir.' },
  { icon: '📱', title: 'Telefonu Kapat', description: 'Dikkat dağıtıcıları en aza indir.' },
  { icon: '🎯', title: 'Hedef Belirle', description: 'Her seans için net bir hedef koy.' },
  { icon: '✍️', title: 'Not Al', description: 'Yazarak öğrenme daha kalıcıdır.' },
];

const STUDY_TIPS_EN = [
  { icon: '📚', title: 'Pomodoro Technique', description: 'Study 25 min, break 5 min. Perfect for your brain!' },
  { icon: '💧', title: 'Drink Water', description: 'Stay hydrated. Hydration improves concentration.' },
  { icon: '🌿', title: 'Fresh Air', description: 'Ventilate your room. Oxygen is vital for your brain.' },
  { icon: '🧘', title: 'Deep Breaths', description: 'Take 3 deep breaths when stressed.' },
  { icon: '🎵', title: 'Choose Music', description: 'Lo-fi or classical music can boost focus.' },
  { icon: '📱', title: 'Turn Off Phone', description: 'Minimize distractions.' },
  { icon: '🎯', title: 'Set Goals', description: 'Set a clear goal for each session.' },
  { icon: '✍️', title: 'Take Notes', description: 'Learning by writing is more permanent.' },
];

const SUBJECT_TIPS = {
  mathematics: {
    tr: ['Problemleri adım adım çöz', 'Formülleri not defterine yaz', 'Her gün en az 5 problem çöz'],
    en: ['Solve problems step by step', 'Write formulas in notebook', 'Solve at least 5 problems daily']
  },
  science: {
    tr: ['Deneyleri görselleştir', 'Kavramları kendi kelimelerinle açıkla', 'Akış şemaları oluştur'],
    en: ['Visualize experiments', 'Explain concepts in your own words', 'Create flow charts']
  },
  language: {
    tr: ['Her gün 15 dakika okuma yap', 'Yeni kelimeleri cümlede kullan', 'Sesli tekrar et'],
    en: ['Read 15 minutes daily', 'Use new words in sentences', 'Practice out loud']
  },
  history: {
    tr: ['Zaman çizelgeleri oluştur', 'Olayları hikaye gibi anlat', 'Anahtar tarihleri not et'],
    en: ['Create timelines', 'Tell events like stories', 'Note key dates']
  },
  programming: {
    tr: ['Her gün kod yaz', 'Hataları anlamaya çalış', 'Küçük projeler yap'],
    en: ['Code every day', 'Try to understand errors', 'Build small projects']
  }
};

export default function AIStudyCoach({ 
  language = 'tr', 
  studyMinutes = 0, 
  breakMinutes = 0, 
  currentSubject = null,
  onClose 
}) {
  const [currentTip, setCurrentTip] = useState(null);
  const [showTip, setShowTip] = useState(false);

  const tips = language === 'tr' ? STUDY_TIPS_TR : STUDY_TIPS_EN;

  useEffect(() => {
    // Show random tip every 15 minutes during study
    const interval = setInterval(() => {
      if (studyMinutes > 0 && studyMinutes % 15 === 0) {
        showRandomTip();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [studyMinutes]);

  const showRandomTip = () => {
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    setCurrentTip(randomTip);
    setShowTip(true);
  };

  const getAIRecommendation = () => {
    const recs = [];

    // Study duration recommendation
    if (studyMinutes < 15) {
      recs.push({
        icon: <Clock className="w-5 h-5" />,
        text: language === 'tr' 
          ? '💪 Harika başlangıç! En az 25 dakika çalışmayı hedefle.' 
          : '💪 Great start! Aim for at least 25 minutes.'
      });
    } else if (studyMinutes >= 45) {
      recs.push({
        icon: <Coffee className="w-5 h-5" />,
        text: language === 'tr' 
          ? '☕ Uzun süredir çalışıyorsun. 10 dakika mola zamanı!' 
          : '☕ You\'ve been studying long. Time for a 10-min break!'
      });
    }

    // Break recommendation
    if (breakMinutes >= 15) {
      recs.push({
        icon: <Zap className="w-5 h-5" />,
        text: language === 'tr' 
          ? '⚡ Mola yeterli! Tekrar çalışmaya başla.' 
          : '⚡ Break is enough! Start studying again.'
      });
    }

    // Subject-specific tips
    if (currentSubject && SUBJECT_TIPS[currentSubject]) {
      const subjectTips = SUBJECT_TIPS[currentSubject][language];
      const randomSubjectTip = subjectTips[Math.floor(Math.random() * subjectTips.length)];
      recs.push({
        icon: <Book className="w-5 h-5" />,
        text: `📖 ${randomSubjectTip}`
      });
    }

    // Motivation based on performance
    if (studyMinutes >= 60) {
      recs.push({
        icon: <Target className="w-5 h-5" />,
        text: language === 'tr' 
          ? '🎉 1 saat tamamlandı! Harikasın!' 
          : '🎉 1 hour completed! You\'re amazing!'
      });
    }

    return recs;
  };

  const recommendations = getAIRecommendation();

  return (
    <>
      {/* Floating AI Coach Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={showRandomTip}
        className="fixed bottom-24 right-4 z-30 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-2xl"
      >
        <Brain className="w-6 h-6" />
      </motion.button>

      {/* Recommendations Panel */}
      {recommendations.length > 0 && (
        <div className="fixed top-24 left-4 z-30 space-y-2 max-w-xs">
          {recommendations.map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl p-4 shadow-lg backdrop-blur-sm"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{rec.icon}</div>
                <p className="text-sm flex-1">{rec.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Tip Modal */}
      <AnimatePresence>
        {showTip && currentTip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTip(false)}
          >
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowTip(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-4"
                >
                  {currentTip.icon}
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {currentTip.title}
                </h3>
                <p className="text-white/90 text-lg">
                  {currentTip.description}
                </p>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-6"
                >
                  <button
                    onClick={() => setShowTip(false)}
                    className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold shadow-lg"
                  >
                    {language === 'tr' ? '✨ Anladım!' : '✨ Got it!'}
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
