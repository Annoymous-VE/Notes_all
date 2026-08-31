from fastapi import FastAPI

from app.api.routes.files import router as files_router
from app.api.routes.auth import router as auth_router
from app.api.routes.crow import router as crow_router


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NotesAll API",
    version="1.0.0",
)

# CORS setup for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(crow_router)


@app.get("/")
def root():
    return {"message": "NotesAll API is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "api": "NotesAll FastAPI",
        "version": "1.0.0",
        "services": {
            "database": "connected",
            "storage": "supabase_configured",
            "crow_ai": "active"
        }
    }

