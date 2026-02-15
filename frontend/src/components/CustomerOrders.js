import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Cookie, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const DRINK_ITEMS = [
  { id: 'coffee', emoji: '☕', name_tr: 'Kahve', name_en: 'Coffee', credits: 50 },
  { id: 'tea', emoji: '🍵', name_tr: 'Çay', name_en: 'Tea', credits: 40 },
  { id: 'hot_chocolate', emoji: '🍫', name_tr: 'Sıcak Çikolata', name_en: 'Hot Chocolate', credits: 60 },
  { id: 'lemonade', emoji: '🍋', name_tr: 'Limonata', name_en: 'Lemonade', credits: 45 },
  { id: 'iced_coffee', emoji: '🧊☕', name_tr: 'Buzlu Kahve', name_en: 'Iced Coffee', credits: 55 },
];

const TREAT_ITEMS = [
  { id: 'cheesecake', emoji: '🍰', name_tr: 'Cheesecake', name_en: 'Cheesecake', credits: 70 },
  { id: 'cupcake', emoji: '🧁', name_tr: 'Cupcake', name_en: 'Cupcake', credits: 60 },
  { id: 'cookie', emoji: '🍪', name_tr: 'Cookie', name_en: 'Cookie', credits: 50 },
  { id: 'croissant', emoji: '🥐', name_tr: 'Kruvasan', name_en: 'Croissant', credits: 55 },
];

const CUSTOMER_TYPES = [
  { id: 'student_ayse', emoji: '👩‍🎓', name: 'Ayşe', prefers: ['tea', 'cookie'] },
  { id: 'dev_cem', emoji: '👨‍💻', name: 'Cem', prefers: ['coffee', 'iced_coffee'] },
  { id: 'artist_elif', emoji: '👩‍🎨', name: 'Elif', prefers: ['hot_chocolate', 'cheesecake'] },
  { id: 'athlete_mehmet', emoji: '🏃', name: 'Mehmet', prefers: ['iced_coffee', 'cookie'] },
  { id: 'writer_zeynep', emoji: '📚', name: 'Zeynep', prefers: ['tea', 'cupcake'] },
];

export default function CustomerOrders({ language = 'tr', isActive = false, onCreditsEarned }) {
  const [activeOrders, setActiveOrders] = useState([]);
  const [showServingModal, setShowServingModal] = useState(null);

  useEffect(() => {
    if (!isActive) {
      setActiveOrders([]);
      return;
    }

    const generateOrder = () => {
      const customer = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
      const allItems = [...DRINK_ITEMS, ...TREAT_ITEMS];
      
      // Prefer customer's favorite items
      let orderedItem;
      if (Math.random() > 0.3) {
        const preferredIds = customer.prefers;
        const preferredItems = allItems.filter(item => preferredIds.includes(item.id));
        orderedItem = preferredItems[Math.floor(Math.random() * preferredItems.length)];
      } else {
        orderedItem = allItems[Math.floor(Math.random() * allItems.length)];
      }

      const newOrder = {
        id: Date.now(),
        customer,
        item: orderedItem,
        timeLeft: 30,
        served: false
      };

      setActiveOrders(prev => [...prev, newOrder]);

      // Auto-remove after 30 seconds if not served
      setTimeout(() => {
        setActiveOrders(prev => {
          const order = prev.find(o => o.id === newOrder.id);
          if (order && !order.served) {
            toast.error(language === 'tr' ? `${customer.name} ayrıldı... ⏰` : `${customer.name} left... ⏰`);
            return prev.filter(o => o.id !== newOrder.id);
          }
          return prev;
        });
      }, 30000);
    };

    // Generate first order after 5 seconds
    const firstTimer = setTimeout(generateOrder, 5000);

    // Generate orders every 15-30 seconds
    const interval = setInterval(() => {
      if (activeOrders.length < 3) {
        generateOrder();
      }
    }, 15000 + Math.random() * 15000);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
    };
  }, [isActive, activeOrders.length, language]);

  // Timer countdown
  useEffect(() => {
    if (activeOrders.length === 0) return;

    const interval = setInterval(() => {
      setActiveOrders(prev => 
        prev.map(order => ({
          ...order,
          timeLeft: Math.max(0, order.timeLeft - 1)
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [activeOrders]);

  const handleServeOrder = (order) => {
    setShowServingModal(order);
  };

  const handleServeItem = (servedItem) => {
    const order = showServingModal;
    if (!order) return;

    const isCorrect = servedItem.id === order.item.id;

    if (isCorrect) {
      const bonusCredits = order.item.credits + Math.floor(Math.random() * 20);
      toast.success(
        language === 'tr' 
          ? `${order.customer.name} mutlu! +${bonusCredits} 🪙` 
          : `${order.customer.name} is happy! +${bonusCredits} 🪙`
      );
      
      if (onCreditsEarned) {
        onCreditsEarned(bonusCredits);
      }

      setActiveOrders(prev => prev.filter(o => o.id !== order.id));
    } else {
      toast.error(
        language === 'tr' 
          ? `Yanlış sipariş! -20 🪙` 
          : `Wrong order! -20 🪙`
      );
      
      if (onCreditsEarned) {
        onCreditsEarned(-20);
      }

      setActiveOrders(prev => prev.filter(o => o.id !== order.id));
    }

    setShowServingModal(null);
  };

  if (!isActive || activeOrders.length === 0) return null;

  return (
    <>
      {/* Order Queue */}
      <div className="fixed top-24 right-4 z-30 space-y-2">
        <AnimatePresence mode="popLayout">
          {activeOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleServeOrder(order)}
              className="bg-[#F5E6D3]/95 rounded-xl border-4 border-[#D4C4A8] p-3 cursor-pointer hover:scale-105 transition-transform shadow-lg backdrop-blur-sm w-48"
            >
              {/* Customer */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{order.customer.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {order.customer.name}
                  </p>
                  <p className="text-xs text-[#8B6B4D]">
                    {language === 'tr' ? 'Sipariş' : 'Order'}
                  </p>
                </div>
              </div>

              {/* Order Item */}
              <div className="flex items-center justify-between bg-white/50 rounded-lg p-2 mb-2">
                <span className="text-xl">{order.item.emoji}</span>
                <span className="text-xs font-semibold text-[#5D4E37]">
                  {language === 'tr' ? order.item.name_tr : order.item.name_en}
                </span>
              </div>

              {/* Timer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className={`w-3 h-3 ${order.timeLeft < 10 ? 'text-red-500' : 'text-[#8B6B4D]'}`} />
                  <span className={`text-xs font-bold ${order.timeLeft < 10 ? 'text-red-500' : 'text-[#5D4E37]'}`}>
                    {order.timeLeft}s
                  </span>
                </div>
                <span className="text-xs text-[#8B6B4D]">🪙 +{order.item.credits}</span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-[#D4C4A8] rounded-full mt-2 overflow-hidden">
                <motion.div
                  className={`h-full ${order.timeLeft < 10 ? 'bg-red-500' : 'bg-[#D4896A]'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(order.timeLeft / 30) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Serving Modal */}
      <AnimatePresence>
        {showServingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowServingModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#F5E6D3] rounded-2xl border-4 border-[#D4C4A8] p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <h3 className="text-2xl font-bold text-[#5D4E37] mb-4 text-center" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? 'Servis Yap' : 'Serve Order'}
              </h3>

              {/* Customer info */}
              <div className="flex items-center justify-center gap-3 mb-4 bg-white/50 rounded-xl p-3">
                <span className="text-4xl">{showServingModal.customer.emoji}</span>
                <div>
                  <p className="font-bold text-[#5D4E37]">{showServingModal.customer.name}</p>
                  <p className="text-sm text-[#8B6B4D]">
                    {language === 'tr' ? 'istiyor:' : 'wants:'} {showServingModal.item.emoji}
                  </p>
                </div>
              </div>

              {/* Drinks */}
              <div className="mb-4">
                <p className="text-sm font-bold text-[#5D4E37] mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <Coffee className="w-4 h-4 inline mr-1" />
                  {language === 'tr' ? 'İçecekler' : 'Drinks'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DRINK_ITEMS.map(item => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleServeItem(item)}
                      className="bg-white rounded-xl p-3 border-2 border-[#D4C4A8] hover:border-[#D4896A] transition-colors"
                    >
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-[#5D4E37] font-semibold truncate">
                        {language === 'tr' ? item.name_tr : item.name_en}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Treats */}
              <div>
                <p className="text-sm font-bold text-[#5D4E37] mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <Cookie className="w-4 h-4 inline mr-1" />
                  {language === 'tr' ? 'Tatlılar' : 'Treats'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TREAT_ITEMS.map(item => (
                    <motion.button
                      key={item.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleServeItem(item)}
                      className="bg-white rounded-xl p-3 border-2 border-[#D4C4A8] hover:border-[#D4896A] transition-colors"
                    >
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-[#5D4E37] font-semibold truncate">
                        {language === 'tr' ? item.name_tr : item.name_en}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Cancel button */}
              <button
                onClick={() => setShowServingModal(null)}
                className="mt-4 w-full py-2 text-[#8B6B4D] hover:text-[#5D4E37] font-semibold"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
