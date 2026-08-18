from fastapi import APIRouter

app_router = APIRouter()


@app_router.get("/ping")
async def app_ping():
    return {"message": "pong from app api"}
