# 🚀 Tiny Café - Hızlı Başlangıç Kılavuzu

## ✅ Frontend Çalışıyor!
Frontend zaten çalışır durumda: **http://localhost:3000**

## ⚠️ Backend İçin Yapmanız Gerekenler

### 1. Backend .env Dosyası Oluşturun

```bash
cd /Users/sahikaaleynayener/tiny-cafe-game/backend
nano .env
```

Aşağıdaki içeriği yapıştırın:

```bash
# MongoDB - Local için
MONGO_URL=mongodb://localhost:27017
DB_NAME=tiny_cafe

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Spotify (şimdilik dummy, sonra değiştirilecek)
SPOTIFY_CLIENT_ID=dummy
SPOTIFY_CLIENT_SECRET=dummy
SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-callback

# Stripe (şimdilik dummy)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy

# VAPID Keys (şimdilik dummy)
VAPID_PUBLIC_KEY=dummy
VAPID_PRIVATE_KEY=dummy
VAPID_SUBJECT=mailto:test@tinycafe.app

# JWT Secret
JWT_SECRET=super_secret_change_in_production

# Google OAuth (şimdilik dummy)
GOOGLE_CLIENT_ID=dummy
GOOGLE_CLIENT_SECRET=dummy
```

**Kaydetmek için**: `CTRL+O` sonra `ENTER`, çıkmak için `CTRL+X`

### 2. MongoDB'yi Başlatın

Eğer MongoDB kurulu değilse:

```bash
# macOS için
brew install mongodb-community
brew services start mongodb-community

# Veya Docker ile
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Backend'i Başlatın

```bash
cd /Users/sahikaaleynayener/tiny-cafe-game/backend
python3 server.py
```

---

## 🔍 Login Sorunu Nedir?

### Sorun:
Uygulama Google OAuth kullanıyor ve `https://auth.emergentagent.com` adresine yönlendirme yapıyor.

### Çözüm Seçenekleri:

#### Seçenek 1: Test Kullanıcısı (Hızlı Test)
Backend'e test kullanıcı endpoint'i ekleyelim:

```python
# server.py'ye ekleyin:
@api_router.post("/auth/test-login")
async def test_login(response: Response):
    # Test kullanıcısı oluştur
    test_user = {
        "user_id": "test-user-123",
        "email": "test@tinycafe.app",
        "name": "Test Kullanıcı",
        "credits": 1000,
        "level": 5,
        "xp": 500,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Session oluştur
    session_token = secrets.token_urlsafe(32)
    await db.sessions.insert_one({
        "user_id": test_user["user_id"],
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # User'ı kaydet
    await db.users.update_one(
        {"user_id": test_user["user_id"]},
        {"$set": test_user},
        upsert=True
    )
    
    # Cookie set et
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        max_age=7*24*60*60,
        samesite="lax"
    )
    
    return test_user
```

Sonra frontend'de:
```javascript
// Test login butonu
const testLogin = async () => {
  const res = await fetch('http://localhost:8000/api/auth/test-login', {
    method: 'POST',
    credentials: 'include'
  });
  if (res.ok) {
    const user = await res.json();
    setUser(user);
  }
};
```

#### Seçenek 2: Google OAuth Devre Dışı (Üretim için uygun değil)
AuthContext.js'de login fonksiyonunu değiştirin.

#### Seçenek 3: Kendi OAuth Servisiniz
Google Developer Console'dan OAuth credentials alın.

---

## 🎯 Hızlı Başlangıç (En Basit Yol)

### Adım 1: .env dosyasını oluşturun (yukarıdaki gibi)

### Adım 2: MongoDB başlatın
```bash
brew services start mongodb-community
# veya
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Adım 3: Test login endpoint'i ekleyin
```bash
# Backend'de test login ekleyin (yukarıdaki kodu)
```

### Adım 4: Backend başlatın
```bash
cd backend
python3 server.py
```

### Adım 5: Tarayıcıda test edin
```bash
# Console'da çalıştırın:
fetch('http://localhost:8000/api/auth/test-login', {
  method: 'POST',
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

---

## 📝 Şu Anki Durum

✅ **Frontend**: Çalışıyor (http://localhost:3000)  
⚠️ **Backend**: .env dosyası gerekli  
⚠️ **MongoDB**: Başlatılmalı  
⚠️ **Login**: Test endpoint'i eklenecek  

---

## 🆘 Yardım

### MongoDB çalışıyor mu?
```bash
mongosh
# Bağlandıysa çalışıyor
```

### Backend çalışıyor mu?
```bash
curl http://localhost:8000
# {"message":"PoncikFocus API"} dönmeli
```

### Frontend çalışıyor mu?
```bash
curl http://localhost:3000
# HTML dönmeli
```

---

## 🎮 Oyunu Test Etmek İçin

1. .env oluştur
2. MongoDB başlat
3. Backend'e test login ekle
4. Backend başlat
5. Tarayıcıda http://localhost:3000 aç
6. Console'dan test login çalıştır
7. Oyunu kullan!

**Hepsi bu kadar! 🎉**
