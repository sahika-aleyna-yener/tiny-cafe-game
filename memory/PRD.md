# PoncikFocus - Cozy Study App PRD

## Original Problem Statement
Bu bir cozy app. Kullanıcı app'i açtığında Poncik (temaya uygun maskot) "Merhaba!" diyor. App'in amacı ders çalışmayı sakin hale getirmek. Kullanıcı todo'larını yazıyor, sayacı başlatıyor ve kredi kazanıyor. 2x kredi için reklam izleyebilir, arkadaş davet ederse bonus kredi kazanır. Kredilerle içecek/tatlı alabilir. Arkada soft müzik seçebilir. Google ile giriş, TR/EN dil desteği, Pomodoro tekniği, streak ve seviye sistemi.

## User Personas
1. **Öğrenci (Liseli/Üniversiteli)**: Sınavlara çalışırken odaklanmak isteyen, gamification ile motive olan
2. **Uzaktan Çalışan**: Evden çalışırken konsantre olmak isteyen, sakin ortam arayan
3. **Hobi Öğrenen**: Yeni bir şey öğrenirken zaman takibi yapmak isteyen

## Core Requirements (Static)
- [x] Google OAuth ile giriş (Emergent Auth)
- [x] Pomodoro timer (25dk odak, 5dk/15dk mola)
- [x] Todo list yönetimi
- [x] Kredi kazanma sistemi (dakika başına 1 kredi)
- [x] 2x kredi için reklam sistemi (mock)
- [x] Mağaza (içecek/tatlı satın alma)
- [x] Arkadaş davet (+25 kredi bonus)
- [x] Topluluk leaderboard
- [x] Müzik player (lofi/ambient)
- [x] Seviye ve XP sistemi
- [x] Streak takibi
- [x] Rozet sistemi
- [x] TR/EN dil desteği
- [x] Açık/Koyu tema

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Auth**: Emergent Google OAuth
- **Styling**: Cozy cafe theme (Fredoka + Nunito fonts)

## What's Been Implemented (2026-02-04)
### Backend
- User authentication with session management
- Todo CRUD endpoints
- Focus session tracking with credit calculation
- Shop items and purchase system
- Community leaderboard and friends
- Music tracks endpoint
- Badges and earned badges
- User stats and settings

### Frontend
- Landing page with Poncik mascot
- Dashboard with Bento grid layout (Timer, Todos, Music)
- Shop page with drinks/treats tabs
- Community page with leaderboard and friends
- Profile page with stats and badges
- Settings page with language/theme toggles
- Bottom navigation
- Light/Dark theme support
- TR/EN language support

## Prioritized Backlog

### P0 (Completed)
- [x] Core authentication flow
- [x] Timer functionality
- [x] Todo management
- [x] Credit system
- [x] Basic shop

### P1 (Future)
- [ ] Push notifications for break reminders
- [ ] Sound effects for timer completion
- [ ] Real ad integration (Google AdMob)
- [ ] Profile picture upload
- [ ] Session history with calendar view

### P2 (Nice to have)
- [ ] Seasonal themes (Spring, Summer, Fall, Winter)
- [ ] Custom timer durations
- [ ] Social sharing of achievements
- [ ] Offline mode support
- [ ] Mobile app (React Native)

## Next Tasks
1. Add real-time notifications for session completion
2. Implement sound effects for interactions
3. Add more shop items with actual images
4. Calendar view for focus history
5. Achievement sharing to social media
