"""
數據模式模組
定義 API 請求和回應的數據結構
"""
from .pet import Pet, PetCreate, PetFilter
from .user import User, UserCreate
from .application import AdoptionApplication, AdoptionApplicationCreate
from .message import Message, MessageCreate, MessageThread
from .listing import PetListing, PetListingCreate
from .story import Story

__all__ = [
    "Pet",
    "PetCreate",
    "PetFilter",
    "User",
    "UserCreate",
    "AdoptionApplication",
    "AdoptionApplicationCreate",
    "Message",
    "MessageCreate",
    "MessageThread",
    "PetListing",
    "PetListingCreate",
    "Story",
]
