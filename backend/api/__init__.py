"""
API 路由模組
包含所有 API 端點的定義
"""
from .pets import router as pets_router
from .users import router as users_router
from .favorites import router as favorites_router
from .applications import router as applications_router
from .messages import router as messages_router
from .stories import router as stories_router
from .listings import router as listings_router

__all__ = [
    "pets_router",
    "users_router",
    "favorites_router",
    "applications_router",
    "messages_router",
    "stories_router",
    "listings_router",
]
