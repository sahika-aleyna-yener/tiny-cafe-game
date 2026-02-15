import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { User, Shirt, ShoppingBag, Crown, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Character skins
const SKINS = [
  { id: 'default', emoji: '👤', name_tr: 'Varsayılan', name_en: 'Default', price: 0, premium: false },
  { id: 'student_girl', emoji: '👩‍🎓', name_tr: 'Öğrenci Kız', name_en: 'Student Girl', price: 200, premium: false },
  { id: 'student_boy', emoji: '👨‍🎓', name_tr: 'Öğrenci Erkek', name_en: 'Student Boy', price: 200, premium: false },
  { id: 'artist', emoji: '👩‍🎨', name_tr: 'Sanatçı', name_en: 'Artist', price: 300, premium: false },
  { id: 'dev', emoji: '👨‍💻', name_tr: 'Developer', name_en: 'Developer', price: 300, premium: false },
  { id: 'scientist', emoji: '👨‍🔬', name_tr: 'Bilim İnsanı', name_en: 'Scientist', price: 400, premium: false },
  { id: 'teacher', emoji: '👩‍🏫', name_tr: 'Öğretmen', name_en: 'Teacher', price: 400, premium: false },
  { id: 'cool', emoji: '😎', name_tr: 'Cool', name_en: 'Cool', price: 0, premium: true },
  { id: 'ninja', emoji: '🥷', name_tr: 'Ninja', name_en: 'Ninja', price: 0, premium: true },
];

// Outfits
const OUTFITS = [
  { id: 'casual', emoji: '👕', name_tr: 'Günlük Kıyafet', name_en: 'Casual', price: 0, premium: false },
  { id: 'hoodie', emoji: '🧥', name_tr: 'Kapşonlu', name_en: 'Hoodie', price: 150, premium: false },
  { id: 'suit', emoji: '👔', name_tr: 'Takım Elbise', name_en: 'Suit', price: 300, premium: false },
  { id: 'dress', emoji: '👗', name_tr: 'Elbise', name_en: 'Dress', price: 250, premium: false },
  { id: 'sports', emoji: '🏃', name_tr: 'Spor', name_en: 'Sports', price: 200, premium: false },
  { id: 'winter', emoji: '🧣', name_tr: 'Kışlık', name_en: 'Winter', price: 0, premium: true },
  { id: 'summer', emoji: '🩳', name_tr: 'Yazlık', name_en: 'Summer', price: 0, premium: true },
];

// Accessories
const ACCESSORIES = [
  { id: 'none', emoji: '🚫', name_tr: 'Yok', name_en: 'None', price: 0, premium: false },
  { id: 'glasses', emoji: '👓', name_tr: 'Gözlük', name_en: 'Glasses', price: 100, premium: false },
  { id: 'sunglasses', emoji: '🕶️', name_tr: 'Güneş Gözlüğü', name_en: 'Sunglasses', price: 150, premium: false },
  { id: 'hat', emoji: '🎩', name_tr: 'Şapka', name_en: 'Hat', price: 200, premium: false },
  { id: 'cap', emoji: '🧢', name_tr: 'Kep', name_en: 'Cap', price: 120, premium: false },
  { id: 'headphones', emoji: '🎧', name_tr: 'Kulaklık', name_en: 'Headphones', price: 180, premium: false },
  { id: 'crown', emoji: '👑', name_tr: 'Taç', name_en: 'Crown', price: 0, premium: true },
];

export default function CharacterCustomizer({ isOpen, onClose }) {
  const { language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [selectedSkin, setSelectedSkin] = useState('default');
  const [selectedOutfit, setSelectedOutfit] = useState('casual');
  const [selectedAccessory, setSelectedAccessory] = useState('none');
  const [ownedItems, setOwnedItems] = useState([]);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    if (user?.customization) {
      setSelectedSkin(user.customization.skin || 'default');
      setSelectedOutfit(user.customization.outfit || 'casual');
      setSelectedAccessory(user.customization.accessory || 'none');
    }
    if (user?.owned_customization) {
      setOwnedItems(user.owned_customization);
    }
  }, [user]);

  const handlePurchase = async (item, type) => {
    if (item.premium && !user?.is_premium) {
      toast.error(language === 'tr' ? 'Premium üyelik gerekli' : 'Premium membership required');
      return;
    }

    if (item.price > 0 && (user?.credits || 0) < item.price) {
      toast.error(language === 'tr' ? 'Yeterli kredin yok' : 'Not enough credits');
      return;
    }

    const itemId = `${type}_${item.id}`;
    if (ownedItems.includes(itemId)) {
      // Already owned, just equip
      await handleEquip(item, type);
      return;
    }

    setPurchasing(itemId);
    try {
      const res = await fetch(`${API}/customization/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ item_id: itemId, price: item.price }),
      });

      if (res.ok) {
        toast.success(language === 'tr' ? 'Satın alındı!' : 'Purchased!');
        await refreshUser();
        await handleEquip(item, type);
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      toast.error('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const handleEquip = async (item, type) => {
    try {
      const customization = {
        skin: type === 'skin' ? item.id : selectedSkin,
        outfit: type === 'outfit' ? item.id : selectedOutfit,
        accessory: type === 'accessory' ? item.id : selectedAccessory,
      };

      const res = await fetch(`${API}/customization/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(customization),
      });

      if (res.ok) {
        if (type === 'skin') setSelectedSkin(item.id);
        if (type === 'outfit') setSelectedOutfit(item.id);
        if (type === 'accessory') setSelectedAccessory(item.id);
        
        toast.success(language === 'tr' ? 'Kuşanıldı!' : 'Equipped!');
        await refreshUser();
      }
    } catch (err) {
      console.error('Equip failed:', err);
    }
  };

  const isOwned = (item, type) => {
    if (item.price === 0 && !item.premium) return true;
    return ownedItems.includes(`${type}_${item.id}`);
  };

  const isEquipped = (item, type) => {
    if (type === 'skin') return selectedSkin === item.id;
    if (type === 'outfit') return selectedOutfit === item.id;
    if (type === 'accessory') return selectedAccessory === item.id;
    return false;
  };

  const getName = (item) => language === 'tr' ? item.name_tr : item.name_en;

  const renderItem = (item, type) => {
    const owned = isOwned(item, type);
    const equipped = isEquipped(item, type);
    const canAfford = (user?.credits || 0) >= item.price;
    const isPremiumLocked = item.premium && !user?.is_premium;

    return (
      <motion.div
        key={item.id}
        whileHover={{ scale: 1.03 }}
        className={`bg-[#F5E6D3] rounded-xl border-4 p-4 text-center cursor-pointer ${
          equipped ? 'border-[#D4896A] shadow-lg' : 'border-[#D4C4A8]'
        } ${isPremiumLocked ? 'opacity-60' : ''}`}
        onClick={() => owned && !isPremiumLocked ? handleEquip(item, type) : handlePurchase(item, type)}
      >
        <div className="text-5xl mb-2">{item.emoji}</div>
        <p className="text-sm font-bold text-[#5D4E37] mb-1">{getName(item)}</p>
        
        {isPremiumLocked ? (
          <div className="flex items-center justify-center gap-1 text-amber-600">
            <Crown className="w-4 h-4" />
            <span className="text-xs font-semibold">Premium</span>
          </div>
        ) : equipped ? (
          <div className="flex items-center justify-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            <span className="text-xs font-semibold">{language === 'tr' ? 'Kuşanılı' : 'Equipped'}</span>
          </div>
        ) : owned ? (
          <button className="text-xs text-[#D4896A] font-semibold">
            {language === 'tr' ? 'Kuşan' : 'Equip'}
          </button>
        ) : (
          <div className={`text-xs font-semibold ${canAfford ? 'text-[#D4896A]' : 'text-[#A89880]'}`}>
            🪙 {item.price}
          </div>
        )}
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="bg-[#F5E6D3] rounded-2xl border-4 border-[#D4C4A8] p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? '✨ Karakter Özelleştirme' : '✨ Character Customization'}
            </h2>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-lg">
              <span className="text-xl">🪙</span>
              <span className="font-bold text-[#5D4E37]">{user?.credits || 0}</span>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white/50 rounded-xl p-8 mb-6 text-center">
            <div className="text-8xl mb-2">
              {SKINS.find(s => s.id === selectedSkin)?.emoji || '👤'}
            </div>
            <div className="flex items-center justify-center gap-4 text-4xl">
              {OUTFITS.find(o => o.id === selectedOutfit)?.emoji || '👕'}
              {selectedAccessory !== 'none' && (ACCESSORIES.find(a => a.id === selectedAccessory)?.emoji || '')}
            </div>
          </div>

          <Tabs defaultValue="skins" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/50 rounded-xl p-1">
              <TabsTrigger value="skins" className="rounded-lg">
                <User className="w-4 h-4 mr-2" />
                {language === 'tr' ? 'Karakterler' : 'Characters'}
              </TabsTrigger>
              <TabsTrigger value="outfits" className="rounded-lg">
                <Shirt className="w-4 h-4 mr-2" />
                {language === 'tr' ? 'Kıyafetler' : 'Outfits'}
              </TabsTrigger>
              <TabsTrigger value="accessories" className="rounded-lg">
                <ShoppingBag className="w-4 h-4 mr-2" />
                {language === 'tr' ? 'Aksesuarlar' : 'Accessories'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="skins">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {SKINS.map(skin => renderItem(skin, 'skin'))}
              </div>
            </TabsContent>

            <TabsContent value="outfits">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {OUTFITS.map(outfit => renderItem(outfit, 'outfit'))}
              </div>
            </TabsContent>

            <TabsContent value="accessories">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {ACCESSORIES.map(acc => renderItem(acc, 'accessory'))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
