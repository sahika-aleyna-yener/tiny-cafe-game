import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, Square, Plus, Trash2, Check, Coffee, Flame, Star, Volume2, VolumeX, SkipForward, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';
import { Progress } from '../components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MASCOT_IMAGE = "/assets/pets/poncik-bear.jpg";

const TIMER_MODES = {
  focus: { duration: 25, label: 'timer_focus' },
  shortBreak: { duration: 5, label: 'timer_short_break' },
  longBreak: { duration: 15, label: 'timer_long_break' },
};

export default function Dashboard() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  
  // Timer state
  const [timerMode, setTimerMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_MODES.focus.duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const startTimeRef = useRef(null);
  
  // Todos state
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  
  // Music state
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);
  
  // Mascot state
  const [mascotMessage, setMascotMessage] = useState('mascot_welcome');

  // Fetch initial data
  useEffect(() => {
    fetchTodos();
    fetchTracks();
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
  }, [isRunning, timeLeft]);

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
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      }
    } catch (err) {
      console.error('Failed to fetch todos:', err);
    }
  };

  const fetchTracks = async () => {
    try {
      const res = await fetch(`${API}/music/tracks`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
        const unlockedTrack = data.find(t => !t.locked);
        if (unlockedTrack) setCurrentTrack(unlockedTrack);
      }
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
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
        setMascotMessage('mascot_start');
        
        if (currentTrack && !currentTrack.locked) {
          audioRef.current?.play();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Failed to start session:', err);
      toast.error('Failed to start session');
    }
  };

  const handleStopTimer = () => {
    setIsRunning(false);
    audioRef.current?.pause();
    setIsPlaying(false);
    
    if (sessionId && startTimeRef.current) {
      // Show ad modal even for short sessions (at least 10 seconds)
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds >= 10) {
        setShowAdModal(true);
        setAdCountdown(5);
      } else {
        // If less than 10 seconds, complete without ad offer
        completeSession(false);
      }
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    audioRef.current?.pause();
    setIsPlaying(false);
    setMascotMessage('mascot_complete');
    setShowAdModal(true);
    setAdCountdown(5);
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
        toast.success(`+${data.credits_earned} ${t('dashboard_credits')}! +${data.xp_earned} XP`);
        
        if (data.new_level > (user?.level || 1)) {
          toast.success(t('session_level_up'));
          setMascotMessage('mascot_level_up');
        }
        
        await refreshUser();
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
    } catch (err) {
      console.error('Failed to toggle todo:', err);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await fetch(`${API}/todos/${todoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setTodos(prev => prev.filter(t => t.todo_id !== todoId));
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  };

  // Music handlers
  const handleTrackSelect = (track) => {
    if (track.locked) {
      toast.error(t('music_unlock_level', { level: track.unlock_level }));
      return;
    }
    setCurrentTrack(track);
    if (isPlaying) {
      audioRef.current?.play();
    }
  };

  const togglePlayMusic = () => {
    if (!currentTrack || currentTrack.locked) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const xpProgress = user ? (user.xp / (user.level * 1000)) * 100 : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        loop
        onEnded={() => setIsPlaying(false)}
      />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.img
              src={MASCOT_IMAGE}
              alt="Poncik"
              className="w-16 h-16 rounded-full object-cover border-2 border-[var(--surface)]"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {t('dashboard_greeting')}, {user?.name?.split(' ')[0]}!
              </h1>
              <p className="text-[var(--text-muted)] text-sm">{t(mascotMessage)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-[var(--surface)] px-4 py-2 rounded-full">
              <Coffee className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-bold text-[var(--text-main)]">{user?.credits || 0}</span>
            </div>
            <div className="flex items-center gap-2 bg-[var(--surface)] px-4 py-2 rounded-full">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-[var(--text-main)]">{user?.streak_days || 0}</span>
            </div>
            <div className="level-badge" data-testid="level-badge">
              {user?.level || 1}
            </div>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex justify-between text-sm text-[var(--text-muted)] mb-2">
            <span>{t('dashboard_level')} {user?.level || 1}</span>
            <span>{user?.xp || 0} / {(user?.level || 1) * 1000} XP</span>
          </div>
          <Progress value={xpProgress} className="h-3" />
        </motion.div>

        {/* Bento Grid */}
        <div className="bento-grid">
          {/* Timer Card - Main */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="cozy-card md:row-span-2"
          >
            {/* Timer Mode Tabs */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {Object.entries(TIMER_MODES).map(([key, mode]) => (
                <button
                  key={key}
                  onClick={() => handleModeChange(key)}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                    timerMode === key
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'bg-[var(--surface-highlight)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-testid={`timer-mode-${key}`}
                >
                  {t(mode.label)}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="text-center mb-8">
              <motion.div
                key={timeLeft}
                initial={{ scale: 1.02 }}
                animate={{ scale: 1 }}
                className="timer-display mb-4"
                data-testid="timer-display"
              >
                {formatTime(timeLeft)}
              </motion.div>
              
              <p className="text-[var(--text-muted)]">
                {isRunning ? t('mascot_working') : t('mascot_start')}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartTimer}
                  className="btn-primary flex items-center gap-2 text-lg"
                  data-testid="start-timer-btn"
                >
                  <Play className="w-6 h-6" />
                  {t('dashboard_start_focus')}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStopTimer}
                  className="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2"
                  data-testid="stop-timer-btn"
                >
                  <Square className="w-5 h-5" />
                  {t('dashboard_stop_focus')}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Todos Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="cozy-card"
            >
              <h2 className="text-xl font-bold text-[var(--text-main)] mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {t('todos_title')}
              </h2>

              <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder={t('todos_add')}
                  className="cozy-input flex-1"
                  data-testid="todo-input"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="p-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl"
                  data-testid="add-todo-btn"
                >
                  <Plus className="w-5 h-5" />
                </motion.button>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {todos.length === 0 ? (
                    <p className="text-[var(--text-muted)] text-center py-4">{t('todos_empty')}</p>
                  ) : (
                    todos.map((todo) => (
                      <motion.div
                        key={todo.todo_id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className={`todo-item ${todo.completed ? 'completed' : ''}`}
                        data-testid={`todo-item-${todo.todo_id}`}
                      >
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => handleToggleTodo(todo.todo_id, todo.completed)}
                        />
                        <span className="todo-text flex-1 text-[var(--text-main)]">{todo.text}</span>
                        <button
                          onClick={() => handleDeleteTodo(todo.todo_id)}
                          className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Music Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="cozy-card"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {t('music_title')}
                </h2>
                <button
                  onClick={togglePlayMusic}
                  className="p-2 rounded-full bg-[var(--surface-highlight)] text-[var(--primary)]"
                  data-testid="music-toggle-btn"
                >
                  {isPlaying ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
              </div>

              {currentTrack && (
                <div className="mb-4 p-3 bg-[var(--surface-highlight)] rounded-xl">
                  <p className="text-sm text-[var(--text-muted)]">{t('music_now_playing')}</p>
                  <p className="font-semibold text-[var(--text-main)]">{currentTrack.name}</p>
                  <p className="text-sm text-[var(--text-muted)]">{currentTrack.artist}</p>
                </div>
              )}

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {tracks.map((track) => (
                  <div
                    key={track.track_id}
                    onClick={() => handleTrackSelect(track)}
                    className={`music-track ${currentTrack?.track_id === track.track_id ? 'active' : ''} ${track.locked ? 'locked' : ''}`}
                    data-testid={`music-track-${track.track_id}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[var(--primary)] bg-opacity-20 flex items-center justify-center">
                      {track.locked ? (
                        <Lock className="w-4 h-4 text-[var(--text-muted)]" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[var(--primary)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--text-main)] truncate">{track.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{track.category}</p>
                    </div>
                    {track.locked && (
                      <span className="text-xs text-[var(--text-muted)]">Lv.{track.unlock_level}</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="ad-overlay"
            data-testid="ad-modal"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="ad-container"
            >
              <h3 className="text-2xl font-bold text-[var(--text-main)] mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {t('session_complete')}
              </h3>
              
              <motion.img
                src={MASCOT_IMAGE}
                alt="Poncik"
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              
              <p className="text-[var(--text-muted)] mb-6">
                {t('dashboard_watch_ad')}
              </p>
              
              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => completeSession(true)}
                  disabled={adCountdown > 0}
                  className={`btn-primary w-full ${adCountdown > 0 ? 'opacity-50' : ''}`}
                  data-testid="watch-ad-btn"
                >
                  {adCountdown > 0 ? `${adCountdown}s...` : '2x ' + t('dashboard_credits')}
                </motion.button>
                
                <button
                  onClick={() => completeSession(false)}
                  className="btn-ghost w-full"
                  data-testid="skip-ad-btn"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
