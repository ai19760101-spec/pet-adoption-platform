import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Import FastAPI app from backend/main.py
from main import app
