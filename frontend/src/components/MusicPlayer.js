import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Shuffle, Repeat, Music, ExternalLink, Lock, Search, X } from 'lucide-react';
import { Slider } from '../components/ui/slider';

// Free lofi/ambient tracks from various sources
const MUSIC_TRACKS = [
  { id: 'lofi_1', name: 'Coffee Shop Vibes', artist: 'LoFi Dreams', category: 'lofi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: '☕', duration: '3:45', locked: false },
  { id: 'lofi_2', name: 'Rainy Day Study', artist: 'Chill Beats', category: 'lofi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: '🌧️', duration: '4:12', locked: false },
  { id: 'lofi_3', name: 'Midnight Jazz', artist: 'Jazz Cafe', category: 'jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: '🎷', duration: '3:58', locked: false },
  { id: 'ambient_1', name: 'Forest Whispers', artist: 'Nature Sounds', category: 'nature', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: '🌲', duration: '5:20', locked: false },
  { id: 'ambient_2', name: 'Ocean Waves', artist: 'Calm Waters', category: 'nature', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: '🌊', duration: '4:30', locked: false },
  { id: 'piano_1', name: 'Soft Piano Dreams', artist: 'Classical Focus', category: 'classical', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: '🎹', duration: '4:15', locked: false },
  { id: 'lofi_4', name: 'Sakura Season', artist: 'Tokyo Beats', category: 'lofi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: '🌸', duration: '3:30', locked: true, unlockLevel: 3 },
  { id: 'lofi_5', name: 'Sunset Cafe', artist: 'Evening Vibes', category: 'lofi', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: '🌅', duration: '4:00', locked: true, unlockLevel: 5 },
  { id: 'ambient_3', name: 'Fireplace Crackle', artist: 'Cozy Sounds', category: 'ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', cover: '🔥', duration: '6:00', locked: true, unlockLevel: 4 },
  { id: 'jazz_2', name: 'Late Night Jazz', artist: 'Smooth Tunes', category: 'jazz', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', cover: '🎺', duration: '4:45', locked: true, unlockLevel: 6 },
];

const CATEGORIES = [
  { id: 'all', name_tr: 'Tümü', name_en: 'All', icon: '🎵' },
  { id: 'lofi', name_tr: 'Lo-Fi', name_en: 'Lo-Fi', icon: '🎧' },
  { id: 'jazz', name_tr: 'Caz', name_en: 'Jazz', icon: '🎷' },
  { id: 'nature', name_tr: 'Doğa', name_en: 'Nature', icon: '🌿' },
  { id: 'classical', name_tr: 'Klasik', name_en: 'Classical', icon: '🎹' },
  { id: 'ambient', name_tr: 'Ambient', name_en: 'Ambient', icon: '✨' },
];

export default function MusicPlayer({ isOpen, onClose, userLevel = 1 }) {
  const { language } = useLanguage();
  const audioRef = useRef(null);
  
  const [currentTrack, setCurrentTrack] = useState(MUSIC_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tracks based on category and search
  const filteredTracks = MUSIC_TRACKS.filter(track => {
    const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory;
    const matchesSearch = track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Define playNext before useEffect that uses it
  const playNext = useCallback(() => {
    const availableTracks = filteredTracks.filter(t => !t.locked || t.unlockLevel <= userLevel);
    const currentIndex = availableTracks.findIndex(t => t.id === currentTrack.id);
    
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * availableTracks.length);
    } else {
      nextIndex = (currentIndex + 1) % availableTracks.length;
    }
    
    setCurrentTrack(availableTracks[nextIndex]);
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  }, [filteredTracks, userLevel, currentTrack.id, shuffle, isPlaying]);

  // Update audio when track changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentTrack.url;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentTrack, isPlaying]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Track progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeat) {
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('loadedmetadata', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat, playNext]);

  const togglePlay = () => {
    if (currentTrack.locked && currentTrack.unlockLevel > userLevel) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playTrack = (track) => {
    if (track.locked && track.unlockLevel > userLevel) return;
    setCurrentTrack(track);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 100);
  };

  const playPrev = () => {
    const availableTracks = filteredTracks.filter(t => !t.locked || t.unlockLevel <= userLevel);
    const currentIndex = availableTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? availableTracks.length - 1 : currentIndex - 1;
    setCurrentTrack(availableTracks[prevIndex]);
    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const seekTo = (value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setProgress(value[0]);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryName = (cat) => language === 'tr' ? cat.name_tr : cat.name_en;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-[#2D2D2D] to-[#1A1A1A] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl"
        >
          {/* Hidden audio element */}
          <audio ref={audioRef} />

          {/* Header */}
          <div className="bg-gradient-to-r from-[#D4896A] to-[#E09A7A] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? 'Müzik Kütüphanesi' : 'Music Library'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex h-[calc(85vh-180px)]">
            {/* Sidebar - Categories */}
            <div className="w-48 bg-[#252525] p-4 border-r border-[#333]">
              <p className="text-xs text-gray-400 uppercase mb-3 font-semibold">
                {language === 'tr' ? 'Kategoriler' : 'Categories'}
              </p>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#D4896A] text-white'
                        : 'text-gray-300 hover:bg-[#333]'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-sm">{getCategoryName(cat)}</span>
                  </button>
                ))}
              </div>

              {/* Spotify Link */}
              <div className="mt-6 pt-4 border-t border-[#333]">
                <a
                  href="https://open.spotify.com/search/lofi%20study"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 bg-[#1DB954] text-white rounded-lg text-sm hover:bg-[#1ed760] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify'da Aç
                </a>
              </div>
            </div>

            {/* Main content - Track list */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'tr' ? 'Şarkı veya sanatçı ara...' : 'Search songs or artists...'}
                  className="w-full bg-[#333] text-white pl-10 pr-4 py-2 rounded-lg border border-[#444] focus:border-[#D4896A] focus:outline-none"
                />
              </div>

              {/* Track list */}
              <div className="space-y-2">
                {filteredTracks.map((track, index) => {
                  const isLocked = track.locked && track.unlockLevel > userLevel;
                  const isActive = currentTrack.id === track.id;
                  
                  return (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => playTrack(track)}
                      className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all ${
                        isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#333]'
                      } ${isActive ? 'bg-[#D4896A]/20 border border-[#D4896A]' : ''}`}
                    >
                      {/* Cover/Number */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#D4896A] to-[#A66B4F] flex items-center justify-center text-2xl">
                        {isLocked ? <Lock className="w-5 h-5 text-white" /> : track.cover}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${isActive ? 'text-[#D4896A]' : 'text-white'}`}>
                          {track.name}
                        </p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>

                      {/* Duration/Lock info */}
                      <div className="text-right">
                        {isLocked ? (
                          <p className="text-xs text-gray-400">Lv.{track.unlockLevel}</p>
                        ) : (
                          <p className="text-sm text-gray-400">{track.duration}</p>
                        )}
                      </div>

                      {/* Playing indicator */}
                      {isActive && isPlaying && (
                        <div className="flex gap-0.5">
                          <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-[#D4896A] rounded-full" />
                          <motion.div animate={{ height: [16, 8, 16] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-[#D4896A] rounded-full" />
                          <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-[#D4896A] rounded-full" />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Player controls */}
          <div className="bg-[#181818] border-t border-[#333] p-4">
            <div className="flex items-center gap-4">
              {/* Current track info */}
              <div className="flex items-center gap-3 w-64">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#D4896A] to-[#A66B4F] flex items-center justify-center text-2xl">
                  {currentTrack.cover}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{currentTrack.name}</p>
                  <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShuffle(!shuffle)}
                    className={`p-2 rounded-full transition-colors ${shuffle ? 'text-[#D4896A]' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button onClick={playPrev} className="p-2 text-gray-400 hover:text-white">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    )}
                  </button>
                  <button onClick={playNext} className="p-2 text-gray-400 hover:text-white">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setRepeat(!repeat)}
                    className={`p-2 rounded-full transition-colors ${repeat ? 'text-[#D4896A]' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-md flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-10 text-right">{formatTime(progress)}</span>
                  <Slider
                    value={[progress]}
                    max={duration || 100}
                    step={1}
                    onValueChange={seekTo}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-2 w-32">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setVolume(value[0] / 100);
                    setIsMuted(false);
                  }}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
