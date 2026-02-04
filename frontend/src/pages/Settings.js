import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Globe, Sun, Moon, Bell, Volume2 } from 'lucide-react';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { refreshUser } = useAuth();

  const handleLanguageChange = async (lang) => {
    setLanguage(lang);
    try {
      await fetch(`${API}/user/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ language: lang }),
      });
      await refreshUser();
      toast.success(lang === 'tr' ? 'Dil değiştirildi!' : 'Language changed!');
    } catch (err) {
      console.error('Failed to update language:', err);
    }
  };

  const handleThemeChange = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    toggleTheme();
    try {
      await fetch(`${API}/user/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ active_theme: newTheme }),
      });
      await refreshUser();
    } catch (err) {
      console.error('Failed to update theme:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <SettingsIcon className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl font-bold text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {t('settings_title')}
          </h1>
        </motion.div>

        <div className="space-y-6">
          {/* Language Setting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="cozy-card"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Globe className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--text-main)]">{t('settings_language')}</h2>
                <p className="text-sm text-[var(--text-muted)]">Choose your preferred language</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange('tr')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  language === 'tr'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--surface-highlight)] text-[var(--text-muted)]'
                }`}
                data-testid="lang-tr-btn"
              >
                Türkçe
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleLanguageChange('en')}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-[var(--surface-highlight)] text-[var(--text-muted)]'
                }`}
                data-testid="lang-en-btn"
              >
                English
              </motion.button>
            </div>
          </motion.div>

          {/* Theme Setting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="cozy-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  {theme === 'light' ? (
                    <Sun className="w-6 h-6 text-yellow-500" />
                  ) : (
                    <Moon className="w-6 h-6 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-[var(--text-main)]">{t('settings_theme')}</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    {theme === 'light' ? t('settings_theme_light') : t('settings_theme_dark')}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
                data-testid="theme-toggle"
              />
            </div>
          </motion.div>

          {/* Notifications Setting */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="cozy-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="font-bold text-[var(--text-main)]">{t('settings_notifications')}</h2>
                  <p className="text-sm text-[var(--text-muted)]">Enable push notifications</p>
                </div>
              </div>
              <Switch defaultChecked data-testid="notifications-toggle" />
            </div>
          </motion.div>

          {/* Sound Effects */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="cozy-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="font-bold text-[var(--text-main)]">{t('settings_sound')}</h2>
                  <p className="text-sm text-[var(--text-muted)]">Play sound effects</p>
                </div>
              </div>
              <Switch defaultChecked data-testid="sound-toggle" />
            </div>
          </motion.div>
        </div>

        {/* Version */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[var(--text-muted)] text-sm mt-12"
        >
          PoncikFocus v1.0.0
        </motion.p>
      </div>
    </div>
  );
}
