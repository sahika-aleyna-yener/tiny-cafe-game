import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, Cookie, Lock, Check, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Shop() {
  const { t, language } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch(`${API}/shop/items`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (item.locked) {
      toast.error(language === 'tr' ? `Seviye ${item.unlock_level} gerekli` : `Level ${item.unlock_level} required`);
      return;
    }
    
    if ((user?.credits || 0) < item.price) {
      toast.error(language === 'tr' ? 'Yeterli kredin yok' : 'Not enough credits');
      return;
    }

    if (user?.owned_items?.includes(item.item_id)) {
      toast.info(language === 'tr' ? 'Bu ürüne zaten sahipsin' : 'You already own this');
      return;
    }

    setPurchasing(item.item_id);
    
    try {
      const res = await fetch(`${API}/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ item_id: item.item_id }),
      });
      
      if (res.ok) {
        toast.success(language === 'tr' ? 'Satın alma başarılı!' : 'Purchase successful!');
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

  const drinks = items.filter(i => i.category === 'drinks');
  const treats = items.filter(i => i.category === 'treats');

  const getName = (item) => language === 'tr' ? item.name_tr : item.name_en;
  const getDesc = (item) => language === 'tr' ? item.description_tr : item.description_en;

  const renderItem = (item) => {
    const isOwned = user?.owned_items?.includes(item.item_id);
    const canAfford = (user?.credits || 0) >= item.price;
    
    return (
      <motion.div
        key={item.item_id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: item.locked ? 1 : 1.03, y: item.locked ? 0 : -4 }}
        className={`bg-[#F5E6D3] rounded-xl border-4 border-[#D4C4A8] p-4 text-center transition-shadow ${
          item.locked ? 'opacity-60' : 'hover:shadow-lg cursor-pointer'
        }`}
        data-testid={`shop-item-${item.item_id}`}
      >
        {/* Item Image */}
        <div className="w-20 h-20 mx-auto mb-3 rounded-xl overflow-hidden bg-white/50 border-2 border-[#D4C4A8]">
          {item.image_url.startsWith('/') ? (
            <img 
              src={item.image_url} 
              alt={getName(item)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl flex items-center justify-center h-full">{item.image_url}</span>
          )}
        </div>
        
        <h3 className="font-bold text-[#5D4E37] text-center mb-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {getName(item)}
        </h3>
        
        <p className="text-xs text-[#8B6B4D] text-center mb-3">
          {getDesc(item)}
        </p>
        
        {item.locked ? (
          <div className="flex items-center justify-center gap-2 text-[#A89880]">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-semibold">Lv.{item.unlock_level}</span>
          </div>
        ) : isOwned ? (
          <div className="flex items-center justify-center gap-2 text-[#81C784]">
            <Check className="w-4 h-4" />
            <span className="font-semibold text-sm">{language === 'tr' ? 'Sahip' : 'Owned'}</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePurchase(item)}
            disabled={!canAfford || purchasing === item.item_id}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm mx-auto border-b-2 ${
              canAfford
                ? 'bg-[#D4896A] text-white border-[#A66B4F] hover:bg-[#E09A7A]'
                : 'bg-[#D4C4A8] text-[#A89880] border-[#C4B498] cursor-not-allowed'
            }`}
            data-testid={`buy-btn-${item.item_id}`}
          >
            <span>🪙</span>
            {purchasing === item.item_id ? '...' : item.price}
          </motion.button>
        )}
      </motion.div>
    );
  };

  return (
    <div 
      className="min-h-screen pb-24 relative"
      style={{
        backgroundImage: 'url(/assets/themes/sakura-cafe.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-block bg-[#F5E6D3]/95 rounded-2xl border-4 border-[#D4C4A8] px-8 py-6 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Sparkles className="w-8 h-8 text-[#D4896A]" />
              <h1 className="text-4xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {language === 'tr' ? 'Mağaza' : 'Shop'}
              </h1>
              <Sparkles className="w-8 h-8 text-[#D4896A]" />
            </div>
            <p className="text-[#8B6B4D]">{language === 'tr' ? 'Kredilerini harca!' : 'Spend your credits!'}</p>
            
            {/* Credits display */}
            <div className="flex items-center justify-center gap-2 mt-4 px-6 py-3 bg-white/50 rounded-xl border-2 border-[#D4C4A8]">
              <span className="text-2xl">🪙</span>
              <span className="text-2xl font-bold text-[#5D4E37]">{user?.credits || 0}</span>
              <span className="text-[#8B6B4D]">{language === 'tr' ? 'Kredi' : 'Credits'}</span>
              <span className="text-2xl">🪙</span>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="drinks" className="w-full">
          <TabsList className="flex justify-center gap-4 mb-8">
            <TabsTrigger
              value="drinks"
              className="px-6 py-3 rounded-xl font-bold border-b-4 data-[state=active]:bg-[#D4896A] data-[state=active]:text-white data-[state=active]:border-[#A66B4F] data-[state=inactive]:bg-[#F5E6D3] data-[state=inactive]:text-[#5D4E37] data-[state=inactive]:border-[#D4C4A8]"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
              data-testid="tab-drinks"
            >
              <Coffee className="w-5 h-5 mr-2 inline" />
              {language === 'tr' ? 'İçecekler' : 'Drinks'}
            </TabsTrigger>
            <TabsTrigger
              value="treats"
              className="px-6 py-3 rounded-xl font-bold border-b-4 data-[state=active]:bg-[#D4896A] data-[state=active]:text-white data-[state=active]:border-[#A66B4F] data-[state=inactive]:bg-[#F5E6D3] data-[state=inactive]:text-[#5D4E37] data-[state=inactive]:border-[#D4C4A8]"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
              data-testid="tab-treats"
            >
              <Cookie className="w-5 h-5 mr-2 inline" />
              {language === 'tr' ? 'Tatlılar' : 'Treats'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drinks">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {drinks.map(renderItem)}
            </div>
          </TabsContent>

          <TabsContent value="treats">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {treats.map(renderItem)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
