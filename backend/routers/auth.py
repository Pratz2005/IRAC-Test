from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.supabase_client import supabase

router = APIRouter(prefix="/auth", tags=["Auth"])

class SignupRequest(BaseModel):
    email: str
    password: str
    role: str  # "PM" or "RC"

class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/signup")
def signup(req: SignupRequest):
    try:
        user = supabase.auth.sign_up({
            "email": req.email.strip(),
            "password": req.password
        })

        if not user or not user.user:
            raise HTTPException(status_code=400, detail="Signup failed")

        # Insert role into profiles table linked to auth.users id
        supabase.table("profiles").insert({
            "id": user.user.id,
            "role": req.role
        }).execute()

        return {
            "message": "Signup successful. Please confirm your email before logging in.",
            "email": req.email
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/login")
def login(req: LoginRequest):
    try:
        user = supabase.auth.sign_in_with_password({
            "email": req.email.strip(),
            "password": req.password
        })

        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid login")

        # Fetch the role from profiles
        profile = supabase.table("profiles").select("role").eq("id", user.user.id).single().execute()

        if not profile.data:
            raise HTTPException(status_code=404, detail="Profile not found for this user")

        return {
            "token": user.session.access_token,
            "user": {
                "id": user.user.id,
                "email": user.user.email,
                "role": profile.data["role"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
