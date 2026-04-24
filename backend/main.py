from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from app.core.config import settings
from app.api.routes import auth, users, courses, assignments, blogs, notifications, rag
from app.db.mongodb import connect_db, close_db, get_gridfs
from app.db.redis import connect_redis, close_redis
from app.utils.firebase import initialize_firebase
from app.utils.pinecone import init_pinecone
from bson import ObjectId

app = FastAPI(
    title="Campus Communication Platform",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV == "development" else None,
)

# CORS must be first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await connect_db()
    await connect_redis()
    initialize_firebase()
    init_pinecone()

@app.on_event("shutdown")
async def shutdown():
    await close_db()
    await close_redis()

# API Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(blogs.router, prefix="/api/blogs", tags=["Blogs"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(rag.router, prefix="/api/rag", tags=["RAG"])

@app.get("/")
async def root():
    return {"message": "Campus Platform API is running", "env": settings.APP_ENV}

# File serving from GridFS
@app.get("/api/files/{file_id}")
async def get_file(file_id: str):
    gridfs = get_gridfs()
    try:
        grid_out = await gridfs.open_download_stream(ObjectId(file_id))
        return StreamingResponse(
            grid_out,
            media_type=grid_out.metadata.get("content_type", "application/octet-stream"),
            headers={"Content-Disposition": f"attachment; filename={grid_out.filename}"}
        )
    except Exception:
        raise HTTPException(status_code=404, detail="File not found")