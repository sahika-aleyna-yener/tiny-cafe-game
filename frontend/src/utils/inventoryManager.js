// Shop Items ve Inventory Sistemi
export const SHOP_ITEMS = {
  // Pets
  pets: [
    { 
      id: 'cat-orange', 
      name_tr: 'Turuncu Kedi', 
      name_en: 'Orange Cat',
      image: '/assets/pets/cat-orange.jpg',
      price: 5000,
      category: 'pet',
      rarity: 'common',
      emoji: '🐱'
    },
    { 
      id: 'bunny-white', 
      name_tr: 'Beyaz Tavşan', 
      name_en: 'White Bunny',
      image: '/assets/pets/bunny-white.jpg',
      price: 6000,
      category: 'pet',
      rarity: 'common',
      emoji: '🐰'
    },
    { 
      id: 'poncik-bear', 
      name_tr: 'Poncik Ayı', 
      name_en: 'Poncik Bear',
      image: '/assets/pets/poncik-bear.jpg',
      price: 8000,
      category: 'pet',
      rarity: 'rare',
      emoji: '🐻'
    },
    { 
      id: 'panda-baby', 
      name_tr: 'Bebek Panda', 
      name_en: 'Baby Panda',
      image: '/assets/pets/panda-baby.jpg',
      price: 10000,
      category: 'pet',
      rarity: 'epic',
      emoji: '🐼'
    },
  ],
  
  // Character Outfits
  outfits: [
    {
      id: 'casual',
      name_tr: 'Günlük Kıyafet',
      name_en: 'Casual Outfit',
      image: '/assets/character/casual.png',
      price: 0, // Varsayılan
      category: 'outfit',
      rarity: 'common',
      emoji: '👕'
    },
    {
      id: 'cozy',
      name_tr: 'Rahat Kıyafet',
      name_en: 'Cozy Outfit',
      image: '/assets/character/cozy.png',
      price: 3000,
      category: 'outfit',
      rarity: 'common',
      emoji: '🧥'
    },
    {
      id: 'study-uniform',
      name_tr: 'Çalışma Üniforması',
      name_en: 'Study Uniform',
      image: '/assets/character/uniform.png',
      price: 5000,
      category: 'outfit',
      rarity: 'rare',
      emoji: '🎓'
    },
  ],
  
  // Cafe Furniture
  furniture: [
    {
      id: 'table-wood-1',
      name_tr: 'Ahşap Masa',
      name_en: 'Wooden Table',
      image: '/assets/items/table-wood.jpg',
      price: 1500,
      category: 'furniture',
      size: { width: 2, height: 2 }, // Grid units
      rarity: 'common',
      emoji: '🪑'
    },
    {
      id: 'chair-modern',
      name_tr: 'Modern Sandalye',
      name_en: 'Modern Chair',
      image: '/assets/items/chair-modern.jpg',
      price: 800,
      category: 'furniture',
      size: { width: 1, height: 1 },
      rarity: 'common',
      emoji: '🪑'
    },
    {
      id: 'plant-pot',
      name_tr: 'Saksı Bitki',
      name_en: 'Potted Plant',
      image: '/assets/items/plant-pot.jpg',
      price: 1200,
      category: 'decoration',
      size: { width: 1, height: 1 },
      rarity: 'common',
      emoji: '🪴'
    },
    {
      id: 'painting-sakura',
      name_tr: 'Kiraz Çiçeği Tablosu',
      name_en: 'Sakura Painting',
      image: '/assets/items/painting-sakura.jpg',
      price: 2000,
      category: 'decoration',
      size: { width: 2, height: 1 },
      rarity: 'rare',
      emoji: '🖼️'
    },
    {
      id: 'lamp-vintage',
      name_tr: 'Vintage Lamba',
      name_en: 'Vintage Lamp',
      image: '/assets/items/lamp-vintage.jpg',
      price: 1800,
      category: 'decoration',
      size: { width: 1, height: 2 },
      rarity: 'rare',
      emoji: '💡'
    },
  ],
  
  // Themes
  themes: [
    {
      id: 'sakura',
      name_tr: 'Kiraz Çiçeği',
      name_en: 'Sakura',
      image: '/assets/themes/sakura.jpg',
      price: 0, // Varsayılan
      category: 'theme',
      colors: {
        primary: '#F5E6D3',
        secondary: '#FFB7C5',
        accent: '#FF69B4'
      },
      rarity: 'common',
      emoji: '🌸'
    },
    {
      id: 'autumn',
      name_tr: 'Sonbahar',
      name_en: 'Autumn',
      image: '/assets/themes/autumn.jpg',
      price: 4000,
      category: 'theme',
      colors: {
        primary: '#D4A574',
        secondary: '#8B4513',
        accent: '#FF8C00'
      },
      rarity: 'rare',
      emoji: '🍂'
    },
    {
      id: 'winter',
      name_tr: 'Kış',
      name_en: 'Winter',
      image: '/assets/themes/winter.jpg',
      price: 4000,
      category: 'theme',
      colors: {
        primary: '#E8F4F8',
        secondary: '#B0E0E6',
        accent: '#4682B4'
      },
      rarity: 'rare',
      emoji: '❄️'
    },
  ]
};

// Inventory Manager Class
export class InventoryManager {
  constructor(userId) {
    this.userId = userId;
    this.items = this.loadInventory();
  }

  // LocalStorage'dan yükle
  loadInventory() {
    const saved = localStorage.getItem(`inventory_${this.userId}`);
    return saved ? JSON.parse(saved) : {
      pets: [],
      outfits: ['casual'], // Varsayılan
      furniture: [],
      themes: ['sakura'], // Varsayılan
      equipped: {
        pet: null,
        outfit: 'casual',
        theme: 'sakura'
      }
    };
  }

  // LocalStorage'a kaydet
  saveInventory() {
    localStorage.setItem(`inventory_${this.userId}`, JSON.stringify(this.items));
  }

  // Eşya satın al
  purchaseItem(itemId, userCredits) {
    // Tüm kategorilerde ara
    let item = null;
    let category = null;
    
    for (const [cat, items] of Object.entries(SHOP_ITEMS)) {
      item = items.find(i => i.id === itemId);
      if (item) {
        category = cat;
        break;
      }
    }
    
    if (!item) {
      return { success: false, error: 'Item not found' };
    }
    
    // Zaten sahip mi?
    if (this.items[category].includes(itemId)) {
      return { success: false, error: 'Already owned' };
    }
    
    // Yeterli kredi var mı?
    if (userCredits < item.price) {
      return { success: false, error: 'Insufficient credits' };
    }
    
    // Satın al
    this.items[category].push(itemId);
    this.saveInventory();
    
    return { 
      success: true, 
      item,
      creditsSpent: item.price,
      newBalance: userCredits - item.price
    };
  }

  // Eşya kullan/kuşan
  equipItem(itemId, category) {
    // Sahip mi?
    if (!this.items[category].includes(itemId)) {
      return { success: false, error: 'Not owned' };
    }
    
    // Kuşan
    if (category === 'pets') {
      this.items.equipped.pet = itemId;
    } else if (category === 'outfits') {
      this.items.equipped.outfit = itemId;
    } else if (category === 'themes') {
      this.items.equipped.theme = itemId;
    }
    
    this.saveInventory();
    return { success: true };
  }

  // Sahip olunan eşyaları al
  getOwnedItems(category) {
    return this.items[category] || [];
  }

  // Kuşanılmış eşyaları al
  getEquippedItems() {
    return this.items.equipped;
  }

  // Belirli bir eşya sahip mi?
  ownsItem(itemId, category) {
    return this.items[category]?.includes(itemId) || false;
  }

  // Tüm sahip olunan eşyaların toplam değeri
  getTotalValue() {
    let total = 0;
    
    for (const [category, ownedIds] of Object.entries(this.items)) {
      if (category === 'equipped') continue;
      
      ownedIds.forEach(id => {
        const item = SHOP_ITEMS[category]?.find(i => i.id === id);
        if (item) total += item.price;
      });
    }
    
    return total;
  }
}

// Helper: Get item by ID
export function getItemById(itemId) {
  for (const items of Object.values(SHOP_ITEMS)) {
    const item = items.find(i => i.id === itemId);
    if (item) return item;
  }
  return null;
}

// Helper: Filter shop items
export function filterShopItems(category, rarity = null, maxPrice = null) {
  let items = SHOP_ITEMS[category] || [];
  
  if (rarity) {
    items = items.filter(i => i.rarity === rarity);
  }
  
  if (maxPrice) {
    items = items.filter(i => i.price <= maxPrice);
  }
  
  return items;
}

// Helper: Get all purchasable items
export function getAllShopItems() {
  const all = [];
  for (const [category, items] of Object.entries(SHOP_ITEMS)) {
    items.forEach(item => {
      all.push({ ...item, category });
    });
  }
  return all;
}
