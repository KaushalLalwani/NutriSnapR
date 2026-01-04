from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import auth, analyze, history
from app.routes import goals
from app.routes import summary


app = FastAPI(
    title="NutriSnap AI Backend",
    version="4.0"
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routes ----
app.include_router(auth.router)
app.include_router(analyze.router)
app.include_router(history.router)
app.include_router(goals.router)
app.include_router(summary.router)
from app.routes import community
app.include_router(community.router)
from app.routes import profile
app.include_router(profile.router)


