import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Users, X, Plus, UserPlus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// WebSocket URL
const WS_URL = BACKEND_URL?.replace('http', 'ws') || 'ws://localhost:8000';

export default function ChatSystem() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeChat, setActiveChat] = useState(null); // 'friends' or 'group_id'
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws/chat/${user?.user_id}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          setMessages(prev => [...prev, data.message]);
          scrollToBottom();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
    }
  };

  const fetchChats = async () => {
    try {
      const [groupsRes, friendsRes] = await Promise.all([
        fetch(`${API}/chat/groups`, { credentials: 'include' }),
        fetch(`${API}/chat/friends`, { credentials: 'include' }),
      ]);

      if (groupsRes.ok) {
        setGroups(await groupsRes.json());
      }
      if (friendsRes.ok) {
        setFriends(await friendsRes.json());
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const res = await fetch(`${API}/chat/messages/${chatId}`, { 
        credentials: 'include' 
      });
      
      if (res.ok) {
        const msgs = await res.json();
        setMessages(msgs);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !activeChat) return;

    // Anti-spam check
    const recentMessages = messages.filter(m => 
      m.sender_id === user?.user_id && 
      Date.now() - new Date(m.created_at).getTime() < 5000
    );

    if (recentMessages.length >= 3) {
      toast.error(language === 'tr' ? 'Yavaşla! Spam yapma 😊' : 'Slow down! No spam 😊');
      return;
    }

    try {
      const res = await fetch(`${API}/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          chat_id: activeChat,
          message: inputMessage.trim(),
        }),
      });

      if (res.ok) {
        setInputMessage('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message');
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) return;

    try {
      const res = await fetch(`${API}/chat/groups/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: groupName.trim() }),
      });

      if (res.ok) {
        toast.success(language === 'tr' ? 'Grup oluşturuldu!' : 'Group created!');
        setGroupName('');
        setShowGroupModal(false);
        await fetchChats();
      }
    } catch (err) {
      console.error('Failed to create group:', err);
      toast.error('Failed to create group');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const quickMessages = language === 'tr' 
    ? ['Gel kankim! 🎯', 'Çalışma zamanı! 📚', 'Mola verelim mi? ☕', 'Harika gidiyorsun! 🌟']
    : ['Come on buddy! 🎯', 'Study time! 📚', 'Break time? ☕', 'You\'re doing great! 🌟'];

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 left-4 z-30 bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-full shadow-2xl"
      >
        <MessageCircle className="w-6 h-6" />
        {messages.filter(m => !m.read && m.sender_id !== user?.user_id).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {messages.filter(m => !m.read && m.sender_id !== user?.user_id).length}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed left-4 bottom-44 z-40 w-96 h-[600px] bg-[#F5E6D3] rounded-2xl border-4 border-[#D4C4A8] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#D4C4A8]">
              <h3 className="font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                💬 {language === 'tr' ? 'Sohbet' : 'Chat'}
              </h3>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowGroupModal(true)}
                  className="p-2 bg-[#D4896A] text-white rounded-lg"
                >
                  <Plus className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {!activeChat ? (
              /* Chat List */
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {/* Friends */}
                {friends.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#8B6B4D] mb-2">
                      {language === 'tr' ? 'Arkadaşlar' : 'Friends'}
                    </p>
                    {friends.map((friend) => (
                      <motion.div
                        key={friend.user_id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setActiveChat(`friend_${friend.user_id}`);
                          loadMessages(`friend_${friend.user_id}`);
                        }}
                        className="bg-white/50 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-[#D4896A] rounded-full flex items-center justify-center text-white font-bold">
                            {friend.name?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#5D4E37] text-sm">{friend.name}</p>
                            <p className="text-xs text-[#8B6B4D]">{friend.last_message || 'Start chatting'}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Groups */}
                {groups.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-bold text-[#8B6B4D] mb-2">
                      {language === 'tr' ? 'Gruplar' : 'Groups'}
                    </p>
                    {groups.map((group) => (
                      <motion.div
                        key={group.group_id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          setActiveChat(`group_${group.group_id}`);
                          loadMessages(`group_${group.group_id}`);
                        }}
                        className="bg-white/50 rounded-lg p-3 cursor-pointer hover:bg-white/80 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-10 h-10 text-[#D4896A]" />
                          <div className="flex-1">
                            <p className="font-semibold text-[#5D4E37] text-sm">{group.name}</p>
                            <p className="text-xs text-[#8B6B4D]">{group.members_count} members</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {friends.length === 0 && groups.length === 0 && (
                  <div className="text-center py-8 text-[#8B6B4D]">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{language === 'tr' ? 'Henüz sohbet yok' : 'No chats yet'}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Active Chat */
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-2 p-3 border-b-2 border-[#D4C4A8]">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setActiveChat(null)}
                    className="p-1 hover:bg-white/50 rounded"
                  >
                    ←
                  </motion.button>
                  <p className="font-bold text-[#5D4E37]">
                    {activeChat.startsWith('friend_') ? 'Friend' : 'Group'}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] rounded-lg p-2 ${
                        msg.sender_id === user?.user_id 
                          ? 'bg-[#D4896A] text-white' 
                          : 'bg-white/80 text-[#5D4E37]'
                      }`}>
                        {msg.sender_id !== user?.user_id && (
                          <p className="text-xs font-bold mb-1">{msg.sender_name}</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Messages */}
                <div className="px-3 py-2 flex gap-2 overflow-x-auto">
                  {quickMessages.map((msg, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInputMessage(msg)}
                      className="text-xs bg-white/50 hover:bg-white/80 rounded-full px-3 py-1 whitespace-nowrap"
                    >
                      {msg}
                    </motion.button>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="p-3 border-t-2 border-[#D4C4A8]">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={language === 'tr' ? 'Mesaj yaz...' : 'Type a message...'}
                      className="flex-1 px-3 py-2 bg-white/50 rounded-lg border-2 border-[#D4C4A8] focus:outline-none focus:border-[#D4896A]"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="p-2 bg-[#D4896A] text-white rounded-lg"
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Group Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGroupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F5E6D3] rounded-2xl border-4 border-[#D4C4A8] p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-[#5D4E37] mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? 'Yeni Grup Oluştur' : 'Create New Group'}
              </h3>
              <form onSubmit={createGroup} className="space-y-4">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={language === 'tr' ? 'Grup adı...' : 'Group name...'}
                  className="w-full px-4 py-2 bg-white/50 rounded-lg border-2 border-[#D4C4A8] focus:outline-none focus:border-[#D4896A]"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-2 bg-[#D4896A] text-white rounded-lg font-bold"
                >
                  {language === 'tr' ? 'Oluştur' : 'Create'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
