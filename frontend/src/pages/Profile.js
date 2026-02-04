import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Award, Clock, Coffee, Flame, Star, ShoppingBag, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Profile() {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, badgesRes, earnedRes] = await Promise.all([
        fetch(`${API}/user/stats`, { credentials: 'include' }),
        fetch(`${API}/badges`, { credentials: 'include' }),
        fetch(`${API}/badges/earned`, { credentials: 'include' }),
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (badgesRes.ok) setBadges(await badgesRes.json());
      if (earnedRes.ok) setEarnedBadges(await earnedRes.json());
    } catch (err) {
      console.error('Failed to fetch profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const formatTime = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const xpProgress = user ? (user.xp / (user.level * 1000)) * 100 : 0;
  const xpToNext = user ? (user.level * 1000) - user.xp : 0;

  const getBadgeName = (badge) => language === 'tr' ? badge.name_tr : badge.name_en;
  const getBadgeDesc = (badge) => language === 'tr' ? badge.description_tr : badge.description_en;

  const earnedBadgeIds = earnedBadges.map(b => b.badge_id);

  const statItems = [
    { icon: Clock, label: t('profile_total_minutes'), value: formatTime(stats?.total_focus_minutes || 0), color: 'text-blue-500' },
    { icon: Star, label: t('profile_total_sessions'), value: stats?.total_sessions || 0, color: 'text-yellow-500' },
    { icon: Flame, label: t('dashboard_streak'), value: `${stats?.streak_days || 0} ${language === 'tr' ? 'gün' : 'days'}`, color: 'text-orange-500' },
    { icon: ShoppingBag, label: t('profile_total_purchases'), value: stats?.total_purchases || 0, color: 'text-purple-500' },
    { icon: Users, label: t('community_friends'), value: stats?.total_friends || 0, color: 'text-green-500' },
    { icon: Award, label: t('profile_badges'), value: earnedBadges.length, color: 'text-pink-500' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cozy-card mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-[var(--surface-highlight)]">
              <AvatarImage src={user?.picture} />
              <AvatarFallback className="bg-[var(--primary)] text-[var(--primary-foreground)] text-3xl">
                {user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-[var(--text-main)] mb-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {user?.name}
              </h1>
              <p className="text-[var(--text-muted)] mb-4">{user?.email}</p>
              
              {/* Level Progress */}
              <div className="max-w-sm mx-auto md:mx-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="level-badge w-8 h-8 text-sm">{user?.level || 1}</div>
                    <span className="font-semibold text-[var(--text-main)]">{t('dashboard_level')} {user?.level || 1}</span>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{xpToNext} XP {t('profile_xp_to_next')}</span>
                </div>
                <Progress value={xpProgress} className="h-3" />
              </div>
            </div>
            
            {/* Credits */}
            <div className="flex flex-col items-center gap-2 px-6 py-4 bg-[var(--surface-highlight)] rounded-2xl">
              <Coffee className="w-8 h-8 text-[var(--primary)]" />
              <span className="text-3xl font-bold text-[var(--text-main)]">{user?.credits || 0}</span>
              <span className="text-sm text-[var(--text-muted)]">{t('dashboard_credits')}</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[var(--surface)] rounded-full p-1">
            <TabsTrigger
              value="stats"
              className="rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
              data-testid="tab-stats"
            >
              <User className="w-4 h-4 mr-2" />
              {t('profile_stats')}
            </TabsTrigger>
            <TabsTrigger
              value="badges"
              className="rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
              data-testid="tab-badges"
            >
              <Award className="w-4 h-4 mr-2" />
              {t('profile_badges')}
            </TabsTrigger>
          </TabsList>

          {/* Stats */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statItems.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="cozy-card text-center"
                >
                  <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                  <p className="text-2xl font-bold text-[var(--text-main)]">{stat.value}</p>
                  <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Badges */}
          <TabsContent value="badges">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {badges.map((badge, index) => {
                const isEarned = earnedBadgeIds.includes(badge.badge_id);
                return (
                  <motion.div
                    key={badge.badge_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`badge-item ${isEarned ? 'earned' : 'opacity-50'}`}
                    data-testid={`badge-${badge.badge_id}`}
                  >
                    <div className="badge-icon">{badge.icon}</div>
                    <h3 className="font-bold text-[var(--text-main)] text-center text-sm">
                      {getBadgeName(badge)}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] text-center mt-1">
                      {isEarned ? getBadgeDesc(badge) : t('profile_badge_locked')}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-full font-semibold"
            data-testid="logout-btn"
          >
            <LogOut className="w-5 h-5" />
            {t('profile_logout')}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
