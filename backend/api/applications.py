"""
領養申請 API 路由
處理領養申請相關的端點
"""
from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client
from schemas.application import AdoptionApplication, AdoptionApplicationCreate

router = APIRouter(prefix="/applications", tags=["領養申請"])

# 模擬用戶 ID
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"

# 狀態標籤映射
STATUS_LABELS = {
    "pending": "審核中",
    "interview": "已安排面談",
    "completed": "已完成",
    "rejected": "未通過",
}


@router.get("", response_model=list[AdoptionApplication])
async def get_applications() -> list[AdoptionApplication]:
    """
    獲取用戶的所有領養申請
    """
    try:
        client = get_client()
        response = client.table("adoption_applications").select("*").eq("user_id", MOCK_USER_ID).order("created_at", desc=True).execute()
        
        applications = []
        for item in response.data:
            applications.append(AdoptionApplication(
                id=str(item["id"]),
                user_id=str(item["user_id"]),
                pet_id=str(item["pet_id"]),
                status=item["status"],
                status_label=STATUS_LABELS.get(item["status"], "未知"),
                housing_type=item.get("housing_type", ""),
                outdoor_space=item.get("outdoor_space", ""),
                is_renting=item.get("is_renting", False),
                has_pets=item.get("has_pets", False),
                experience=item.get("experience"),
                full_name=item["full_name"],
                phone=item["phone"],
                email=item["email"],
                interview_date=item.get("interview_date"),
                interview_time=item.get("interview_time"),
                created_at=item.get("created_at"),
            ))
        
        return applications
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取申請列表失敗: {str(e)}")


@router.post("", response_model=dict)
async def create_application(data: AdoptionApplicationCreate) -> dict:
    """
    提交新的領養申請
    """
    if not data.agreed:
        raise HTTPException(status_code=400, detail="必須同意服務條款")
    
    try:
        client = get_client()
        
        # 檢查是否已對該寵物提交過申請
        existing = client.table("adoption_applications").select("id").eq("user_id", MOCK_USER_ID).eq("pet_id", data.pet_id).execute()
        
        if existing.data:
            raise HTTPException(status_code=400, detail="您已經對這隻寵物提交過申請了")
        
        # 創建申請
        response = client.table("adoption_applications").insert({
            "user_id": MOCK_USER_ID,
            "pet_id": data.pet_id,
            "status": "pending",
            "housing_type": data.housing_type,
            "outdoor_space": data.outdoor_space,
            "is_renting": data.is_renting,
            "has_pets": data.has_pets,
            "experience": data.experience,
            "full_name": data.full_name,
            "phone": data.phone,
            "email": data.email,
        }).execute()
        
        return {
            "message": "申請已成功提交",
            "success": True,
            "application_id": str(response.data[0]["id"]) if response.data else None,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"提交申請失敗: {str(e)}")


@router.get("/{application_id}", response_model=AdoptionApplication)
async def get_application(application_id: str) -> AdoptionApplication:
    """
    獲取單一申請詳情
    """
    try:
        client = get_client()
        response = client.table("adoption_applications").select("*").eq("id", application_id).eq("user_id", MOCK_USER_ID).single().execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="找不到該申請")
        
        item = response.data
        return AdoptionApplication(
            id=str(item["id"]),
            user_id=str(item["user_id"]),
            pet_id=str(item["pet_id"]),
            status=item["status"],
            status_label=STATUS_LABELS.get(item["status"], "未知"),
            housing_type=item.get("housing_type", ""),
            outdoor_space=item.get("outdoor_space", ""),
            is_renting=item.get("is_renting", False),
            has_pets=item.get("has_pets", False),
            experience=item.get("experience"),
            full_name=item["full_name"],
            phone=item["phone"],
            email=item["email"],
            interview_date=item.get("interview_date"),
            interview_time=item.get("interview_time"),
            created_at=item.get("created_at"),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取申請詳情失敗: {str(e)}")
