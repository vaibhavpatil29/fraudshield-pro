import json
from app.core.redis_client import redis_client

async def get_user_profile(user_id: str) -> dict:
    """Get user's behavioral profile from Redis."""
    data = await redis_client.get(f"profile:{user_id}")
    if data:
        return json.loads(data)
    return {
        "user_id": user_id,
        "avg_amount": 0,
        "txn_count": 0,
        "known_merchants": [],
        "known_devices": [],
        "active_hours": []
    }

async def update_user_profile(user_id: str, transaction: dict):
    """Update user profile after each transaction."""
    profile = await get_user_profile(user_id)

    # Update avg amount using running average
    count = profile["txn_count"] + 1
    avg = ((profile["avg_amount"] * profile["txn_count"]) + transaction["amount"]) / count
    profile["avg_amount"] = round(avg, 2)
    profile["txn_count"] = count

    # Track known merchants (keep last 20)
    merchants = profile["known_merchants"]
    if transaction["merchant"] not in merchants:
        merchants.append(transaction["merchant"])
        profile["known_merchants"] = merchants[-20:]

    # Track known devices (keep last 10)
    if transaction.get("device_id"):
        devices = profile["known_devices"]
        if transaction["device_id"] not in devices:
            devices.append(transaction["device_id"])
            profile["known_devices"] = devices[-10:]

    # Track active hours
    from datetime import datetime
    hour = datetime.now().hour
    hours = profile["active_hours"]
    if hour not in hours:
        hours.append(hour)
        profile["active_hours"] = hours

    # Save back to Redis (expires in 90 days)
    await redis_client.setex(
        f"profile:{user_id}",
        90 * 24 * 3600,
        json.dumps(profile)
    )

    return profile