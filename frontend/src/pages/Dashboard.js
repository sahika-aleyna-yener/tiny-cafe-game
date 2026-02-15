import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Square, Plus, Trash2, Coffee, Flame, Volume2, VolumeX, Lock, Calendar, Gift, Sparkles, X, Check, Music, Target, Award, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';
import CafeCharacters from '../components/CafeCharacters';
import MusicPlayer from '../components/MusicPlayer';
import CustomerOrders from '../components/CustomerOrders';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Seasonal themes
const THEMES = {
  sakura: { bg: '/assets/themes/sakura-cafe.jpg', name_tr: 'Sakura Festivali', name_en: 'Sakura Festival' },
  spring: { bg: '/assets/themes/spring-cafe.jpg', name_tr: 'Bahar', name_en: 'Spring' },
  summer: { bg: '/assets/themes/summer-cafe.jpg', name_tr: 'Yaz', name_en: 'Summer' },
  autumn: { bg: '/assets/themes/autumn-cafe.jpg', name_tr: 'Sonbahar', name_en: 'Autumn' },
  winter: { bg: '/assets/themes/winter-cafe.jpg', name_tr: 'Kış', name_en: 'Winter' },
};

const TIMER_MODES = {
  focus: { duration: 25, label_tr: 'Odaklanma', label_en: 'Focus' },
  shortBreak: { duration: 5, label_tr: 'Kısa Mola', label_en: 'Short Break' },
  longBreak: { duration: 15, label_tr: 'Uzun Mola', label_en: 'Long Break' },
};

// Motivational messages
const MOTIVATION_MESSAGES = [
  { tr: 'Harika gidiyorsun! 💪', en: 'You\'re doing great! 💪' },
  { tr: 'Odaklan, başarı yakın! ✨', en: 'Stay focused, success is near! ✨' },
  { tr: 'Her dakika seni güçlendiriyor! 📚', en: 'Every minute makes you stronger! 📚' },
  { tr: 'Sen yapabilirsin! 🎯', en: 'You can do it! 🎯' },
  { tr: 'Kafede en çalışkan sensin! ☕', en: 'You\'re the hardest worker in the cafe! ☕' },
];

export default function Dashboard() {
  const { t, language } = useLanguage();
  const { user, refreshUser } = useAuth();
  
  // Theme state
  const [currentTheme, setCurrentTheme] = useState('sakura');
  
  // Timer state
  const [timerMode, setTimerMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const startTimeRef = useRef(null);
  const [motivationMessage, setMotivationMessage] = useState(null);
  
  // Todos state
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [showTodos, setShowTodos] = useState(false);
  
  // Music state
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  
  // Shop items for sidebar
  const [shopItems, setShopItems] = useState([]);
  
  // Daily quests
  const [dailyQuests, setDailyQuests] = useState([]);
  const [showQuests, setShowQuests] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState({ 
    show: true, 
    message_tr: 'Yeni Mevsim! Bahar Şenliği Başladı! 🌸', 
    message_en: 'New Season! Spring Festival Started! 🌸' 
  });

  // Timer complete handler (defined before useEffect)
  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);
    setShowAdModal(true);
    setAdCountdown(5);
    toast.success(language === 'tr' ? '🎉 Seans tamamlandı! Harika iş!' : '🎉 Session complete! Great job!');
  }, [language]);

  // Fetch initial data
  useEffect(() => {
    fetchTodos();
    fetchShopItems();
    fetchDailyQuests();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, handleTimerComplete]);

  // Motivation messages every 5 minutes while studying
  useEffect(() => {
    if (!isRunning) return;
    
    const showMotivation = () => {
      const msg = MOTIVATION_MESSAGES[Math.floor(Math.random() * MOTIVATION_MESSAGES.length)];
      setMotivationMessage(language === 'tr' ? msg.tr : msg.en);
      setTimeout(() => setMotivationMessage(null), 4000);
    };

    const interval = setInterval(showMotivation, 5 * 60 * 1000); // Every 5 minutes
    return () => clearInterval(interval);
  }, [isRunning, language]);

  // Ad countdown
  useEffect(() => {
    let interval;
    if (showAdModal && adCountdown > 0) {
      interval = setInterval(() => {
        setAdCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showAdModal, adCountdown]);

  const fetchTodos = async () => {
    try {
      const res = await fetch(`${API}/todos`, { credentials: 'include' });
      if (res.ok) setTodos(await res.json());
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  };

  const fetchShopItems = async () => {
    try {
      const res = await fetch(`${API}/shop/items`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const drinks = data.filter(i => i.category === 'drinks').slice(0, 4);
        setShopItems(drinks);
      }
    } catch (err) {
      console.error('Failed to fetch shop items:', err);
    }
  };

  const fetchDailyQuests = async () => {
    try {
      const res = await fetch(`${API}/quests/daily`, { credentials: 'include' });
      if (res.ok) setDailyQuests(await res.json());
    } catch (err) {
      console.error('Failed to fetch quests:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = async () => {
    try {
      const res = await fetch(`${API}/focus/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ duration_minutes: TIMER_MODES[timerMode].duration }),
      });
      if (res.ok) {
        const data = await res.json();
        setSessionId(data.session_id);
        setIsRunning(true);
        startTimeRef.current = Date.now();
        toast.success(language === 'tr' ? 'Çalışma başladı! Başarılar! 🎯' : 'Study started! Good luck! 🎯');
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      toast.error('Failed to start session');
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    
    if (sessionId && startTimeRef.current) {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds >= 10) {
        setShowAdModal(true);
        setAdCountdown(5);
      } else {
        completeSession(false);
      }
    }
  };

  const completeSession = async (doubleCredits = false) => {
    if (!sessionId) return;
    
    const elapsedMinutes = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 60000));
    
    try {
      const res = await fetch(`${API}/focus/end/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ actual_minutes: elapsedMinutes, double_credits: doubleCredits }),
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(`+${data.credits_earned} ${language === 'tr' ? 'Kredi' : 'Credits'}! +${data.xp_earned} XP`);
        await refreshUser();
        await fetchDailyQuests(); // Update quest progress
      }
    } catch (err) {
      console.error('Failed to end session:', err);
    }
    
    setSessionId(null);
    startTimeRef.current = null;
    setTimeLeft(TIMER_MODES[timerMode].duration * 60);
    setShowAdModal(false);
  };

  const handleModeChange = (mode) => {
    if (isRunning) return;
    setTimerMode(mode);
    setTimeLeft(TIMER_MODES[mode].duration * 60);
  };

  // Todo handlers
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      const res = await fetch(`${API}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: newTodo.trim() }),
      });
      
      if (res.ok) {
        const todo = await res.json();
        setTodos(prev => [...prev, todo]);
        setNewTodo('');
      }
    } catch (err) {
      console.error('Failed to add todo:', err);
    }
  };

  const handleToggleTodo = async (todoId, completed) => {
    try {
      await fetch(`${API}/todos/${todoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: !completed }),
      });
      setTodos(prev => prev.map(t => t.todo_id === todoId ? { ...t, completed: !completed } : t));
      
      // Refresh quests if completing a todo
      if (!completed) {
        await fetchDailyQuests();
      }
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await fetch(`${API}/todos/${todoId}`, { method: 'DELETE', credentials: 'include' });
      setTodos(prev => prev.filter(t => t.todo_id !== todoId));
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  const claimQuest = async (questId) => {
    try {
      const res = await fetch(`${API}/quests/claim/${questId}`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        toast.success(`${language === 'tr' ? 'Görev tamamlandı!' : 'Quest completed!'} +${data.credits_earned} 🪙`);
        await refreshUser();
        await fetchDailyQuests();
      }
    } catch (err) {
      console.error('Failed to claim quest:', err);
    }
  };

  const today = new Date();
  const dayNames = language === 'tr' 
    ? ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = language === 'tr'
    ? ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getName = (item) => language === 'tr' ? item.name_tr : item.name_en;
  const getQuestTitle = (quest) => language === 'tr' ? quest.title_tr : quest.title_en;

  const completedQuestsCount = dailyQuests.filter(q => q.completed || q.progress >= q.target).length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{ backgroundImage: `url(${THEMES[currentTheme].bg})` }}
      />
      
      {/* Animated Cafe Characters */}
      <CafeCharacters language={language} isStudying={isRunning} />
      
      {/* Customer Orders System */}
      <CustomerOrders 
        onServeComplete={(result) => {
          // result: { success, credits, customer, drink }
          console.log('Serve complete:', result);
        }}
        userCredits={user?.credits || 0}
        onCreditChange={(amount) => {
          // Local credit update
          if (user) {
            const newCredits = Math.max(0, user.credits + amount);
            setUser({ ...user, credits: newCredits });
          }
        }}
      />
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col pb-20">
        
        {/* Top Bar */}
        <div className="bg-[#8B6B4D]/95 border-b-4 border-[#5D4E37] px-4 py-3 flex items-center justify-between backdrop-blur-sm">
          {/* Start Study Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={isRunning ? handleStopTimer : handleStartTimer}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg border-b-4 transition-all ${
              isRunning 
                ? 'bg-red-500 border-red-700 hover:bg-red-600' 
                : 'bg-[#D4896A] border-[#A66B4F] hover:bg-[#E09A7A]'
            }`}
            style={{ fontFamily: "'Fredoka', sans-serif" }}
            data-testid="start-study-btn"
          >
            {isRunning ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isRunning 
              ? (language === 'tr' ? 'Çalışmayı Bitir' : 'Stop Studying')
              : (language === 'tr' ? 'Ders Çalışmaya Başla' : 'Start Studying')
            }
          </motion.button>

          {/* Credits Display */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 bg-[#F5E6D3] px-4 py-2 rounded-lg border-2 border-[#D4C4A8] shadow-md"
          >
            <span className="text-2xl">🪙</span>
            <span className="text-xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? 'KREDİ' : 'CREDIT'}: {user?.credits || 0}
            </span>
            <span className="text-2xl">🪙</span>
          </motion.div>

          {/* Music Control */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowMusicPlayer(true)}
              className="p-3 bg-[#F5E6D3] rounded-lg border-2 border-[#D4C4A8] hover:bg-[#E8D9C6] transition-colors flex items-center gap-2"
              data-testid="music-btn"
            >
              <Music className="w-5 h-5 text-[#5D4E37]" />
              <span className="text-sm font-semibold text-[#5D4E37] hidden md:block">
                {language === 'tr' ? 'Müzik' : 'Music'}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex">
          {/* Left Side - Content */}
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
            
            {/* Motivation Message */}
            <AnimatePresence>
              {motivationMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className="absolute top-20 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4896A] to-[#E09A7A] text-white px-6 py-3 rounded-xl shadow-xl z-20"
                  style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                  {motivationMessage}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Notification Banner */}
            <AnimatePresence>
              {notification.show && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-[#F5E6D3]/95 rounded-xl border-4 border-[#D4C4A8] p-4 relative shadow-lg backdrop-blur-sm"
                >
                  <button 
                    onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                    className="absolute top-2 right-2 text-[#8B6B4D] hover:text-[#5D4E37]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-[#D4896A]" />
                    <p className="font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      {language === 'tr' ? notification.message_tr : notification.message_en}
                    </p>
                    <Gift className="w-6 h-6 text-[#D4896A]" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer Display */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#F5E6D3]/95 rounded-xl border-4 border-[#D4C4A8] p-6 shadow-lg backdrop-blur-sm"
            >
              {/* Timer Mode Tabs */}
              <div className="flex gap-2 mb-4 justify-center flex-wrap">
                {Object.entries(TIMER_MODES).map(([key, mode]) => (
                  <button
                    key={key}
                    onClick={() => handleModeChange(key)}
                    disabled={isRunning}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all border-b-2 ${
                      timerMode === key
                        ? 'bg-[#D4896A] text-white border-[#A66B4F]'
                        : 'bg-[#E8D9C6] text-[#5D4E37] border-[#D4C4A8] hover:bg-[#DFD0BC]'
                    } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ fontFamily: "'Fredoka', sans-serif" }}
                    data-testid={`timer-mode-${key}`}
                  >
                    {language === 'tr' ? mode.label_tr : mode.label_en}
                  </button>
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                <motion.div 
                  className="text-6xl md:text-7xl font-bold text-[#5D4E37] mb-4"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  animate={isRunning ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  data-testid="timer-display"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <p className="text-[#8B6B4D]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {isRunning 
                    ? (language === 'tr' ? 'Çalışıyorsun! Harika gidiyorsun! 🔥' : "You're studying! Great job! 🔥")
                    : (language === 'tr' ? 'Hadi çalışmaya başlayalım! ☕' : "Let's start studying! ☕")
                  }
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t-2 border-[#D4C4A8] flex-wrap">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-[#5D4E37]">{user?.streak_days || 0}</span>
                  <span className="text-sm text-[#8B6B4D]">{language === 'tr' ? 'Gün' : 'Days'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="font-bold text-[#5D4E37]">Lv.{user?.level || 1}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">⏱️</span>
                  <span className="font-bold text-[#5D4E37]">{user?.total_focus_minutes || 0}</span>
                  <span className="text-sm text-[#8B6B4D]">{language === 'tr' ? 'dk' : 'min'}</span>
                </div>
              </div>
            </motion.div>

            {/* Daily Quests */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowQuests(!showQuests)}
              className="bg-gradient-to-r from-[#D4896A]/95 to-[#E09A7A]/95 rounded-xl border-4 border-[#A66B4F] p-4 shadow-lg text-left hover:from-[#E09A7A]/95 hover:to-[#F0AB8B]/95 transition-all backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-white" />
                  <span className="font-bold text-white text-lg" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {language === 'tr' ? 'Günlük Görevler' : 'Daily Quests'}
                  </span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm text-white">
                    {completedQuestsCount}/{dailyQuests.length}
                  </span>
                </div>
                <ChevronRight className={`w-5 h-5 text-white transition-transform ${showQuests ? 'rotate-90' : ''}`} />
              </div>
            </motion.button>

            {/* Quests Expanded */}
            <AnimatePresence>
              {showQuests && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#F5E6D3]/95 rounded-xl border-4 border-[#D4C4A8] p-4 shadow-lg space-y-3 backdrop-blur-sm"
                >
                  {dailyQuests.map((quest) => {
                    const isComplete = quest.progress >= quest.target;
                    const isClaimed = quest.completed;
                    
                    return (
                      <div
                        key={quest.quest_id}
                        className={`p-3 rounded-xl border-2 ${
                          isClaimed ? 'bg-green-100 border-green-300' : 
                          isComplete ? 'bg-yellow-50 border-yellow-300' : 
                          'bg-white/50 border-[#D4C4A8]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-[#5D4E37]">{getQuestTitle(quest)}</span>
                          <span className="text-sm text-[#8B6B4D]">
                            🪙 {quest.reward_credits} | ✨ {quest.reward_xp} XP
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={(quest.progress / quest.target) * 100} 
                            className="flex-1 h-2"
                          />
                          <span className="text-sm font-semibold text-[#5D4E37] min-w-[60px] text-right">
                            {quest.progress}/{quest.target}
                          </span>
                          {isComplete && !isClaimed && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => claimQuest(quest.quest_id)}
                              className="px-3 py-1 bg-[#D4896A] text-white rounded-lg text-sm font-bold"
                            >
                              {language === 'tr' ? 'Al' : 'Claim'}
                            </motion.button>
                          )}
                          {isClaimed && (
                            <Check className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Todo List Toggle */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setShowTodos(!showTodos)}
              className="bg-[#F5E6D3]/95 rounded-xl border-4 border-[#D4C4A8] p-4 shadow-lg text-left hover:bg-[#EDE0CE]/95 transition-colors backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  📝 {language === 'tr' ? 'Yapılacaklar' : 'To-Do List'} ({todos.filter(t => !t.completed).length})
                </span>
                <span className="text-[#8B6B4D]">{showTodos ? '▲' : '▼'}</span>
              </div>
            </motion.button>

            {/* Todo List Expanded */}
            <AnimatePresence>
              {showTodos && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[#F5E6D3]/95 rounded-xl border-4 border-[#D4C4A8] p-4 shadow-lg backdrop-blur-sm"
                >
                  <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder={language === 'tr' ? 'Yeni görev ekle...' : 'Add new task...'}
                      className="flex-1 px-3 py-2 bg-white/80 border-2 border-[#D4C4A8] rounded-lg text-[#5D4E37] placeholder-[#A89880]"
                      data-testid="todo-input"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#D4896A] text-white rounded-lg border-b-2 border-[#A66B4F] hover:bg-[#E09A7A]"
                      data-testid="add-todo-btn"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </form>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {todos.length === 0 ? (
                      <p className="text-center text-[#8B6B4D] py-4">
                        {language === 'tr' ? 'Henüz görev yok' : 'No tasks yet'}
                      </p>
                    ) : (
                      todos.map((todo) => (
                        <div
                          key={todo.todo_id}
                          className={`flex items-center gap-3 p-2 rounded-lg bg-white/50 ${todo.completed ? 'opacity-60' : ''}`}
                          data-testid={`todo-item-${todo.todo_id}`}
                        >
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={() => handleToggleTodo(todo.todo_id, todo.completed)}
                          />
                          <span className={`flex-1 text-[#5D4E37] ${todo.completed ? 'line-through' : ''}`}>
                            {todo.text}
                          </span>
                          <button
                            onClick={() => handleDeleteTodo(todo.todo_id)}
                            className="p-1 text-[#A89880] hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="w-64 bg-[#8B6B4D]/90 border-l-4 border-[#5D4E37] p-4 flex flex-col gap-4 backdrop-blur-sm hidden md:flex">
            
            {/* Calendar Widget */}
            <div className="bg-[#F5E6D3] rounded-xl border-4 border-[#D4C4A8] overflow-hidden">
              <div className="bg-[#D4896A] px-4 py-2 text-center border-b-2 border-[#A66B4F]">
                <p className="text-xs text-white/80">{monthNames[today.getMonth()].toUpperCase()} {today.getFullYear()}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-4xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {today.getDate()}
                </p>
                <p className="text-sm text-[#8B6B4D]">{dayNames[today.getDay()]}</p>
                <div className="mt-2 pt-2 border-t border-[#D4C4A8]">
                  <p className="text-xs font-bold text-[#D4896A]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {language === 'tr' ? THEMES[currentTheme].name_tr : THEMES[currentTheme].name_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Drinks Menu */}
            <div className="bg-[#F5E6D3] rounded-xl border-4 border-[#D4C4A8] p-4 flex-1">
              <h3 className="font-bold text-[#5D4E37] mb-3 text-center" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                ☕ {language === 'tr' ? 'İÇECEKLER' : 'DRINKS'}
              </h3>
              <div className="space-y-3">
                {shopItems.map((item) => (
                  <div
                    key={item.item_id}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      item.locked ? 'opacity-50' : 'hover:bg-[#E8D9C6] cursor-pointer'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/50">
                      <img 
                        src={item.image_url} 
                        alt={getName(item)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#5D4E37] truncate">{getName(item)}</p>
                      {item.locked ? (
                        <p className="text-xs text-[#A89880] flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Lv.{item.unlock_level}
                        </p>
                      ) : (
                        <p className="text-xs text-[#8B6B4D]">🪙 {item.price}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className="bg-[#F5E6D3] rounded-xl border-4 border-[#D4C4A8] p-3">
              <p className="text-xs font-bold text-[#5D4E37] mb-2 text-center" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                🎨 {language === 'tr' ? 'TEMA' : 'THEME'}
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {Object.keys(THEMES).map((key) => (
                  <button
                    key={key}
                    onClick={() => setCurrentTheme(key)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      currentTheme === key 
                        ? 'border-[#D4896A] ring-2 ring-[#D4896A]' 
                        : 'border-[#D4C4A8] hover:border-[#A89880]'
                    }`}
                    style={{
                      backgroundImage: `url(${THEMES[key].bg})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    title={language === 'tr' ? THEMES[key].name_tr : THEMES[key].name_en}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Music Player Modal */}
      <MusicPlayer 
        isOpen={showMusicPlayer} 
        onClose={() => setShowMusicPlayer(false)}
        userLevel={user?.level || 1}
      />

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            data-testid="ad-modal"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#F5E6D3] rounded-xl border-4 border-[#D4C4A8] p-6 max-w-sm text-center shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-[#5D4E37] mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                🎉 {language === 'tr' ? 'Seans Tamamlandı!' : 'Session Complete!'}
              </h3>
              
              <p className="text-[#8B6B4D] mb-6">
                {language === 'tr' ? 'Reklam izleyerek 2x kredi kazan!' : 'Watch ad to earn 2x credits!'}
              </p>
              
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => completeSession(true)}
                  disabled={adCountdown > 0}
                  className={`px-6 py-3 bg-[#D4896A] text-white rounded-lg font-bold border-b-4 border-[#A66B4F] ${
                    adCountdown > 0 ? 'opacity-50' : 'hover:bg-[#E09A7A]'
                  }`}
                  data-testid="watch-ad-btn"
                >
                  {adCountdown > 0 ? `${adCountdown}s...` : `🪙 2x ${language === 'tr' ? 'Kredi' : 'Credits'}`}
                </motion.button>
                
                <button
                  onClick={() => completeSession(false)}
                  className="px-6 py-2 text-[#8B6B4D] hover:text-[#5D4E37]"
                  data-testid="skip-ad-btn"
                >
                  {language === 'tr' ? 'Geç' : 'Skip'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
