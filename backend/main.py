from fastapi import FastAPI
from backend.routers import auth, risk_scenarios, risk_tables, dashboard

app = FastAPI(title="Risk Management App")

# Register routers
app.include_router(auth.router)
app.include_router(risk_scenarios.router)
app.include_router(risk_tables.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Risk Management API is running"}
