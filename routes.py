from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import LeaderboardUser, UserOut
from auth import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.get("/leaderboard", response_model=list[LeaderboardUser])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.points.desc()).limit(10).all()
    return users

@router.get("/me", response_model=UserOut)
def get_my_stats(current_user: User = Depends(get_current_user)):
    return current_user
