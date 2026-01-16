# 寵物領養平台 - 全端應用開發任務

## 目標
將現有的純前端寵物領養平台轉換為完整的全端應用，使用 Supabase 作為後端數據存儲。

## 任務分解

### 1. 規劃階段
- [x] 分析前端代碼結構
- [x] 撰寫實現計劃文檔
- [x] 用戶審核確認

### 2. 後端實現
- [x] 設計 Supabase 數據庫架構
  - [x] pets 表（寵物資訊）
  - [x] users 表（用戶資料）
  - [x] favorites 表（收藏關聯）
  - [x] adoption_applications 表（領養申請）
  - [x] messages 表（訊息）
  - [x] stories 表（幸福故事）
  - [x] pet_listings 表（用戶刊登的寵物）
- [x] 創建 FastAPI 後端
  - [x] 項目結構設置（main.py, config.py）
  - [x] Supabase 客戶端配置（services/supabase_client.py）
  - [x] API 路由實現（7 個路由模組）
  - [x] CORS 設置

### 3. 前端改造
- [x] 創建 API 服務層（services/api.ts, services/config.ts）
- [x] 創建自定義 Hooks（hooks/usePets.ts, hooks/useFavorites.ts, hooks/useStories.ts）
- [x] 改造各組件以使用 API
  - [x] App.tsx - 收藏狀態管理改用 API
  - [x] Home.tsx - 從 API 獲取寵物列表和故事
  - [x] Explore.tsx - 從 API 獲取並篩選寵物
  - [x] Favorites.tsx - 從 API 獲取收藏列表
  - [x] AdoptionForm.tsx - 提交領養申請到 API
  - [x] PostPet.tsx - 提交新寵物刊登到 API
  - [x] Profile.tsx - 從 API 獲取用戶資料、申請狀態、訊息

### 4. 驗證階段
- [x] 用戶設置 Supabase 並執行數據庫初始化
- [x] 測試 API 端點
  - [x] Basic CRUD (Pets)
  - [x] Create (Favorites)
  - [x] Message Detail (Verified by Code)
- [x] 測試前後端連通性
- [x] 測試完整用戶流程
- [x] 創建種子數據腳本 (`seed_data.py`)
- [x] 執行數據填充到真實資料庫

