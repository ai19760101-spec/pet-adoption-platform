import sys
import os
import traceback
from fastapi import FastAPI
from fastapi.responses import JSONResponse

# Debug: Print current location and path
print(f"Loading Vercel Entry Point from: {__file__}")

# Add backend directory to path
# __file__ is c:\Antigravity\寵物領養平台\api\index.py
# dirname is c:\Antigravity\寵物領養平台\api
# .. is c:\Antigravity\寵物領養平台
# backend is c:\Antigravity\寵物領養平台\backend
backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
backend_path = os.path.abspath(backend_path)
sys.path.append(backend_path)

print(f"Added backend path: {backend_path}")

try:
    # Import the main FastAPI app
    from main import app
    print("Successfully imported app from main")
except Exception as e:
    print(f"Failed to import app: {e}")
    traceback.print_exc()
    
    # Create a fallback app to serve the error
    app = FastAPI()
    error_msg = traceback.format_exc()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Backend Startup Error (Import Failed)",
                "traceback": error_msg,
                "sys_path": sys.path,
                "cwd": os.getcwd(),
                "backend_path_resolved": backend_path,
                "files_in_backend": os.listdir(backend_path) if os.path.exists(backend_path) else "backend not found"
            }
        )
