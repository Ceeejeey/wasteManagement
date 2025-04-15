from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from schemas import LeaderboardUser  # we’ll define this below

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
