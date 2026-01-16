
import asyncio
from services.supabase_client import get_client
from config import settings

# 確保使用真實客戶端
settings.DEBUG = False

async def seed_pets():
    client = get_client()
    print("🚀 開始填充寵物數據...")

    # 1. 插入寵物
    pets_data = [
        {
            "name": "Bella",
            "breed": "黃金獵犬",
            "age": "2 歲",
            "age_group": "成年",
            "gender": "母",
            "size": "大型",
            "pet_type": "狗狗",
            "location": "台北市",
            "distance": "2.5 公里外",
            "image_url": "https://placehold.co/800x600/orange/white?text=Bella",
            "description": "Bella 是一隻熱愛陽光的狗狗，喜歡在海灘散步和追網球。",
            "adoption_fee": 150,
            "is_vaccinated": True,
            "is_neutered": True,
            "is_featured": True,
            "tags": ["愛玩", "對小孩友善", "已訓練", "活潑"],
        },
        {
            "name": "Milo",
            "breed": "美國短毛貓",
            "age": "8 個月",
            "age_group": "幼年",
            "gender": "公",
            "size": "小型",
            "pet_type": "貓咪",
            "location": "新北市",
            "distance": "5.1 公里外",
            "image_url": "https://placehold.co/800x600/gray/white?text=Milo",
            "description": "Milo 是一隻愛撒嬌的小貓，特別喜歡玩雷射筆。",
            "adoption_fee": 100,
            "is_vaccinated": True,
            "is_neutered": False,
            "is_featured": False,
            "tags": ["愛撒嬌", "安靜"],
        },
        {
            "name": "Rocky",
            "breed": "巴哥",
            "age": "4 歲",
            "age_group": "成年",
            "gender": "公",
            "size": "小型",
            "pet_type": "狗狗",
            "location": "台中市",
            "distance": "1.2 公里外",
            "image_url": "https://placehold.co/800x600/brown/white?text=Rocky",
            "description": "Rocky 是一隻穩重的巴哥混種，非常有規矩，適合新手領養。",
            "adoption_fee": 120,
            "is_vaccinated": True,
            "is_neutered": True,
            "is_featured": False,
            "tags": ["穩重", "已訓練"],
        },
        {
            "name": "Luna",
            "breed": "暹羅貓",
            "age": "1 歲",
            "age_group": "成年",
            "gender": "母",
            "size": "中型",
            "pet_type": "貓咪",
            "location": "台北市",
            "distance": "3 公里外",
            "image_url": "https://placehold.co/800x600/ivory/black?text=Luna",
            "description": "Luna 聲音甜美，喜歡與人對話，是非常好的陪伴伴侶。",
            "adoption_fee": 120,
            "is_vaccinated": True,
            "is_neutered": True,
            "is_featured": False,
            "tags": ["愛說話", "黏人", "優雅"],
        },
        {
            "name": "Charlie",
            "breed": "柯基",
            "age": "4 歲",
            "age_group": "成年",
            "gender": "公",
            "size": "中型",
            "pet_type": "狗狗",
            "location": "台中市",
            "distance": "150 公里外",
            "image_url": "https://placehold.co/800x600/goldenrod/white?text=Charlie",
            "description": "Charlie 雖然腿短但跑得很快，是你慢跑的最佳夥伴。",
            "adoption_fee": 180,
            "is_vaccinated": True,
            "is_neutered": True,
            "is_featured": True,
            "tags": ["可愛", "活力", "吃貨"],
        },
    ]

    try:
        response = client.table("pets").insert(pets_data).execute()
        # 檢查 response.data (Supabase Python SDK 通常返回 data 屬性)
        if hasattr(response, 'data') and response.data:
            print(f"✅ 成功插入 {len(response.data)} 筆寵物資料！")
        else:
             # 如果沒有 data 屬性，可能舊版 SDK 或不同封裝，嘗試直接打印
            print("✅ 插入請求已執行 (請檢查資料庫確認結果)")
            print(response)

    except Exception as e:
        print(f"❌ 寵物插入失敗: {str(e)}")
        print("請確認您的 Supabase 'pets' 資料表是否已建立。")

    # 1.5. 插入測試使用者 (解決 Foreign Key 錯誤)
    test_user_id = "00000000-0000-0000-0000-000000000001"
    import uuid
    user_data = {
        "id": test_user_id,
        "name": "測試使用者",
        "email": "test@example.com",
    }
    
    try:
        # 嘗試插入使用者
        print(f"👤 嘗試建立測試使用者 ({test_user_id})...")
        res = client.table("users").insert(user_data).execute()
        if hasattr(res, 'data') and len(res.data) > 0:
            print("✅ 成功插入測試使用者！")
    except Exception as e:
        print(f"⚠️ 使用者插入異常 (可能已存在或 schema 不符): {e}")
        # 繼續執行，因為如果已存在也是 ok 的

    # 2. 插入訊息對話 (配合前端 App.tsx 的硬編碼 ID)
    threads_data = [
        {
            "id": "00000000-0000-0000-0000-000000000011",
            "user_id": test_user_id,
            "shelter_name": "快樂爪收容所",
            "shelter_avatar": "https://picsum.photos/seed/shelter/100/100",
            "pet_name": "Bella",
        },
        {
            "id": "00000000-0000-0000-0000-000000000012",
            "user_id": test_user_id,
            "shelter_name": "快樂爪收容所",
            "shelter_avatar": "https://picsum.photos/seed/shelter/100/100",
            "pet_name": "Milo",
        },
    ]

    try:
        # 先檢查對話是否已存在（避免重複插入錯誤）
        existing = client.table("message_threads").select("id").execute()
        existing_ids = [item['id'] for item in existing.data] if existing.data else []
        
        new_threads = [t for t in threads_data if t['id'] not in existing_ids]
        
        if new_threads:
            res = client.table("message_threads").insert(new_threads).execute()
            print(f"📄 API 回應: {res}")
            if hasattr(res, 'data') and len(res.data) > 0:
                print(f"✅ 成功插入 {len(new_threads)} 筆對話資料！")
            else:
                print("❌ 插入似已執行但無資料返回，可能失敗。")
        else:
            print("ℹ️ 對話資料已存在，跳過插入。")

    except Exception as e:
        print(f"❌ 對話插入失敗: {str(e)}")
        # 嘗試印出更多錯誤細節
        if hasattr(e, 'message'):
           print(f"詳細錯誤: {e.message}")
        if hasattr(e, 'details'):
           print(f"錯誤詳情: {e.details}")
        if hasattr(e, 'hint'):
           print(f"提示: {e.hint}")
        print("💡 可能原因：")
        print("1. 'user_id' 使用了不存在的 UUID，而該欄位關聯到了 auth.users 表。")
        print("2. 違反了其他 Foreign Key 約束。")

    # 3. 插入初始訊息
    messages_data = [
        {
            "id": str(uuid.uuid4()),
            "thread_id": "00000000-0000-0000-0000-000000000011",
            "sender": "other",
            "text": "您好，關於您領養 Bella 的申請，我們想與您確認下週二上午 10:00 是否方便前來面談呢？",
            "created_at": "2023-01-01T10:00:00Z", # 修正: timestamp -> created_at
            "is_read": True,
        }
    ]

    try:
        # 檢查訊息
        client.table("messages").insert(messages_data).execute()
        print(f"✅ 成功插入初始訊息！")
        
        # 4. 驗證讀取 (RLS 檢查)
        print("🔍 驗證資料讀取權限...")
        
        # 驗證對話
        verify_threads = client.table("message_threads").select("*").eq("id", "00000000-0000-0000-0000-000000000011").execute()
        if verify_threads.data and len(verify_threads.data) > 0:
            print("✅ 驗證成功：可以讀取對話資料 (message_threads)。")
        else:
            print("⚠️ 驗證失敗：無法讀取對話資料 (message_threads)！")

        # 驗證收藏 (新增檢查)
        print("🔍 驗證收藏資料讀取權限...")
        
        # 獲取一個真實的寵物 ID
        pet_res = client.table("pets").select("id").limit(1).execute()
        if not pet_res.data:
            print("❌ 無法獲取寵物 ID，跳過收藏驗證")
        else:
            real_pet_id = pet_res.data[0]['id']
            # 嘗試插入一個收藏
            fav_data = {
               "user_id": test_user_id,
               "pet_id": real_pet_id 
            }
        try:
            # 先檢查是否已收藏
            check = client.table("favorites").select("*").eq("user_id", test_user_id).eq("pet_id", "1").execute()
            if not check.data:
                client.table("favorites").insert(fav_data).execute()
                print("✅ 成功插入測試收藏紀錄！")
            
            # 再讀取
            verify_fav = client.table("favorites").select("*").eq("user_id", test_user_id).execute()
            if verify_fav.data and len(verify_fav.data) > 0:
                 print("✅ 驗證成功：可以讀取收藏資料 (favorites)。")
            else:
                 print("⚠️ 驗證失敗：無法讀取收藏資料 (favorites)！")
                 print("   請確認 'favorites' 表格的 RLS 是否已關閉。")
        except Exception as e:
            print(f"❌ 收藏驗證出錯: {e}")
            print("   請確認 'favorites' 表格是否存在且 RLS 已關閉。")
            
    except Exception as e:
        # 忽略重複插入錯誤（如果 ID 衝突）
        pass

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_pets())
