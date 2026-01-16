from os.path import dirname, join, abspath
import sys

# 將 backend 目錄加入路徑
sys.path.append(join(dirname(__file__), '../backend'))

# 導入 FastAPI app
from main import app
