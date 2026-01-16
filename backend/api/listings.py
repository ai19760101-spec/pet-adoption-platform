"""
寵物刊登 API 路由
處理用戶刊登寵物相關的端點
"""
from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client
from schemas.listing import PetListing, PetListingCreate

router = APIRouter(prefix="/listings", tags=["寵物刊登"])

# 模擬用戶 ID
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


@router.get("", response_model=list[PetListing])
async def get_listings() -> list[PetListing]:
    """
    獲取用戶的所有寵物刊登
    """
    try:
        client = get_client()
        response = client.table("pet_listings").select("*").eq("user_id", MOCK_USER_ID).order("created_at", desc=True).execute()
        
        listings = []
        for item in response.data:
            listings.append(PetListing(
                id=str(item["id"]),
                user_id=str(item["user_id"]),
                name=item["name"],
                pet_type=item["pet_type"],
                breed=item["breed"],
                age=item["age"],
                gender=item["gender"],
                size=item.get("size"),
                description=item.get("description"),
                image_url=item.get("image_url"),
                status=item.get("status", "active"),
                created_at=item.get("created_at"),
            ))
        
        return listings
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取刊登列表失敗: {str(e)}")


@router.post("", response_model=dict)
async def create_listing(data: PetListingCreate) -> dict:
    """
    創建新的寵物刊登
    """
    try:
        client = get_client()
        
        response = client.table("pet_listings").insert({
            "user_id": MOCK_USER_ID,
            "name": data.name,
            "pet_type": data.pet_type,
            "breed": data.breed,
            "age": data.age,
            "gender": data.gender,
            "size": data.size,
            "description": data.description,
            "image_url": data.image_url,
            "status": "active",
        }).execute()
        
        return {
            "message": "刊登成功",
            "success": True,
            "listing_id": str(response.data[0]["id"]) if response.data else None,
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"創建刊登失敗: {str(e)}")


@router.delete("/{listing_id}")
async def delete_listing(listing_id: str) -> dict:
    """
    刪除寵物刊登
    """
    try:
        client = get_client()
        client.table("pet_listings").delete().eq("id", listing_id).eq("user_id", MOCK_USER_ID).execute()
        
        return {"message": "刊登已刪除", "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"刪除刊登失敗: {str(e)}")


@router.patch("/{listing_id}/status")
async def update_listing_status(listing_id: str, status: str) -> dict:
    """
    更新刊登狀態
    """
    if status not in ["active", "inactive", "adopted"]:
        raise HTTPException(status_code=400, detail="無效的狀態值")
    
    try:
        client = get_client()
        client.table("pet_listings").update({"status": status}).eq("id", listing_id).eq("user_id", MOCK_USER_ID).execute()
        
        return {"message": "狀態已更新", "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新狀態失敗: {str(e)}")
