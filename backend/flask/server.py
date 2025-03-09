from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
model = YOLO("yolo11n.pt")  

@app.route("/detect", methods=["POST"])
def detect_objects():
    print("recived by yolo")
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files["image"]
    image_bytes = file.read()
    image_np = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    
    results = model(image)  
    
    detections = []
    for result in results:
        boxes = result.boxes.xywh  
        confidences = result.boxes.conf  
        for i, box in enumerate(boxes):
            detections.append({
                "class": result.names[int(result.boxes.cls[i])],
                "confidence": float(confidences[i]),
                "bbox": box.tolist()
            })
    output = jsonify({"detections": detections})
    print("yolo output", output)
    return output

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=3002, debug=True)
