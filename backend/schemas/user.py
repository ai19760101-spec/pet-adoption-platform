"""
用戶數據模式
定義用戶相關的請求和回應結構
"""
from typing import Optional
from datetime import date
from pydantic import BaseModel, Field, EmailStr


class UserBase(BaseModel):
    """用戶基礎模式"""
    name: str = Field(..., min_length=1, max_length=100, description="用戶名稱")
    email: EmailStr = Field(..., description="電子郵件")
    avatar_url: Optional[str] = Field(None, description="頭像網址")


class User(UserBase):
    """用戶完整模式（包含 ID 和元數據）"""
    id: str = Field(..., description="用戶唯一識別碼")
    member_since: Optional[date] = Field(None, description="加入日期")

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    """創建用戶的請求模式"""
    pass


class UserStats(BaseModel):
    """用戶統計數據"""
    applications_count: int = Field(default=0, description="領養申請數量")
    favorites_count: int = Field(default=0, description="收藏數量")
    visits_count: int = Field(default=0, description="參訪次數")
