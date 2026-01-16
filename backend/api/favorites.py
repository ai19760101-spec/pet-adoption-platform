"""
收藏 API 路由
處理用戶收藏寵物的端點
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.supabase_client import get_client
from schemas.pet import Pet

router = APIRouter(prefix="/favorites", tags=["收藏"])

# 模擬用戶 ID
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


class FavoriteCreate(BaseModel):
    """新增收藏的請求模式"""
    pet_id: str


class FavoriteIds(BaseModel):
    """收藏 ID 列表"""
    pet_ids: list[str]


@router.get("", response_model=list[Pet])
async def get_favorites() -> list[Pet]:
    """
    獲取用戶收藏的寵物列表
    """
    try:
        client = get_client()
        
        # 獲取用戶的收藏記錄
        favorites_response = client.table("favorites").select("pet_id").eq("user_id", MOCK_USER_ID).execute()
        
        if not favorites_response.data:
            return []
        
        pet_ids = [f["pet_id"] for f in favorites_response.data]
        
        # 獲取寵物詳情
        pets_response = client.table("pets").select("*").in_("id", pet_ids).execute()
        
        pets = []
        for item in pets_response.data:
            pets.append(Pet(
                id=str(item["id"]),
                name=item["name"],
                breed=item["breed"],
                age=item["age"],
                age_group=item["age_group"],
                gender=item["gender"],
                size=item["size"],
                pet_type=item["pet_type"],
                location=item["location"],
                distance=item.get("distance"),
                image_url=item["image_url"],
                description=item.get("description"),
                adoption_fee=float(item.get("adoption_fee", 0)),
                is_vaccinated=item.get("is_vaccinated", False),
                is_neutered=item.get("is_neutered", False),
                is_featured=item.get("is_featured", False),
                tags=item.get("tags", []),
            ))
        
        return pets
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取收藏列表失敗: {str(e)}")


@router.get("/ids", response_model=FavoriteIds)
async def get_favorite_ids() -> FavoriteIds:
    """
    獲取用戶收藏的寵物 ID 列表
    用於前端快速檢查收藏狀態
    """
    try:
        client = get_client()
        response = client.table("favorites").select("pet_id").eq("user_id", MOCK_USER_ID).execute()
        
        pet_ids = [f["pet_id"] for f in response.data] if response.data else []
        return FavoriteIds(pet_ids=pet_ids)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取收藏 ID 失敗: {str(e)}")


@router.post("")
async def add_favorite(data: FavoriteCreate) -> dict:
    """
    新增收藏
    """
    try:
        client = get_client()
        
        # 檢查是否已收藏
        existing = client.table("favorites").select("id").eq("user_id", MOCK_USER_ID).eq("pet_id", data.pet_id).execute()
        
        if existing.data:
            return {"message": "已經收藏過了", "success": True}
        
        # 新增收藏 (必須調用 execute)
        client.table("favorites").insert({
            "user_id": MOCK_USER_ID,
            "pet_id": data.pet_id,
        }).execute()
        
        return {"message": "收藏成功", "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"新增收藏失敗: {str(e)}")


@router.delete("/{pet_id}")
async def remove_favorite(pet_id: str) -> dict:
    """
    移除收藏
    """
    try:
        client = get_client()
        client.table("favorites").delete().eq("user_id", MOCK_USER_ID).eq("pet_id", pet_id).execute()
        
        return {"message": "已取消收藏", "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"移除收藏失敗: {str(e)}")
