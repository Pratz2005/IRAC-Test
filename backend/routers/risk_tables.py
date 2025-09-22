from typing import Literal
from fastapi import APIRouter, HTTPException
from backend.supabase_client import supabase
from backend.schemas import RiskTableItem
from pydantic import BaseModel, constr

router = APIRouter(prefix="/risk-tables", tags=["Risk Tables"])

class MitigationUpdate(BaseModel):
    mitigation_status: Literal["not mitigated", "partially mitigated", "fully mitigated"]

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

@router.delete("/{pm_id}/delete/{item_id}")
def delete_risk_table_item(pm_id: str, item_id: str):
    print(f"Attempting to delete: item_id={item_id}, pm_id={pm_id}")
    
    # First check if the item exists and belongs to this PM
    check_res = (
        supabase
        .table("risk_tables")
        .select("*")
        .eq("id", item_id)
        .eq("project_manager_id", pm_id)
        .execute()
    )
    
    print(f"Found items before delete: {len(check_res.data)}")
    if check_res.data:
        print(f"Item to delete: {check_res.data[0]}")
    
    if not check_res.data:
        raise HTTPException(status_code=404, detail="Item not found or access denied")
    
    # Now delete it
    delete_res = (
        supabase
        .table("risk_tables")
        .delete()
        .eq("id", item_id)
        .eq("project_manager_id", pm_id)
        .execute()
    )
    
    print(f"Delete response: {delete_res}")
    
    # Verify it's actually deleted
    verify_res = (
        supabase
        .table("risk_tables")
        .select("*")
        .eq("id", item_id)
        .execute()
    )
    
    print(f"Items remaining after delete: {len(verify_res.data)}")
    
    return {"message": "Item deleted successfully", "id": item_id}


@router.put("/{pm_id}/update/{item_id}")
def update_risk_table_item(pm_id: str, item_id: str, patch: MitigationUpdate):
    # Check if item exists and belongs to this PM
    check_res = (
        supabase
        .table("risk_tables")
        .select("id")
        .eq("id", item_id)
        .eq("project_manager_id", pm_id)
        .execute()
    )
    
    if not check_res.data:
        raise HTTPException(status_code=404, detail="Item not found or access denied")
    
    # Update and return the updated data
    res = (
        supabase
        .table("risk_tables")
        .update({"mitigation_status": patch.mitigation_status})
        .eq("id", item_id)
        .execute()
    )
    
    # Get the updated item to return
    updated_res = (
        supabase
        .table("risk_tables")
        .select("*")
        .eq("id", item_id)
        .execute()
    )
    
    return updated_res.data[0] if updated_res.data else {"id": item_id, "mitigation_status": patch.mitigation_status}