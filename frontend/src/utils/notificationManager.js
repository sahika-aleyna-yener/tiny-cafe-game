// Bildirim ve Motivasyon Sistemi
import { toast } from 'sonner';

export class NotificationManager {
  constructor() {
    this.lastNotification = Date.now();
    this.interval = 15 * 60 * 1000; // 15 dakika
    this.enabled = true;
    this.timerId = null;
  }

  // Bildirimleri başlat
  start(language = 'tr', bonusTracker) {
    if (!this.enabled) return;
    
    this.stop(); // Öncekini durdur
    
    this.timerId = setInterval(() => {
      if (this.enabled) {
        const message = bonusTracker.getMotivationMessage(language);
        this.showMotivation(message);
      }
    }, this.interval);
  }

  // Durdur
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  // Motivasyon göster
  showMotivation(message) {
    toast.info(message, {
      duration: 5000,
      position: 'top-center',
      icon: '✨'
    });
  }

  // Event bildirimi (müşteri geldi, hedef tamamlandı, vb.)
  showEvent(event, language = 'tr') {
    const { type, data } = event;
    
    switch (type) {
      case 'customer_arrived':
        toast.info(
          language === 'tr'
            ? `${data.customer.name_tr} geldi! ${data.customer.emoji}`
            : `${data.customer.name_en} arrived! ${data.customer.emoji}`,
          { duration: 4000, icon: '👋' }
        );
        break;
        
      case 'customer_left':
        toast.error(
          language === 'tr'
            ? `${data.customer.name_tr} bekledi ve gitti... 😔`
            : `${data.customer.name_en} left... 😔`,
          { duration: 3000 }
        );
        break;
        
      case 'order_complete':
        toast.success(
          language === 'tr'
            ? `🎉 Harika servis! +${data.credits} kredi!`
            : `🎉 Great service! +${data.credits} credits!`,
          { duration: 4000 }
        );
        break;
        
      case 'bonus_unlocked':
        toast.success(
          language === 'tr'
            ? `${data.bonus.emoji} ${data.bonus.name_tr} açıldı!`
            : `${data.bonus.emoji} ${data.bonus.name_en} unlocked!`,
          { duration: 5000, icon: '🎁' }
        );
        break;
        
      case 'daily_goal':
        toast.success(
          language === 'tr'
            ? '🎯 Günlük hedef tamamlandı! +500 kredi!'
            : '🎯 Daily goal completed! +500 credits!',
          { duration: 6000 }
        );
        this.playSound('achievement');
        break;
        
      case 'weekly_streak':
        toast.success(
          language === 'tr'
            ? '⚡ 7 günlük streak! +1000 kredi!'
            : '⚡ 7 day streak! +1000 credits!',
          { duration: 6000 }
        );
        this.playSound('achievement');
        break;
        
      case 'level_up':
        toast.success(
          language === 'tr'
            ? `🎊 Level ${data.newLevel}! Tebrikler!`
            : `🎊 Level ${data.newLevel}! Congratulations!`,
          { duration: 5000 }
        );
        this.playSound('levelup');
        break;
        
      case 'item_purchased':
        toast.success(
          language === 'tr'
            ? `🛍️ ${data.item.name_tr} satın alındı!`
            : `🛍️ ${data.item.name_en} purchased!`,
          { duration: 3000 }
        );
        this.playSound('purchase');
        break;
        
      default:
        console.log('Unknown event type:', type);
    }
  }

  // Ses çal (şu an için placeholder)
  playSound(soundType) {
    // TODO: Actual sound playing
    console.log(`🔊 Playing sound: ${soundType}`);
  }

  // Bildirimleri etkinleştir/devre dışı bırak
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  // Browser notification permission
  async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Browser notification göster
  showBrowserNotification(title, body, icon = '/logo.png') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon });
    }
  }
}

// Ses Sistemi
export class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
    this.musicVolume = 0.3;
    this.currentMusic = null;
  }

  // Ses yükle
  loadSound(name, url) {
    const audio = new Audio(url);
    audio.volume = this.volume;
    this.sounds[name] = audio;
  }

  // Ses çal
  play(name) {
    if (!this.enabled || !this.sounds[name]) return;
    
    const sound = this.sounds[name].cloneNode();
    sound.volume = this.volume;
    sound.play().catch(err => console.log('Sound play error:', err));
  }

  // Müzik çal (loop)
  playMusic(url) {
    if (!this.enabled) return;
    
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
    
    this.currentMusic = new Audio(url);
    this.currentMusic.volume = this.musicVolume;
    this.currentMusic.loop = true;
    this.currentMusic.play().catch(err => console.log('Music play error:', err));
  }

  // Müzik durdur
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  // Volume ayarla
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.volume;
    });
  }

  // Müzik volume ayarla
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
  }

  // Sesleri etkinleştir/kapat
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    }
    return this.enabled;
  }

  // Placeholder ses URL'leri
  initDefaultSounds() {
    // Gerçek ses dosyaları eklenene kadar placeholder
    const soundUrls = {
      coffee_pour: '/sounds/coffee_pour.mp3',
      bell: '/sounds/bell.mp3',
      success: '/sounds/success.mp3',
      purchase: '/sounds/purchase.mp3',
      achievement: '/sounds/achievement.mp3',
      levelup: '/sounds/levelup.mp3',
      click: '/sounds/click.mp3',
      whoosh: '/sounds/whoosh.mp3',
    };
    
    // Sesler varsa yükle
    Object.entries(soundUrls).forEach(([name, url]) => {
      this.loadSound(name, url);
    });
  }
}

// Singleton instances
export const notificationManager = new NotificationManager();
export const soundManager = new SoundManager();

// Initialize
soundManager.initDefaultSounds();

// Helper: Show quick toast
export function showToast(message, type = 'info', duration = 3000) {
  const toastFn = toast[type] || toast.info;
  toastFn(message, { duration });
}

// Helper: Show achievement toast
export function showAchievement(title, description, emoji = '🏆') {
  toast.success(`${emoji} ${title}`, {
    description,
    duration: 5000,
    position: 'top-center',
  });
  soundManager.play('achievement');
}
