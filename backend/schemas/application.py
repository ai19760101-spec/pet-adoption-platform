"""
領養申請數據模式
定義領養申請相關的請求和回應結構
"""
from typing import Optional
from datetime import date, time
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class ApplicationStatus(str, Enum):
    """申請狀態枚舉"""
    PENDING = "pending"
    INTERVIEW = "interview"
    COMPLETED = "completed"
    REJECTED = "rejected"


class AdoptionApplicationBase(BaseModel):
    """領養申請基礎模式"""
    pet_id: str = Field(..., description="寵物 ID")
    housing_type: str = Field(..., description="住宅類型")
    outdoor_space: str = Field(..., description="戶外空間類型")
    is_renting: bool = Field(default=False, description="是否租屋")
    has_pets: bool = Field(default=False, description="是否有其他寵物")
    experience: Optional[str] = Field(None, description="領養經驗描述")
    full_name: str = Field(..., min_length=1, max_length=100, description="申請人全名")
    phone: str = Field(..., min_length=1, max_length=50, description="聯絡電話")
    email: EmailStr = Field(..., description="電子郵件")


class AdoptionApplication(AdoptionApplicationBase):
    """領養申請完整模式"""
    id: str = Field(..., description="申請唯一識別碼")
    user_id: str = Field(..., description="用戶 ID")
    status: ApplicationStatus = Field(default=ApplicationStatus.PENDING, description="申請狀態")
    status_label: str = Field(default="審核中", description="狀態顯示文字")
    interview_date: Optional[date] = Field(None, description="面談日期")
    interview_time: Optional[str] = Field(None, description="面談時間")
    created_at: Optional[str] = Field(None, description="創建時間")

    class Config:
        from_attributes = True


class AdoptionApplicationCreate(AdoptionApplicationBase):
    """創建領養申請的請求模式"""
    agreed: bool = Field(..., description="是否同意條款")
