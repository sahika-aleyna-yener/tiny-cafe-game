import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Users, UserPlus, Clock, Flame, Crown, Medal } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Community() {
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leaderboardRes, friendsRes] = await Promise.all([
        fetch(`${API}/community/leaderboard`, { credentials: 'include' }),
        fetch(`${API}/community/friends`, { credentials: 'include' }),
      ]);
      
      if (leaderboardRes.ok) {
        setLeaderboard(await leaderboardRes.json());
      }
      if (friendsRes.ok) {
        setFriends(await friendsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch community data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    setInviting(true);
    try {
      const res = await fetch(`${API}/community/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ target_email: inviteEmail.trim() }),
      });
      
      if (res.ok) {
        toast.success(t('community_invite_success'));
        setInviteEmail('');
        setDialogOpen(false);
        await fetchData();
        await refreshUser();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Invite failed');
      }
    } catch (err) {
      console.error('Invite failed:', err);
      toast.error('Invite failed');
    } finally {
      setInviting(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center font-bold text-[var(--text-muted)]">{index + 1}</span>;
  };

  const formatMinutes = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {t('community_title')}
            </h1>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center gap-2"
                data-testid="invite-friend-btn"
              >
                <UserPlus className="w-5 h-5" />
                {t('community_invite')}
              </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--surface)] border-[var(--border)]">
              <DialogHeader>
                <DialogTitle className="text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {t('community_invite')}
                </DialogTitle>
              </DialogHeader>
              <p className="text-[var(--text-muted)] mb-4">{t('community_invite_bonus')}</p>
              <form onSubmit={handleInvite} className="space-y-4">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('community_invite_placeholder')}
                  className="cozy-input"
                  data-testid="invite-email-input"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={inviting}
                  className="btn-primary w-full"
                  data-testid="send-invite-btn"
                >
                  {inviting ? '...' : t('community_invite')}
                </motion.button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[var(--surface)] rounded-full p-1">
            <TabsTrigger
              value="leaderboard"
              className="rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
              data-testid="tab-leaderboard"
            >
              <Trophy className="w-4 h-4 mr-2" />
              {t('community_leaderboard')}
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
              data-testid="tab-friends"
            >
              <Users className="w-4 h-4 mr-2" />
              {t('community_friends')}
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard */}
          <TabsContent value="leaderboard">
            <div className="cozy-card">
              {leaderboard.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-8">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`leaderboard-item ${entry.user_id === user?.user_id ? 'bg-[var(--surface-highlight)]' : ''}`}
                      data-testid={`leaderboard-item-${index}`}
                    >
                      <div className="leaderboard-rank">
                        {getRankIcon(index)}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={entry.picture} />
                        <AvatarFallback className="bg-[var(--primary)] text-[var(--primary-foreground)]">
                          {entry.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text-main)] truncate">
                          {entry.name}
                          {entry.user_id === user?.user_id && ' (Sen)'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatMinutes(entry.total_focus_minutes || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {entry.streak_days || 0}
                          </span>
                        </div>
                      </div>
                      <div className="level-badge text-sm w-8 h-8">
                        {entry.level || 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Friends */}
          <TabsContent value="friends">
            <div className="cozy-card">
              {friends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
                  <p className="text-[var(--text-muted)]">{t('community_no_friends')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {friends.map((friend, index) => (
                    <motion.div
                      key={friend.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="leaderboard-item"
                      data-testid={`friend-item-${index}`}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={friend.picture} />
                        <AvatarFallback className="bg-[var(--secondary)] text-white">
                          {friend.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--text-main)] truncate">{friend.name}</p>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatMinutes(friend.total_focus_minutes || 0)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {friend.streak_days || 0}
                          </span>
                        </div>
                      </div>
                      <div className="level-badge text-sm w-8 h-8">
                        {friend.level || 1}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
