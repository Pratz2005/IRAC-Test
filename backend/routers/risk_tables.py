from fastapi import APIRouter, HTTPException
from backend.supabase_client import supabase
from backend.schemas import RiskTableItem

router = APIRouter(prefix="/risk-tables", tags=["Risk Tables"])

@router.post("/{pm_id}/add")
def add_to_risk_table(pm_id: str, item: RiskTableItem):
    res = supabase.table("risk_tables").insert({
        "project_manager_id": pm_id,
        "risk_scenario_id": item.risk_scenario_id,
        "mitigation_status": item.mitigation_status
    }).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Insert failed")
    return res.data[0]

@router.get("/{pm_id}")
def get_pm_risk_table(pm_id: str):
    res = supabase.table("risk_tables").select("*").eq("project_manager_id", pm_id).execute()
    return res.data

@router.get("/")
def get_all_risk_tables():
    res = supabase.table("risk_tables").select("*").execute()
    return res.data
