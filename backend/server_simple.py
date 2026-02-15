#!/usr/bin/env python3
"""
Simplified backend server for testing without MongoDB
Uses in-memory storage for development/testing
"""

from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import secrets
import json

# In-memory storage
users_db: Dict[str, Any] = {}
sessions_db: Dict[str, str] = {}  # session_token -> user_id

app = FastAPI(title="PoncikFocus Test API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class TestLoginResponse(BaseModel):
    id: str
    email: str
    name: str
    credits: int
    level: int
    xp: int
    streak_days: int
    last_login: str
    customization: dict
    premium: dict
    stats: dict

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "PoncikFocus Test API",
        "version": "1.0.0-test",
        "mode": "in-memory",
        "endpoints": {
            "test_login": "POST /api/auth/test-login",
            "me": "GET /api/auth/me",
            "logout": "POST /api/auth/logout"
        }
    }

# Test login endpoint
@app.post("/api/auth/test-login")
async def test_login(response: Response):
    """Create a test user and log them in"""
    
    # Create test user
    user_id = f"test_{secrets.token_hex(8)}"
    session_token = secrets.token_urlsafe(32)
    
    user_data = {
        "id": user_id,
        "email": "test@tinycafe.app",
        "name": "Test User",
        "credits": 1000,
        "level": 5,
        "xp": 500,
        "streak_days": 3,
        "last_login": datetime.now().isoformat(),
        "customization": {
            "character": "default",
            "outfit": "casual",
            "unlocked_outfits": ["casual", "cozy"],
            "theme": "sakura"
        },
        "premium": {
            "is_premium": False,
            "expires_at": None
        },
        "stats": {
            "total_sessions": 10,
            "total_focus_minutes": 250,
            "quests_completed": 5,
            "customers_served": 15
        }
    }
    
    # Store in memory
    users_db[user_id] = user_data
    sessions_db[session_token] = user_id
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
        path="/"
    )
    
    return user_data

# Get current user
@app.get("/api/auth/me")
async def get_current_user(request: Request):
    """Get currently logged in user"""
    
    session_token = request.cookies.get("session_token")
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user_id = sessions_db.get(session_token)
    if not user_id or user_id not in users_db:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return users_db[user_id]

# Logout
@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    
    session_token = request.cookies.get("session_token")
    if session_token and session_token in sessions_db:
        del sessions_db[session_token]
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

# Mock endpoints for frontend compatibility
@app.get("/api/user")
async def get_user(request: Request):
    """Alias for /api/auth/me"""
    return await get_current_user(request)

@app.get("/api/todos")
async def get_todos(request: Request):
    """Mock todos"""
    return []

@app.get("/api/shop/items")
async def get_shop_items():
    """Mock shop items"""
    return []

@app.get("/api/quests/daily")
async def get_daily_quests():
    """Mock daily quests"""
    return []

@app.get("/api/community/leaderboard")
async def get_leaderboard():
    """Mock leaderboard"""
    return []

@app.get("/api/community/friends")
async def get_friends():
    """Mock friends"""
    return []

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "users_count": len(users_db),
        "sessions_count": len(sessions_db),
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    print("🚀 Starting PoncikFocus Test Server...")
    print("📝 Mode: In-Memory (No MongoDB required)")
    print("🌐 Frontend: http://localhost:3000")
    print("🔌 Backend: http://localhost:8000")
    print("✅ Ready for test login!")
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
