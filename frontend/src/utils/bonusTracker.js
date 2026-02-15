// Bonus ve Achievement Tracking Sistemi
export class BonusTracker {
  constructor() {
    this.startTime = null;
    this.lastBreakTime = null;
    this.continuousMinutes = 0;
    this.dailyMinutes = 0;
    this.streakDays = 0;
    this.lastStudyDate = null;
  }

  // Çalışma başladığında
  startSession() {
    this.startTime = Date.now();
    this.lastBreakTime = null;
  }

  // Her dakika çağrılacak
  trackMinute() {
    this.continuousMinutes++;
    this.dailyMinutes++;
    
    return this.calculateBonuses();
  }

  // Bonus hesaplama
  calculateBonuses() {
    const bonuses = [];
    
    // 1. Kesintisiz Çalışma Bonusu (2 saat = 120 dakika)
    if (this.continuousMinutes >= 120) {
      bonuses.push({
        type: 'continuous_work',
        name_tr: 'Kesintisiz Çalışma',
        name_en: 'Continuous Work',
        multiplier: 1.20, // +20%
        emoji: '🔥',
        message_tr: '2 saat kesintisiz çalıştın! +20% bonus!',
        message_en: '2 hours of continuous work! +20% bonus!'
      });
    }
    
    // 2. Günlük Hedef (4 saat = 240 dakika)
    if (this.dailyMinutes >= 240) {
      bonuses.push({
        type: 'daily_goal',
        name_tr: 'Günlük Hedef',
        name_en: 'Daily Goal',
        credits: 500,
        emoji: '🎯',
        message_tr: '4 saat tamamlandı! +500 kredi bonus!',
        message_en: '4 hours completed! +500 credits bonus!'
      });
    }
    
    // 3. Haftalık Streak (7 gün üst üste)
    if (this.streakDays >= 7) {
      bonuses.push({
        type: 'weekly_streak',
        name_tr: 'Haftalık Streak',
        name_en: 'Weekly Streak',
        credits: 1000,
        emoji: '⚡',
        message_tr: '7 gün streak! +1000 kredi bonus!',
        message_en: '7 day streak! +1000 credits bonus!'
      });
    }
    
    return bonuses;
  }

  // Mola verildiğinde
  takeBreak() {
    this.lastBreakTime = Date.now();
    this.continuousMinutes = 0; // Reset continuous
  }

  // Gün değiştiğinde streak kontrolü
  checkDailyStreak() {
    const today = new Date().toDateString();
    
    if (this.lastStudyDate) {
      const lastDate = new Date(this.lastStudyDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        // Dün çalışmış, streak devam
        this.streakDays++;
      } else if (lastDate.toDateString() !== today) {
        // Streak kırıldı
        this.streakDays = 0;
      }
    }
    
    this.lastStudyDate = today;
    this.dailyMinutes = 0; // Reset daily
    
    return this.streakDays;
  }

  // Her 15 dakikada motivasyon mesajı
  getMotivationMessage(language = 'tr') {
    const messages_tr = [
      '💪 Harika gidiyorsun! Devam et!',
      '🌟 Odaklandın, tebrikler!',
      '☕ Kısa bir mola verebilirsin',
      '🔥 Muhteşem bir performans!',
      '🎯 Hedefine yaklaşıyorsun!',
      '✨ Sen yaparsın, inanıyorum!',
      '🚀 İlerlemene bak, harika!',
      '💡 Beynin şu an en verimli!',
    ];
    
    const messages_en = [
      '💪 You\'re doing great! Keep going!',
      '🌟 Well focused, congratulations!',
      '☕ You can take a short break',
      '🔥 Excellent performance!',
      '🎯 You\'re getting closer to your goal!',
      '✨ You got this, I believe in you!',
      '🚀 Look at your progress, amazing!',
      '💡 Your brain is at peak efficiency!',
    ];
    
    const messages = language === 'tr' ? messages_tr : messages_en;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // AI Coach önerileri
  getAIAdvice(studyData, language = 'tr') {
    const { minutes, breaksTaken, focusScore } = studyData;
    
    const advice = [];
    
    // Focus score'a göre öneri
    if (focusScore < 0.6) {
      advice.push({
        type: 'focus',
        message_tr: '🎯 Dikkatini daha iyi toplamak için telefonunu uzağa koy.',
        message_en: '🎯 Put your phone away to improve focus.',
        priority: 'high'
      });
    }
    
    // Çalışma süresine göre
    if (minutes > 90 && breaksTaken === 0) {
      advice.push({
        type: 'break',
        message_tr: '☕ 90 dakika oldu! 5-10 dakika mola ver, beynin dinlensin.',
        message_en: '☕ 90 minutes passed! Take a 5-10 minute break.',
        priority: 'high'
      });
    }
    
    // Öğrenme verimliliği
    if (minutes < 25) {
      advice.push({
        type: 'technique',
        message_tr: '📚 Pomodoro tekniği dene: 25 dk çalış, 5 dk mola.',
        message_en: '📚 Try Pomodoro: 25 min work, 5 min break.',
        priority: 'medium'
      });
    }
    
    // Çok uzun çalışma
    if (minutes > 240) {
      advice.push({
        type: 'rest',
        message_tr: '😴 4 saatten fazla çalıştın! Uzun bir mola vermelisin.',
        message_en: '😴 4+ hours of work! You need a longer break.',
        priority: 'high'
      });
    }
    
    return advice.sort((a, b) => 
      a.priority === 'high' ? -1 : b.priority === 'high' ? 1 : 0
    );
  }

  // Kişiselleştirilmiş ders önerileri
  getStudyAdvice(subject, language = 'tr') {
    const adviceMap = {
      math: {
        tr: [
          '📐 Matematik: Formülleri yaz ve tekrar et.',
          '✏️ Her problemi adım adım çöz.',
          '🧮 Bol bol örnek soru çöz.',
        ],
        en: [
          '📐 Math: Write down formulas and review.',
          '✏️ Solve every problem step by step.',
          '🧮 Practice with many example problems.',
        ]
      },
      science: {
        tr: [
          '🔬 Fen: Kavramları anlayarak öğren, ezber değil.',
          '📊 Diyagramlar çiz, görselleştir.',
          '🧪 Deneyleri kafanda canlandır.',
        ],
        en: [
          '🔬 Science: Learn concepts, not memorize.',
          '📊 Draw diagrams, visualize.',
          '🧪 Imagine experiments in your mind.',
        ]
      },
      language: {
        tr: [
          '📚 Dil: Yüksek sesle oku, telaffuz çalış.',
          '✍️ Günlük tut, yazarak pekiştir.',
          '🗣️ Diyalog kur, konuşma pratiği yap.',
        ],
        en: [
          '📚 Language: Read aloud, practice pronunciation.',
          '✍️ Keep a journal, reinforce by writing.',
          '🗣️ Create dialogues, practice speaking.',
        ]
      },
      history: {
        tr: [
          '📖 Tarih: Olayları kronolojik sırala.',
          '🗺️ Haritalarla coğrafi bağlantı kur.',
          '🎭 Hikaye gibi anlat, ezberleme.',
        ],
        en: [
          '📖 History: Order events chronologically.',
          '🗺️ Connect geography with maps.',
          '🎭 Tell like a story, don\'t memorize.',
        ]
      },
      default: {
        tr: [
          '📝 Not al ve özetler çıkar.',
          '🔄 Düzenli tekrar yap (spaced repetition).',
          '❓ Sorular oluştur ve cevapla.',
        ],
        en: [
          '📝 Take notes and create summaries.',
          '🔄 Regular review (spaced repetition).',
          '❓ Create questions and answer them.',
        ]
      }
    };
    
    const subjectKey = subject ? subject.toLowerCase() : 'default';
    const messages = adviceMap[subjectKey] || adviceMap.default;
    return messages[language];
  }

  // Save state
  toJSON() {
    return {
      startTime: this.startTime,
      lastBreakTime: this.lastBreakTime,
      continuousMinutes: this.continuousMinutes,
      dailyMinutes: this.dailyMinutes,
      streakDays: this.streakDays,
      lastStudyDate: this.lastStudyDate,
    };
  }

  // Load state
  fromJSON(data) {
    Object.assign(this, data);
  }
}

// Export singleton instance
export const bonusTracker = new BonusTracker();

// Helper: Her dakika kredi hesaplama
export function calculateMinuteCredits(baseCredits = 10, bonuses = []) {
  let credits = baseCredits;
  
  // Bonusları uygula
  bonuses.forEach(bonus => {
    if (bonus.multiplier) {
      credits *= bonus.multiplier;
    }
  });
  
  return Math.floor(credits);
}

// Helper: Toplam bonus kredileri
export function calculateBonusCredits(bonuses = []) {
  return bonuses.reduce((total, bonus) => {
    return total + (bonus.credits || 0);
  }, 0);
}
