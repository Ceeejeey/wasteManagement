from fastapi import FastAPI, File, UploadFile, Depends
from fastapi.responses import JSONResponse
from register import register 
from login import login
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
from ultralytics import YOLO
from sqlalchemy.orm import Session
from database import SessionLocal# Assuming you have this as a dependency
from models import User, WasteLog
from auth import get_user_from_token, oauth2_scheme  # Your JWT-based authentication dependency
from fastapi.security import OAuth2PasswordBearer
from routes import router


app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, you can specify domains like ["https://example.com"]
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Load trained YOLOv8 model
model = YOLO("weights/best.pt")

# Categories of waste
RECYCLABLE = ['cardboard_box', 'can', 'plastic_bottle_cap', 'plastic_bottle', 'reuseable_paper']
NON_RECYCLABLE = ['plastic_bag', 'scrap_paper', 'stick', 'plastic_cup', 'snack_bag', 'plastic_box', 'straw', 'plastic_cup_lid', 'scrap_plastic', 'cardboard_bowl', 'plastic_cultery']
HAZARDOUS = ['battery', 'chemical_spray_can', 'chemical_plastic_bottle', 'chemical_plastic_gallon', 'light_bulb', 'paint_bucket']

# Points allocation system
POINTS = {
    'recyclable': 1,
    'non_recyclable': 5,
    'hazardous': 10
}

def allocate_points(cls_name):
    if cls_name in RECYCLABLE:
        return POINTS['recyclable']
    elif cls_name in NON_RECYCLABLE:
        return POINTS['non_recyclable']
    elif cls_name in HAZARDOUS:
        return POINTS['hazardous']
    return 0  # Default to 0 if waste type is unknown


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post("/predict_image/")
async def predict_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)  # get token directly
):
    current_user = get_user_from_token(token, db)  # ensure correct session!

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model.predict(img, conf=0.25, verbose=True)

    detections = []
    total_points = 0
    boxes = results[0].boxes

    if boxes is not None:
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            points = allocate_points(cls_name)

            detections.append({
                'class': cls_name,
                'points': points
            })

            waste_log = WasteLog(
                user_id=current_user.id,
                waste_type=cls_name,
                points_earned=points
            )
            db.add(waste_log)
            total_points += points

        # ✅ Update points and commit
        current_user.points += total_points
        db.commit()
        db.refresh(current_user)

    return JSONResponse(content={
        "detections": detections,
        "total_points": total_points,
        "user_points": current_user.points
    })



app.include_router(register, prefix="/api")
app.include_router(login, prefix="/api")
app.include_router(router, prefix="/api")
