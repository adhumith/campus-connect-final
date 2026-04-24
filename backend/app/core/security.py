from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.utils.firebase import verify_firebase_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> dict:
    token = credentials.credentials
    try:
        decoded_token = await verify_firebase_token(token)
        return decoded_token
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))