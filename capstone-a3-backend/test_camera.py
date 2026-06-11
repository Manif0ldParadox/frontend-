import cv2
import os
import time

os.makedirs("captures", exist_ok=True)

for i in range(5):
    print("=" * 40)
    print(f"Testing camera index: {i}")

    cap = cv2.VideoCapture(i)
    print("opened:", cap.isOpened())

    if not cap.isOpened():
        cap.release()
        continue

    ret = False
    frame = None

    for _ in range(10):
        ret, frame = cap.read()
        time.sleep(0.1)

    print("read:", ret)

    if ret and frame is not None:
        path = f"captures/test_camera_{i}.jpg"
        cv2.imwrite(path, frame)
        print("saved:", path)
    else:
        print(f"camera index {i} opened but frame failed")

    cap.release()
