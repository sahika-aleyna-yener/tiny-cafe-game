#!/usr/bin/env python3
"""
Database Migration Script for Tiny Café v2.0
Adds new collections and indexes
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def migrate():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("=" * 60)
    print("Starting Database Migration for Tiny Café v2.0")
    print("=" * 60)
    
    # 1. Chat Messages Collection
    print("\n1. Creating chat_messages collection...")
    try:
        await db.create_collection("chat_messages")
        await db.chat_messages.create_index("chat_id")
        await db.chat_messages.create_index("sender_id")
        await db.chat_messages.create_index("created_at")
        print("   ✓ chat_messages collection created")
    except Exception as e:
        print(f"   - chat_messages already exists or error: {e}")
    
    # 2. Chat Groups Collection
    print("\n2. Creating chat_groups collection...")
    try:
        await db.create_collection("chat_groups")
        await db.chat_groups.create_index("group_id", unique=True)
        await db.chat_groups.create_index("created_by")
        print("   ✓ chat_groups collection created")
    except Exception as e:
        print(f"   - chat_groups already exists or error: {e}")
    
    # 3. Premium Subscriptions Collection
    print("\n3. Creating premium_subscriptions collection...")
    try:
        await db.create_collection("premium_subscriptions")
        await db.premium_subscriptions.create_index("user_id")
        await db.premium_subscriptions.create_index("stripe_subscription_id")
        await db.premium_subscriptions.create_index("expires_at")
        print("   ✓ premium_subscriptions collection created")
    except Exception as e:
        print(f"   - premium_subscriptions already exists or error: {e}")
    
    # 4. Push Subscriptions Collection
    print("\n4. Creating push_subscriptions collection...")
    try:
        await db.create_collection("push_subscriptions")
        await db.push_subscriptions.create_index("user_id", unique=True)
        print("   ✓ push_subscriptions collection created")
    except Exception as e:
        print(f"   - push_subscriptions already exists or error: {e}")
    
    # 5. Update Users Collection - Add New Fields
    print("\n5. Updating users collection with new fields...")
    try:
        result = await db.users.update_many(
            {},
            {
                "$set": {
                    "is_premium": False,
                    "owned_customization": [],
                    "customization": {
                        "skin": "default",
                        "outfit": "casual",
                        "accessory": "none"
                    }
                }
            }
        )
        print(f"   ✓ Updated {result.modified_count} users with new fields")
    except Exception as e:
        print(f"   - Error updating users: {e}")
    
    # 6. Friendships Collection (if not exists)
    print("\n6. Checking friendships collection...")
    try:
        collections = await db.list_collection_names()
        if "friendships" not in collections:
            await db.create_collection("friendships")
            await db.friendships.create_index("user_id")
            await db.friendships.create_index("friend_id")
            await db.friendships.create_index("status")
            print("   ✓ friendships collection created")
        else:
            print("   - friendships collection already exists")
    except Exception as e:
        print(f"   - Error with friendships: {e}")
    
    # 7. Create indexes for better performance
    print("\n7. Creating additional indexes...")
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("is_premium")
        await db.users.create_index("level")
        print("   ✓ Additional indexes created")
    except Exception as e:
        print(f"   - Indexes already exist or error: {e}")
    
    print("\n" + "=" * 60)
    print("Migration Completed Successfully! ✓")
    print("=" * 60)
    
    # Print summary
    print("\nDatabase Summary:")
    collections = await db.list_collection_names()
    for coll in sorted(collections):
        count = await db[coll].count_documents({})
        print(f"  - {coll}: {count} documents")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate())
