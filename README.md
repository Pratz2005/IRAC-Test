# IRAC-Test

# Risk Management Web App — Backend

Backend API for a proof-of-concept risk management app supporting two roles:
- **Project Manager (PM):** view the global risk scenario library, build a project risk table, update mitigation status.
- **Risk Consultant (RC):** view all PM risk tables and see dashboard statistics.

## Features
- Supabase authentication (store role as user metadata: `PM` / `RC`)
- Risk scenario library (view, add)
- Risk tables per PM (add scenario, set mitigation status: `not mitigated` / `partially mitigated` / `fully mitigated`)
- Dashboard stats (e.g., distribution of scenarios across projects)
- Interactive OpenAPI docs at `/docs`

## Tech
- FastAPI, Uvicorn, Supabase (Auth + Postgres), python-dotenv, Pydantic
- Python virtualenv with `requirements.txt`

## Environment & Install
Create and activate a virtual environment, then install:
```bash
python -m venv .venv
# Windows (PowerShell): .\.venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

## Code to set up supabase DB tables

-- Global risk scenario library

create table if not exists risk_scenarios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  mitigation_strategy text not null
);

-- PM-owned risk table entries (one row per selected scenario)

create table if not exists risk_tables (
  id uuid primary key default gen_random_uuid(),
  project_manager_id uuid not null,  -- from auth.users.id
  risk_scenario_id uuid references risk_scenarios(id) on delete cascade,
  mitigation_status text
    check (mitigation_status in ('not mitigated','partially mitigated','fully mitigated'))
    not null default 'not mitigated'
);

-- Enable Row Level Security (RLS)

alter table risk_scenarios enable row level security;
alter table risk_tables enable row level security;

-- Simple policies for POC (relax or refine as needed)

create policy "risk_scenarios readable by all" on risk_scenarios
for select using (true);

create policy "risk_scenarios insert (admin/dev only if desired)" on risk_scenarios
for insert with check (true);

create policy "risk_tables selectable by all (RC dashboard)" on risk_tables
for select using (true);

create policy "risk_tables insert by anyone (POC)" on risk_tables
for insert with check (true);
