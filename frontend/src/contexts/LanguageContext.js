import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  tr: {
    // Common
    app_name: "PoncikFocus",
    loading: "Yükleniyor...",
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    confirm: "Onayla",
    close: "Kapat",
    back: "Geri",
    next: "İleri",
    yes: "Evet",
    no: "Hayır",
    
    // Navigation
    nav_dashboard: "Ana Sayfa",
    nav_shop: "Mağaza",
    nav_pets: "Dostlar",
    nav_community: "Topluluk",
    nav_profile: "Profil",
    nav_settings: "Ayarlar",
    
    // Landing
    landing_title: "Merhaba!",
    landing_subtitle: "Birlikte çalışmaya hazır mısın?",
    landing_cta: "Hadi Başlayalım",
    landing_login_google: "Google ile Giriş Yap",
    landing_features_title: "Neler Yapabilirsin?",
    landing_feature_1: "Odaklanma seansları ile kredi kazan",
    landing_feature_2: "Kredilerini tatlılar ve içeceklerle değiştir",
    landing_feature_3: "Arkadaşlarınla yarış ve seri yap",
    landing_feature_4: "Rahatlatıcı müzikler eşliğinde çalış",
    
    // Dashboard
    dashboard_greeting: "Merhaba",
    dashboard_start_focus: "Odaklanmaya Başla",
    dashboard_stop_focus: "Bitir",
    dashboard_pause: "Duraklat",
    dashboard_resume: "Devam Et",
    dashboard_pomodoro: "Pomodoro",
    dashboard_short_break: "Kısa Mola",
    dashboard_long_break: "Uzun Mola",
    dashboard_credits: "Kredi",
    dashboard_level: "Seviye",
    dashboard_streak: "Gün Serisi",
    dashboard_total_time: "Toplam Süre",
    dashboard_minutes: "dakika",
    dashboard_hours: "saat",
    dashboard_watch_ad: "Reklam İzle (2x Kredi)",
    dashboard_ad_bonus: "2x kredi kazandın!",
    
    // Todos
    todos_title: "Yapılacaklar",
    todos_add: "Yeni görev ekle...",
    todos_empty: "Henüz görev yok. Bir tane ekle!",
    todos_completed: "tamamlandı",
    
    // Music
    music_title: "Müzik",
    music_now_playing: "Şimdi Çalıyor",
    music_locked: "Kilitli",
    music_unlock_level: "Seviye {level} gerekli",
    
    // Shop
    shop_title: "Mağaza",
    shop_subtitle: "Kredilerini harca!",
    shop_drinks: "İçecekler",
    shop_treats: "Tatlılar",
    shop_buy: "Satın Al",
    shop_owned: "Sahip",
    shop_locked: "Kilitli",
    shop_not_enough: "Yeterli kredin yok",
    shop_purchase_success: "Satın alma başarılı!",
    shop_unlock_level: "Seviye {level} gerekli",
    
    // Community
    community_title: "Topluluk",
    community_leaderboard: "Liderlik Tablosu",
    community_friends: "Arkadaşlar",
    community_invite: "Arkadaş Davet Et",
    community_invite_bonus: "+25 kredi kazan!",
    community_invite_placeholder: "Arkadaşının e-postası",
    community_invite_success: "Arkadaş eklendi! +25 kredi kazandın!",
    community_no_friends: "Henüz arkadaşın yok. Birilerini davet et!",
    community_focus_minutes: "dk odaklanma",
    
    // Profile
    profile_title: "Profil",
    profile_stats: "İstatistikler",
    profile_badges: "Rozetler",
    profile_total_sessions: "Toplam Seans",
    profile_total_minutes: "Toplam Dakika",
    profile_total_purchases: "Toplam Alışveriş",
    profile_xp_to_next: "Sonraki seviyeye",
    profile_badge_locked: "Henüz kazanılmadı",
    profile_logout: "Çıkış Yap",
    
    // Settings
    settings_title: "Ayarlar",
    settings_language: "Dil",
    settings_theme: "Tema",
    settings_theme_light: "Açık",
    settings_theme_dark: "Koyu",
    settings_notifications: "Bildirimler",
    settings_sound: "Ses Efektleri",
    
    // Timer modes
    timer_focus: "Odaklanma",
    timer_short_break: "Kısa Mola",
    timer_long_break: "Uzun Mola",
    timer_custom: "Özel",
    
    // Session end
    session_complete: "Seans Tamamlandı!",
    session_earned: "Kazandın",
    session_xp: "XP",
    session_level_up: "Seviye Atladın!",
    
    // Mascot messages
    mascot_welcome: "Merhaba! Ben Poncik!",
    mascot_start: "Hadi çalışmaya başlayalım!",
    mascot_working: "Harika gidiyorsun!",
    mascot_break: "Mola zamanı! Biraz dinlen.",
    mascot_complete: "Süpersin! İyi iş çıkardın!",
    mascot_streak: "Vay! {days} günlük seri!",
    mascot_level_up: "Tebrikler! Yeni seviye!",
  },
  en: {
    // Common
    app_name: "PoncikFocus",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    confirm: "Confirm",
    close: "Close",
    back: "Back",
    next: "Next",
    yes: "Yes",
    no: "No",
    
    // Navigation
    nav_dashboard: "Dashboard",
    nav_shop: "Shop",
    nav_community: "Community",
    nav_profile: "Profile",
    nav_settings: "Settings",
    
    // Landing
    landing_title: "Hello!",
    landing_subtitle: "Ready to study together?",
    landing_cta: "Let's Start",
    landing_login_google: "Sign in with Google",
    landing_features_title: "What can you do?",
    landing_feature_1: "Earn credits with focus sessions",
    landing_feature_2: "Exchange credits for treats and drinks",
    landing_feature_3: "Compete with friends and build streaks",
    landing_feature_4: "Study with relaxing music",
    
    // Dashboard
    dashboard_greeting: "Hello",
    dashboard_start_focus: "Start Focus",
    dashboard_stop_focus: "Stop",
    dashboard_pause: "Pause",
    dashboard_resume: "Resume",
    dashboard_pomodoro: "Pomodoro",
    dashboard_short_break: "Short Break",
    dashboard_long_break: "Long Break",
    dashboard_credits: "Credits",
    dashboard_level: "Level",
    dashboard_streak: "Day Streak",
    dashboard_total_time: "Total Time",
    dashboard_minutes: "minutes",
    dashboard_hours: "hours",
    dashboard_watch_ad: "Watch Ad (2x Credits)",
    dashboard_ad_bonus: "You earned 2x credits!",
    
    // Todos
    todos_title: "To-Do List",
    todos_add: "Add new task...",
    todos_empty: "No tasks yet. Add one!",
    todos_completed: "completed",
    
    // Music
    music_title: "Music",
    music_now_playing: "Now Playing",
    music_locked: "Locked",
    music_unlock_level: "Level {level} required",
    
    // Shop
    shop_title: "Shop",
    shop_subtitle: "Spend your credits!",
    shop_drinks: "Drinks",
    shop_treats: "Treats",
    shop_buy: "Buy",
    shop_owned: "Owned",
    shop_locked: "Locked",
    shop_not_enough: "Not enough credits",
    shop_purchase_success: "Purchase successful!",
    shop_unlock_level: "Level {level} required",
    
    // Community
    community_title: "Community",
    community_leaderboard: "Leaderboard",
    community_friends: "Friends",
    community_invite: "Invite Friend",
    community_invite_bonus: "Earn +25 credits!",
    community_invite_placeholder: "Friend's email",
    community_invite_success: "Friend added! You earned +25 credits!",
    community_no_friends: "No friends yet. Invite someone!",
    community_focus_minutes: "min focused",
    
    // Profile
    profile_title: "Profile",
    profile_stats: "Statistics",
    profile_badges: "Badges",
    profile_total_sessions: "Total Sessions",
    profile_total_minutes: "Total Minutes",
    profile_total_purchases: "Total Purchases",
    profile_xp_to_next: "XP to next level",
    profile_badge_locked: "Not yet earned",
    profile_logout: "Logout",
    
    // Settings
    settings_title: "Settings",
    settings_language: "Language",
    settings_theme: "Theme",
    settings_theme_light: "Light",
    settings_theme_dark: "Dark",
    settings_notifications: "Notifications",
    settings_sound: "Sound Effects",
    
    // Timer modes
    timer_focus: "Focus",
    timer_short_break: "Short Break",
    timer_long_break: "Long Break",
    timer_custom: "Custom",
    
    // Session end
    session_complete: "Session Complete!",
    session_earned: "You earned",
    session_xp: "XP",
    session_level_up: "Level Up!",
    
    // Mascot messages
    mascot_welcome: "Hello! I'm Poncik!",
    mascot_start: "Let's start studying!",
    mascot_working: "You're doing great!",
    mascot_break: "Break time! Take a rest.",
    mascot_complete: "Awesome! Great job!",
    mascot_streak: "Wow! {days} day streak!",
    mascot_level_up: "Congratulations! New level!",
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('poncik_language');
    return saved || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('poncik_language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['en'][key] || key;
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });
    return text;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
