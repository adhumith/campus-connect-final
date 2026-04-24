import redis.asyncio as aioredis
from app.core.config import settings

redis_client = None

async def connect_redis():
    global redis_client
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
    print("✅ Redis connected successfully")

async def close_redis():
    global redis_client
    if redis_client:
        await redis_client.close()
        print("✅ Redis connection closed")

def get_redis():
    return redis_client