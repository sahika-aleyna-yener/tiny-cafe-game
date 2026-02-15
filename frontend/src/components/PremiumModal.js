import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Zap, Star, Gift } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PREMIUM_FEATURES_TR = [
  { icon: <Crown className="w-5 h-5" />, text: 'Özel premium karakterler ve kıyafetler' },
  { icon: <Sparkles className="w-5 h-5" />, text: 'Reklamsız deneyim' },
  { icon: <Zap className="w-5 h-5" />, text: '2x kredi bonusu' },
  { icon: <Star className="w-5 h-5" />, text: 'Gelişmiş AI çalışma önerileri' },
  { icon: <Gift className="w-5 h-5" />, text: 'Özel temalar ve efektler' },
  { icon: <Check className="w-5 h-5" />, text: 'Sınırsız grup oluşturma' },
  { icon: <Check className="w-5 h-5" />, text: 'Öncelikli destek' },
  { icon: <Check className="w-5 h-5" />, text: 'Özel rozetler' },
];

const PREMIUM_FEATURES_EN = [
  { icon: <Crown className="w-5 h-5" />, text: 'Exclusive premium characters & outfits' },
  { icon: <Sparkles className="w-5 h-5" />, text: 'Ad-free experience' },
  { icon: <Zap className="w-5 h-5" />, text: '2x credit bonus' },
  { icon: <Star className="w-5 h-5" />, text: 'Advanced AI study recommendations' },
  { icon: <Gift className="w-5 h-5" />, text: 'Exclusive themes & effects' },
  { icon: <Check className="w-5 h-5" />, text: 'Unlimited group creation' },
  { icon: <Check className="w-5 h-5" />, text: 'Priority support' },
  { icon: <Check className="w-5 h-5" />, text: 'Exclusive badges' },
];

const PRICING_PLANS = [
  {
    id: 'monthly',
    name_tr: 'Aylık',
    name_en: 'Monthly',
    price: 29.99,
    period_tr: 'ay',
    period_en: 'month',
    popular: false
  },
  {
    id: 'yearly',
    name_tr: 'Yıllık',
    name_en: 'Yearly',
    price: 199.99,
    period_tr: 'yıl',
    period_en: 'year',
    popular: true,
    savings_tr: '%44 tasarruf!',
    savings_en: 'Save 44%!'
  }
];

export default function PremiumModal({ isOpen, onClose }) {
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [processing, setProcessing] = useState(false);

  const features = language === 'tr' ? PREMIUM_FEATURES_TR : PREMIUM_FEATURES_EN;

  const handleSubscribe = async () => {
    setProcessing(true);
    
    try {
      // In production, integrate with Stripe/PayPal
      const res = await fetch(`${API}/premium/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          plan: selectedPlan,
          payment_method: 'stripe' // or 'paypal'
        }),
      });

      if (res.ok) {
        const { checkout_url } = await res.json();
        
        // Redirect to payment page
        if (checkout_url) {
          window.location.href = checkout_url;
        } else {
          toast.success(language === 'tr' ? 'Premium aktif!' : 'Premium activated!');
          await refreshUser();
          onClose();
        }
      } else {
        toast.error(language === 'tr' ? 'Ödeme başarısız' : 'Payment failed');
      }
    } catch (err) {
      console.error('Subscription failed:', err);
      toast.error('Subscription failed');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  // If already premium
  if (user?.is_premium) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-6xl mb-4"
          >
            👑
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? 'Premium Üye' : 'Premium Member'}
          </h2>
          <p className="text-white/90 mb-6">
            {language === 'tr' 
              ? 'Zaten premium üyeliğiniz var!' 
              : 'You already have premium membership!'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-3 bg-white text-yellow-600 rounded-xl font-bold shadow-lg"
          >
            {language === 'tr' ? 'Kapat' : 'Close'}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-7xl mb-4"
          >
            👑
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-2" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? 'Premium\'a Geç' : 'Go Premium'}
          </h2>
          <p className="text-white/90 text-lg">
            {language === 'tr' 
              ? 'Tam potansiyelini ortaya çıkar!' 
              : 'Unlock your full potential!'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Features */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              ✨ {language === 'tr' ? 'Özellikler' : 'Features'}
            </h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 text-white"
                >
                  <div className="mt-0.5 text-yellow-300">{feature.icon}</div>
                  <p className="flex-1">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 text-center" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              💰 {language === 'tr' ? 'Plan Seç' : 'Choose Plan'}
            </h3>
            <div className="space-y-4">
              {PRICING_PLANS.map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`bg-white rounded-xl p-6 cursor-pointer transition-all relative ${
                    selectedPlan === plan.id 
                      ? 'ring-4 ring-yellow-400 shadow-2xl' 
                      : 'ring-2 ring-white/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-purple-900 px-4 py-1 rounded-full text-xs font-bold">
                      {language === 'tr' ? '🔥 En Popüler' : '🔥 Most Popular'}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xl font-bold text-purple-900">
                      {language === 'tr' ? plan.name_tr : plan.name_en}
                    </h4>
                    {selectedPlan === plan.id && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold text-purple-900">₺{plan.price}</span>
                    <span className="text-gray-600">/ {language === 'tr' ? plan.period_tr : plan.period_en}</span>
                  </div>
                  
                  {plan.savings_tr && (
                    <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                      {language === 'tr' ? plan.savings_tr : plan.savings_en}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubscribe}
              disabled={processing}
              className="w-full mt-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg shadow-2xl disabled:opacity-50"
            >
              {processing 
                ? '...' 
                : language === 'tr' 
                  ? '✨ Premium Al' 
                  : '✨ Get Premium'}
            </motion.button>

            <p className="text-white/70 text-xs text-center mt-4">
              {language === 'tr' 
                ? 'İstediğin zaman iptal edebilirsin' 
                : 'Cancel anytime'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
