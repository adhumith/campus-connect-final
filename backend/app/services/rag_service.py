from google import genai
from app.core.config import settings
from app.utils.pinecone import get_index
from app.db.mongodb import get_db
import hashlib

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

async def get_embedding(text: str) -> list:
    result = client.models.embed_content(
        model="gemini-embedding-001",
        contents=text
    )
    return result.embeddings[0].values

async def upload_document(text: str, metadata: dict) -> dict:
    index = get_index()
    embedding = await get_embedding(text)
    doc_id = hashlib.md5(text[:100].encode()).hexdigest()
    index.upsert(vectors=[{
        "id": doc_id,
        "values": embedding,
        "metadata": {
            **metadata,
            "text": text[:1000]
        }
    }])
    db = get_db()
    await db.rag_documents.insert_one({
        "doc_id": doc_id,
        "text": text,
        "metadata": metadata
    })
    return {"doc_id": doc_id, "message": "Document uploaded successfully"}

async def query_rag(question: str) -> str:
    index = get_index()
    question_embedding = await get_embedding(question)
    results = index.query(
        vector=question_embedding,
        top_k=5,
        include_metadata=True
    )
    if not results["matches"]:
        return "Not Found"
    top_score = results["matches"][0]["score"]
    if top_score < 0.6:
        return "Not Found"
    context = "\n\n".join([
        match["metadata"].get("text", "")
        for match in results["matches"]
        if match["score"] > 0.5
    ])
    if not context.strip():
        return "Not Found"
    answer = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"Answer based on context only. Context: {context} Question: {question}"
    )
    return answer.text.strip()

async def reset_knowledge_base() -> dict:
    index = get_index()
    db = get_db()
    index.delete(delete_all=True)
    await db.rag_documents.delete_many({})
    return {"message": "Knowledge base reset successfully"}