#!/usr/bin/env python3
"""
Generate VAPID keys for push notifications
Run this once and add the keys to your .env file
"""

from py_vapid import Vapid

def generate_vapid_keys():
    vapid = Vapid()
    vapid.generate_keys()
    
    print("=" * 60)
    print("VAPID Keys Generated Successfully!")
    print("=" * 60)
    print("\nAdd these to your .env file:\n")
    print(f"VAPID_PUBLIC_KEY={vapid.public_key.savekey('urlsafe').decode()}")
    print(f"VAPID_PRIVATE_KEY={vapid.private_key.savekey('urlsafe').decode()}")
    print(f"VAPID_SUBJECT=mailto:your@email.com")
    print("\n" + "=" * 60)
    print("IMPORTANT: Keep the PRIVATE_KEY secret!")
    print("=" * 60)

if __name__ == "__main__":
    generate_vapid_keys()
