from fastapi import FastAPI, APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

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

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: str
    created_at: str

class Todo(BaseModel):
    todo_id: str
    user_id: str
    text: str
    completed: bool = False
    created_at: str

class TodoCreate(BaseModel):
    text: str

class TodoUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None

class FocusSession(BaseModel):
    session_id: str
    user_id: str
    duration_minutes: int
    credits_earned: int
    double_credits: bool = False
    started_at: str
    ended_at: str

class FocusSessionStart(BaseModel):
    duration_minutes: int = 25

class FocusSessionEnd(BaseModel):
    actual_minutes: int
    double_credits: bool = False

class ShopItem(BaseModel):
    item_id: str
    name_tr: str
    name_en: str
    description_tr: str
    description_en: str
    price: int
    category: str
    image_url: str
    locked: bool = False
    unlock_level: int = 1

class Purchase(BaseModel):
    item_id: str

class FriendRequest(BaseModel):
    target_email: str

class MusicTrack(BaseModel):
    track_id: str
    name: str
    artist: str
    url: str
    category: str
    locked: bool = False
    unlock_level: int = 1

class SettingsUpdate(BaseModel):
    language: Optional[str] = None
    active_theme: Optional[str] = None

class Badge(BaseModel):
    badge_id: str
    name_tr: str
    name_en: str
    description_tr: str
    description_en: str
    icon: str
    requirement_type: str
    requirement_value: int

# ==================== AUTH HELPERS ====================

async def get_current_user(request: Request) -> User:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

# ==================== AUTH ENDPOINTS ====================

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token"""
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        
        user_data = resp.json()
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": user_data["name"], "picture": user_data.get("picture")}}
        )
    else:
        new_user = {
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "credits": 50,
            "level": 1,
            "xp": 0,
            "streak_days": 0,
            "last_study_date": None,
            "total_focus_minutes": 0,
            "owned_items": [],
            "active_theme": "light",
            "language": "tr",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(new_user)
    
    session_token = user_data.get("session_token", f"session_{uuid.uuid4().hex}")
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.delete_many({"user_id": user_id})
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@api_router.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user"""
    user = await get_current_user(request)
    return user.model_dump()

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_many({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/", samesite="none", secure=True)
    return {"message": "Logged out"}

# ==================== TODO ENDPOINTS ====================

@api_router.get("/todos", response_model=List[Todo])
async def get_todos(request: Request):
    user = await get_current_user(request)
    todos = await db.todos.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return todos

@api_router.post("/todos", response_model=Todo, status_code=201)
async def create_todo(todo: TodoCreate, request: Request):
    user = await get_current_user(request)
    todo_doc = {
        "todo_id": f"todo_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "text": todo.text,
        "completed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.todos.insert_one(todo_doc)
    return Todo(**{k: v for k, v in todo_doc.items() if k != "_id"})

@api_router.put("/todos/{todo_id}", response_model=Todo)
async def update_todo(todo_id: str, update: TodoUpdate, request: Request):
    user = await get_current_user(request)
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if update_data:
        await db.todos.update_one(
            {"todo_id": todo_id, "user_id": user.user_id},
            {"$set": update_data}
        )
    todo_doc = await db.todos.find_one({"todo_id": todo_id, "user_id": user.user_id}, {"_id": 0})
    if not todo_doc:
        raise HTTPException(status_code=404, detail="Todo not found")
    return Todo(**todo_doc)

@api_router.delete("/todos/{todo_id}")
async def delete_todo(todo_id: str, request: Request):
    user = await get_current_user(request)
    result = await db.todos.delete_one({"todo_id": todo_id, "user_id": user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted"}

# ==================== FOCUS SESSION ENDPOINTS ====================

@api_router.post("/focus/start")
async def start_focus_session(data: FocusSessionStart, request: Request):
    user = await get_current_user(request)
    session_doc = {
        "session_id": f"focus_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "duration_minutes": data.duration_minutes,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "status": "active"
    }
    await db.focus_sessions.insert_one(session_doc)
    return {"session_id": session_doc["session_id"], "started_at": session_doc["started_at"]}

@api_router.post("/focus/end/{session_id}")
async def end_focus_session(session_id: str, data: FocusSessionEnd, request: Request):
    user = await get_current_user(request)
    
    session_doc = await db.focus_sessions.find_one(
        {"session_id": session_id, "user_id": user.user_id},
        {"_id": 0}
    )
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Calculate credits: 1 credit per minute, doubled if ad watched
    base_credits = data.actual_minutes
    multiplier = 2 if data.double_credits else 1
    credits_earned = base_credits * multiplier
    
    # Update session
    await db.focus_sessions.update_one(
        {"session_id": session_id},
        {"$set": {
            "ended_at": datetime.now(timezone.utc).isoformat(),
            "actual_minutes": data.actual_minutes,
            "credits_earned": credits_earned,
            "double_credits": data.double_credits,
            "status": "completed"
        }}
    )
    
    # Update user stats
    today = datetime.now(timezone.utc).date().isoformat()
    last_study = user.last_study_date
    
    new_streak = user.streak_days
    if last_study:
        last_date = datetime.fromisoformat(last_study).date()
        today_date = datetime.now(timezone.utc).date()
        if (today_date - last_date).days == 1:
            new_streak += 1
        elif (today_date - last_date).days > 1:
            new_streak = 1
    else:
        new_streak = 1
    
    # XP calculation: 10 XP per minute
    xp_earned = data.actual_minutes * 10
    new_xp = user.xp + xp_earned
    new_level = user.level
    
    # Level up every 1000 XP
    while new_xp >= new_level * 1000:
        new_xp -= new_level * 1000
        new_level += 1
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {
            "credits": user.credits + credits_earned,
            "total_focus_minutes": user.total_focus_minutes + data.actual_minutes,
            "streak_days": new_streak,
            "last_study_date": today,
            "xp": new_xp,
            "level": new_level
        }}
    )
    
    # Check for new badges
    await check_and_award_badges(user.user_id)
    
    return {
        "credits_earned": credits_earned,
        "xp_earned": xp_earned,
        "new_level": new_level,
        "streak_days": new_streak
    }

async def check_and_award_badges(user_id: str):
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user_doc:
        return
    
    existing_badges = await db.user_badges.find({"user_id": user_id}, {"_id": 0}).to_list(100)
    existing_badge_ids = [b["badge_id"] for b in existing_badges]
    
    badges_to_check = [
        {"badge_id": "first_focus", "requirement_type": "total_minutes", "requirement_value": 1},
        {"badge_id": "hour_hero", "requirement_type": "total_minutes", "requirement_value": 60},
        {"badge_id": "streak_starter", "requirement_type": "streak", "requirement_value": 3},
        {"badge_id": "streak_master", "requirement_type": "streak", "requirement_value": 7},
        {"badge_id": "level_5", "requirement_type": "level", "requirement_value": 5},
    ]
    
    for badge in badges_to_check:
        if badge["badge_id"] in existing_badge_ids:
            continue
        
        earned = False
        if badge["requirement_type"] == "total_minutes":
            earned = user_doc.get("total_focus_minutes", 0) >= badge["requirement_value"]
        elif badge["requirement_type"] == "streak":
            earned = user_doc.get("streak_days", 0) >= badge["requirement_value"]
        elif badge["requirement_type"] == "level":
            earned = user_doc.get("level", 1) >= badge["requirement_value"]
        
        if earned:
            await db.user_badges.insert_one({
                "user_id": user_id,
                "badge_id": badge["badge_id"],
                "earned_at": datetime.now(timezone.utc).isoformat()
            })

@api_router.get("/focus/history")
async def get_focus_history(request: Request):
    user = await get_current_user(request)
    sessions = await db.focus_sessions.find(
        {"user_id": user.user_id, "status": "completed"},
        {"_id": 0}
    ).sort("ended_at", -1).to_list(50)
    return sessions

# ==================== SHOP ENDPOINTS ====================

@api_router.get("/shop/items", response_model=List[ShopItem])
async def get_shop_items(request: Request):
    user = await get_current_user(request)
    items = await db.shop_items.find({}, {"_id": 0}).to_list(100)
    
    if not items:
        default_items = [
            {"item_id": "coffee_latte", "name_tr": "Sıcak Latte", "name_en": "Hot Latte", "description_tr": "Kremsi ve sıcacık", "description_en": "Creamy and warm", "price": 30, "category": "drinks", "image_url": "☕", "locked": False, "unlock_level": 1},
            {"item_id": "coffee_mocha", "name_tr": "Mocha", "name_en": "Mocha", "description_tr": "Çikolatalı keyif", "description_en": "Chocolate delight", "price": 40, "category": "drinks", "image_url": "🍫", "locked": False, "unlock_level": 1},
            {"item_id": "tea_matcha", "name_tr": "Matcha Latte", "name_en": "Matcha Latte", "description_tr": "Yeşil çay enerjisi", "description_en": "Green tea energy", "price": 35, "category": "drinks", "image_url": "🍵", "locked": True, "unlock_level": 3},
            {"item_id": "donut_choco", "name_tr": "Çikolatalı Donut", "name_en": "Chocolate Donut", "description_tr": "Tatlı bir mola", "description_en": "A sweet break", "price": 25, "category": "treats", "image_url": "🍩", "locked": False, "unlock_level": 1},
            {"item_id": "cake_slice", "name_tr": "Pasta Dilimi", "name_en": "Cake Slice", "description_tr": "Kutlama vakti!", "description_en": "Celebration time!", "price": 50, "category": "treats", "image_url": "🍰", "locked": True, "unlock_level": 5},
            {"item_id": "cookie_pack", "name_tr": "Kurabiye Paketi", "name_en": "Cookie Pack", "description_tr": "Çıtır çıtır", "description_en": "Crunchy goodness", "price": 20, "category": "treats", "image_url": "🍪", "locked": False, "unlock_level": 1},
            {"item_id": "smoothie", "name_tr": "Meyve Smoothie", "name_en": "Fruit Smoothie", "description_tr": "Ferahlatıcı", "description_en": "Refreshing", "price": 45, "category": "drinks", "image_url": "🥤", "locked": True, "unlock_level": 4},
            {"item_id": "croissant", "name_tr": "Kruvasan", "name_en": "Croissant", "description_tr": "Tereyağlı lezzet", "description_en": "Buttery delight", "price": 30, "category": "treats", "image_url": "🥐", "locked": False, "unlock_level": 2},
        ]
        for item in default_items:
            await db.shop_items.insert_one(item)
        items = default_items
    
    for item in items:
        item["locked"] = item.get("unlock_level", 1) > user.level
    
    return items

@api_router.post("/shop/purchase")
async def purchase_item(purchase: Purchase, request: Request):
    user = await get_current_user(request)
    
    item = await db.shop_items.find_one({"item_id": purchase.item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    if item.get("unlock_level", 1) > user.level:
        raise HTTPException(status_code=403, detail="Item locked - level too low")
    
    if user.credits < item["price"]:
        raise HTTPException(status_code=400, detail="Not enough credits")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {
            "$inc": {"credits": -item["price"]},
            "$push": {"owned_items": purchase.item_id}
        }
    )
    
    await db.purchases.insert_one({
        "purchase_id": f"purchase_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "item_id": purchase.item_id,
        "price": item["price"],
        "purchased_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Purchase successful", "item": item}

@api_router.get("/shop/purchases")
async def get_purchases(request: Request):
    user = await get_current_user(request)
    purchases = await db.purchases.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return purchases

# ==================== COMMUNITY ENDPOINTS ====================

@api_router.get("/community/leaderboard")
async def get_leaderboard(request: Request):
    users = await db.users.find(
        {},
        {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "level": 1, "total_focus_minutes": 1, "streak_days": 1}
    ).sort("total_focus_minutes", -1).to_list(20)
    return users

@api_router.get("/community/friends")
async def get_friends(request: Request):
    user = await get_current_user(request)
    friendships = await db.friendships.find(
        {"$or": [{"user_id": user.user_id}, {"friend_id": user.user_id}], "status": "accepted"},
        {"_id": 0}
    ).to_list(100)
    
    friend_ids = []
    for f in friendships:
        if f["user_id"] == user.user_id:
            friend_ids.append(f["friend_id"])
        else:
            friend_ids.append(f["user_id"])
    
    friends = await db.users.find(
        {"user_id": {"$in": friend_ids}},
        {"_id": 0, "user_id": 1, "name": 1, "picture": 1, "level": 1, "total_focus_minutes": 1, "streak_days": 1}
    ).to_list(100)
    
    return friends

@api_router.post("/community/invite")
async def invite_friend(data: FriendRequest, request: Request):
    user = await get_current_user(request)
    
    target = await db.users.find_one({"email": data.target_email}, {"_id": 0})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target["user_id"] == user.user_id:
        raise HTTPException(status_code=400, detail="Cannot invite yourself")
    
    existing = await db.friendships.find_one({
        "$or": [
            {"user_id": user.user_id, "friend_id": target["user_id"]},
            {"user_id": target["user_id"], "friend_id": user.user_id}
        ]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Friendship already exists")
    
    await db.friendships.insert_one({
        "friendship_id": f"friend_{uuid.uuid4().hex[:12]}",
        "user_id": user.user_id,
        "friend_id": target["user_id"],
        "status": "accepted",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Bonus credits for inviting
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$inc": {"credits": 25}}
    )
    
    return {"message": "Friend added! +25 bonus credits", "bonus_credits": 25}

# ==================== MUSIC ENDPOINTS ====================

@api_router.get("/music/tracks")
async def get_music_tracks(request: Request):
    user = await get_current_user(request)
    tracks = await db.music_tracks.find({}, {"_id": 0}).to_list(100)
    
    if not tracks:
        default_tracks = [
            {"track_id": "lofi_chill", "name": "Cozy Cafe Vibes", "artist": "LoFi Dreams", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", "category": "lofi", "locked": False, "unlock_level": 1},
            {"track_id": "ambient_rain", "name": "Rainy Day Study", "artist": "Ambient Sounds", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", "category": "ambient", "locked": False, "unlock_level": 1},
            {"track_id": "piano_soft", "name": "Soft Piano Dreams", "artist": "Classical Focus", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", "category": "classical", "locked": False, "unlock_level": 1},
            {"track_id": "nature_forest", "name": "Forest Whispers", "artist": "Nature Sounds", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", "category": "nature", "locked": True, "unlock_level": 3},
            {"track_id": "jazz_smooth", "name": "Midnight Jazz", "artist": "Jazz Cafe", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", "category": "jazz", "locked": True, "unlock_level": 5},
            {"track_id": "electronic_focus", "name": "Deep Focus Electronic", "artist": "Focus Beats", "url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", "category": "electronic", "locked": True, "unlock_level": 7},
        ]
        for track in default_tracks:
            await db.music_tracks.insert_one(track)
        tracks = default_tracks
    
    for track in tracks:
        track["locked"] = track.get("unlock_level", 1) > user.level
    
    return tracks

# ==================== BADGES ENDPOINTS ====================

@api_router.get("/badges")
async def get_badges(request: Request):
    badges = [
        {"badge_id": "first_focus", "name_tr": "İlk Adım", "name_en": "First Step", "description_tr": "İlk odaklanma seansını tamamla", "description_en": "Complete your first focus session", "icon": "🌟", "requirement_type": "total_minutes", "requirement_value": 1},
        {"badge_id": "hour_hero", "name_tr": "Saat Kahramanı", "name_en": "Hour Hero", "description_tr": "Toplam 1 saat odaklan", "description_en": "Focus for 1 hour total", "icon": "⏰", "requirement_type": "total_minutes", "requirement_value": 60},
        {"badge_id": "streak_starter", "name_tr": "Seri Başlangıcı", "name_en": "Streak Starter", "description_tr": "3 günlük seri yap", "description_en": "Achieve a 3-day streak", "icon": "🔥", "requirement_type": "streak", "requirement_value": 3},
        {"badge_id": "streak_master", "name_tr": "Seri Ustası", "name_en": "Streak Master", "description_tr": "7 günlük seri yap", "description_en": "Achieve a 7-day streak", "icon": "💪", "requirement_type": "streak", "requirement_value": 7},
        {"badge_id": "level_5", "name_tr": "Seviye 5", "name_en": "Level 5", "description_tr": "Seviye 5'e ulaş", "description_en": "Reach level 5", "icon": "🏆", "requirement_type": "level", "requirement_value": 5},
        {"badge_id": "shopaholic", "name_tr": "Alışveriş Delisi", "name_en": "Shopaholic", "description_tr": "10 ürün satın al", "description_en": "Purchase 10 items", "icon": "🛍️", "requirement_type": "purchases", "requirement_value": 10},
        {"badge_id": "social_butterfly", "name_tr": "Sosyal Kelebek", "name_en": "Social Butterfly", "description_tr": "5 arkadaş ekle", "description_en": "Add 5 friends", "icon": "🦋", "requirement_type": "friends", "requirement_value": 5},
    ]
    return badges

@api_router.get("/badges/earned")
async def get_earned_badges(request: Request):
    user = await get_current_user(request)
    earned = await db.user_badges.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    return earned

# ==================== USER SETTINGS ====================

@api_router.put("/user/settings")
async def update_settings(settings: SettingsUpdate, request: Request):
    user = await get_current_user(request)
    update_data = {k: v for k, v in settings.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"user_id": user.user_id}, {"$set": update_data})
    
    user_doc = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return user_doc

@api_router.get("/user/stats")
async def get_user_stats(request: Request):
    user = await get_current_user(request)
    
    # Get session count
    session_count = await db.focus_sessions.count_documents({"user_id": user.user_id, "status": "completed"})
    purchase_count = await db.purchases.count_documents({"user_id": user.user_id})
    friend_count = await db.friendships.count_documents({
        "$or": [{"user_id": user.user_id}, {"friend_id": user.user_id}],
        "status": "accepted"
    })
    badge_count = await db.user_badges.count_documents({"user_id": user.user_id})
    
    return {
        "total_sessions": session_count,
        "total_focus_minutes": user.total_focus_minutes,
        "total_purchases": purchase_count,
        "total_friends": friend_count,
        "total_badges": badge_count,
        "credits": user.credits,
        "level": user.level,
        "xp": user.xp,
        "streak_days": user.streak_days
    }

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "PoncikFocus API", "version": "1.0.0"}

# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
