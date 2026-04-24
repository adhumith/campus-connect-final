from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from app.core.config import settings

client: AsyncIOMotorClient = None
db = None
gridfs_bucket = None

async def connect_db():
    global client, db, gridfs_bucket
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DB_NAME]
    gridfs_bucket = AsyncIOMotorGridFSBucket(db)
    print("✅ MongoDB connected successfully")

async def close_db():
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")

def get_db():
    return db

def get_gridfs():
    return gridfs_bucket