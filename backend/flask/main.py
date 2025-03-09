from ultralytics import YOLO 
# import cvzone
# import cv2

# Detectiong on images
model = YOLO("yolo11n.pt")
results = model("photo1.png")

for result in results:
    detected_classes = result.names
    boxes = result.boxes.xywh  
    confidences = result.boxes.conf 

    # detected objects with bounding boxes and confidence scores
    for i, box in enumerate(boxes):
        print(f"Object: {detected_classes[int(result.boxes.cls[i])]}, "
              f"Bounding box: {box}, "
              f"Confidence: {confidences[i]}")










# #live cam
# cap = cv2.VideoCapture(0)

# while True:
#    ret, image = cap.read()
#    results = model(image)
#    for info in results:
#       parameters = info.boxes
#       for box in parameters:
#          #convert to integer values
#          x1,y1,x2,y2 = box.xyxy[0].numpy().astype('int')
#          confidence = box.conf[0].numpy().astype('int')*100

#          class_detected_number = box.cls[0]
#          class_detected_number = int(class_detected_number)
#          class_detected_name = results[0].names[class_detected_number]

#          cv2.rectangle(image,(x1,y1),(x2,y2),(0,0,255),3)
#          cvzone.putTextRect(image,f'{class_detected_name}',[x1 + 8, y1 - 12], thickness=2,scale=1.5)


#    cv2.imshow('frame', image)
#    cv2.waitKey(1)