"""
幸福故事 API 路由
處理幸福故事相關的端點
"""
from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client
from schemas.story import Story

router = APIRouter(prefix="/stories", tags=["幸福故事"])


@router.get("", response_model=list[Story])
async def get_stories() -> list[Story]:
    """
    獲取所有幸福故事
    """
    try:
        client = get_client()
        response = client.table("stories").select("*").order("created_at", desc=True).execute()
        
        stories = []
        for item in response.data:
            stories.append(Story(
                id=str(item["id"]),
                author=item["author"],
                pet_name=item["pet_name"],
                content=item["content"],
                image_url=item.get("image_url"),
                color=item.get("color"),
            ))
        
        return stories
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取故事列表失敗: {str(e)}")
