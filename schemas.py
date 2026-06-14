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


# 📉 Spend Log Schema
class SpendLogOut(BaseModel):
    id: int
    amount: int
    spent_on: Optional[str]
    spent_at: datetime

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
    spend_logs: List[SpendLogOut] = []

    class Config:
        orm_mode = True
class LeaderboardUser(BaseModel):
    id: int
    username: str
    points: int

class SpendPointsRequest(BaseModel):
    user_id: int
    amount: int
    spent_on: str


    class Config:
        orm_mode = True

# ✅ Detection Item (sent from frontend when user confirms)
class DetectionItem(BaseModel):
    waste_type: str
    points_earned: int

# ✅ Confirm Detection Request
class ConfirmDetectionRequest(BaseModel):
    detections: List[DetectionItem]