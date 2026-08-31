from fastapi import FastAPI

from app.api.routes.files import router as files_router
from app.api.routes.auth import router as auth_router
from app.api.routes.crow import router as crow_router


app = FastAPI(
    title="NotesAll API",
    version="1.0.0",
)

# Register routers
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(crow_router)


@app.get("/")
def root():
    return {"message": "NotesAll API is running"}
