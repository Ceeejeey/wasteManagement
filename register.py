from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import User
from schemas import UserCreate, UserOut
from database import SessionLocal
from auth import hash_password

register = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@register.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # 🔍 Check for existing username or email
    existing_user = db.query(User).filter(
        (User.username == user.username) | (User.email == user.email)
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or Email already exists")

    # 🔐 Hash password
    hashed_pw = hash_password(user.password)

    # 🆕 Create new user with default role='user' and points=0
    new_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_pw
        # role and points will take default values
    )

    # 💾 Save user
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user
