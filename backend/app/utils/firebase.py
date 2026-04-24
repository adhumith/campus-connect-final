import firebase_admin
from firebase_admin import credentials, auth
import os

def initialize_firebase():
    if not firebase_admin._apps:
        # Get the path relative to this file
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        cred_path = os.path.join(base_dir, "firebase-admin.json")
        print(f"Looking for firebase-admin.json at: {cred_path}")
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