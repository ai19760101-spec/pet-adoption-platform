# 寵物領養平台 - 全端應用實現計劃

## 概述
將現有的純前端寵物領養平台（PawsAdopt）轉換為完整的全端應用，使用 **FastAPI** 作為後端框架，**Supabase** 作為數據存儲。

## 前端代碼分析摘要

| 功能模組 | 組件 | 當前狀態 | 需要的 API |
|---------|------|---------|-----------|
| 寵物瀏覽 | Home.tsx, Explore.tsx | 使用靜態 PETS 數據 | GET /pets |
| 寵物詳情 | PetDetails.tsx | 使用傳入的 pet 對象 | GET /pets/{id} |
| 收藏功能 | Favorites.tsx | 前端 Set 管理 | GET/POST/DELETE /favorites |
| 領養申請 | AdoptionForm.tsx | 模擬提交 | POST /adoption-applications |
| 寵物刊登 | PostPet.tsx | 模擬提交 | POST /pet-listings |
| 用戶檔案 | Profile.tsx | 靜態 Mock 數據 | GET /users/me, GET /applications |
| 訊息系統 | Profile.tsx | 靜態 Mock 數據 | GET/POST /messages |
| 幸福故事 | Home.tsx | 靜態 STORIES 數據 | GET /stories |

---

## 用戶審核項目

> [!IMPORTANT]
> **Supabase 設置需求**
> 請確認您已有 Supabase 專案，需提供：
> 1. `SUPABASE_URL` - 專案 URL
> 2. `SUPABASE_KEY` - anon/public key

> [!NOTE]
> **用戶認證方案**
> 本計劃採用模擬用戶（user_id = 1）進行開發測試。如需完整認證功能，可後續整合 Supabase Auth。

---

## 提議的變更

### 數據庫架構設計

創建以下 Supabase 表：

```sql
-- 用戶表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    member_since DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 寵物表
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    age_group VARCHAR(20) NOT NULL CHECK (age_group IN ('幼年', '成年', '老年')),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('公', '母')),
    size VARCHAR(10) NOT NULL CHECK (size IN ('小型', '中型', '大型')),
    pet_type VARCHAR(20) NOT NULL CHECK (pet_type IN ('狗狗', '貓咪', '鳥類', '兔子', '其他')),
    location VARCHAR(100) NOT NULL,
    distance VARCHAR(50),
    image_url TEXT NOT NULL,
    description TEXT,
    adoption_fee DECIMAL(10, 2) DEFAULT 0,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_neutered BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[], -- PostgreSQL array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 收藏表
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pet_id)
);

-- 領養申請表
CREATE TABLE adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'interview', 'completed', 'rejected')),
    housing_type VARCHAR(50),
    outdoor_space VARCHAR(50),
    is_renting BOOLEAN DEFAULT FALSE,
    has_pets BOOLEAN DEFAULT FALSE,
    experience TEXT,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    interview_date DATE,
    interview_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用戶刊登的寵物
CREATE TABLE pet_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    pet_type VARCHAR(20) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    age VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    size VARCHAR(10),
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'adopted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 訊息對話表
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    shelter_name VARCHAR(100) NOT NULL,
    shelter_avatar TEXT,
    pet_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 訊息表
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('user', 'other')),
    text TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 幸福故事表
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author VARCHAR(100) NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    color VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### 後端組件

#### [NEW] [backend](file:///c:/Antigravity/寵物領養平台/backend)

新建後端目錄，結構如下：

```
backend/
├── main.py              # FastAPI 應用入口
├── config.py            # Supabase 配置
├── requirements.txt     # Python 依賴
├── api/
│   ├── __init__.py
│   ├── pets.py          # 寵物相關 API
│   ├── users.py         # 用戶相關 API
│   ├── favorites.py     # 收藏相關 API
│   ├── applications.py  # 領養申請 API
│   ├── messages.py      # 訊息 API
│   ├── stories.py       # 故事 API
│   └── listings.py      # 寵物刊登 API
├── schemas/
│   ├── __init__.py
│   ├── pet.py           # 寵物 Schema
│   ├── user.py          # 用戶 Schema
│   ├── application.py   # 申請 Schema
│   └── message.py       # 訊息 Schema
└── services/
    ├── __init__.py
    └── supabase_client.py  # Supabase 客戶端服務
```

#### API 端點設計

| 方法 | 路徑 | 功能 | 請求格式 |
|------|------|------|---------|
| GET | /api/pets | 獲取寵物列表（支援篩選） | Query: location, age, size, gender, type |
| GET | /api/pets/{id} | 獲取單一寵物詳情 | - |
| GET | /api/stories | 獲取幸福故事列表 | - |
| GET | /api/users/me | 獲取當前用戶資料 | - |
| GET | /api/favorites | 獲取用戶收藏列表 | - |
| POST | /api/favorites | 新增收藏 | Body: { pet_id } |
| DELETE | /api/favorites/{pet_id} | 移除收藏 | - |
| GET | /api/applications | 獲取用戶的領養申請 | - |
| POST | /api/applications | 提交領養申請 | Body: AdoptionApplicationCreate |
| GET | /api/listings | 獲取用戶的寵物刊登 | - |
| POST | /api/listings | 創建新寵物刊登 | Body: PetListingCreate |
| GET | /api/messages/threads | 獲取訊息對話列表 | - |
| GET | /api/messages/threads/{id} | 獲取對話訊息詳情 | - |
| POST | /api/messages/threads/{id} | 發送訊息 | Body: { text?, image_url? } |

---

### 前端組件

#### [NEW] [api.ts](file:///c:/Antigravity/寵物領養平台/services/api.ts)

創建統一的 API 服務層：

```typescript
const API_BASE_URL = 'http://localhost:8000/api';

export const api = {
  // 寵物相關
  getPets: (filters?: PetFilters) => Promise<Pet[]>,
  getPetById: (id: string) => Promise<Pet>,
  
  // 收藏相關
  getFavorites: () => Promise<Pet[]>,
  addFavorite: (petId: string) => Promise<void>,
  removeFavorite: (petId: string) => Promise<void>,
  
  // 申請相關
  getApplications: () => Promise<Application[]>,
  submitApplication: (data: ApplicationData) => Promise<void>,
  
  // 刊登相關
  getListings: () => Promise<PetListing[]>,
  createListing: (data: ListingData) => Promise<void>,
  
  // 訊息相關
  getMessageThreads: () => Promise<MessageThread[]>,
  getMessages: (threadId: string) => Promise<Message[]>,
  sendMessage: (threadId: string, data: MessageData) => Promise<void>,
  
  // 故事相關
  getStories: () => Promise<Story[]>,
  
  // 用戶相關
  getCurrentUser: () => Promise<User>,
};
```

#### [MODIFY] [App.tsx](file:///c:/Antigravity/寵物領養平台/App.tsx)

- 將 `favorites` 從前端 Set 改為 API 驅動
- 添加用戶狀態管理
- 添加數據載入狀態

#### [MODIFY] [Home.tsx](file:///c:/Antigravity/寵物領養平台/views/Home.tsx)

- 移除 `PETS` 和 `STORIES` 靜態導入
- 使用 `useEffect` 從 API 獲取數據
- 添加載入和錯誤狀態處理

#### [MODIFY] [Explore.tsx](file:///c:/Antigravity/寵物領養平台/views/Explore.tsx)

- 從 API 獲取寵物列表
- 篩選邏輯移至後端

#### [MODIFY] [Favorites.tsx](file:///c:/Antigravity/寵物領養平台/views/Favorites.tsx)

- 從 API 獲取收藏的寵物列表

#### [MODIFY] [AdoptionForm.tsx](file:///c:/Antigravity/寵物領養平台/views/AdoptionForm.tsx)

- 修改 `handleSubmit` 以呼叫 API
- 處理 API 回應和錯誤

#### [MODIFY] [PostPet.tsx](file:///c:/Antigravity/寵物領養平台/views/PostPet.tsx)

- 修改 `handleSubmit` 以呼叫 API
- 處理圖片上傳

#### [MODIFY] [Profile.tsx](file:///c:/Antigravity/寵物領養平台/views/Profile.tsx)

- 從 API 獲取用戶資料
- 從 API 獲取申請紀錄
- 從 API 獲取訊息對話

#### [MODIFY] [package.json](file:///c:/Antigravity/寵物領養平台/package.json)

新增依賴：
- `axios` - HTTP 請求庫

#### [NEW] [.env.local](file:///c:/Antigravity/寵物領養平台/.env.local) 更新

```
VITE_API_BASE_URL=http://localhost:8000/api
```

#### [NEW] [backend/.env](file:///c:/Antigravity/寵物領養平台/backend/.env)

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

---

## 驗證計劃

### 自動化測試

```bash
# 1. 啟動後端服務
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 2. 測試 API 端點
curl http://localhost:8000/api/pets
curl http://localhost:8000/api/stories
curl http://localhost:8000/health

# 3. 啟動前端
cd ..
npm install
npm run dev

# 4. 訪問 http://localhost:5173 測試完整功能
```

### 手動驗證

1. **寵物列表**：確認首頁和探索頁能正確載入寵物
2. **收藏功能**：測試添加/移除收藏
3. **領養申請**：完成申請流程，確認數據存入 Supabase
4. **寵物刊登**：測試發布新寵物
5. **訊息系統**：測試收發訊息
6. **用戶檔案**：確認用戶資料正確顯示
