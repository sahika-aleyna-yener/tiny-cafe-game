# ☕ Tiny Café - Ders Çalışma Motivasyon Oyunu

Tiny Café, öğrencilerin ders çalışma süresini oyunlaştıran rahatlatıcı bir kafe simülasyon oyunudur. Gerçek hayatta ders çalıştıkça oyun içi kredi kazanılır ve bu krediyle sanal kafeler dekore edilir.

## 🎮 Özellikler

### ✅ Tamamlanan Sistemler

#### 🎯 Temel Oyun Mekaniği
- **Pomodoro Timer Sistemi**: Focus (25dk), Kısa Mola (5dk), Uzun Mola (15dk) modları
- **Kredi Kazanma**: Her dakika 10 kredi + bonus sistemleri
- **Streak Sistemi**: Günlük streak takibi ve bonusları
- **Level & XP**: Progresyon sistemi ile oyuncu gelişimi
- **Günlük Görevler**: Her gün yeni görevler ve ödüller

#### 👥 Müşteri & Karakter Sistemi
- **Müşteri Siparişleri**: Gerçek zamanlı sipariş sistemi (çalışırken aktif)
- **5 Farklı Müşteri Tipi**: Ayşe, Cem, Elif, Mehmet, Zeynep
- **Sipariş Servisi**: Doğru servis = bonus kredi, yanlış servis = kredi kaybı
- **Animasyonlu Karakterler**: Kafede dolaşan ve çalışan karakterler
- **Konuşma Balonları**: Rastgele motivasyon mesajları

#### ☕ İçecek & Tatlı Sistemi
- **8 İçecek Çeşidi**: Kahve, çay, sıcak çikolata, limonata ve daha fazlası
- **15+ Tatlı Çeşidi**: Gerçek görsellerle cheesecake, cupcake, croissant, eclair ve daha fazlası
- **Seviye Bazlı Kilitleme**: Belirli seviyelerde yeni ürünler açılır
- **Mini-Game**: Müşterilere doğru ürünü servis etme oyunu

#### 🎨 Kafe Dekorasyon Sistemi
- **Sürükle-Bırak Arayüzü**: Kolay dekorasyon yerleştirme
- **8x8 Grid Sistemi**: Organize yerleştirme alanı
- **8 Farklı Eşya**: Masa, sandalye, koltuk, bitki, lamba, tablo, kitaplık, halı
- **Döndürme & Silme**: Tam kontrol
- **Kaydetme Sistemi**: Dekorasyonunuzu kaydedin

#### 🏆 Achievement (Başarım) Sistemi
- **14 Farklı Başarım**: İlk adım, kararlı öğrenci, çalışma ustası ve daha fazlası
- **Kategoriler**:
  - Çalışma seansı başarımları (1, 10, 50 seans)
  - Streak başarımları (3, 7, 30 gün)
  - Toplam süre başarımları (60, 600 dakika)
  - Level başarımları (5, 10)
  - Alışveriş başarımları (5, 10 ürün)
- **Ödüller**: Her başarım kredi kazandırır
- **Animasyonlu Popup**: Başarım kazanıldığında görsel geri bildirim

#### 🎵 Müzik & Ses Sistemi
- **10 Müzik Parçası**: Lo-Fi, Jazz, Doğa Sesleri, Klasik, Ambient
- **Kategori Filtreleme**: Müzikleri kategoriye göre filtrele
- **Arama Özelliği**: Müzik adı veya sanatçı ara
- **Tam Kontrol**: Play/Pause, İleri/Geri, Ses Seviyesi, Shuffle, Repeat
- **Seviye Kilidi**: Bazı müzikler belirli seviyelerde açılır

#### 🐾 Evcil Hayvan Sistemi
- **12 Sevimli Hayvan**: Gerçek hayvan görselleri
  - Poncik (Ayı) - Varsayılan
  - Fluffy Tavşan
  - Turuncu Kedi
  - Kahverengi Köpek
  - Sevimli Hamster
  - Gri Kedi
  - Kızıl Tilki
  - Gece Baykuşu
  - Bebek Panda
  - Minik Penguen
  - Rakun Arkadaş
  - Mutlu Sincap

#### 🎨 Tema & Görsel Tasarım
- **5 Mevsimsel Tema**: Sakura, Bahar, Yaz, Sonbahar, Kış
- **Cozy Aesthetic**: Sıcak renkler ve rahatlatıcı atmosfer
- **Smooth Animasyonlar**: Framer Motion ile akıcı geçişler
- **Responsive Tasarım**: Mobil ve desktop uyumlu
- **PWA Desteği**: Mobil cihazlara yüklenebilir

#### 🌍 Dil Desteği
- **Türkçe & İngilizce**: Tam dil desteği
- **Anında Geçiş**: Dil değişimi için yeniden başlatma gerekmez

## 🎯 Oyun Döngüsü

1. **Çalışmaya Başla** → Timer başlar, karakterler aktif olur
2. **Müşteri Gelir** → Sipariş oluşur (15-30 saniye aralıklarla)
3. **Sipariş Servis Et** → Doğru ürünü seç, kredi kazan
4. **Kredi Harca** → İçecek, tatlı, evcil hayvan satın al
5. **Kafe Dekore Et** → Eşyaları yerleştir, kafeni özelleştir
6. **Başarım Kazan** → Hedefleri tamamla, ödüller kazan
7. **Seviye Atla** → Yeni özellikler ve ürünler aç

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
cd frontend
npm install

# Geliştirme sunucusunu başlat
npm start

# Production build
npm run build
```

## 📱 Teknoloji Stack

- **Frontend**: React 19 + React Router
- **Styling**: Tailwind CSS + Custom CSS
- **Animasyonlar**: Framer Motion
- **UI Bileşenleri**: Radix UI + Shadcn/ui
- **State Management**: React Context
- **PWA**: Service Worker desteği

## 🎨 Renk Paleti

```css
/* Ana Renkler */
--cream: #F4E4C1;        /* Duvarlar */
--brown: #8B6F47;        /* Ahşap */
--mint: #7FA99B;         /* Bitkiler */
--terracotta: #C85A54;   /* Aksan */
--yellow: #F5D547;       /* Işıklar */
```

## 📊 Başarım Listesi

- 🎯 İlk Adım (50🪙)
- 📚 Kararlı Öğrenci - 10 seans (200🪙)
- 🏆 Çalışma Ustası - 50 seans (500🪙)
- 🔥 3 Günlük Seri (150🪙)
- ⚡ Haftalık Seri - 7 gün (300🪙)
- 👑 Aylık Seri - 30 gün (1000🪙)
- ⏰ Saat Tamamlandı - 60 dk (100🪙)
- ⭐ 10 Saat Ustası (500🪙)
- 🌟 Seviye 5 Kahramanı (300🪙)
- 💎 Seviye 10 Efsanesi (800🪙)
- 🛍️ Koleksiyoncu - 5 ürün (200🪙)
- ☕ Kafe Sahibi - 10 ürün (400🪙)
- 🎪 Yardımsever Barista - 10 müşteri (250🪙)
- 🎯 Görev Avcısı - 5 görev (300🪙)

## 🎵 Müzik Kategorileri

- **🎧 Lo-Fi**: Coffee Shop Vibes, Rainy Day Study, Sakura Season, Sunset Cafe
- **🎷 Jazz**: Midnight Jazz, Late Night Jazz
- **🌿 Doğa**: Forest Whispers, Ocean Waves
- **🎹 Klasik**: Soft Piano Dreams
- **✨ Ambient**: Fireplace Crackle

## 🐾 Evcil Hayvan Fiyatları

| Hayvan | Fiyat | Seviye |
|--------|-------|--------|
| Poncik | 0 🪙 | 1 |
| Tavşan | 100 🪙 | 2 |
| Turuncu Kedi | 120 🪙 | 2 |
| Gri Kedi | 130 🪙 | 2 |
| Köpek | 150 🪙 | 3 |
| Sincap | 150 🪙 | 3 |
| Hamster | 180 🪙 | 3 |
| Rakun | 200 🪙 | 4 |
| Baykuş | 220 🪙 | 4 |
| Tilki | 250 🪙 | 5 |
| Penguen | 280 🪙 | 5 |
| Panda | 300 🪙 | 6 |

## 🎯 Geliştirme Roadmap

### Tamamlandı ✅
- [x] Temel timer ve kredi sistemi
- [x] Müşteri sipariş sistemi
- [x] İçecek hazırlama mini-game
- [x] Kafe dekorasyon sistemi
- [x] Achievement sistemi
- [x] Müzik player
- [x] Evcil hayvan sistemi
- [x] Gerçek görsel entegrasyonu
- [x] Dil desteği (TR/EN)

### Gelecek Özellikler 🚀
- [ ] Multiplayer - Arkadaşlarınla çalış
- [ ] Liderlik tablosu
- [ ] Haftalık turnuvalar
- [ ] Daha fazla evcil hayvan
- [ ] Daha fazla tema
- [ ] Sosyal paylaşım özellikleri
- [ ] Push bildirimleri
- [ ] Daha fazla mini-game

## 📝 Lisans

Bu proje öğrenci motivasyonu için geliştirilmiştir.

## 🙏 Teşekkürler

Tiny Café'yi oynadığınız için teşekkürler! Başarılı çalışmalar dileriz! ☕📚✨

---

**Motto**: "Tiny Café ile öğrenciler ders çalışmayı sevecek!" 💪
