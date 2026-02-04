import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, Clock, Users, Music } from 'lucide-react';

const MASCOT_IMAGE = "/assets/pets/poncik-bear.jpg";

const features = [
  { icon: Clock, key: 'landing_feature_1' },
  { icon: Coffee, key: 'landing_feature_2' },
  { icon: Users, key: 'landing_feature_3' },
  { icon: Music, key: 'landing_feature_4' },
];

export default function Landing() {
  const { t, language, toggleLanguage } = useLanguage();
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)] grain-overlay overflow-hidden">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 rounded-full bg-[var(--surface)] text-[var(--text-main)] font-semibold text-sm shadow-md hover:shadow-lg transition-shadow"
          data-testid="language-toggle"
        >
          {language === 'tr' ? 'EN' : 'TR'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Mascot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mb-8 inline-block"
          >
            <div className="relative">
              <motion.img
                src={MASCOT_IMAGE}
                alt="Poncik"
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[var(--surface)] shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 bg-[var(--secondary)] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg"
              >
                Poncik
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-6xl font-bold text-[var(--text-main)] mb-4"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            {t('landing_title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-[var(--text-muted)] mb-8"
          >
            {t('landing_subtitle')}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            onClick={login}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3"
            data-testid="login-google-btn"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('landing_login_google')}
          </motion.button>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-center text-[var(--text-main)] mb-8" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {t('landing_features_title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="cozy-card flex items-center gap-4 cursor-default"
              >
                <div className="w-14 h-14 rounded-2xl bg-[var(--primary)] bg-opacity-10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-[var(--primary)]" />
                </div>
                <p className="text-[var(--text-main)] font-medium">
                  {t(feature.key)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* App name footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-16"
        >
          <p className="text-3xl font-bold text-[var(--primary)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {t('app_name')}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-2">
            Your cozy study companion
          </p>
        </motion.div>
      </div>
    </div>
  );
}
