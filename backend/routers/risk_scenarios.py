from fastapi import APIRouter, HTTPException
from backend.supabase_client import supabase
from backend.schemas import RiskScenario

router = APIRouter(prefix="/risks", tags=["Risk Scenarios"])

@router.get("/")
def get_all_risk_scenarios():
    data = supabase.table("risk_scenarios").select("*").execute()
    return data.data

@router.post("/")
def add_risk_scenario(risk: RiskScenario):
    res = supabase.table("risk_scenarios").insert(risk.dict()).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Insert failed")
    return res.data[0]
