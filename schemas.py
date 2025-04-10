from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# 👤 Base User Schema (for shared attributes)
class UserBase(BaseModel):
    username: str
    email: EmailStr


# 📝 User Creation Input Schema
class UserCreate(UserBase):
    password: str


# 🔐 User Login Input Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 🚀 Waste Log Schema (for future nested response)
class WasteLogOut(BaseModel):
    id: int
    waste_type: str
    points_earned: int
    detected_at: datetime

    class Config:
        orm_mode = True


# 📤 User Output Schema (safe to return)
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    points: int
    created_at: datetime
    updated_at: Optional[datetime]
    waste_logs: List[WasteLogOut] = []

    class Config:
        orm_mode = True
