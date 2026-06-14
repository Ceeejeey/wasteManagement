from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# 👤 Base User Schema (for shared attributes)
class UserBase(BaseModel):
    """
    Base model for User fields, containing the common attributes.
    """
    username: str
    email: EmailStr


# 📝 User Creation Input Schema
class UserCreate(UserBase):
    """
    Schema for creating a new user. Extends UserBase with a password field.
    """
    password: str


# 🔐 User Login Input Schema
class UserLogin(BaseModel):
    """
    Schema used when a user logs in. Requires an email and password.
    """
    email: EmailStr
    password: str


# 🚀 Waste Log Schema (for future nested response)
class WasteLogOut(BaseModel):
    """
    Schema representing a single waste detection event log to send to the client.
    """
    id: int
    waste_type: str
    points_earned: int
    detected_at: datetime

    class Config:
        orm_mode = True # Allows Pydantic to read data from SQLAlchemy ORM models


# 📉 Spend Log Schema
class SpendLogOut(BaseModel):
    """
    Schema representing a record of points spent by the user.
    """
    id: int
    amount: int
    spent_on: Optional[str]
    spent_at: datetime

    class Config:
        orm_mode = True


# 📤 User Output Schema (safe to return)
class UserOut(BaseModel):
    """
    Schema for returning user data. Safely excludes the password hash.
    Includes related logs like waste_logs and spend_logs.
    """
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
    """
    Schema specifically tailored for displaying users on the leaderboard.
    Only includes essential fields like id, username, and points.
    """
    id: int
    username: str
    points: int

class SpendPointsRequest(BaseModel):
    """
    Schema representing a request from the client to deduct points from a user's account.
    """
    user_id: int
    amount: int
    spent_on: str


    class Config:
        orm_mode = True

# ✅ Detection Item (sent from frontend when user confirms)
class DetectionItem(BaseModel):
    """
    Schema representing an individual detected item and its associated points.
    """
    waste_type: str
    points_earned: int

# ✅ Confirm Detection Request
class ConfirmDetectionRequest(BaseModel):
    """
    Schema representing a request from the client to finalize points and logs 
    after reviewing and approving the AI's predictions.
    """
    detections: List[DetectionItem]