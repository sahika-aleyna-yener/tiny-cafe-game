# 🎨 Görsel Asset Entegrasyon Rehberi

## 📦 Mevcut Görseller

### Desktop'ta Hazır (Kullanılmayı Bekliyor!)
```
/Users/sahikaaleynayener/Desktop/cozy game/
├── pets/          (17 adet pet görseli)
├── tatlılar/      (Tatlı görselleri)
└── *.jpg          (33 adet kafe eşyası)
```

---

## 🚀 Manuel Kopyalama (Gerekli!)

Sistem güvenlik nedeniyle Desktop'tan otomatik kopyalamaya izin vermiyor.  
**Sen terminal'de şu komutları çalıştırmalısın:**

### 1. Pet Görselleri
```bash
cp "/Users/sahikaaleynayener/Desktop/cozy game/pets"/*.jpg \
   /Users/sahikaaleynayener/tiny-cafe-game/frontend/public/assets/pets/
```

### 2. Kafe Eşyaları
```bash
cp "/Users/sahikaaleynayener/Desktop/cozy game"/*.jpg \
   /Users/sahikaaleynayener/tiny-cafe-game/frontend/public/assets/items/
```

### 3. Tatlılar
```bash
cp "/Users/sahikaaleynayener/Desktop/cozy game/tatlılar"/* \
   /Users/sahikaaleynayener/tiny-cafe-game/frontend/public/assets/desserts/
```

---

## ✅ Kopyalama Sonrası

Görseller kopyalandıktan sonra:
1. Frontend'i yeniden başlatmaya gerek YOK (hot reload)
2. Görseller `/assets/pets/...` yolundan erişilebilir olacak
3. Uygulama otomatik gösterecek

---

## 🎮 Kullanım Örnekleri

### Pet Görseli
```jsx
<img src="/assets/pets/unnamed.jpg" alt="Pet" />
```

### Kafe Eşyası
```jsx
<img src="/assets/items/unnamed-1.jpg" alt="Table" />
```

### Tatlı
```jsx
<img src="/assets/desserts/cake.jpg" alt="Cake" />
```

---

## 📊 Asset İsimlendirme

Desktop'taki dosyalar:
- `unnamed.jpg`, `unnamed-1.jpg`, ... (kafe eşyaları)
- `unnamed kopyası.jpg`, ... (varyasyonlar)

Bu görselleri kullanırken:
1. Anlamlı isimler verebiliriz (rename)
2. Ya da index numarasıyla kullanabiliriz

Örnek isimlendirme:
```bash
# pets/
cat-orange.jpg
cat-white.jpg
dog-brown.jpg
...

# items/
table-wood-1.jpg
chair-modern-1.jpg
plant-pot-1.jpg
painting-sakura.jpg
lamp-vintage.jpg
...
```

---

## 🎨 Görsel Optimizasyonu (Opsiyonel)

Eğer görseller çok büyükse:

### macOS ile
```bash
# ImageMagick kur (ilk seferinde)
brew install imagemagick

# Tüm jpg'leri optimize et
cd /Users/sahikaaleynayener/tiny-cafe-game/frontend/public/assets
find . -name "*.jpg" -exec convert {} -quality 85 -resize 800x800\> {} \;
```

### WebP'ye Çevir (Modern Format)
```bash
find . -name "*.jpg" -exec sh -c 'cwebp -q 80 "$1" -o "${1%.jpg}.webp"' _ {} \;
```

---

## 📝 TODO: Asset Mapping

Görseller kopyalandıktan sonra:

### 1. Pet Sistemi
`frontend/src/data/petsData.js` oluştur:
```javascript
export const PETS = [
  { id: 'cat1', name: 'Orange Cat', image: '/assets/pets/unnamed.jpg', price: 5000 },
  { id: 'cat2', name: 'White Cat', image: '/assets/pets/unnamed-1.jpg', price: 5000 },
  // ...
];
```

### 2. Kafe Eşyaları
`frontend/src/data/furnitureData.js`:
```javascript
export const FURNITURE = [
  { 
    id: 'table1', 
    name_tr: 'Ahşap Masa', 
    name_en: 'Wooden Table',
    image: '/assets/items/unnamed.jpg', 
    price: 1500,
    category: 'furniture'
  },
  // ...
];
```

### 3. Shop Entegrasyonu
Shop.js component'ine ekle:
```jsx
import { PETS } from '../data/petsData';
import { FURNITURE } from '../data/furnitureData';

// Shop'ta göster
{PETS.map(pet => (
  <div key={pet.id}>
    <img src={pet.image} alt={pet.name} />
    <p>{pet.name}</p>
    <button>Buy {pet.price}kr</button>
  </div>
))}
```

---

## 🎯 Öncelikli Entegrasyon

1. **Pet Görselleri** → Character customization'da göster
2. **Kafe Eşyaları** → Shop'a ekle
3. **Tatlı Görselleri** → CustomerOrders'da göster (dessert siparişleri)

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Görselleri kopyala (yukarıdaki komutlar)
cp "/Users/sahikaaleynayener/Desktop/cozy game/pets"/*.jpg \
   /Users/sahikaaleynayener/tiny-cafe-game/frontend/public/assets/pets/

# 2. Kontrol et
ls /Users/sahikaaleynayener/tiny-cafe-game/frontend/public/assets/pets/

# 3. Tarayıcıda test
# http://localhost:3000/assets/pets/unnamed.jpg
```

---

## 💡 İpuçları

1. **İsimlendirme**: Görselleri kopyaladıktan sonra anlamlı isimlerle rename edebiliriz
2. **Dosya Boyutu**: Her görsel <500KB olmalı (web performance için)
3. **Format**: JPG ve PNG destekleniyor, WebP daha iyi
4. **Lazy Loading**: React'te `loading="lazy"` kullan

---

**Şimdi yukarıdaki cp komutlarını çalıştır ve bana "tamam" de!** 🚀
