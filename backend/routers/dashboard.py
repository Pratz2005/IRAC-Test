from fastapi import APIRouter
from backend.supabase_client import supabase
from collections import Counter

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats():
    res = supabase.table("risk_tables").select("*").execute()
    risks = [r["risk_scenario_id"] for r in res.data]
    stats = Counter(risks)
    return {"risk_distribution": stats}
