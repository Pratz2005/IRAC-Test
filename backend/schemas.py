from pydantic import BaseModel
from typing import List, Optional

class RiskScenario(BaseModel):
    id: Optional[str]
    name: str
    description: str
    mitigation_strategy: str

class RiskTableItem(BaseModel):
    id: Optional[str]
    risk_scenario_id: str
    mitigation_status: str   # "not mitigated", "partially mitigated", "fully mitigated"

class RiskTable(BaseModel):
    id: Optional[str]
    project_manager_id: str
    risks: List[RiskTableItem]
