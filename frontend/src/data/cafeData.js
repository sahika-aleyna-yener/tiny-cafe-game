// Müşteri Karakterleri
export const CUSTOMERS = [
  {
    id: 'ayse',
    name_tr: 'Öğrenci Ayşe',
    name_en: 'Student Ayşe',
    emoji: '👩‍🎓',
    personality: 'studious',
    favoriteTime: { start: 9, end: 12 }, // Sabah 9-12
    favoriteDrinks: ['black_tea', 'green_tea', 'latte'],
    orderFrequency: 'medium',
    tips: { min: 50, max: 150 },
    description_tr: 'Sınav öncesi çay içmeyi sever',
    description_en: 'Loves tea before exams',
    patience: 30, // seconds
    mood: 'calm'
  },
  {
    id: 'cem',
    name_tr: 'Developer Cem',
    name_en: 'Developer Cem',
    emoji: '🧑‍💻',
    personality: 'focused',
    favoriteTime: { start: 22, end: 2 }, // Gece 22-02
    favoriteDrinks: ['espresso', 'double_espresso', 'cold_brew'],
    orderFrequency: 'high',
    tips: { min: 100, max: 200 },
    description_tr: 'Gece kodlamak için double espresso ister',
    description_en: 'Needs double espresso for night coding',
    patience: 25,
    mood: 'intense'
  },
  {
    id: 'elif',
    name_tr: 'Sanatçı Elif',
    name_en: 'Artist Elif',
    emoji: '🎨',
    personality: 'creative',
    favoriteTime: { start: 14, end: 18 }, // Öğleden sonra
    favoriteDrinks: ['latte', 'mocha', 'vanilla_latte'],
    orderFrequency: 'medium',
    tips: { min: 80, max: 180 },
    description_tr: 'Latte + cheesecake kombinasyonu favorisi',
    description_en: 'Favorite: Latte + cheesecake combo',
    patience: 35,
    mood: 'relaxed',
    prefersDessert: true
  },
  {
    id: 'mehmet',
    name_tr: 'Sporcu Mehmet',
    name_en: 'Athlete Mehmet',
    emoji: '🏃',
    personality: 'energetic',
    favoriteTime: { start: 6, end: 10 }, // Sabah erken
    favoriteDrinks: ['cold_brew', 'iced_coffee', 'smoothie'],
    orderFrequency: 'high',
    tips: { min: 60, max: 140 },
    description_tr: 'Soğuk kahve ve protein smoothie sever',
    description_en: 'Loves cold brew and protein smoothies',
    patience: 20,
    mood: 'energetic'
  },
  {
    id: 'zeynep',
    name_tr: 'Yazar Zeynep',
    name_en: 'Writer Zeynep',
    emoji: '📚',
    personality: 'thoughtful',
    favoriteTime: { start: 16, end: 20 }, // Akşam
    favoriteDrinks: ['hot_chocolate', 'chai_latte', 'cappuccino'],
    orderFrequency: 'low',
    tips: { min: 100, max: 200 },
    description_tr: 'Sıcak çikolata ile kitap okur',
    description_en: 'Reads books with hot chocolate',
    patience: 40,
    mood: 'peaceful'
  }
];

// İçecekler
export const DRINKS = [
  // Sıcak Kahveler
  {
    id: 'espresso',
    name_tr: 'Espresso',
    name_en: 'Espresso',
    category: 'hot_coffee',
    emoji: '☕',
    price: 2000,
    prepTime: 15, // seconds
    difficulty: 'easy',
    ingredients: ['coffee', 'hot_water'],
    size: 'small'
  },
  {
    id: 'double_espresso',
    name_tr: 'Double Espresso',
    name_en: 'Double Espresso',
    category: 'hot_coffee',
    emoji: '☕☕',
    price: 2500,
    prepTime: 20,
    difficulty: 'easy',
    ingredients: ['coffee', 'coffee', 'hot_water'],
    size: 'small'
  },
  {
    id: 'latte',
    name_tr: 'Latte',
    name_en: 'Latte',
    category: 'hot_coffee',
    emoji: '🥛',
    price: 2500,
    prepTime: 25,
    difficulty: 'medium',
    ingredients: ['coffee', 'milk', 'foam'],
    size: 'medium'
  },
  {
    id: 'cappuccino',
    name_tr: 'Cappuccino',
    name_en: 'Cappuccino',
    category: 'hot_coffee',
    emoji: '☕',
    price: 2500,
    prepTime: 25,
    difficulty: 'medium',
    ingredients: ['coffee', 'milk', 'foam', 'cinnamon'],
    size: 'medium'
  },
  {
    id: 'mocha',
    name_tr: 'Mocha',
    name_en: 'Mocha',
    category: 'hot_coffee',
    emoji: '🍫',
    price: 3000,
    prepTime: 30,
    difficulty: 'medium',
    ingredients: ['coffee', 'chocolate', 'milk', 'whipped_cream'],
    size: 'medium'
  },
  {
    id: 'vanilla_latte',
    name_tr: 'Vanilyalı Latte',
    name_en: 'Vanilla Latte',
    category: 'hot_coffee',
    emoji: '🌼',
    price: 2800,
    prepTime: 25,
    difficulty: 'medium',
    ingredients: ['coffee', 'milk', 'vanilla', 'foam'],
    size: 'medium'
  },
  
  // Çaylar
  {
    id: 'black_tea',
    name_tr: 'Siyah Çay',
    name_en: 'Black Tea',
    category: 'tea',
    emoji: '🍵',
    price: 1500,
    prepTime: 20,
    difficulty: 'easy',
    ingredients: ['black_tea', 'hot_water'],
    size: 'medium'
  },
  {
    id: 'green_tea',
    name_tr: 'Yeşil Çay',
    name_en: 'Green Tea',
    category: 'tea',
    emoji: '🍃',
    price: 1500,
    prepTime: 20,
    difficulty: 'easy',
    ingredients: ['green_tea', 'hot_water'],
    size: 'medium'
  },
  {
    id: 'chai_latte',
    name_tr: 'Chai Latte',
    name_en: 'Chai Latte',
    category: 'tea',
    emoji: '🫖',
    price: 2000,
    prepTime: 25,
    difficulty: 'medium',
    ingredients: ['chai_tea', 'milk', 'cinnamon', 'foam'],
    size: 'medium'
  },
  
  // Soğuk İçecekler
  {
    id: 'cold_brew',
    name_tr: 'Cold Brew',
    name_en: 'Cold Brew',
    category: 'cold_coffee',
    emoji: '🧊',
    price: 2500,
    prepTime: 20,
    difficulty: 'easy',
    ingredients: ['coffee', 'cold_water', 'ice'],
    size: 'large'
  },
  {
    id: 'iced_coffee',
    name_tr: 'Buzlu Kahve',
    name_en: 'Iced Coffee',
    category: 'cold_coffee',
    emoji: '☕🧊',
    price: 2500,
    prepTime: 20,
    difficulty: 'easy',
    ingredients: ['coffee', 'milk', 'ice', 'sugar'],
    size: 'large'
  },
  {
    id: 'lemonade',
    name_tr: 'Limonata',
    name_en: 'Lemonade',
    category: 'cold_drink',
    emoji: '🍋',
    price: 1000,
    prepTime: 15,
    difficulty: 'easy',
    ingredients: ['lemon', 'water', 'sugar', 'ice'],
    size: 'medium'
  },
  
  // Diğer
  {
    id: 'hot_chocolate',
    name_tr: 'Sıcak Çikolata',
    name_en: 'Hot Chocolate',
    category: 'other',
    emoji: '🍫',
    price: 2000,
    prepTime: 25,
    difficulty: 'easy',
    ingredients: ['chocolate', 'milk', 'whipped_cream'],
    size: 'medium'
  },
  {
    id: 'smoothie',
    name_tr: 'Smoothie',
    name_en: 'Smoothie',
    category: 'cold_drink',
    emoji: '🥤',
    price: 3000,
    prepTime: 30,
    difficulty: 'medium',
    ingredients: ['banana', 'berries', 'milk', 'ice'],
    size: 'large'
  }
];

// Tatlılar
export const DESSERTS = [
  {
    id: 'cheesecake',
    name_tr: 'Cheesecake',
    name_en: 'Cheesecake',
    emoji: '🍰',
    price: 3000,
    prepTime: 10,
    category: 'dessert'
  },
  {
    id: 'cupcake',
    name_tr: 'Cupcake',
    name_en: 'Cupcake',
    emoji: '🧁',
    price: 2500,
    prepTime: 10,
    category: 'dessert'
  },
  {
    id: 'cookie',
    name_tr: 'Cookie',
    name_en: 'Cookie',
    emoji: '🍪',
    price: 1500,
    prepTime: 5,
    category: 'dessert'
  },
  {
    id: 'brownie',
    name_tr: 'Brownie',
    name_en: 'Brownie',
    emoji: '🍫',
    price: 2000,
    prepTime: 10,
    category: 'dessert'
  },
  {
    id: 'muffin',
    name_tr: 'Muffin',
    name_en: 'Muffin',
    emoji: '🧁',
    price: 2000,
    prepTime: 10,
    category: 'dessert'
  }
];

// İçecek boyutları
export const CUP_SIZES = [
  {
    id: 'small',
    name_tr: 'Küçük',
    name_en: 'Small',
    emoji: '🥛',
    multiplier: 0.8
  },
  {
    id: 'medium',
    name_tr: 'Orta',
    name_en: 'Medium',
    emoji: '☕',
    multiplier: 1.0
  },
  {
    id: 'large',
    name_tr: 'Büyük',
    name_en: 'Large',
    emoji: '🍺',
    multiplier: 1.3
  }
];

// Süslemeler / Ekstralar
export const TOPPINGS = [
  {
    id: 'whipped_cream',
    name_tr: 'Krem Şanti',
    name_en: 'Whipped Cream',
    emoji: '🍦',
    price: 100
  },
  {
    id: 'cinnamon',
    name_tr: 'Tarçın',
    name_en: 'Cinnamon',
    emoji: '🌰',
    price: 50
  },
  {
    id: 'chocolate_syrup',
    name_tr: 'Çikolata Sosu',
    name_en: 'Chocolate Syrup',
    emoji: '🍫',
    price: 150
  },
  {
    id: 'caramel',
    name_tr: 'Karamel',
    name_en: 'Caramel',
    emoji: '🍯',
    price: 150
  },
  {
    id: 'vanilla',
    name_tr: 'Vanilya',
    name_en: 'Vanilla',
    emoji: '🌼',
    price: 100
  },
  {
    id: 'foam',
    name_tr: 'Köpük',
    name_en: 'Foam',
    emoji: '☁️',
    price: 0
  }
];

// Yardımcı fonksiyonlar
export const getDrinkById = (id) => DRINKS.find(d => d.id === id);
export const getCustomerById = (id) => CUSTOMERS.find(c => c.id === id);
export const getDessertById = (id) => DESSERTS.find(d => d.id === id);

// Rastgele müşteri seç (saat bazlı)
export const getRandomCustomer = () => {
  const currentHour = new Date().getHours();
  
  // Şu anki saatte aktif müşterileri filtrele
  const activeCustomers = CUSTOMERS.filter(customer => {
    const { start, end } = customer.favoriteTime;
    if (start < end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Gece geçiş durumu (örn: 22-02)
      return currentHour >= start || currentHour < end;
    }
  });
  
  // Aktif müşteri varsa onlardan seç, yoksa herhangi biri
  const pool = activeCustomers.length > 0 ? activeCustomers : CUSTOMERS;
  return pool[Math.floor(Math.random() * pool.length)];
};

// Müşterinin favori içeceklerinden birini seç
export const getCustomerOrder = (customerId) => {
  const customer = getCustomerById(customerId);
  if (!customer) return null;
  
  const drinkId = customer.favoriteDrinks[Math.floor(Math.random() * customer.favoriteDrinks.length)];
  const drink = getDrinkById(drinkId);
  
  // %30 ihtimalle tatlı da ister (eğer tatlı sever bir karakterse)
  const dessert = customer.prefersDessert && Math.random() > 0.7
    ? DESSERTS[Math.floor(Math.random() * DESSERTS.length)]
    : null;
  
  return {
    drink,
    dessert,
    customer,
    timestamp: Date.now()
  };
};
