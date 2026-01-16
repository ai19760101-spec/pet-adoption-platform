"""
幸福故事數據模式
定義幸福故事相關的請求和回應結構
"""
from typing import Optional
from pydantic import BaseModel, Field


class StoryBase(BaseModel):
    """故事基礎模式"""
    author: str = Field(..., min_length=1, max_length=100, description="作者名稱")
    pet_name: str = Field(..., min_length=1, max_length=100, description="寵物名稱")
    content: str = Field(..., description="故事內容")
    image_url: Optional[str] = Field(None, description="圖片網址")
    color: Optional[str] = Field(None, description="背景顏色樣式")


class Story(StoryBase):
    """故事完整模式"""
    id: str = Field(..., description="故事唯一識別碼")

    class Config:
        from_attributes = True


class StoryCreate(StoryBase):
    """創建故事的請求模式"""
    pass
