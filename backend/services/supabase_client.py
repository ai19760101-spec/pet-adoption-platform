"""
Supabase 客戶端服務
使用 HTTP API 直接與 Supabase 通訊（避免依賴構建問題）
"""
import httpx
from typing import Optional, Any
from config import settings


class SupabaseClient:
    """
    Supabase REST API 客戶端
    提供簡單的資料庫操作介面
    """
    
    def __init__(self, url: str, key: str):
        self.base_url = f"{url}/rest/v1"
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self._client = httpx.Client(timeout=30.0)
    
    def table(self, name: str) -> "TableQuery":
        """
        選取資料表
        """
        return TableQuery(self, name)
    
    def _request(self, method: str, endpoint: str, **kwargs) -> httpx.Response:
        """
        發送 HTTP 請求
        """
        url = f"{self.base_url}/{endpoint}"
        return self._client.request(method, url, headers=self.headers, **kwargs)


class TableQuery:
    """
    資料表查詢建構器
    """
    
    def __init__(self, client: SupabaseClient, table_name: str):
        self.client = client
        self.table_name = table_name
        self._filters: list[str] = []
        self._select_columns = "*"
        self._order_column: Optional[str] = None
        self._order_desc = False
        self._limit_count: Optional[int] = None
        self._is_single = False
        self._count_type: Optional[str] = None
        
        # 延遲執行標記
        self._is_insert = False
        self._insert_data = None
        self._is_update = False
        self._update_data = None
        self._is_delete = False
    
    def select(self, columns: str = "*", count: Optional[str] = None) -> "TableQuery":
        """選取欄位"""
        self._select_columns = columns
        self._count_type = count
        return self
    
    def eq(self, column: str, value: Any) -> "TableQuery":
        """等於條件"""
        self._filters.append(f"{column}=eq.{value}")
        return self
    
    def in_(self, column: str, values: list) -> "TableQuery":
        """包含在列表中"""
        values_str = ",".join(str(v) for v in values)
        self._filters.append(f"{column}=in.({values_str})")
        return self
    
    def order(self, column: str, desc: bool = False, asc: bool = False) -> "TableQuery":
        """排序"""
        self._order_column = column
        self._order_desc = desc
        return self
    
    def limit(self, count: int) -> "TableQuery":
        """限制數量"""
        self._limit_count = count
        return self
    
    def single(self) -> "TableQuery":
        """預期只有一筆結果"""
        self._is_single = True
        return self
    
    def insert(self, data: dict | list) -> "TableQuery":
        """插入資料"""
        self._insert_data = data
        self._is_insert = True
        return self
        
    def update(self, data: dict) -> "TableQuery":
        """更新資料"""
        self._update_data = data
        self._is_update = True
        return self
        
    def delete(self) -> "TableQuery":
        """刪除資料"""
        self._is_delete = True
        return self

    def execute(self) -> "QueryResult":
        """執行查詢"""
        if self._is_insert:
            return self._do_insert()
        if self._is_update:
            return self._do_update()
        if self._is_delete:
            return self._do_delete()
            
        return self._do_select()

    def _do_select(self) -> "QueryResult":
        params = {}
        endpoint = self.table_name
        
        if self._select_columns:
            params["select"] = self._select_columns
        
        for f in self._filters:
            key, value = f.split("=", 1)
            params[key] = value
        
        if self._order_column:
            order_dir = "desc" if self._order_desc else "asc"
            params["order"] = f"{self._order_column}.{order_dir}"
        
        if self._limit_count:
            params["limit"] = str(self._limit_count)
        
        headers = dict(self.client.headers)
        if self._count_type:
            headers["Prefer"] = f"count={self._count_type}"
        
        try:
            response = self.client._client.get(
                f"{self.client.base_url}/{endpoint}",
                headers=headers,
                params=params
            )
            
            data = response.json() if response.status_code == 200 else []
            count = None
            
            if self._count_type and "content-range" in response.headers:
                range_header = response.headers.get("content-range", "")
                if "/" in range_header:
                    count = int(range_header.split("/")[-1])
            
            if self._is_single:
                data = data[0] if data else None
            
            return QueryResult(data=data, count=count)
        except Exception:
            return QueryResult(data=[], count=0)

    def _do_insert(self) -> "QueryResult":
        if isinstance(self._insert_data, dict):
            data = [self._insert_data]
        else:
            data = self._insert_data
            
        try:
            response = self.client._client.post(
                f"{self.client.base_url}/{self.table_name}",
                headers=self.client.headers,
                json=data
            )
            
            if response.status_code not in [200, 201]:
                print(f"❌ Supabase API Error ({response.status_code}): {response.text}")

            result_data = response.json() if response.status_code in [200, 201] else []
            return QueryResult(data=result_data, count=len(result_data) if result_data else 0)
        except Exception as e:
            print(f"❌ Supabase Client Exception: {e}")
            return QueryResult(data=[], count=0)

    def _do_update(self) -> "QueryResult":
        params = {}
        for f in self._filters:
            key, value = f.split("=", 1)
            params[key] = value
        
        try:
            response = self.client._client.patch(
                f"{self.client.base_url}/{self.table_name}",
                headers=self.client.headers,
                params=params,
                json=self._update_data
            )
            
            result_data = response.json() if response.status_code == 200 else []
            return QueryResult(data=result_data, count=len(result_data) if result_data else 0)
        except Exception:
            return QueryResult(data=[], count=0)

    def _do_delete(self) -> "QueryResult":
        params = {}
        for f in self._filters:
            key, value = f.split("=", 1)
            params[key] = value
        
        try:
            response = self.client._client.delete(
                f"{self.client.base_url}/{self.table_name}",
                headers=self.client.headers,
                params=params
            )
            return QueryResult(data=[], count=0)
        except Exception:
            return QueryResult(data=[], count=0)


class QueryResult:
    """
    查詢結果包裝
    """
    
    def __init__(self, data: Any, count: Optional[int] = None):
        self.data = data
        self.count = count


# 全域客戶端實例
_client = None
_mock_client = None


def get_client():
    """
    獲取 Supabase 客戶端單例
    在 DEBUG 模式下，優先返回模擬客戶端
    """
    global _client, _mock_client
    
    # DEBUG 模式優先使用模擬客戶端
    if settings.DEBUG:
        if _mock_client is None:
            print("🔧 使用模擬客戶端（DEBUG 模式）")
            _mock_client = MockSupabaseClient()
            # 確保重新加載時數據重置或保持一致
        return _mock_client
    
    # 驗證配置
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase 配置未設置：請設定 SUPABASE_URL 和 SUPABASE_KEY 環境變數")
    
    if _client is None:
        _client = SupabaseClient(
            url=settings.SUPABASE_URL,
            key=settings.SUPABASE_KEY,
        )
    
    return _client


class MockSupabaseClient:
    """
    開發模式模擬客戶端
    當沒有配置 Supabase 時使用模擬數據
    """
    
    def __init__(self):
        # 模擬數據存儲
        self._data = {
            "pets": [
                {
                    "id": "1",
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
                    "id": "2",
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
                    "id": "3",
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
                    "id": "4",
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
                    "id": "5",
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
            ],
            "stories": [
                {
                    "id": "s1",
                    "author": "Sarah",
                    "pet_name": "Luna",
                    "content": "Luna 為我們的生活帶來了無限歡樂！謝謝你們協助我們找到她。",
                    "image_url": "https://picsum.photos/seed/sarah/200/200",
                    "color": "bg-primary/5",
                },
                {
                    "id": "s2",
                    "author": "Mike",
                    "pet_name": "Oliver",
                    "content": "遇見 Oliver 之前我不認為自己是貓派，但他是我最好的夥伴。",
                    "image_url": "https://picsum.photos/seed/mike/200/200",
                    "color": "bg-accent-peach/10",
                },
            ],
            "favorites": [],
            "adoption_applications": [],
            "pet_listings": [],
            "message_threads": [
                {
                    "id": "00000000-0000-0000-0000-000000000011",
                    "user_id": "00000000-0000-0000-0000-000000000001",
                    "shelter_name": "快樂爪收容所",
                    "shelter_avatar": "https://picsum.photos/seed/shelter/100/100",
                    "pet_name": "Bella",
                },
            ],
            "messages": [
                {
                    "id": "m1",
                    "thread_id": "00000000-0000-0000-0000-000000000011",
                    "sender": "other",
                    "text": "您好，關於您領養 Bella 的申請，我們想與您確認下週二上午 10:00 是否方便前來面談呢？",
                    "is_read": True,
                },
            ],
            "users": [
                {
                    "id": "00000000-0000-0000-0000-000000000001",
                    "name": "Alex",
                    "email": "alex@example.com",
                    "avatar_url": "https://picsum.photos/seed/alex/300/300",
                    "member_since": "2023-01-01",
                },
            ],
        }
    
    def table(self, name: str) -> "MockTableQuery":
        return MockTableQuery(self, name)


class MockTableQuery:
    """
    模擬資料表查詢
    """
    
    def __init__(self, client: MockSupabaseClient, table_name: str):
        self.client = client
        self.table_name = table_name
        self._filters = {}
        self._is_single = False
        self._is_delete = False
        self._is_update = False
        self._update_data = None
        self._is_insert = False
        self._insert_data = None
    
    def select(self, columns: str = "*", count: Optional[str] = None) -> "MockTableQuery":
        return self
    
    def eq(self, column: str, value: Any) -> "MockTableQuery":
        self._filters[column] = value
        return self
    
    def in_(self, column: str, values: list) -> "MockTableQuery":
        self._filters[f"{column}_in"] = values
        return self
    
    def order(self, column: str, desc: bool = False, asc: bool = False) -> "MockTableQuery":
        return self
    
    def limit(self, count: int) -> "MockTableQuery":
        return self
    
    def single(self) -> "MockTableQuery":
        self._is_single = True
        return self
    
    def execute(self) -> QueryResult:
        if self._is_delete:
            return self._do_delete()
        
        # 處理更新操作
        if self._is_update:
            return self._do_update()
            
        # 處理插入操作
        if self._is_insert:
            return self._do_insert()
        
        # 正常的 select 查詢
        data = self.client._data.get(self.table_name, [])
        
        # 應用過濾
        if self._filters:
            filtered = []
            for item in data:
                match = True
                for key, value in self._filters.items():
                    if key.endswith("_in"):
                        real_key = key[:-3]
                        if item.get(real_key) not in value:
                            match = False
                            break
                    elif item.get(key) != value:
                        match = False
                        break
                if match:
                    filtered.append(item)
            data = filtered
        
        if self._is_single:
            data = data[0] if data else None
        
        return QueryResult(data=data, count=len(data) if isinstance(data, list) else 1)
    
    def insert(self, data: dict | list) -> "MockTableQuery":
        """插入操作 - 返回 self 來支援鏈式調用"""
        self._insert_data = data
        self._is_insert = True
        return self

    def _do_insert(self):
        """實際執行插入操作"""
        if not hasattr(self, '_insert_data'):
            return QueryResult(data=[], count=0)
            
        data = self._insert_data
        if isinstance(data, dict):
            data = [data]
        
        table_data = self.client._data.get(self.table_name, [])
        result_data = []
        for item in data:
            if "id" not in item:
                item["id"] = str(len(table_data) + 1)
            # 簡單的深拷貝以避免引用問題
            new_item = item.copy()
            table_data.append(new_item)
            result_data.append(new_item)
        
        self.client._data[self.table_name] = table_data
        return QueryResult(data=result_data, count=len(result_data))
    
    def update(self, data: dict) -> "MockTableQuery":
        """更新操作 - 返回 self 來支援鏈式調用"""
        self._update_data = data
        self._is_update = True
        return self
    
    def _do_update(self):
        """實際執行更新操作"""
        if not hasattr(self, '_update_data'):
            return QueryResult(data=[], count=0)
        
        table_data = self.client._data.get(self.table_name, [])
        updated = []
        
        for item in table_data:
            match = True
            for key, value in self._filters.items():
                if key.endswith("_in"):
                    continue
                if item.get(key) != value:
                    match = False
                    break
            if match:
                item.update(self._update_data)
                updated.append(item)
        
        return QueryResult(data=updated, count=len(updated))
    
    def delete(self) -> "MockTableQuery":
        """刪除操作 - 返回 self 來支援鏈式調用"""
        self._is_delete = True
        return self
    
    def _do_delete(self):
        """實際執行刪除操作"""
        table_data = self.client._data.get(self.table_name, [])
        
        if self._filters:
            new_data = []
            for item in table_data:
                keep = False
                for key, value in self._filters.items():
                    if key.endswith("_in"):
                        continue
                    if item.get(key) != value:
                        keep = True
                        break
                if keep:
                    new_data.append(item)
            self.client._data[self.table_name] = new_data
        
        return QueryResult(data=[], count=0)
    
    def __del__(self):
        """對象銷毀時自動執行刪除或更新操作"""
        if getattr(self, '_is_delete', False):
            self._do_delete()
        if getattr(self, '_is_update', False):
            self._do_update()
        if getattr(self, '_is_insert', False):
            self._do_insert()
