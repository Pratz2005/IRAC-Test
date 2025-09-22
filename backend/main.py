from fastapi import FastAPI
from backend.routers import auth, risk_scenarios, risk_tables, dashboard
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Risk Management App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(risk_scenarios.router)
app.include_router(risk_tables.router)
app.include_router(dashboard.router)

@app.get("/")
def root():
    return {"message": "Risk Management API is running"}
