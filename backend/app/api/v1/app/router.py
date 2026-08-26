from fastapi import APIRouter

from app.api.v1.app.achievements.router import router as achievements_router
from app.api.v1.app.auth.router import router as auth_router
from app.api.v1.app.cultural_items.router import router as cultural_items_router
from app.api.v1.app.explore_nodes.router import router as explore_nodes_router
from app.api.v1.app.home.router import router as home_router
from app.api.v1.app.scan_records.router import router as scan_router
from app.api.v1.app.users.router import router as users_router
from app.api.v1.app.wardrobe.router import router as wardrobe_router

app_router = APIRouter()

app_router.include_router(auth_router)
app_router.include_router(home_router)
app_router.include_router(cultural_items_router)
app_router.include_router(explore_nodes_router)
app_router.include_router(scan_router)
app_router.include_router(wardrobe_router)
app_router.include_router(achievements_router)
app_router.include_router(users_router)


@app_router.get("/ping")
async def app_ping():
    return {"message": "pong from app api"}
