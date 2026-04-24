from pinecone import Pinecone
from app.core.config import settings

pc = None
index = None

def init_pinecone():
    global pc, index
    try:
        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX_NAME)
        print("✅ Pinecone initialized successfully")
    except Exception as e:
        print(f"⚠️ Pinecone init failed: {e}")
        index = None

def get_index():
    return index