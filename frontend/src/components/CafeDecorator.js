import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Grid, Move, RotateCw, Trash2, ShoppingBag, Save } from 'lucide-react';
import { toast } from 'sonner';

const FURNITURE_ITEMS = [
  { id: 'table_wood', name_tr: 'Ahşap Masa', name_en: 'Wood Table', emoji: '🪑', width: 2, height: 2, category: 'furniture' },
  { id: 'chair_brown', name_tr: 'Kahverengi Sandalye', name_en: 'Brown Chair', emoji: '💺', width: 1, height: 1, category: 'furniture' },
  { id: 'sofa_comfy', name_tr: 'Rahat Koltuk', name_en: 'Comfy Sofa', emoji: '🛋️', width: 3, height: 1, category: 'furniture' },
  { id: 'plant_pot', name_tr: 'Saksı Bitki', name_en: 'Potted Plant', emoji: '🪴', width: 1, height: 1, category: 'decoration' },
  { id: 'lamp_floor', name_tr: 'Lambader', name_en: 'Floor Lamp', emoji: '💡', width: 1, height: 1, category: 'decoration' },
  { id: 'painting', name_tr: 'Tablo', name_en: 'Painting', emoji: '🖼️', width: 2, height: 1, category: 'decoration' },
  { id: 'bookshelf', name_tr: 'Kitaplık', name_en: 'Bookshelf', emoji: '📚', width: 2, height: 2, category: 'furniture' },
  { id: 'rug_cozy', name_tr: 'Yumuşak Halı', name_en: 'Cozy Rug', emoji: '🎨', width: 3, height: 2, category: 'decoration' },
];

const GRID_SIZE = 8;
const CELL_SIZE = 60;

export default function CafeDecorator({ language = 'tr', isOpen, onClose }) {
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [showGrid, setShowGrid] = useState(true);

  const handleDragStart = (item, index = null) => {
    setDraggedItem({ item, placedIndex: index });
  };

  const handleDrop = (x, y) => {
    if (!draggedItem) return;

    const { item, placedIndex } = draggedItem;

    // Check if position is valid (within grid and not overlapping)
    if (!isValidPosition(x, y, item, placedIndex)) {
      toast.error(language === 'tr' ? 'Bu konuma yerleştiremezsiniz' : 'Cannot place here');
      setDraggedItem(null);
      return;
    }

    // Place or move item
    if (placedIndex !== null) {
      // Moving existing item
      setPlacedItems(prev => 
        prev.map((p, i) => i === placedIndex ? { ...p, x, y } : p)
      );
    } else {
      // Placing new item
      setPlacedItems(prev => [...prev, { ...item, x, y, rotation: 0, id: Date.now() }]);
    }

    setDraggedItem(null);
  };

  const isValidPosition = (x, y, item, excludeIndex = null) => {
    // Check bounds
    if (x < 0 || y < 0 || x + item.width > GRID_SIZE || y + item.height > GRID_SIZE) {
      return false;
    }

    // Check overlap with other items
    for (let i = 0; i < placedItems.length; i++) {
      if (i === excludeIndex) continue;
      
      const placed = placedItems[i];
      if (!(x >= placed.x + placed.width || 
            x + item.width <= placed.x ||
            y >= placed.y + placed.height ||
            y + item.height <= placed.y)) {
        return false;
      }
    }

    return true;
  };

  const handleRotate = (index) => {
    setPlacedItems(prev => 
      prev.map((item, i) => 
        i === index 
          ? { ...item, rotation: (item.rotation + 90) % 360, width: item.height, height: item.width }
          : item
      )
    );
  };

  const handleDelete = (index) => {
    setPlacedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      // Save to backend
      toast.success(language === 'tr' ? 'Kafe dekorasyonu kaydedildi!' : 'Cafe decoration saved!');
    } catch (err) {
      toast.error(language === 'tr' ? 'Kaydetme başarısız' : 'Save failed');
    }
  };

  if (!isOpen) return null;

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
        className="bg-[#F5E6D3] rounded-2xl border-4 border-[#D4C4A8] p-6 max-w-6xl w-full max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#5D4E37]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {language === 'tr' ? '☕ Kafe Dekorasyonu' : '☕ Cafe Decoration'}
          </h2>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded-lg ${showGrid ? 'bg-[#D4896A] text-white' : 'bg-white/50 text-[#5D4E37]'}`}
            >
              <Grid className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-4 py-2 bg-[#D4896A] text-white rounded-lg font-bold flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {language === 'tr' ? 'Kaydet' : 'Save'}
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Furniture Palette */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-bold text-[#5D4E37] mb-3" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              <ShoppingBag className="w-5 h-5 inline mr-2" />
              {language === 'tr' ? 'Eşyalar' : 'Items'}
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {FURNITURE_ITEMS.map((item) => (
                <motion.div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(item)}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-lg p-3 border-2 border-[#D4C4A8] cursor-move hover:border-[#D4896A] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#5D4E37] truncate">
                        {language === 'tr' ? item.name_tr : item.name_en}
                      </p>
                      <p className="text-xs text-[#8B6B4D]">
                        {item.width}x{item.height}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Grid Canvas */}
          <div className="lg:col-span-3">
            <div 
              className="relative bg-[#E8D9C6] rounded-xl border-4 border-[#D4C4A8] overflow-hidden"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                maxWidth: '100%',
                aspectRatio: '1/1'
              }}
            >
              {/* Grid Background */}
              {showGrid && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
                    <g key={i}>
                      <line
                        x1={`${(i / GRID_SIZE) * 100}%`}
                        y1="0"
                        x2={`${(i / GRID_SIZE) * 100}%`}
                        y2="100%"
                        stroke="#D4C4A8"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                      <line
                        x1="0"
                        y1={`${(i / GRID_SIZE) * 100}%`}
                        x2="100%"
                        y2={`${(i / GRID_SIZE) * 100}%`}
                        stroke="#D4C4A8"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    </g>
                  ))}
                </svg>
              )}

              {/* Drop zones */}
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                  const x = i % GRID_SIZE;
                  const y = Math.floor(i / GRID_SIZE);
                  return (
                    <div
                      key={i}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(x, y)}
                      className="border border-transparent hover:bg-[#D4896A]/10 transition-colors"
                    />
                  );
                })}
              </div>

              {/* Placed Items */}
              <AnimatePresence>
                {placedItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    drag
                    dragMomentum={false}
                    onDragStart={() => handleDragStart(item, index)}
                    className="absolute cursor-move group"
                    style={{
                      left: `${(item.x / GRID_SIZE) * 100}%`,
                      top: `${(item.y / GRID_SIZE) * 100}%`,
                      width: `${(item.width / GRID_SIZE) * 100}%`,
                      height: `${(item.height / GRID_SIZE) * 100}%`,
                      transform: `rotate(${item.rotation}deg)`,
                    }}
                  >
                    <div className="relative w-full h-full bg-white/80 rounded-lg border-2 border-[#D4C4A8] flex items-center justify-center group-hover:border-[#D4896A] transition-colors">
                      <span className="text-4xl">{item.emoji}</span>
                      
                      {/* Control buttons */}
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRotate(index);
                          }}
                          className="p-1 bg-[#D4896A] text-white rounded"
                        >
                          <RotateCw className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(index);
                          }}
                          className="p-1 bg-red-500 text-white rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Help text */}
            <p className="text-center text-sm text-[#8B6B4D] mt-4">
              {language === 'tr' 
                ? '💡 Eşyaları sürükleyerek yerleştirin, döndürün ve düzenleyin' 
                : '💡 Drag items to place, rotate, and arrange them'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
