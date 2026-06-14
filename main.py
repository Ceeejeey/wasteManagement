from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.responses import JSONResponse
from register import register 
from login import login
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from ultralytics import YOLO
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, WasteLog
from auth import get_user_from_token, oauth2_scheme  # JWT-based authentication dependency
from fastapi.security import OAuth2PasswordBearer
from routes import router
from database import engine
import models

# Ensure all database tables are created before starting the application
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Setup OAuth2 password flow for Swagger UI and token retrieval
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_db():
    """
    Dependency function to provide a database session to endpoints.
    Ensures the session is closed after the request is processed.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
# Configure CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, can be restricted to specific domains
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load the trained YOLOv8 model for waste detection
model = YOLO("weights/best.pt")

# Define the categories of waste based on the model's detectable classes
RECYCLABLE = ['cardboard_box', 'reuseable_paper', 'cardboard_bowl', 'scrap_paper']
NON_RECYCLABLE = ['plastic_bag', 'stick', 'plastic_cup', 'snack_bag', 'plastic_box', 'straw', 'plastic_cup_lid', 'scrap_plastic', 'plastic_cultery', 'plastic_bottle', 'can', 'plastic_bottle_cap']
HAZARDOUS = ['battery', 'chemical_spray_can', 'chemical_plastic_bottle', 'chemical_plastic_gallon', 'light_bulb', 'paint_bucket']

# Define the base points awarded for each waste category
POINTS = {
    'recyclable': 1,
    'non_recyclable': 5,
    'hazardous': 10
}

def allocate_points(cls_name):
    """
    Determines the base points to award based on the detected waste class.
    """
    if cls_name in RECYCLABLE:
        return POINTS['recyclable']
    elif cls_name in NON_RECYCLABLE:
        return POINTS['non_recyclable']
    elif cls_name in HAZARDOUS:
        return POINTS['hazardous']
    return 0  # Default to 0 if waste type is unknown

def get_category(cls_name):
    """
    Categorizes a specific waste class name into its overarching category.
    Used for frontend display and color-coding.
    """
    if cls_name in RECYCLABLE:
        return 'Recyclable'
    elif cls_name in NON_RECYCLABLE:
        return 'Non-Recyclable'
    elif cls_name in HAZARDOUS:
        return 'Hazardous'
    return 'Unknown'


@app.get("/")
async def read_root():
    """
    Health check endpoint.
    """
    return {"Hello": "World"}


@app.post("/predict_image/")
async def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """
    Endpoint to receive an image, run it through the YOLOv8 model, and return the detected waste items.
    Calculates the potential points the user can earn, applying a leaderboard rank multiplier.
    Does NOT save points to the database; the frontend must confirm the detection first.
    """
    # Authenticate the user from the token
    current_user = get_user_from_token(token, db)

    # Read the uploaded image file into memory
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run inference using the YOLO model
    results = model.predict(img, conf=0.25, verbose=True)

    # Calculate user's current rank to apply the appropriate point multiplier
    users = db.query(User).order_by(User.points.desc()).all()
    rank = next((index + 1 for index, u in enumerate(users) if u.id == current_user.id), None)
    
    # Base multiplier is 1x. Top 3 ranks get bonus multipliers.
    multiplier = 1.0
    if rank == 1:
        multiplier = 2.0
    elif rank == 2:
        multiplier = 1.5
    elif rank == 3:
        multiplier = 1.25

    detections = []
    total_points = 0
    boxes = results[0].boxes

    # Process each detected bounding box
    if boxes is not None:
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            confidence = float(box.conf[0]) * 100
            
            category = get_category(cls_name)
            base_points = allocate_points(cls_name)
            
            # Apply multiplier and round to nearest integer
            points = int(round(base_points * multiplier))

            detections.append({
                'class': cls_name,
                'points': points,
                'accuracy': f"{confidence:.1f}%",
                'category': category
            })
            total_points += points

    # ⚠️ Points are NOT saved here — the frontend must call /api/confirm_detection
    # after the user reviews and approves the result.
    return JSONResponse(content={
        "detections": detections,
        "total_points": total_points,
        "user_points": current_user.points,  # unchanged until confirmed
        "multiplier": multiplier
    })


# Include external routers for modularity
app.include_router(register, prefix="/api")
app.include_router(login, prefix="/api")
app.include_router(router, prefix="/api")

