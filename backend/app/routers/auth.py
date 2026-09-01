from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
import uuid

from app.schemas.auth import UserCreate, UserLogin, UserResponse, Token
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.database import get_async_db

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    db = get_async_db()
    existing_user = await db.users.find_one({"email": user.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    new_user = {
        "id": user_id,
        "email": user.email.lower(),
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(new_user)
    
    access_token = create_access_token(data={"sub": user_id})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    db = get_async_db()
    db_user = await db.users.find_one({"email": user.email.lower()})
    
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
        
    access_token = create_access_token(data={"sub": db_user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_me(user_id: str = Depends(get_current_user)):
    db = get_async_db()
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    return {
        "id": user["id"],
        "email": user["email"],
        "created_at": user["created_at"]
    }
