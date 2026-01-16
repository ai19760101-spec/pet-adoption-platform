"""
寵物 API 路由
處理寵物列表和詳情的端點
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from services.supabase_client import get_client
from schemas.pet import Pet, PetFilter

router = APIRouter(prefix="/pets", tags=["寵物"])


@router.get("", response_model=list[Pet])
async def get_pets(
    location: Optional[str] = Query(None, description="地點篩選"),
    age_group: Optional[str] = Query(None, description="年齡層篩選"),
    size: Optional[str] = Query(None, description="體型篩選"),
    gender: Optional[str] = Query(None, description="性別篩選"),
    pet_type: Optional[str] = Query(None, description="寵物類型篩選"),
    sort: Optional[str] = Query(None, description="排序方式"),
) -> list[Pet]:
    """
    獲取寵物列表
    支援多種篩選條件和排序
    """
    try:
        client = get_client()
        query = client.table("pets").select("*")
        
        # 應用篩選條件
        if location and location != "全部":
            query = query.eq("location", location)
        if age_group and age_group != "全部":
            query = query.eq("age_group", age_group)
        if size and size != "全部":
            query = query.eq("size", size)
        if gender and gender != "全部":
            query = query.eq("gender", gender)
        if pet_type and pet_type != "全部":
            query = query.eq("pet_type", pet_type)
        
        response = query.execute()
        
        pets = []
        for item in response.data:
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
        
        # 應用排序（距離由近到遠）
        if sort == "距離由近到遠":
            def extract_distance(pet: Pet) -> float:
                if not pet.distance:
                    return float("inf")
                # 嘗試從字串中提取數字
                import re
                match = re.search(r"[\d.]+", pet.distance)
                return float(match.group()) if match else float("inf")
            
            pets.sort(key=extract_distance)
        
        return pets
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取寵物列表失敗: {str(e)}")


@router.get("/{pet_id}", response_model=Pet)
async def get_pet(pet_id: str) -> Pet:
    """
    獲取單一寵物詳情
    """
    try:
        client = get_client()
        response = client.table("pets").select("*").eq("id", pet_id).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="找不到該寵物")
        
        item = response.data
        return Pet(
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
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取寵物詳情失敗: {str(e)}")
