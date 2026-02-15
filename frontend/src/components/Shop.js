import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { SHOP_ITEMS, InventoryManager } from '../utils/inventoryManager';
import { ShoppingCart, Check, Lock, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function Shop({ userId, userCredits, onPurchase, onEquip }) {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('pets');
  const [inventoryManager] = useState(() => new InventoryManager(userId));

  const categories = [
    { id: 'pets', name_tr: 'Evcil Hayvanlar', name_en: 'Pets', emoji: '🐱' },
    { id: 'outfits', name_tr: 'Kıyafetler', name_en: 'Outfits', emoji: '👕' },
    { id: 'furniture', name_tr: 'Mobilya', name_en: 'Furniture', emoji: '🪑' },
    { id: 'themes', name_tr: 'Temalar', name_en: 'Themes', emoji: '🎨' },
  ];

  const currentItems = SHOP_ITEMS[selectedCategory] || [];
  const ownedItems = inventoryManager.getOwnedItems(selectedCategory);
  const equippedItems = inventoryManager.getEquippedItems();

  const handlePurchase = (item) => {
    const result = inventoryManager.purchaseItem(item.id, userCredits);
    
    if (result.success) {
      toast.success(
        language === 'tr'
          ? `🛍️ ${item.name_tr} satın alındı!`
          : `🛍️ ${item.name_en} purchased!`
      );
      
      if (onPurchase) {
        onPurchase(result);
      }
    } else {
      if (result.error === 'Already owned') {
        toast.error(language === 'tr' ? 'Zaten sahipsin!' : 'Already owned!');
      } else if (result.error === 'Insufficient credits') {
        toast.error(
          language === 'tr'
            ? `Yetersiz kredi! ${item.price - userCredits} daha gerekli.`
            : `Not enough credits! Need ${item.price - userCredits} more.`
        );
      }
    }
  };

  const handleEquip = (item) => {
    const result = inventoryManager.equipItem(item.id, selectedCategory);
    
    if (result.success) {
      toast.success(
        language === 'tr'
          ? `✨ ${item.name_tr} kuşanıldı!`
          : `✨ ${item.name_en} equipped!`
      );
      
      if (onEquip) {
        onEquip({ item, category: selectedCategory });
      }
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 bg-gray-50';
      case 'rare': return 'border-blue-400 bg-blue-50';
      case 'epic': return 'border-purple-400 bg-purple-50';
      case 'legendary': return 'border-yellow-400 bg-yellow-50';
      default: return 'border-gray-300';
    }
  };

  const isEquipped = (itemId) => {
    if (selectedCategory === 'pets') return equippedItems.pet === itemId;
    if (selectedCategory === 'outfits') return equippedItems.outfit === itemId;
    if (selectedCategory === 'themes') return equippedItems.theme === itemId;
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-[var(--text)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {language === 'tr' ? '🛍️ Dükkan' : '🛍️ Shop'}
        </h2>
        <div className="text-right">
          <p className="text-sm text-[var(--text-muted)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? 'Kredilerin' : 'Your Credits'}
          </p>
          <p className="text-2xl font-bold text-[var(--primary)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {userCredits.toLocaleString()} {language === 'tr' ? 'kr' : 'cr'}
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[var(--primary)] text-white shadow-lg'
                : 'bg-[var(--card)] text-[var(--text)] hover:bg-[var(--background)]'
            }`}
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            <span className="mr-2">{cat.emoji}</span>
            {language === 'tr' ? cat.name_tr : cat.name_en}
          </motion.button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {currentItems.map((item, index) => {
            const owned = ownedItems.includes(item.id);
            const equipped = isEquipped(item.id);
            const canAfford = userCredits >= item.price;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`relative bg-[var(--card)] rounded-xl p-4 border-2 ${getRarityColor(item.rarity)} shadow-md hover:shadow-xl transition-all`}
              >
                {/* Rarity Badge */}
                {item.rarity !== 'common' && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-xs font-bold">
                    <Star className="w-3 h-3" />
                    {item.rarity.toUpperCase()}
                  </div>
                )}

                {/* Equipped Badge */}
                {equipped && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                    <Check className="w-3 h-3" />
                    {language === 'tr' ? 'Kuşanılı' : 'Equipped'}
                  </div>
                )}

                {/* Item Image */}
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-[var(--background)]">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={language === 'tr' ? item.name_tr : item.name_en}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full flex items-center justify-center" style={{ display: item.image ? 'none' : 'flex' }}>
                    <span className="text-6xl">{item.emoji}</span>
                  </div>
                </div>

                {/* Item Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                    {language === 'tr' ? item.name_tr : item.name_en}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[var(--primary)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      {item.price === 0 ? (
                        language === 'tr' ? 'Ücretsiz' : 'Free'
                      ) : (
                        `${item.price.toLocaleString()} ${language === 'tr' ? 'kr' : 'cr'}`
                      )}
                    </span>
                  </div>

                  {/* Action Button */}
                  {owned ? (
                    equipped ? (
                      <div className="w-full py-2 bg-green-100 text-green-700 rounded-lg text-center font-bold flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        {language === 'tr' ? 'Kuşanılı' : 'Equipped'}
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEquip(item)}
                        className="w-full py-2 bg-[var(--primary)] text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-colors"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                      >
                        <Sparkles className="w-4 h-4" />
                        {language === 'tr' ? 'Kuşan' : 'Equip'}
                      </motion.button>
                    )
                  ) : (
                    <motion.button
                      whileHover={{ scale: canAfford ? 1.05 : 1 }}
                      whileTap={{ scale: canAfford ? 0.95 : 1 }}
                      onClick={() => canAfford && handlePurchase(item)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                        canAfford
                          ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                      {canAfford ? (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          {language === 'tr' ? 'Satın Al' : 'Buy'}
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          {language === 'tr' ? 'Yetersiz Kredi' : 'Not Enough'}
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {currentItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl text-[var(--text-muted)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? 'Bu kategoride henüz ürün yok.' : 'No items in this category yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
