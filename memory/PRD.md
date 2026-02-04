# PoncikFocus - Cozy Study App PRD

## Original Problem Statement
Bu bir cozy app. Kullanıcı app'i açtığında Poncik (temaya uygun maskot) "Merhaba!" diyor. App'in amacı ders çalışmayı sakin hale getirmek. Kullanıcı todo'larını yazıyor, sayacı başlatıyor ve kredi kazanıyor. 2x kredi için reklam izleyebilir, arkadaş davet ederse bonus kredi kazanır. Kredilerle içecek/tatlı alabilir. Arkada soft müzik seçebilir. Google ile giriş, TR/EN dil desteği, Pomodoro tekniği, streak ve seviye sistemi.

## User Personas
1. **Öğrenci (Liseli/Üniversiteli)**: Sınavlara çalışırken odaklanmak isteyen, gamification ile motive olan
2. **Uzaktan Çalışan**: Evden çalışırken konsantre olmak isteyen, sakin ortam arayan
3. **Hobi Öğrenen**: Yeni bir şey öğrenirken zaman takibi yapmak isteyen

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Auth**: Emergent Google OAuth
- **Styling**: Pixel Art Cozy Cafe theme (Fredoka + Nunito + JetBrains Mono fonts)
- **Assets**: tiny-cafe GitHub repo görselleri

## What's Been Implemented

### 2026-02-04 - Initial MVP
- Core authentication, timer, todo, credit, shop, community, badges systems

### 2026-02-04 - Pixel Art UI Redesign (Latest)
**Ana UI Değişiklikleri:**
- Pixel art cafe arka planları (5 mevsimsel tema: Sakura, Spring, Summer, Autumn, Winter)
- "Ders Çalışmaya Başla" butonu üst bar'da
- 🪙 KREDİ göstergesi (altın sikke ikonları ile)
- Mevsim bildirim banner'ı ("Yeni Mevsim! Bahar Şenliği Başladı!")
- Takvim widget (tarih + mevsim festivali)
- İçecekler sidebar (tiny-cafe görselleri ile)
- Tema seçici (5 farklı pixel art cafe arka planı)

**Shop Sayfası:**
- Pixel art cafe arka planı
- İçecekler: Latte, Cappuccino, Mocha, Matcha, Hot Chocolate, Chai Latte, Espresso, Caramel Latte, Strawberry Smoothie, Lemonade
- Tatlılar: Croissant, Donut, Cupcake, Macaron, Chocolate Cake, Cheesecake, Ice Cream, Profiterole, Crème Brûlée

**Assets:**
- /assets/themes/ - 5 mevsimsel cafe arka planı
- /assets/drinks/ - İçecek görselleri
- /assets/desserts/ - Tatlı görselleri

## Prioritized Backlog

### P0 (Completed)
- [x] Core authentication flow
- [x] Timer functionality with Pomodoro
- [x] Todo management
- [x] Credit system
- [x] Shop with real images
- [x] Pixel art cafe UI redesign
- [x] Seasonal themes

### P1 (Future)
- [ ] Sound effects for interactions
- [ ] Push notifications
- [ ] Calendar history view
- [ ] Active pet selection

### P2 (Nice to have)
- [ ] Custom timer durations
- [ ] Social sharing
- [ ] Offline mode
- [ ] Mobile app

## Next Tasks
1. Ses efektleri ekle (timer başlama/bitme, satın alma)
2. Animasyonlu pixel art karakterler (cafe'de çalışan insanlar)
3. Günlük/haftalık görevler sistemi
4. Achievement paylaşımı
