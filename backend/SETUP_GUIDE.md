# 🚀 Backend Setup Guide - Tiny Café v2.0

## 📋 Prerequisites

- Python 3.9+
- MongoDB 4.4+
- Node.js 16+ (for frontend)

## 🔧 Installation Steps

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual values
nano .env  # or use your favorite editor
```

### 3. Generate VAPID Keys (for Push Notifications)

```bash
python generate_vapid_keys.py
```

Copy the generated keys to your `.env` file.

### 4. Run Database Migration

```bash
python migrate_database.py
```

This will create all necessary collections and indexes.

### 5. Start the Server

```bash
# Development
uvicorn server_new:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn server_new:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🔑 External Services Setup

### 1. Spotify Integration

#### Step 1: Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click "Create App"
3. Fill in details:
   - **App Name**: Tiny Café
   - **App Description**: Study motivation app with music integration
   - **Redirect URI**: `http://localhost:3000/spotify-callback` (dev) or your production URL

#### Step 2: Get Credentials
1. Go to your app settings
2. Copy **Client ID** and **Client Secret**
3. Add to `.env`:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify-callback
   ```

#### Step 3: Set Scopes
The app requests these scopes:
- `user-read-playback-state`
- `user-modify-playback-state`
- `user-read-currently-playing`
- `streaming`
- `user-read-email`
- `user-read-private`

### 2. Stripe Setup (Premium Payments)

#### Step 1: Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Complete account setup

#### Step 2: Get API Keys
1. Go to **Developers > API Keys**
2. Copy **Publishable key** and **Secret key**
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

#### Step 3: Setup Webhook
1. Go to **Developers > Webhooks**
2. Click "Add endpoint"
3. **Endpoint URL**: `https://your-domain.com/api/premium/webhook`
4. **Events to send**:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy **Signing secret** to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

#### Step 4: Create Products (Optional via Dashboard or API)
The app automatically creates products, but you can also create them manually:
- **Monthly Premium**: ₺29.99/month
- **Yearly Premium**: ₺199.99/year

### 3. Push Notifications (VAPID)

#### Already Done!
VAPID keys are generated with `generate_vapid_keys.py`.

Just make sure to:
1. Keep `VAPID_PRIVATE_KEY` secret
2. Add `VAPID_PUBLIC_KEY` to frontend
3. Set `VAPID_SUBJECT` to a valid mailto: address

### 4. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or
apt-get install mongodb  # Ubuntu

# Start MongoDB
brew services start mongodb-community  # macOS
# or
sudo systemctl start mongod  # Ubuntu

# Update .env
MONGO_URL=mongodb://localhost:27017
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Update `.env`:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   ```

---

## 🧪 Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:8000/

# API health
curl http://localhost:8000/api/health

# WebSocket test (use wscat)
npm install -g wscat
wscat -c ws://localhost:8000/ws/chat/test-user-id
```

### Test Stripe Webhook Locally

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:8000/api/premium/webhook

# Test webhook
stripe trigger checkout.session.completed
```

---

## 📊 Database Collections

After migration, you'll have these collections:

| Collection | Purpose |
|------------|---------|
| `users` | User accounts and profiles |
| `sessions` | User sessions |
| `chat_messages` | Chat messages |
| `chat_groups` | Chat groups |
| `premium_subscriptions` | Premium memberships |
| `push_subscriptions` | Push notification subscriptions |
| `friendships` | Friend relationships |
| `focus_sessions` | Study sessions |
| `todos` | User todos |

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env` to git
- ✅ Use different keys for dev/prod
- ✅ Rotate keys regularly

### 2. HTTPS in Production
```nginx
# Nginx example
server {
    listen 443 ssl;
    server_name api.tinycafe.app;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 3. Rate Limiting
Already implemented in code:
- Chat: Max 3 messages per 5 seconds
- API: Can add with FastAPI middleware

---

## 🚀 Production Deployment

### Option 1: Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "server_new:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t tiny-cafe-backend .
docker run -p 8000:8000 --env-file .env tiny-cafe-backend
```

### Option 2: Heroku

```bash
# Create Procfile
echo "web: uvicorn server_new:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
heroku create tiny-cafe-api
heroku config:set $(cat .env | sed 's/^//')
git push heroku main
```

### Option 3: AWS EC2

```bash
# On EC2 instance
sudo apt update
sudo apt install python3-pip python3-venv nginx

# Clone repo
git clone https://github.com/your-repo/tiny-cafe-game.git
cd tiny-cafe-game/backend

# Setup
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/tiny-cafe.service
```

Service file:
```ini
[Unit]
Description=Tiny Cafe Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/tiny-cafe-game/backend
Environment="PATH=/home/ubuntu/tiny-cafe-game/backend/venv/bin"
ExecStart=/home/ubuntu/tiny-cafe-game/backend/venv/bin/uvicorn server_new:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable tiny-cafe
sudo systemctl start tiny-cafe
```

---

## 📈 Monitoring

### Logs
```bash
# View logs
tail -f /var/log/tiny-cafe.log

# With systemd
journalctl -u tiny-cafe -f
```

### Health Endpoint
```bash
curl http://localhost:8000/api/health
```

### Database Stats
```python
# In MongoDB shell
use tiny_cafe
db.stats()
db.users.stats()
```

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Failed
```bash
# Check MongoDB is running
mongosh  # or mongo

# Check connection string
echo $MONGO_URL
```

### Issue: Stripe Webhook Not Working
```bash
# Test with Stripe CLI
stripe listen --forward-to localhost:8000/api/premium/webhook

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

### Issue: Push Notifications Not Sending
```bash
# Verify VAPID keys
python -c "from py_vapid import Vapid; print('OK')"

# Check browser console for subscription errors
```

### Issue: Spotify OAuth Fails
- Check redirect URI matches exactly
- Verify client ID/secret
- Check user granted permissions

---

## 📝 API Documentation

Once server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Setup environment variables
3. ✅ Generate VAPID keys
4. ✅ Run database migration
5. ✅ Create Spotify app
6. ✅ Setup Stripe account
7. ✅ Test endpoints
8. ✅ Deploy to production

---

## 💡 Tips

### Development
- Use `--reload` flag for auto-restart
- Check logs frequently
- Test webhooks with Stripe CLI

### Production
- Use environment variables
- Enable HTTPS
- Setup monitoring (Sentry, DataDog, etc.)
- Regular database backups
- Rate limiting and DDoS protection

---

## 📞 Support

For issues:
1. Check logs: `journalctl -u tiny-cafe -f`
2. Verify environment variables
3. Test individual endpoints
4. Check MongoDB connection
5. Review Stripe/Spotify dashboard for errors

---

**Backend is ready! 🚀**

Now start the frontend and test the full application!
