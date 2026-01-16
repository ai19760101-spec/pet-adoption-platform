@echo off
echo ====================================
echo 寵物領養平台 - 後端啟動腳本
echo ====================================
echo.

REM 切換到後端目錄
cd /d "%~dp0"

REM 檢查是否有虛擬環境
if not exist "venv" (
    echo 正在創建 Python 虛擬環境...
    python -m venv venv
    echo 虛擬環境創建完成！
    echo.
)

REM 啟動虛擬環境
call venv\Scripts\activate.bat

REM 安裝依賴
echo 正在安裝依賴套件...
pip install -r requirements.txt -q

echo.
echo 正在啟動 FastAPI 服務...
echo API 文檔: http://localhost:8000/docs
echo 健康檢查: http://localhost:8000/health
echo.
echo 按 Ctrl+C 停止服務
echo.

REM 啟動服務
uvicorn main:app --reload --host 0.0.0.0 --port 8000
