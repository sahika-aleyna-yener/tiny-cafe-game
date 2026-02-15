from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import asyncio
import json
import base64
from pywebpush import webpush, WebPushException
import stripe
import secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe setup
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY', '')

# VAPID keys for push notifications
VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', '')
VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', '')
VAPID_CLAIMS = {"sub": os.environ.get('VAPID_SUBJECT', 'mailto:support@tinycafe.app')}

# Spotify credentials
SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID', '')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET', '')
SPOTIFY_REDIRECT_URI = os.environ.get('SPOTIFY_REDIRECT_URI', 'http://localhost:3000/spotify-callback')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"User {user_id} connected to WebSocket")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            logger.info(f"User {user_id} disconnected from WebSocket")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except Exception as e:
                logger.error(f"Failed to send message to {user_id}: {e}")

    async def broadcast(self, message: dict, user_ids: List[str]):
        for user_id in user_ids:
            await self.send_personal_message(message, user_id)

manager = ConnectionManager()

# ==================== EXISTING MODELS ====================

class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    credits: int = 0
    level: int = 1
    xp: int = 0
    streak_days: int = 0
    last_study_date: Optional[str] = None
    total_focus_minutes: int = 0
    owned_items: List[str] = []
    active_theme: str = "light"
    language: str = "tr"
    created_at: Optional[str] = None
    
    # NEW FIELDS
    is_premium: bool = False
    premium_expires_at: Optional[str] = None
    owned_customization: List[str] = []
    customization: Optional[Dict] = None
    spotify_access_token: Optional[str] = None
    spotify_refresh_token: Optional[str] = None

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: str
    created_at: str

# ==================== NEW MODELS ====================

# Customization Models
class CustomizationPurchase(BaseModel):
    item_id: str
    price: int

class CustomizationEquip(BaseModel):
    skin: str
    outfit: str
    accessory: str

# Chat Models
class ChatMessage(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chat_id: str
    sender_id: str
    sender_name: str
    message: str
    read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatSend(BaseModel):
    chat_id: str
    message: str

class GroupCreate(BaseModel):
    name: str
    member_ids: List[str] = []

class ChatGroup(BaseModel):
    group_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    members: List[str] = []
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# Premium Models
class PremiumSubscribe(BaseModel):
    plan: str  # "monthly" or "yearly"
    payment_method: str = "stripe"

class PremiumSubscription(BaseModel):
    subscription_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan: str
    status: str = "active"
    stripe_subscription_id: Optional[str] = None
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    expires_at: str

# Notification Models
class PushSubscription(BaseModel):
    user_id: str
    subscription: Dict
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class NotificationSend(BaseModel):
    user_id: str
    title: str
    body: str
    icon: str = "/logo192.png"

# Spotify Models
class SpotifyCallback(BaseModel):
    code: str

# ==================== HELPER FUNCTIONS ====================

async def get_user_from_session(request: Request) -> Optional[dict]:
    """Extract user from session cookie"""
    session_token = request.cookies.get('session_token')
    if not session_token:
        return None
    
    session = await db.sessions.find_one({"session_token": session_token})
    if not session:
        return None
    
    # Check if expired
    if datetime.fromisoformat(session['expires_at'].replace('Z', '+00:00')) < datetime.now(timezone.utc):
        return None
    
    user = await db.users.find_one({"user_id": session['user_id']})
    return user

def check_premium(user: dict) -> bool:
    """Check if user has active premium"""
    if not user.get('is_premium'):
        return False
    
    if user.get('premium_expires_at'):
        expires = datetime.fromisoformat(user['premium_expires_at'].replace('Z', '+00:00'))
        if expires < datetime.now(timezone.utc):
            return False
    
    return True

# ==================== CUSTOMIZATION ENDPOINTS ====================

@api_router.post("/customization/purchase")
async def purchase_customization(purchase: CustomizationPurchase, request: Request):
    """Purchase a customization item"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if already owned
    if purchase.item_id in user.get('owned_customization', []):
        raise HTTPException(status_code=400, detail="Already owned")
    
    # Check credits
    if user.get('credits', 0) < purchase.price:
        raise HTTPException(status_code=400, detail="Not enough credits")
    
    # Deduct credits and add item
    await db.users.update_one(
        {"user_id": user['user_id']},
        {
            "$inc": {"credits": -purchase.price},
            "$push": {"owned_customization": purchase.item_id}
        }
    )
    
    return {"success": True, "item_id": purchase.item_id}

@api_router.post("/customization/equip")
async def equip_customization(equip: CustomizationEquip, request: Request):
    """Equip customization items"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Update customization
    await db.users.update_one(
        {"user_id": user['user_id']},
        {"$set": {"customization": equip.dict()}}
    )
    
    return {"success": True, "customization": equip.dict()}

@api_router.get("/customization/owned")
async def get_owned_customization(request: Request):
    """Get owned customization items"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {"owned": user.get('owned_customization', [])}

# ==================== CHAT ENDPOINTS ====================

@api_router.get("/chat/groups")
async def get_chat_groups(request: Request):
    """Get user's chat groups"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    groups = await db.chat_groups.find(
        {"members": user['user_id']}
    ).to_list(length=100)
    
    # Add member count
    for group in groups:
        group['members_count'] = len(group.get('members', []))
        group['_id'] = str(group['_id'])
    
    return groups

@api_router.get("/chat/friends")
async def get_chat_friends(request: Request):
    """Get user's friends for chat"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get friends from community
    friends = await db.friendships.find(
        {
            "$or": [
                {"user_id": user['user_id'], "status": "accepted"},
                {"friend_id": user['user_id'], "status": "accepted"}
            ]
        }
    ).to_list(length=100)
    
    friend_ids = []
    for friendship in friends:
        friend_id = friendship['friend_id'] if friendship['user_id'] == user['user_id'] else friendship['user_id']
        friend_ids.append(friend_id)
    
    # Get friend user data
    friend_users = await db.users.find(
        {"user_id": {"$in": friend_ids}}
    ).to_list(length=100)
    
    return friend_users

@api_router.get("/chat/messages/{chat_id}")
async def get_chat_messages(chat_id: str, request: Request):
    """Get messages for a chat"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    messages = await db.chat_messages.find(
        {"chat_id": chat_id}
    ).sort("created_at", 1).to_list(length=100)
    
    # Mark as read
    await db.chat_messages.update_many(
        {"chat_id": chat_id, "sender_id": {"$ne": user['user_id']}},
        {"$set": {"read": True}}
    )
    
    for msg in messages:
        msg['_id'] = str(msg['_id'])
    
    return messages

@api_router.post("/chat/send")
async def send_chat_message(chat: ChatSend, request: Request):
    """Send a chat message"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Anti-spam: Check recent messages
    recent = await db.chat_messages.find(
        {
            "sender_id": user['user_id'],
            "created_at": {"$gte": (datetime.now(timezone.utc) - timedelta(seconds=5)).isoformat()}
        }
    ).to_list(length=10)
    
    if len(recent) >= 3:
        raise HTTPException(status_code=429, detail="Too many messages")
    
    # Create message
    message = ChatMessage(
        chat_id=chat.chat_id,
        sender_id=user['user_id'],
        sender_name=user['name'],
        message=chat.message
    )
    
    await db.chat_messages.insert_one(message.dict())
    
    # Send via WebSocket to participants
    if chat.chat_id.startswith('group_'):
        # Get group members
        group = await db.chat_groups.find_one({"group_id": chat.chat_id.replace('group_', '')})
        if group:
            await manager.broadcast(
                {"type": "new_message", "message": message.dict()},
                group['members']
            )
    elif chat.chat_id.startswith('friend_'):
        # Send to friend
        friend_id = chat.chat_id.replace('friend_', '')
        await manager.send_personal_message(
            {"type": "new_message", "message": message.dict()},
            friend_id
        )
    
    return {"success": True, "message": message.dict()}

@api_router.post("/chat/groups/create")
async def create_chat_group(group: GroupCreate, request: Request):
    """Create a new chat group"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check premium for unlimited groups
    if not check_premium(user):
        # Check group limit for free users
        user_groups = await db.chat_groups.count_documents({"created_by": user['user_id']})
        if user_groups >= 3:
            raise HTTPException(status_code=403, detail="Group limit reached. Upgrade to premium.")
    
    # Create group
    chat_group = ChatGroup(
        name=group.name,
        members=[user['user_id']] + group.member_ids,
        created_by=user['user_id']
    )
    
    await db.chat_groups.insert_one(chat_group.dict())
    
    return {"success": True, "group": chat_group.dict()}

# ==================== PREMIUM ENDPOINTS ====================

@api_router.post("/premium/subscribe")
async def subscribe_premium(sub: PremiumSubscribe, request: Request):
    """Subscribe to premium"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Calculate price and duration
    if sub.plan == "monthly":
        price = 2999  # 29.99 TRY in cents
        duration_days = 30
    elif sub.plan == "yearly":
        price = 19999  # 199.99 TRY in cents
        duration_days = 365
    else:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Create Stripe checkout session
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'try',
                    'product_data': {
                        'name': f'Tiny Café Premium - {sub.plan.capitalize()}',
                        'description': 'Premium membership with exclusive features',
                    },
                    'unit_amount': price,
                    'recurring': {
                        'interval': 'month' if sub.plan == 'monthly' else 'year',
                    },
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/premium/success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{os.environ.get("FRONTEND_URL", "http://localhost:3000")}/premium/cancel',
            client_reference_id=user['user_id'],
            metadata={
                'user_id': user['user_id'],
                'plan': sub.plan
            }
        )
        
        return {"checkout_url": checkout_session.url}
    
    except Exception as e:
        logger.error(f"Stripe error: {e}")
        raise HTTPException(status_code=500, detail="Payment processing failed")

@api_router.post("/premium/webhook")
async def premium_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.environ.get('STRIPE_WEBHOOK_SECRET', '')
        )
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle subscription events
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata']['user_id']
        plan = session['metadata']['plan']
        
        # Calculate expiry
        duration_days = 30 if plan == 'monthly' else 365
        expires_at = (datetime.now(timezone.utc) + timedelta(days=duration_days)).isoformat()
        
        # Update user
        await db.users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "is_premium": True,
                    "premium_expires_at": expires_at
                }
            }
        )
        
        # Create subscription record
        subscription = PremiumSubscription(
            user_id=user_id,
            plan=plan,
            stripe_subscription_id=session.get('subscription'),
            expires_at=expires_at
        )
        await db.premium_subscriptions.insert_one(subscription.dict())
    
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        
        # Deactivate premium
        await db.users.update_many(
            {"stripe_subscription_id": subscription['id']},
            {"$set": {"is_premium": False}}
        )
    
    return {"success": True}

@api_router.get("/premium/status")
async def get_premium_status(request: Request):
    """Get user's premium status"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    is_premium = check_premium(user)
    
    return {
        "is_premium": is_premium,
        "expires_at": user.get('premium_expires_at')
    }

# ==================== NOTIFICATION ENDPOINTS ====================

@api_router.get("/notifications/vapid-public-key")
async def get_vapid_public_key():
    """Get VAPID public key for push notifications"""
    return {"public_key": VAPID_PUBLIC_KEY}

@api_router.post("/notifications/subscribe")
async def subscribe_notifications(subscription: Dict, request: Request):
    """Subscribe to push notifications"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Store subscription
    push_sub = PushSubscription(
        user_id=user['user_id'],
        subscription=subscription
    )
    
    await db.push_subscriptions.update_one(
        {"user_id": user['user_id']},
        {"$set": push_sub.dict()},
        upsert=True
    )
    
    return {"success": True}

@api_router.post("/notifications/unsubscribe")
async def unsubscribe_notifications(request: Request):
    """Unsubscribe from push notifications"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    await db.push_subscriptions.delete_one({"user_id": user['user_id']})
    
    return {"success": True}

@api_router.post("/notifications/send")
async def send_notification(notification: NotificationSend, request: Request):
    """Send push notification to user"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Get user's subscription
    sub_doc = await db.push_subscriptions.find_one({"user_id": notification.user_id})
    if not sub_doc:
        raise HTTPException(status_code=404, detail="User not subscribed")
    
    try:
        webpush(
            subscription_info=sub_doc['subscription'],
            data=json.dumps({
                "title": notification.title,
                "body": notification.body,
                "icon": notification.icon
            }),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        return {"success": True}
    except WebPushException as e:
        logger.error(f"Push notification failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send notification")

# ==================== SPOTIFY ENDPOINTS ====================

@api_router.post("/spotify/callback")
async def spotify_callback(callback: SpotifyCallback, request: Request):
    """Handle Spotify OAuth callback"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://accounts.spotify.com/api/token',
            data={
                'grant_type': 'authorization_code',
                'code': callback.code,
                'redirect_uri': SPOTIFY_REDIRECT_URI,
                'client_id': SPOTIFY_CLIENT_ID,
                'client_secret': SPOTIFY_CLIENT_SECRET,
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Spotify auth failed")
        
        tokens = response.json()
    
    # Store tokens
    await db.users.update_one(
        {"user_id": user['user_id']},
        {
            "$set": {
                "spotify_access_token": tokens['access_token'],
                "spotify_refresh_token": tokens['refresh_token']
            }
        }
    )
    
    return {"success": True, "access_token": tokens['access_token']}

@api_router.get("/spotify/token")
async def get_spotify_token(request: Request):
    """Get user's Spotify access token"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not user.get('spotify_access_token'):
        raise HTTPException(status_code=404, detail="Spotify not connected")
    
    return {"access_token": user['spotify_access_token']}

@api_router.post("/spotify/refresh")
async def refresh_spotify_token(request: Request):
    """Refresh Spotify access token"""
    user = await get_user_from_session(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not user.get('spotify_refresh_token'):
        raise HTTPException(status_code=404, detail="No refresh token")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://accounts.spotify.com/api/token',
            data={
                'grant_type': 'refresh_token',
                'refresh_token': user['spotify_refresh_token'],
                'client_id': SPOTIFY_CLIENT_ID,
                'client_secret': SPOTIFY_CLIENT_SECRET,
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Refresh failed")
        
        tokens = response.json()
    
    # Update token
    await db.users.update_one(
        {"user_id": user['user_id']},
        {"$set": {"spotify_access_token": tokens['access_token']}}
    )
    
    return {"access_token": tokens['access_token']}

# ==================== WEBSOCKET ====================

@app.websocket("/ws/chat/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time chat"""
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection alive
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(user_id)

# ==================== EXISTING ENDPOINTS (keep all existing ones) ====================
# ... (all your existing endpoints remain here)

# Register router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
