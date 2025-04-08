from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import cv2
from ultralytics import YOLO
from fastapi import File, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
app = FastAPI()

# Load trained YOLOv8 model
model = YOLO("weights/best.pt")

# OpenCV webcam
cap = cv2.VideoCapture(0)

def generate_frames():
    while True:
        success, frame = cap.read()
        if not success:
            break

        # YOLO prediction
        results = model.predict(source=frame, conf=0.25, verbose=True)

        # Print detected classes
        boxes = results[0].boxes
        if boxes is not None:
            for box in boxes:
                class_id = int(box.cls[0])
                print("Detected:", model.names[class_id])

        # Draw results
        annotated_frame = results[0].plot()

        _, buffer = cv2.imencode('.jpg', annotated_frame)
        frame_bytes = buffer.tobytes()

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.post("/predict_image/")
async def predict_image(file: UploadFile = File(...)):
    contents = await file.read()

    # Convert to NumPy array
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Predict using YOLO
    results = model.predict(img, conf=0.25, verbose=True)

    # Parse detections
    detections = []
    boxes = results[0].boxes
    if boxes is not None:
        for box in boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            detections.append(cls_name)

    return JSONResponse(content={"detections": detections})
       
@app.get("/")
def read_root():
    return {"message": "Smart Waste System API is live!"}

@app.get("/video_feed")
def video_feed():
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
