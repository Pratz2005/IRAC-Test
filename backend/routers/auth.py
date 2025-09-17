from fastapi import APIRouter, HTTPException
from backend.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/signup")
def signup(email: str, password: str, role: str):
    try:
        user = supabase.auth.sign_up({"email": email, "password": password})
        if not user:
            raise HTTPException(status_code=400, detail="Signup failed")
        # Add role metadata
        supabase.auth.update_user(user.user.id, {"data": {"role": role}})
        return {"message": "User created", "id": user.user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(email: str, password: str):
    try:
        user = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid login")
        return {"token": user.session.access_token, "user": user.user}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
