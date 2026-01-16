"""
訊息 API 路由
處理訊息對話相關的端點
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException
from services.supabase_client import get_client
from schemas.message import Message, MessageCreate, MessageThread

router = APIRouter(prefix="/messages", tags=["訊息"])

# 模擬用戶 ID
MOCK_USER_ID = "00000000-0000-0000-0000-000000000001"


def format_time(dt_str: str | None) -> str:
    """格式化時間顯示"""
    if not dt_str:
        return "未知"
    try:
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
        now = datetime.now(dt.tzinfo)
        diff = now - dt
        
        if diff.days == 0:
            if diff.seconds < 60:
                return "剛剛"
            elif diff.seconds < 3600:
                return f"{diff.seconds // 60} 分鐘前"
            else:
                return f"{diff.seconds // 3600} 小時前"
        elif diff.days == 1:
            return "昨天"
        else:
            return f"{diff.days} 天前"
    except Exception:
        return "未知"


@router.get("/threads", response_model=list[MessageThread])
async def get_message_threads() -> list[MessageThread]:
    """
    獲取用戶的所有訊息對話
    """
    try:
        client = get_client()
        response = client.table("message_threads").select("*").eq("user_id", MOCK_USER_ID).order("created_at", desc=True).execute()
        
        threads = []
        for item in response.data:
            # 獲取最後一則訊息
            last_msg_response = client.table("messages").select("*").eq("thread_id", item["id"]).order("created_at", desc=True).limit(1).execute()
            
            last_message = "尚無訊息"
            last_time = format_time(item.get("created_at"))
            
            if last_msg_response.data:
                msg = last_msg_response.data[0]
                if msg.get("text"):
                    last_message = msg["text"]
                elif msg.get("image_url"):
                    last_message = "傳送了一張相片"
                last_time = format_time(msg.get("created_at"))
            
            # 計算未讀數量
            unread_response = client.table("messages").select("id", count="exact").eq("thread_id", item["id"]).eq("sender", "other").eq("is_read", False).execute()
            unread_count = unread_response.count or 0
            
            threads.append(MessageThread(
                id=str(item["id"]),
                name=item["shelter_name"],
                avatar=item.get("shelter_avatar", "https://picsum.photos/seed/shelter/100/100"),
                pet_name=item.get("pet_name", ""),
                last_message=last_message,
                time=last_time,
                unread_count=unread_count,
            ))
        
        return threads
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取對話列表失敗: {str(e)}")


@router.get("/threads/{thread_id}", response_model=list[Message])
async def get_thread_messages(thread_id: str) -> list[Message]:
    """
    獲取對話中的所有訊息
    """
    try:
        client = get_client()
        
        # 驗證對話歸屬
        thread_response = client.table("message_threads").select("id").eq("id", thread_id).eq("user_id", MOCK_USER_ID).execute()
        
        if not thread_response.data:
            raise HTTPException(status_code=404, detail="找不到該對話")
        
        # 獲取訊息
        response = client.table("messages").select("*").eq("thread_id", thread_id).order("created_at", asc=True).execute()
        
        messages = []
        for item in response.data:
            messages.append(Message(
                id=str(item["id"]),
                thread_id=str(item["thread_id"]),
                sender=item["sender"],
                text=item.get("text"),
                image_url=item.get("image_url"),
                timestamp=format_time(item.get("created_at")),
            ))
        
        # 標記為已讀
        client.table("messages").update({"is_read": True}).eq("thread_id", thread_id).eq("sender", "other").execute()
        
        return messages
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"獲取訊息失敗: {str(e)}")


@router.post("/threads/{thread_id}", response_model=Message)
async def send_message(thread_id: str, data: MessageCreate) -> Message:
    """
    發送訊息
    """
    if not data.text and not data.image_url:
        raise HTTPException(status_code=400, detail="訊息內容不能為空")
    
    try:
        client = get_client()
        
        # 驗證對話歸屬
        thread_response = client.table("message_threads").select("id").eq("id", thread_id).eq("user_id", MOCK_USER_ID).execute()
        
        if not thread_response.data:
            raise HTTPException(status_code=404, detail="找不到該對話")
        
        # 發送訊息
        response = client.table("messages").insert({
            "thread_id": thread_id,
            "sender": "user",
            "text": data.text,
            "image_url": data.image_url,
            "is_read": True,
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="發送訊息失敗")
        
        item = response.data[0]
        return Message(
            id=str(item["id"]),
            thread_id=str(item["thread_id"]),
            sender=item["sender"],
            text=item.get("text"),
            image_url=item.get("image_url"),
            timestamp="剛剛",
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"發送訊息失敗: {str(e)}")
