import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, Trophy, Target, Zap, Crown, Medal, CheckCircle } from 'lucide-react';

const ACHIEVEMENTS = [
  {
    id: 'first_study',
    name_tr: 'İlk Adım',
    name_en: 'First Step',
    description_tr: 'İlk çalışma seansını tamamla',
    description_en: 'Complete your first study session',
    icon: '🎯',
    reward_credits: 50,
    requirement: { type: 'sessions_count', value: 1 }
  },
  {
    id: 'study_10_sessions',
    name_tr: 'Kararlı Öğrenci',
    name_en: 'Determined Student',
    description_tr: '10 çalışma seansı tamamla',
    description_en: 'Complete 10 study sessions',
    icon: '📚',
    reward_credits: 200,
    requirement: { type: 'sessions_count', value: 10 }
  },
  {
    id: 'study_50_sessions',
    name_tr: 'Çalışma Ustası',
    name_en: 'Study Master',
    description_tr: '50 çalışma seansı tamamla',
    description_en: 'Complete 50 study sessions',
    icon: '🏆',
    reward_credits: 500,
    requirement: { type: 'sessions_count', value: 50 }
  },
  {
    id: 'streak_3',
    name_tr: '3 Günlük Seri',
    name_en: '3-Day Streak',
    description_tr: '3 gün üst üste çalış',
    description_en: 'Study for 3 days in a row',
    icon: '🔥',
    reward_credits: 150,
    requirement: { type: 'streak', value: 3 }
  },
  {
    id: 'streak_7',
    name_tr: 'Haftalık Seri',
    name_en: 'Weekly Streak',
    description_tr: '7 gün üst üste çalış',
    description_en: 'Study for 7 days in a row',
    icon: '⚡',
    reward_credits: 300,
    requirement: { type: 'streak', value: 7 }
  },
  {
    id: 'streak_30',
    name_tr: 'Aylık Seri',
    name_en: 'Monthly Streak',
    description_tr: '30 gün üst üste çalış',
    description_en: 'Study for 30 days in a row',
    icon: '👑',
    reward_credits: 1000,
    requirement: { type: 'streak', value: 30 }
  },
  {
    id: 'total_60_minutes',
    name_tr: 'Saat Tamamlandı',
    name_en: 'Hour Complete',
    description_tr: 'Toplam 60 dakika çalış',
    description_en: 'Study for 60 minutes total',
    icon: '⏰',
    reward_credits: 100,
    requirement: { type: 'total_minutes', value: 60 }
  },
  {
    id: 'total_600_minutes',
    name_tr: '10 Saat Ustası',
    name_en: '10-Hour Master',
    description_tr: 'Toplam 10 saat çalış',
    description_en: 'Study for 10 hours total',
    icon: '⭐',
    reward_credits: 500,
    requirement: { type: 'total_minutes', value: 600 }
  },
  {
    id: 'level_5',
    name_tr: 'Seviye 5 Kahramanı',
    name_en: 'Level 5 Hero',
    description_tr: 'Seviye 5\'e ulaş',
    description_en: 'Reach level 5',
    icon: '🌟',
    reward_credits: 300,
    requirement: { type: 'level', value: 5 }
  },
  {
    id: 'level_10',
    name_tr: 'Seviye 10 Efsanesi',
    name_en: 'Level 10 Legend',
    description_tr: 'Seviye 10\'a ulaş',
    description_en: 'Reach level 10',
    icon: '💎',
    reward_credits: 800,
    requirement: { type: 'level', value: 10 }
  },
  {
    id: 'buy_5_items',
    name_tr: 'Koleksiyoncu',
    name_en: 'Collector',
    description_tr: '5 ürün satın al',
    description_en: 'Purchase 5 items',
    icon: '🛍️',
    reward_credits: 200,
    requirement: { type: 'items_owned', value: 5 }
  },
  {
    id: 'buy_10_items',
    name_tr: 'Kafe Sahibi',
    name_en: 'Cafe Owner',
    description_tr: '10 ürün satın al',
    description_en: 'Purchase 10 items',
    icon: '☕',
    reward_credits: 400,
    requirement: { type: 'items_owned', value: 10 }
  },
  {
    id: 'serve_10_customers',
    name_tr: 'Yardımsever Barista',
    name_en: 'Helpful Barista',
    description_tr: '10 müşteri servis yap',
    description_en: 'Serve 10 customers',
    icon: '🎪',
    reward_credits: 250,
    requirement: { type: 'customers_served', value: 10 }
  },
  {
    id: 'complete_5_quests',
    name_tr: 'Görev Avcısı',
    name_en: 'Quest Hunter',
    description_tr: '5 günlük görev tamamla',
    description_en: 'Complete 5 daily quests',
    icon: '🎯',
    reward_credits: 300,
    requirement: { type: 'quests_completed', value: 5 }
  }
];

export default function Achievements({ language = 'tr', userStats, onClaimAchievement }) {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showPopup, setShowPopup] = useState(null);

  useEffect(() => {
    if (!userStats) return;

    const checkAchievements = () => {
      ACHIEVEMENTS.forEach(achievement => {
        const isUnlocked = checkRequirement(achievement.requirement, userStats);
        const alreadyClaimed = unlockedAchievements.includes(achievement.id);

        if (isUnlocked && !alreadyClaimed) {
          setUnlockedAchievements(prev => [...prev, achievement.id]);
          setShowPopup(achievement);
          
          setTimeout(() => setShowPopup(null), 5000);
        }
      });
    };

    checkAchievements();
  }, [userStats, unlockedAchievements]);

  const checkRequirement = (requirement, stats) => {
    switch (requirement.type) {
      case 'sessions_count':
        return (stats.total_sessions || 0) >= requirement.value;
      case 'streak':
        return (stats.streak_days || 0) >= requirement.value;
      case 'total_minutes':
        return (stats.total_focus_minutes || 0) >= requirement.value;
      case 'level':
        return (stats.level || 1) >= requirement.value;
      case 'items_owned':
        return (stats.owned_items?.length || 0) >= requirement.value;
      case 'customers_served':
        return (stats.customers_served || 0) >= requirement.value;
      case 'quests_completed':
        return (stats.quests_completed || 0) >= requirement.value;
      default:
        return false;
    }
  };

  const getProgress = (achievement) => {
    if (!userStats) return 0;
    
    const req = achievement.requirement;
    let current = 0;

    switch (req.type) {
      case 'sessions_count':
        current = userStats.total_sessions || 0;
        break;
      case 'streak':
        current = userStats.streak_days || 0;
        break;
      case 'total_minutes':
        current = userStats.total_focus_minutes || 0;
        break;
      case 'level':
        current = userStats.level || 1;
        break;
      case 'items_owned':
        current = userStats.owned_items?.length || 0;
        break;
      case 'customers_served':
        current = userStats.customers_served || 0;
        break;
      case 'quests_completed':
        current = userStats.quests_completed || 0;
        break;
    }

    return Math.min(100, (current / req.value) * 100);
  };

  const handleClaim = (achievement) => {
    if (onClaimAchievement) {
      onClaimAchievement(achievement);
    }
  };

  const getName = (achievement) => language === 'tr' ? achievement.name_tr : achievement.name_en;
  const getDesc = (achievement) => language === 'tr' ? achievement.description_tr : achievement.description_en;

  return (
    <>
      {/* Achievement Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl border-4 border-yellow-700 p-6 shadow-2xl">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ repeat: 3, duration: 0.5 }}
                  className="text-6xl mb-3"
                >
                  {showPopup.icon}
                </motion.div>
                <p className="text-white font-bold text-xl mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {language === 'tr' ? '🎉 Başarım Kazanıldı! 🎉' : '🎉 Achievement Unlocked! 🎉'}
                </p>
                <p className="text-yellow-100 font-bold text-lg mb-1">
                  {getName(showPopup)}
                </p>
                <p className="text-yellow-200 text-sm mb-3">
                  {getDesc(showPopup)}
                </p>
                <div className="bg-yellow-900/30 rounded-lg px-4 py-2 inline-block">
                  <span className="text-white font-bold">+{showPopup.reward_credits} 🪙</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement, index) => {
          const progress = getProgress(achievement);
          const isUnlocked = progress >= 100;
          const isClaimed = unlockedAchievements.includes(achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-[#F5E6D3] rounded-xl border-4 p-4 transition-all ${
                isUnlocked 
                  ? 'border-yellow-500 shadow-lg' 
                  : 'border-[#D4C4A8] opacity-60'
              }`}
            >
              {/* Icon and Status */}
              <div className="flex items-start justify-between mb-3">
                <div className={`text-5xl ${isUnlocked ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                {isClaimed && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
                {isUnlocked && !isClaimed && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClaim(achievement)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm font-bold hover:bg-yellow-600"
                  >
                    {language === 'tr' ? 'Al' : 'Claim'}
                  </motion.button>
                )}
              </div>

              {/* Name and Description */}
              <h3 className="font-bold text-[#5D4E37] mb-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {getName(achievement)}
              </h3>
              <p className="text-xs text-[#8B6B4D] mb-3">
                {getDesc(achievement)}
              </p>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#D4C4A8] rounded-full overflow-hidden mb-2">
                <motion.div
                  className={`h-full ${isUnlocked ? 'bg-yellow-500' : 'bg-[#D4896A]'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Reward */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#8B6B4D]">
                  {progress < 100 ? `${Math.floor(progress)}%` : language === 'tr' ? 'Tamamlandı!' : 'Complete!'}
                </span>
                <span className="font-bold text-[#D4896A]">
                  🪙 {achievement.reward_credits}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
