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
      toast.error(t('shop_unlock_level', { level: item.unlock_level }));
      return;
    }
    
    if ((user?.credits || 0) < item.price) {
      toast.error(t('shop_not_enough'));
      return;
    }

    if (user?.owned_items?.includes(item.item_id)) {
      toast.info(t('shop_owned'));
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
        toast.success(t('shop_purchase_success'));
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
        whileHover={{ scale: item.locked ? 1 : 1.03 }}
        className={`shop-item ${item.locked ? 'locked' : ''}`}
        data-testid={`shop-item-${item.item_id}`}
      >
        <div className="shop-item-icon">
          {item.image_url}
        </div>
        
        <h3 className="font-bold text-[var(--text-main)] text-center mb-1">
          {getName(item)}
        </h3>
        
        <p className="text-sm text-[var(--text-muted)] text-center mb-3">
          {getDesc(item)}
        </p>
        
        {item.locked ? (
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Lv.{item.unlock_level}</span>
          </div>
        ) : isOwned ? (
          <div className="flex items-center gap-2 text-[var(--secondary)]">
            <Check className="w-4 h-4" />
            <span className="font-semibold">{t('shop_owned')}</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePurchase(item)}
            disabled={!canAfford || purchasing === item.item_id}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
              canAfford
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
            }`}
            data-testid={`buy-btn-${item.item_id}`}
          >
            <Coffee className="w-4 h-4" />
            {purchasing === item.item_id ? '...' : `${item.price}`}
          </motion.button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-4xl font-bold text-[var(--text-main)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {t('shop_title')}
            </h1>
          </div>
          <p className="text-[var(--text-muted)]">{t('shop_subtitle')}</p>
          
          {/* Credits display */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[var(--surface)] rounded-full shadow-md"
          >
            <Coffee className="w-6 h-6 text-[var(--primary)]" />
            <span className="text-2xl font-bold text-[var(--text-main)]">{user?.credits || 0}</span>
            <span className="text-[var(--text-muted)]">{t('dashboard_credits')}</span>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="drinks" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-[var(--surface)] rounded-full p-1">
            <TabsTrigger
              value="drinks"
              className="rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
              data-testid="tab-drinks"
            >
              <Coffee className="w-4 h-4 mr-2" />
              {t('shop_drinks')}
            </TabsTrigger>
            <TabsTrigger
              value="treats"
              className="rounded-full data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)]"
              data-testid="tab-treats"
            >
              <Cookie className="w-4 h-4 mr-2" />
              {t('shop_treats')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drinks">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {drinks.map(renderItem)}
            </div>
          </TabsContent>

          <TabsContent value="treats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {treats.map(renderItem)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
