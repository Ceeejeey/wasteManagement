from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
from models import User, WasteLog
from schemas import LeaderboardUser, UserOut, SpendPointsRequest, ConfirmDetectionRequest
from auth import get_current_user

router = APIRouter()

def get_db():
    """
    Dependency function to get a database session.
    Yields a session object and ensures it is closed after the request is processed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@router.get("/leaderboard", response_model=list[LeaderboardUser])
def get_leaderboard(db: Session = Depends(get_db)):
    """
    Fetch the top 10 users with the highest points for the leaderboard.
    """
    users = db.query(User).order_by(User.points.desc()).limit(10).all()
    return users

@router.get("/me", response_model=UserOut)
def get_my_stats(current_user: User = Depends(get_current_user)):
    """
    Fetch the profile and stats of the currently authenticated user.
    """
    return current_user

@router.post("/spend_points")
def spend_points(request: SpendPointsRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Endpoint to allow a user to spend their accumulated green points.
    Validates sufficient points, deducts the amount, and records a SpendLog.
    """
    # Re-query the target user within this route's own session
    target_user = db.query(User).filter(User.id == request.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the user has enough points to make the purchase
    if target_user.points < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient points")
        
    # Deduct the points
    target_user.points -= request.amount
    
    # Record the spending event in the database
    from models import SpendLog
    new_spend_log = SpendLog(
        user_id=target_user.id,
        amount=request.amount,
        spent_on=request.spent_on
    )
    db.add(new_spend_log)
    
    db.commit()
    db.refresh(target_user)
    
    return {"message": f"Successfully spent {request.amount} points", "remaining_points": target_user.points}


@router.post("/confirm_detection")
def confirm_detection(
    request: ConfirmDetectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint to confirm and claim points from a waste detection.
    Called ONLY when the user clicks 'Yes, Claim Points' after reviewing the result on the frontend.
    This is the ONLY place where points and logs are written to the database.
    """
    if not request.detections:
        raise HTTPException(status_code=400, detail="No detections to confirm")

    # Re-query the user within THIS route's session to avoid cross-session issues
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    total_points = 0
    # Create a log for each individual detection item
    for det in request.detections:
        waste_log = WasteLog(
            user_id=user.id,
            waste_type=det.waste_type,
            points_earned=det.points_earned
        )
        db.add(waste_log)
        total_points += det.points_earned

    # Award the accumulated points to the user
    user.points += total_points
    db.commit()
    db.refresh(user)

    return {
        "message": f"Confirmed! +{total_points} points added.",
        "total_points_added": total_points,
        "new_balance": user.points
    }

