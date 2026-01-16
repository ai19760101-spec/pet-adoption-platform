"""
用戶 API 路由
處理用戶相關的端點
"""
from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client
from schemas.user import User, UserStats

router = APIRouter(prefix="/users", tags=["用戶"])

# NOTE: 目前使用模擬用戶 ID 進行開發測試
# 後續可整合 Supabase Auth 實現完整認證
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.get("/me", response_model=User)
async def get_current_user() -> User:
    """
    獲取當前用戶資料
    目前使用模擬用戶進行開發
    """
    try:
        client = get_client()
        response = client.table("users").select("*").eq("id", MOCK_USER_ID).single().execute()
        
        if not response.data:
            # 如果用戶不存在，返回預設用戶資料
            return User(
                id=MOCK_USER_ID,
                name="Alex",
                email="alex@example.com",
                avatar_url="https://picsum.photos/seed/alex/300/300",
                member_since=None,
            )
        
        item = response.data
        return User(
            id=str(item["id"]),
            name=item["name"],
            email=item["email"],
            avatar_url=item.get("avatar_url"),
            member_since=item.get("member_since"),
        )
        
    except Exception as e:
        # 如果查詢失敗，返回預設用戶
        return User(
            id=MOCK_USER_ID,
            name="Alex",
            email="alex@example.com",
            avatar_url="https://picsum.photos/seed/alex/300/300",
            member_since=None,
        )


@router.get("/me/stats", response_model=UserStats)
async def get_user_stats() -> UserStats:
    """
    獲取當前用戶的統計數據
    """
    try:
        client = get_client()
        
        # 獲取申請數量
        apps_response = client.table("adoption_applications").select("id", count="exact").eq("user_id", MOCK_USER_ID).execute()
        applications_count = apps_response.count or 0
        
        # 獲取收藏數量
        favs_response = client.table("favorites").select("id", count="exact").eq("user_id", MOCK_USER_ID).execute()
        favorites_count = favs_response.count or 0
        
        return UserStats(
            applications_count=applications_count,
            favorites_count=favorites_count,
            visits_count=4,  # 模擬數據
        )
        
    except Exception as e:
        # 如果查詢失敗，返回預設統計
        return UserStats(
            applications_count=0,
            favorites_count=0,
            visits_count=0,
        )
