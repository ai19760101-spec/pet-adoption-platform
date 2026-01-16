"""
寵物刊登數據模式
定義用戶刊登寵物相關的請求和回應結構
"""
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class ListingStatus(str, Enum):
    """刊登狀態枚舉"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ADOPTED = "adopted"


class PetListingBase(BaseModel):
    """寵物刊登基礎模式"""
    name: str = Field(..., min_length=1, max_length=100, description="寵物名字")
    pet_type: str = Field(..., description="寵物類型")
    breed: str = Field(..., min_length=1, max_length=100, description="品種")
    age: str = Field(..., description="年齡描述")
    gender: str = Field(..., description="性別")
    size: Optional[str] = Field(None, description="體型")
    description: Optional[str] = Field(None, description="詳細描述")
    image_url: Optional[str] = Field(None, description="圖片網址")


class PetListing(PetListingBase):
    """寵物刊登完整模式"""
    id: str = Field(..., description="刊登唯一識別碼")
    user_id: str = Field(..., description="用戶 ID")
    status: ListingStatus = Field(default=ListingStatus.ACTIVE, description="刊登狀態")
    created_at: Optional[str] = Field(None, description="創建時間")

    class Config:
        from_attributes = True


class PetListingCreate(PetListingBase):
    """創建寵物刊登的請求模式"""
    pass
