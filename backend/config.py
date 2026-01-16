"""
應用程式配置模組
負責載入環境變數和管理全域配置
"""
import os
from dotenv import load_dotenv

# 載入 .env 文件
load_dotenv()


class Settings:
    """
    應用程式設定類
    從環境變數中讀取配置值
    """
    
    # Supabase 配置
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # 開發環境設定
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # CORS 允許的來源
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",  # Vite 開發服務器
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]
    
    def validate(self) -> None:
        """
        驗證必要的配置是否已設定
        如果缺少必要配置則拋出異常
        """
        if not self.SUPABASE_URL:
            raise ValueError("SUPABASE_URL 環境變數未設定")
        if not self.SUPABASE_KEY:
            raise ValueError("SUPABASE_KEY 環境變數未設定")


# 建立全域設定實例
settings = Settings()
