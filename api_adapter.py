
import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), "backend")
sys.path.append(backend_path)

try:
    # 嘗試導入真正的 App
    from main import app
except Exception as e:
    # 如果導入失敗，創建一個臨時 App 來顯示錯誤
    app = FastAPI()
    error_msg = traceback.format_exc()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Backend Startup Error",
                "traceback": error_msg,
                "sys_path": sys.path,
                "cwd": os.getcwd(),
                "files_in_backend": os.listdir(backend_path) if os.path.exists(backend_path) else "backend not found"
            }
        )
