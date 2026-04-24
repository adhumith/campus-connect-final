import firebase_admin
from firebase_admin import credentials, auth
import os

def initialize_firebase():
    if not firebase_admin._apps:
        cred_path = os.path.join("C:\\campus-platform\\backend\\firebase-admin.json")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("✅ Firebase Admin initialized successfully")

async def verify_firebase_token(token: str) -> dict:
    try:
        initialize_firebase()
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")