"""
寵物領養平台後端 API
FastAPI 應用程式入口

啟動方式：
  uvicorn main:app --reload --port 8000
"""
  uvicorn main:app --reload --port 8000
"""
import sys
import os

# 將當前目錄加入 Python Path，確保 Vercel 能正確導入同目錄模組
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from api import (
    pets_router,
    users_router,
    favorites_router,
    applications_router,
    messages_router,
    stories_router,
    listings_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    應用程式生命週期管理
    啟動時驗證配置，關閉時清理資源
    """
    # 啟動時執行
    print("🚀 正在啟動寵物領養平台 API...")
    
    # 驗證配置（在開發模式下可跳過）
    if not settings.DEBUG:
        try:
            settings.validate()
            print("✅ Supabase 配置驗證成功")
        except ValueError as e:
            print(f"⚠️ 配置警告: {e}")
    else:
        print("🔧 開發模式：跳過配置驗證")
    
    print("✅ API 啟動完成")
    
    yield
    
    # 關閉時執行
    print("👋 正在關閉 API...")


# 創建 FastAPI 應用實例
app = FastAPI(
    title="寵物領養平台 API",
    description="PawsAdopt 寵物領養平台的後端 API 服務",
    version="1.0.0",
    lifespan=lifespan,
)

# 配置 CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 健康檢查端點
@app.get("/health", tags=["系統"])
async def health_check():
    """
    健康檢查端點
    用於確認 API 服務是否正常運行
    """
    return {
        "status": "healthy",
        "message": "寵物領養平台 API 運行正常",
        "version": "1.0.0",
    }


# 註冊 API 路由
app.include_router(pets_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(favorites_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(messages_router, prefix="/api")
app.include_router(stories_router, prefix="/api")
app.include_router(listings_router, prefix="/api")


# 根路由
@app.get("/", tags=["系統"])
async def root():
    """
    根路由，返回 API 基本資訊
    """
    return {
        "name": "寵物領養平台 API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
