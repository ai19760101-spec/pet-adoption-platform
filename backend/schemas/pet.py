"""
寵物數據模式
定義寵物相關的請求和回應結構
"""
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class PetType(str, Enum):
    """寵物類型枚舉"""
    DOG = "狗狗"
    CAT = "貓咪"
    BIRD = "鳥類"
    RABBIT = "兔子"
    OTHER = "其他"


class Gender(str, Enum):
    """性別枚舉"""
    MALE = "公"
    FEMALE = "母"


class PetSize(str, Enum):
    """體型枚舉"""
    SMALL = "小型"
    MEDIUM = "中型"
    LARGE = "大型"


class AgeGroup(str, Enum):
    """年齡層枚舉"""
    YOUNG = "幼年"
    ADULT = "成年"
    SENIOR = "老年"


class PetBase(BaseModel):
    """寵物基礎模式"""
    name: str = Field(..., min_length=1, max_length=100, description="寵物名字")
    breed: str = Field(..., min_length=1, max_length=100, description="品種")
    age: str = Field(..., description="年齡描述，例如：2 歲")
    age_group: AgeGroup = Field(..., description="年齡層")
    gender: Gender = Field(..., description="性別")
    size: PetSize = Field(..., description="體型")
    pet_type: PetType = Field(..., description="寵物類型")
    location: str = Field(..., description="所在地點")
    distance: Optional[str] = Field(None, description="距離描述")
    image_url: str = Field(..., description="圖片網址")
    description: Optional[str] = Field(None, description="詳細描述")
    adoption_fee: float = Field(default=0, ge=0, description="領養費用")
    is_vaccinated: bool = Field(default=False, description="是否已接種疫苗")
    is_neutered: bool = Field(default=False, description="是否已絕育")
    is_featured: bool = Field(default=False, description="是否為精選")
    tags: list[str] = Field(default_factory=list, description="標籤列表")


class Pet(PetBase):
    """寵物完整模式（包含 ID）"""
    id: str = Field(..., description="寵物唯一識別碼")

    class Config:
        from_attributes = True


class PetCreate(PetBase):
    """創建寵物的請求模式"""
    pass


class PetFilter(BaseModel):
    """寵物篩選參數"""
    location: Optional[str] = Field(None, description="地點篩選")
    age_group: Optional[str] = Field(None, description="年齡層篩選")
    size: Optional[str] = Field(None, description="體型篩選")
    gender: Optional[str] = Field(None, description="性別篩選")
    pet_type: Optional[str] = Field(None, description="寵物類型篩選")
    sort: Optional[str] = Field(None, description="排序方式")
