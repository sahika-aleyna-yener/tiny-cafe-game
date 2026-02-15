import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Clock, Check, X, Gift } from 'lucide-react';
import { getRandomCustomer, getCustomerOrder, getDrinkById } from '../data/cafeData';
import { toast } from 'sonner';

export default function CustomerOrders({ onServeComplete, userCredits, onCreditChange }) {
  const { language } = useLanguage();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showDrinkMaker, setShowDrinkMaker] = useState(false);

  // Define handleCustomerLeave before it's used in useEffect
  const handleCustomerLeave = useCallback(() => {
    if (currentOrder) {
      toast.error(
        language === 'tr'
          ? `${currentOrder.customer.name_tr} bekledi ve gitti... 😔`
          : `${currentOrder.customer.name_en} left... 😔`
      );
      setCurrentOrder(null);
      setTimeLeft(30);
    }
  }, [currentOrder, language]);

  // Rastgele müşteri gelişi (2-5 dakikada bir)
  useEffect(() => {
    const spawnCustomer = () => {
      if (!currentOrder) {
        const customer = getRandomCustomer();
        const order = getCustomerOrder(customer.id);
        setCurrentOrder(order);
        setTimeLeft(customer.patience || 30);
        
        toast.info(
          language === 'tr' 
            ? `${customer.name_tr} geldi! ${customer.emoji}` 
            : `${customer.name_en} arrived! ${customer.emoji}`
        );
      }
    };

    // İlk müşteri hemen gelsin
    const initialDelay = setTimeout(spawnCustomer, 3000);
    
    // Sonraki müşteriler 2-5 dakikada
    const interval = setInterval(() => {
      const randomDelay = Math.random() * (5 - 2) + 2; // 2-5 dakika
      setTimeout(spawnCustomer, randomDelay * 60 * 1000);
    }, 30000); // Her 30 saniyede kontrol et

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [currentOrder, language]);

  // Timer countdown
  useEffect(() => {
    if (!currentOrder) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Süre doldu, müşteri gitti
          handleCustomerLeave();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentOrder, handleCustomerLeave]);

  const handleStartMaking = () => {
    setShowDrinkMaker(true);
  };

  const handleServeOrder = (preparedDrink) => {
    if (!currentOrder) return;

    const isCorrect = preparedDrink.id === currentOrder.drink.id;
    const customer = currentOrder.customer;

    if (isCorrect) {
      // Doğru servis!
      const baseReward = Math.floor(Math.random() * (customer.tips.max - customer.tips.min) + customer.tips.min);
      const timeBonus = timeLeft > 20 ? 50 : timeLeft > 10 ? 25 : 0;
      const totalReward = baseReward + timeBonus;

      onCreditChange(totalReward);
      
      toast.success(
        language === 'tr'
          ? `🎉 Harika servis! +${totalReward} kredi!`
          : `🎉 Great service! +${totalReward} credits!`,
        { duration: 3000 }
      );

      if (onServeComplete) {
        onServeComplete({
          success: true,
          credits: totalReward,
          customer: customer.id,
          drink: preparedDrink.id
        });
      }
    } else {
      // Yanlış servis
      const penalty = 20;
      onCreditChange(-penalty);
      
      toast.error(
        language === 'tr'
          ? `❌ Yanlış içecek! -${penalty} kredi`
          : `❌ Wrong drink! -${penalty} credits`
      );

      if (onServeComplete) {
        onServeComplete({
          success: false,
          credits: -penalty,
          customer: customer.id,
          drink: preparedDrink.id
        });
      }
    }

    // Müşteriyi gönder
    setCurrentOrder(null);
    setShowDrinkMaker(false);
    setTimeLeft(30);
  };

  if (!currentOrder) {
    return (
      <div className="text-center p-8 bg-[var(--card)] rounded-xl border-2 border-[var(--border)]">
        <p className="text-[var(--text-muted)] text-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {language === 'tr' ? 'Müşteri bekleniyor...' : 'Waiting for customer...'}
        </p>
      </div>
    );
  }

  const customer = currentOrder.customer;
  const drink = currentOrder.drink;
  const dessert = currentOrder.dessert;

  return (
    <div className="space-y-4">
      {/* Müşteri Kartı */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        className="bg-gradient-to-br from-[#F5E6D3] to-[#E8D9C6] p-6 rounded-2xl border-3 border-[#D4C4A8] shadow-lg"
      >
        {/* Müşteri Bilgisi */}
        <div className="flex items-center gap-4 mb-4">
          <div className="text-6xl">{customer.emoji}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? customer.name_tr : customer.name_en}
            </h3>
            <p className="text-sm text-[#8B6F47]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? customer.description_tr : customer.description_en}
            </p>
          </div>
        </div>

        {/* Sipariş */}
        <div className="bg-white/80 rounded-xl p-4 mb-4">
          <p className="text-xs text-[#8B6F47] mb-2 font-semibold" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? 'Sipariş:' : 'Order:'}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-[#7FA99B]/20 px-3 py-2 rounded-lg">
              <span className="text-2xl">{drink.emoji}</span>
              <span className="font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? drink.name_tr : drink.name_en}
              </span>
            </div>
            {dessert && (
              <div className="flex items-center gap-2 bg-[#C85A54]/20 px-3 py-2 rounded-lg">
                <span className="text-2xl">{dessert.emoji}</span>
                <span className="font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  {language === 'tr' ? dessert.name_tr : dessert.name_en}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#C85A54]" />
            <span className={`font-bold text-lg ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[#5D4E37]'}`} 
                  style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {timeLeft}s
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#8B6F47]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? 'Bahşiş:' : 'Tips:'}
            </p>
            <p className="font-bold text-[#7FA99B]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {customer.tips.min}-{customer.tips.max} {language === 'tr' ? 'kr' : 'cr'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!showDrinkMaker && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartMaking}
            className="w-full py-3 bg-gradient-to-r from-[#7FA99B] to-[#6B9489] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            {language === 'tr' ? '☕ Hazırlamaya Başla' : '☕ Start Making'}
          </motion.button>
        )}
      </motion.div>

      {/* İçecek Hazırlama Modal */}
      <AnimatePresence>
        {showDrinkMaker && (
          <DrinkMaker
            targetDrink={drink}
            onComplete={handleServeOrder}
            onCancel={() => setShowDrinkMaker(false)}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// İçecek Hazırlama Mini-Game Component
function DrinkMaker({ targetDrink, onComplete, onCancel, language }) {
  const [step, setStep] = useState(1); // 1: Cup, 2: Drink, 3: Toppings
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [selectedToppings, setSelectedToppings] = useState([]);

  const handleFinish = () => {
    const preparedDrink = {
      ...targetDrink,
      size: selectedSize,
      toppings: selectedToppings
    };
    onComplete(preparedDrink);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--card)] rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border-3 border-[var(--border)]"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[var(--text)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? '☕ İçecek Hazırla' : '☕ Make Drink'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all ${
                i <= step ? 'bg-[#7FA99B]' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? '1. Fincan Boyutunu Seç' : '1. Choose Cup Size'}
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedSize === size
                      ? 'border-[#7FA99B] bg-[#7FA99B]/20'
                      : 'border-gray-300 hover:border-[#7FA99B]/50'
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {size === 'small' ? '🥛' : size === 'medium' ? '☕' : '🍺'}
                  </div>
                  <p className="text-sm font-semibold" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {language === 'tr' 
                      ? size === 'small' ? 'Küçük' : size === 'medium' ? 'Orta' : 'Büyük'
                      : size.charAt(0).toUpperCase() + size.slice(1)}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full mt-6 py-3 bg-[#7FA99B] text-white font-bold rounded-xl"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              {language === 'tr' ? 'Devam →' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? '2. İçeceği Hazırla' : '2. Prepare Drink'}
            </h4>
            <div className="text-center p-8 bg-gradient-to-br from-[#F5E6D3] to-[#E8D9C6] rounded-xl">
              <div className="text-6xl mb-4">{targetDrink.emoji}</div>
              <p className="text-xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? targetDrink.name_tr : targetDrink.name_en}
              </p>
              <div className="mt-4 flex justify-center gap-2">
                {targetDrink.ingredients?.map((ing, i) => (
                  <span key={i} className="px-3 py-1 bg-white/70 rounded-full text-sm">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep(3)}
              className="w-full mt-6 py-3 bg-[#7FA99B] text-white font-bold rounded-xl"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              {language === 'tr' ? 'Devam →' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? '3. Servis Et!' : '3. Serve!'}
            </h4>
            <div className="text-center p-8 bg-gradient-to-br from-[#7FA99B]/20 to-[#6B9489]/20 rounded-xl">
              <div className="text-6xl mb-4">{targetDrink.emoji}</div>
              <p className="text-2xl font-bold text-[#5D4E37] mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? 'Hazır!' : 'Ready!'}
              </p>
              <p className="text-sm text-[#8B6F47]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)} {language === 'tr' ? targetDrink.name_tr : targetDrink.name_en}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFinish}
              className="w-full mt-6 py-4 bg-gradient-to-r from-[#7FA99B] to-[#6B9489] text-white font-bold rounded-xl shadow-lg text-lg"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              {language === 'tr' ? '✓ Servis Et' : '✓ Serve'}
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
