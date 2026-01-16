# 寵物領養平台 - 後端 API

這是寵物領養平台的 FastAPI 後端服務。

## 快速開始

### 1. 設置 Supabase

1. 前往 [Supabase](https://supabase.com) 創建專案
2. 在 SQL Editor 中執行 `init_database.sql` 初始化數據庫
3. 複製 `.env.example` 為 `.env` 並填入 Supabase 憑證

```bash
cp .env.example .env
```

編輯 `.env`：
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
DEBUG=true
```

### 2. 啟動服務

**Windows:**
```bash
start.bat
```

**手動啟動:**
```bash
# 創建虛擬環境
python -m venv venv

# 啟動虛擬環境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 安裝依賴
pip install -r requirements.txt

# 啟動服務
uvicorn main:app --reload --port 8000
```

### 3. 測試 API

- API 文檔: http://localhost:8000/docs
- 健康檢查: http://localhost:8000/health

## API 端點

| 方法 | 路徑 | 功能 |
|------|------|------|
| GET | /api/pets | 獲取寵物列表 |
| GET | /api/pets/{id} | 獲取寵物詳情 |
| GET | /api/stories | 獲取幸福故事 |
| GET | /api/users/me | 獲取當前用戶 |
| GET | /api/favorites | 獲取收藏列表 |
| POST | /api/favorites | 新增收藏 |
| DELETE | /api/favorites/{pet_id} | 移除收藏 |
| GET | /api/applications | 獲取領養申請 |
| POST | /api/applications | 提交領養申請 |
| GET | /api/listings | 獲取用戶刊登 |
| POST | /api/listings | 創建寵物刊登 |
| GET | /api/messages/threads | 獲取訊息對話 |
| GET | /api/messages/threads/{id} | 獲取對話訊息 |
| POST | /api/messages/threads/{id} | 發送訊息 |

## 目錄結構

```
backend/
├── main.py              # FastAPI 應用入口
├── config.py            # 配置管理
├── requirements.txt     # Python 依賴
├── init_database.sql    # 數據庫初始化腳本
├── start.bat           # Windows 啟動腳本
├── api/                 # API 路由
│   ├── pets.py
│   ├── users.py
│   ├── favorites.py
│   ├── applications.py
│   ├── messages.py
│   ├── stories.py
│   └── listings.py
├── schemas/             # Pydantic 數據模型
│   ├── pet.py
│   ├── user.py
│   ├── application.py
│   ├── message.py
│   ├── listing.py
│   └── story.py
└── services/            # 服務層
    └── supabase_client.py
```
