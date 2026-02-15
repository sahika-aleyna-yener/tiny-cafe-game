import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, Clock, Users, Music, Sparkles } from 'lucide-react';

const features = [
  { icon: Clock, key: 'landing_feature_1', emoji: '⏰' },
  { icon: Coffee, key: 'landing_feature_2', emoji: '☕' },
  { icon: Users, key: 'landing_feature_3', emoji: '👥' },
  { icon: Music, key: 'landing_feature_4', emoji: '🎵' },
];

export default function Landing() {
  const { t, language, toggleLanguage } = useLanguage();
  const { login, setUser } = useAuth();
  const navigate = useNavigate();
  
  const handleTestLogin = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(`${BACKEND_URL}/api/auth/test-login`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (res.ok) {
        const userData = await res.json();
        setUser(userData); // Set user in context
        // Store in localStorage as backup
        localStorage.setItem('poncik_user', JSON.stringify(userData));
        // Navigate to dashboard with state
        navigate('/dashboard', { state: { user: userData }, replace: true });
      } else {
        alert('Test login failed. Make sure backend is running!');
      }
    } catch (err) {
      console.error('Test login error:', err);
      alert('Backend connection failed. Is the server running?');
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url(/assets/themes/sakura-cafe.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        imageRendering: 'auto'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />

      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 rounded-lg bg-[#F5E6D3] text-[#5D4E37] font-bold text-sm shadow-lg border-2 border-[#D4C4A8] hover:bg-[#E8D9C6] transition-colors"
          style={{ fontFamily: "'Fredoka', sans-serif" }}
          data-testid="language-toggle"
        >
          {language === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
        </button>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-[#F5E6D3]/95 rounded-2xl border-4 border-[#D4C4A8] shadow-2xl p-8 md:p-12 text-center max-w-lg w-full"
        >
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-[#D4896A] px-6 py-3 rounded-xl border-b-4 border-[#A66B4F] mb-4">
              <span className="text-3xl">☕</span>
              <h1 
                className="text-2xl md:text-3xl font-bold text-white"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                PoncikFocus
              </h1>
              <span className="text-3xl">📚</span>
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 
              className="text-4xl md:text-5xl font-bold text-[#5D4E37] mb-3"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              {t('landing_title')}
            </h2>
            <p className="text-lg text-[#8B6B4D] mb-8">
              {t('landing_subtitle')}
            </p>
          </motion.div>

          {/* Mascot Area */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.5 }}
            className="mb-8"
          >
            <div className="inline-block relative">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="text-8xl"
              >
                🐻
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-2 -right-2 bg-[#81C784] text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                Poncik
              </motion.div>
            </div>
          </motion.div>

          {/* Test Login Button (Development) */}
          <motion.button
            onClick={handleTestLogin}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#81C784] text-white text-lg font-bold rounded-xl border-b-4 border-[#5FA463] hover:bg-[#91D794] transition-colors shadow-lg mb-3"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
            data-testid="test-login-btn"
          >
            <span className="text-2xl">🧪</span>
            {language === 'tr' ? 'Test Girişi (Geliştirme)' : 'Test Login (Dev)'}
          </motion.button>

          {/* Google Login Button */}
          <motion.button
            onClick={login}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#D4896A] text-white text-lg font-bold rounded-xl border-b-4 border-[#A66B4F] hover:bg-[#E09A7A] transition-colors shadow-lg"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 w-full max-w-2xl"
        >
          <h3 
            className="text-xl font-bold text-white text-center mb-4 drop-shadow-lg"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            ✨ {t('landing_features_title')} ✨
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="bg-[#F5E6D3]/90 rounded-xl border-2 border-[#D4C4A8] p-4 flex items-center gap-3"
              >
                <span className="text-2xl">{feature.emoji}</span>
                <p className="text-sm text-[#5D4E37] font-medium">
                  {t(feature.key)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center"
        >
          <p className="text-white/80 text-sm drop-shadow">
            {language === 'tr' ? 'Senin rahat çalışma arkadaşın' : 'Your cozy study companion'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
