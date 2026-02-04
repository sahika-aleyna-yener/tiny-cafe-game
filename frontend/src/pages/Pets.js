import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Lock, Check, Coffee, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PETS = [
  { pet_id: 'poncik', name_tr: 'Poncik', name_en: 'Poncik', description_tr: 'Senin sadık çalışma arkadaşın', description_en: 'Your loyal study buddy', image: 'https://images.unsplash.com/photo-1720351458123-13e188604960?w=200&h=200&fit=crop', price: 0, unlock_level: 1 },
  { pet_id: 'bunny', name_tr: 'Fluffy Tavşan', name_en: 'Fluffy Bunny', description_tr: 'Yumuşacık ve sevimli', description_en: 'Soft and cuddly', image: 'https://images.unsplash.com/photo-1747999616813-bd499f1fce55?w=200&h=200&fit=crop', price: 100, unlock_level: 2 },
  { pet_id: 'cat_orange', name_tr: 'Turuncu Kedi', name_en: 'Orange Cat', description_tr: 'Tembel ama sevimli', description_en: 'Lazy but cute', image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop', price: 120, unlock_level: 2 },
  { pet_id: 'puppy', name_tr: 'Kahverengi Köpek', name_en: 'Brown Puppy', description_tr: 'En sadık dost', description_en: 'Most loyal friend', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop', price: 150, unlock_level: 3 },
  { pet_id: 'hamster', name_tr: 'Sevimli Hamster', name_en: 'Cute Hamster', description_tr: 'Minik enerji topu', description_en: 'Tiny energy ball', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop', price: 180, unlock_level: 3 },
  { pet_id: 'kitten', name_tr: 'Gri Kedi', name_en: 'Gray Kitten', description_tr: 'Gizemli ve zarif', description_en: 'Mysterious and elegant', image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=200&h=200&fit=crop', price: 130, unlock_level: 2 },
  { pet_id: 'fox', name_tr: 'Kızıl Tilki', name_en: 'Red Fox', description_tr: 'Kurnaz ve akıllı', description_en: 'Clever and smart', image: 'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=200&h=200&fit=crop', price: 250, unlock_level: 5 },
  { pet_id: 'owl', name_tr: 'Gece Baykuşu', name_en: 'Night Owl', description_tr: 'Gece çalışanların dostu', description_en: 'Friend of night studiers', image: 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb?w=200&h=200&fit=crop', price: 220, unlock_level: 4 },
  { pet_id: 'panda', name_tr: 'Bebek Panda', name_en: 'Baby Panda', description_tr: 'Bambu aşığı', description_en: 'Bamboo lover', image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&h=200&fit=crop', price: 300, unlock_level: 6 },
  { pet_id: 'penguin', name_tr: 'Minik Penguen', name_en: 'Little Penguin', description_tr: 'Soğukkanlı ve sevimli', description_en: 'Cool and cute', image: 'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?w=200&h=200&fit=crop', price: 280, unlock_level: 5 },
  { pet_id: 'raccoon', name_tr: 'Rakun Arkadaş', name_en: 'Raccoon Friend', description_tr: 'Meraklı gezgin', description_en: 'Curious explorer', image: 'https://images.unsplash.com/photo-1497752531616-c3afd9760a11?w=200&h=200&fit=crop', price: 200, unlock_level: 4 },
  { pet_id: 'squirrel', name_tr: 'Mutlu Sincap', name_en: 'Happy Squirrel', description_tr: 'Enerjik ve neşeli', description_en: 'Energetic and cheerful', image: 'https://images.unsplash.com/photo-1507666405895-422eee7d517f?w=200&h=200&fit=crop', price: 150, unlock_level: 3 },
];

export default function Pets() {
  const { t, language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [selectedPet, setSelectedPet] = useState(null);
  const [purchasing, setPurchasing] = useState(null);

  const getName = (pet) => language === 'tr' ? pet.name_tr : pet.name_en;
  const getDesc = (pet) => language === 'tr' ? pet.description_tr : pet.description_en;

  const isOwned = (petId) => {
    if (petId === 'poncik') return true; // Default pet
    return user?.owned_items?.includes(`pet_${petId}`);
  };

  const isLocked = (pet) => (user?.level || 1) < pet.unlock_level;

  const handlePurchase = async (pet) => {
    if (isLocked(pet)) {
      toast.error(language === 'tr' 
        ? `Seviye ${pet.unlock_level} gerekli` 
        : `Level ${pet.unlock_level} required`);
      return;
    }

    if (isOwned(pet.pet_id)) {
      // Set as active pet
      toast.success(language === 'tr' ? 'Evcil hayvan seçildi!' : 'Pet selected!');
      return;
    }

    if ((user?.credits || 0) < pet.price) {
      toast.error(language === 'tr' ? 'Yeterli kredin yok' : 'Not enough credits');
      return;
    }

    setPurchasing(pet.pet_id);

    try {
      const res = await fetch(`${API}/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ item_id: `pet_${pet.pet_id}` }),
      });

      if (res.ok) {
        toast.success(language === 'tr' ? 'Yeni arkadaşın geldi!' : 'Your new friend arrived!');
        await refreshUser();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Purchase failed');
      }
    } catch (err) {
      console.error('Purchase failed:', err);
      toast.error('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-4xl font-bold text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {language === 'tr' ? 'Evcil Hayvanlar' : 'Pets'}
            </h1>
          </div>
          <p className="text-[var(--text-muted)]">
            {language === 'tr' ? 'Çalışma arkadaşını seç!' : 'Choose your study buddy!'}
          </p>
          
          {/* Credits display */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[var(--surface)] rounded-full shadow-md"
          >
            <Coffee className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-2xl font-bold text-[var(--text-main)]">{user?.credits || 0}</span>
            <span className="text-[var(--text-muted)]">{language === 'tr' ? 'Kredi' : 'Credits'}</span>
          </motion.div>
        </motion.div>

        {/* Pets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {PETS.map((pet, index) => {
            const owned = isOwned(pet.pet_id);
            const locked = isLocked(pet);
            const canAfford = (user?.credits || 0) >= pet.price;

            return (
              <motion.div
                key={pet.pet_id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: locked ? 1 : 1.03 }}
                onClick={() => !locked && setSelectedPet(pet)}
                className={`cozy-card cursor-pointer text-center relative overflow-hidden ${locked ? 'opacity-60' : ''}`}
                data-testid={`pet-${pet.pet_id}`}
              >
                {/* Pet Image */}
                <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-4 border-[var(--surface-highlight)]">
                  <img 
                    src={pet.image} 
                    alt={getName(pet)}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Pet Name */}
                <h3 className="font-bold text-[var(--text-main)] mb-1">
                  {getName(pet)}
                </h3>

                {/* Description */}
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  {getDesc(pet)}
                </p>

                {/* Status */}
                {locked ? (
                  <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm">Lv.{pet.unlock_level}</span>
                  </div>
                ) : owned ? (
                  <div className="flex items-center justify-center gap-2 text-[var(--secondary)]">
                    <Check className="w-4 h-4" />
                    <span className="font-semibold text-sm">{language === 'tr' ? 'Sahip' : 'Owned'}</span>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(pet);
                    }}
                    disabled={!canAfford || purchasing === pet.pet_id}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full font-semibold text-sm mx-auto ${
                      canAfford
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                    }`}
                    data-testid={`buy-pet-${pet.pet_id}`}
                  >
                    <Coffee className="w-4 h-4" />
                    {purchasing === pet.pet_id ? '...' : pet.price}
                  </motion.button>
                )}

                {/* Special badge for Poncik */}
                {pet.pet_id === 'poncik' && (
                  <div className="absolute top-2 right-2 bg-[var(--accent)] text-white text-xs px-2 py-1 rounded-full">
                    <Sparkles className="w-3 h-3 inline mr-1" />
                    {language === 'tr' ? 'Varsayılan' : 'Default'}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
