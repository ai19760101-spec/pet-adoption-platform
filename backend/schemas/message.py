"""
訊息數據模式
定義訊息相關的請求和回應結構
"""
from typing import Optional
from pydantic import BaseModel, Field
from enum import Enum


class MessageSender(str, Enum):
    """訊息發送者類型"""
    USER = "user"
    OTHER = "other"


class MessageBase(BaseModel):
    """訊息基礎模式"""
    text: Optional[str] = Field(None, description="訊息文字內容")
    image_url: Optional[str] = Field(None, description="圖片網址")


class Message(MessageBase):
    """訊息完整模式"""
    id: str = Field(..., description="訊息唯一識別碼")
    thread_id: str = Field(..., description="對話串 ID")
    sender: MessageSender = Field(..., description="發送者類型")
    timestamp: str = Field(..., description="時間戳")

    class Config:
        from_attributes = True


class MessageCreate(MessageBase):
    """創建訊息的請求模式"""
    pass


class MessageThread(BaseModel):
    """訊息對話串模式"""
    id: str = Field(..., description="對話串唯一識別碼")
    name: str = Field(..., description="對話對象名稱")
    avatar: str = Field(..., description="對話對象頭像")
    pet_name: str = Field(..., description="相關寵物名稱")
    last_message: str = Field(..., description="最後一則訊息")
    time: str = Field(..., description="最後訊息時間")
    unread_count: int = Field(default=0, description="未讀訊息數量")

    class Config:
        from_attributes = True
