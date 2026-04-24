from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from app.core.security import get_current_user
from app.services.auth_service import get_user_by_uid
from app.services.rag_service import upload_document, query_rag, reset_knowledge_base
from pydantic import BaseModel
import PyPDF2
import io

router = APIRouter()

class QueryRequest(BaseModel):
    question: str

async def get_current_profile(current_user: dict = Depends(get_current_user)):
    profile = await get_user_by_uid(current_user["uid"])
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.post("/query")
async def query(
    request: QueryRequest,
    profile: dict = Depends(get_current_profile)
):
    answer = await query_rag(question=request.question)
    return {"question": request.question, "answer": answer}

@router.post("/upload")
async def upload(
    subject: str = Form(...),
    file: UploadFile = File(None),
    text: str = Form(None),
    profile: dict = Depends(get_current_profile)
):
    if profile["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can upload to knowledge base")

    content = ""

    if file:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported")
        contents = await file.read()
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
            for page in pdf_reader.pages:
                extracted = page.extract_text()
                if extracted:
                    content += extracted + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to read PDF: {str(e)}")
    elif text:
        content = text
    else:
        raise HTTPException(status_code=400, detail="Either a PDF file or text is required")

    if not content.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from the file")

    chunks = [content[i:i+1000] for i in range(0, len(content), 1000)]
    uploaded = 0
    for chunk in chunks:
        if chunk.strip():
            await upload_document(
                text=chunk,
                metadata={"subject": subject, "scope": "college"}
            )
            uploaded += 1

    return {"message": f"✅ Uploaded successfully! {uploaded} chunks added to knowledge base."}

@router.delete("/reset")
async def reset(profile: dict = Depends(get_current_profile)):
    if profile["role"] != "admin":
        raise HTTPException(status_code=403, detail="Only admin can reset knowledge base")
    return await reset_knowledge_base()