import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export function useNotifications(language = 'tr') {
  const [permission, setPermission] = useState(Notification.permission);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (err) {
      console.error('Failed to check subscription:', err);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPush();
        toast.success(language === 'tr' ? 'Bildirimler aktif!' : 'Notifications enabled!');
      } else {
        toast.error(language === 'tr' ? 'Bildirim izni reddedildi' : 'Notification permission denied');
      }
    } catch (err) {
      console.error('Failed to request permission:', err);
      toast.error('Failed to enable notifications');
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Get VAPID public key from backend
      const vapidRes = await fetch(`${API}/notifications/vapid-public-key`, {
        credentials: 'include'
      });
      const { public_key } = await vapidRes.json();
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(public_key)
      });
      
      // Send subscription to backend
      await fetch(`${API}/notifications/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(sub.toJSON()),
      });
      
      setSubscription(sub);
    } catch (err) {
      console.error('Failed to subscribe to push:', err);
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        
        await fetch(`${API}/notifications/unsubscribe`, {
          method: 'POST',
          credentials: 'include',
        });
        
        setSubscription(null);
        toast.success(language === 'tr' ? 'Bildirimler kapatıldı' : 'Notifications disabled');
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };

  return {
    permission,
    isSubscribed: !!subscription,
    requestPermission,
    unsubscribe,
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationPrompt({ language = 'tr' }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const { permission, isSubscribed, requestPermission } = useNotifications(language);

  useEffect(() => {
    // Show prompt after 30 seconds if not decided
    const timer = setTimeout(() => {
      if (permission === 'default' && !isSubscribed) {
        setShowPrompt(true);
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [permission, isSubscribed]);

  const handleAllow = async () => {
    await requestPermission();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Save to localStorage to not show again
    localStorage.setItem('notification_prompt_dismissed', 'true');
  };

  if (!showPrompt || permission !== 'default') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-24 right-4 z-50 bg-[#F5E6D3] rounded-2xl border-4 border-[#D4C4A8] p-6 shadow-2xl max-w-sm"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-[#8B6B4D] hover:text-[#5D4E37]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-4">
          <Bell className="w-8 h-8 text-[#D4896A] flex-shrink-0" />
          <div>
            <h3 className="font-bold text-[#5D4E37] mb-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? '🔔 Bildirimleri Aç' : '🔔 Enable Notifications'}
            </h3>
            <p className="text-sm text-[#8B6B4D]">
              {language === 'tr' 
                ? 'Çalışma hatırlatmaları ve başarımlar için bildirim al!' 
                : 'Get reminders and achievement notifications!'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAllow}
            className="flex-1 py-2 bg-[#D4896A] text-white rounded-lg font-bold flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            {language === 'tr' ? 'İzin Ver' : 'Allow'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDismiss}
            className="flex-1 py-2 bg-white/50 text-[#5D4E37] rounded-lg font-bold"
          >
            {language === 'tr' ? 'Şimdi Değil' : 'Not Now'}
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Utility function to send local notification
export function sendLocalNotification(title, body, icon = '/logo192.png') {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon,
      badge: icon,
      vibrate: [200, 100, 200],
    });
  }
}

// Predefined notification templates
export const NOTIFICATION_TEMPLATES = {
  studyReminder: {
    tr: {
      title: '📚 Çalışma Zamanı!',
      body: 'Bugünkü çalışma hedefini tamamlamadın. Hadi başlayalım!'
    },
    en: {
      title: '📚 Study Time!',
      body: 'You haven\'t completed today\'s study goal. Let\'s start!'
    }
  },
  breakOver: {
    tr: {
      title: '⏰ Mola Bitti!',
      body: 'Molan sona erdi. Çalışmaya devam etmeye hazır mısın?'
    },
    en: {
      title: '⏰ Break Over!',
      body: 'Your break is over. Ready to continue studying?'
    }
  },
  achievement: {
    tr: {
      title: '🎉 Başarım Kazandın!',
      body: 'Yeni bir başarım açtın. Ödülünü almak için uygulamayı aç!'
    },
    en: {
      title: '🎉 Achievement Unlocked!',
      body: 'You unlocked a new achievement. Open the app to claim your reward!'
    }
  },
  streakWarning: {
    tr: {
      title: '🔥 Serini Kaybetme!',
      body: 'Bugün henüz çalışmadın. Serini korumak için şimdi başla!'
    },
    en: {
      title: '🔥 Don\'t Lose Your Streak!',
      body: 'You haven\'t studied today. Start now to keep your streak!'
    }
  },
  friendInvite: {
    tr: {
      title: '👋 Yeni Arkadaş Daveti!',
      body: 'Birisi seni arkadaş olarak ekledi. Hemen kabul et!'
    },
    en: {
      title: '👋 New Friend Invite!',
      body: 'Someone added you as a friend. Accept now!'
    }
  }
};
