import os
import time

import cv2
import numpy as np


CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
PIXELS_PER_MM = float(os.getenv("PIXELS_PER_MM", "10.0"))
TARGET_LENGTH_MM = float(os.getenv("TARGET_LENGTH_MM", "32.5"))
TARGET_WIDTH_MM = float(os.getenv("TARGET_WIDTH_MM", "12.5"))
LENGTH_TOLERANCE_MM = float(os.getenv("LENGTH_TOLERANCE_MM", "2.0"))
WIDTH_TOLERANCE_MM = float(os.getenv("WIDTH_TOLERANCE_MM", "2.0"))

MIN_AREA_PX = int(os.getenv("MIN_CONTOUR_AREA", "1000"))
MAX_AREA_RATIO = float(os.getenv("MAX_CONTOUR_AREA_RATIO", "0.85"))
MIN_ASPECT_RATIO = float(os.getenv("MIN_ASPECT_RATIO", "1.05"))
MAX_ASPECT_RATIO = float(os.getenv("MAX_ASPECT_RATIO", "15.0"))


def _capture_frame():
    camera = cv2.VideoCapture(CAMERA_INDEX)
    if not camera.isOpened():
        camera.release()
        raise RuntimeError(f"Camera {CAMERA_INDEX} tidak dapat dibuka")

    try:
        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        time.sleep(0.35)

        frame = None
        for _ in range(8):
            success, candidate = camera.read()
            if success and candidate is not None:
                frame = candidate
            time.sleep(0.04)

        if frame is None:
            raise RuntimeError("Camera terbuka tetapi frame tidak dapat dibaca")
        return frame
    finally:
        camera.release()


def _find_target_contour(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (7, 7), 0)
    frame_area = frame.shape[0] * frame.shape[1]
    frame_height, frame_width = frame.shape[:2]
    kernel = np.ones((5, 5), np.uint8)
    candidates = []

    for threshold_mode in (cv2.THRESH_BINARY, cv2.THRESH_BINARY_INV):
        _, threshold = cv2.threshold(
            blurred, 0, 255, threshold_mode | cv2.THRESH_OTSU
        )
        threshold = cv2.morphologyEx(threshold, cv2.MORPH_OPEN, kernel)
        threshold = cv2.morphologyEx(threshold, cv2.MORPH_CLOSE, kernel, iterations=2)
        contours, _ = cv2.findContours(
            threshold, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        candidates.extend(contours)

    area_filtered = []
    preferred = []
    for contour in candidates:
        area = cv2.contourArea(contour)
        if area < MIN_AREA_PX or area > frame_area * MAX_AREA_RATIO:
            continue

        x, y, width, height = cv2.boundingRect(contour)
        touches_frame = (
            x <= 2
            or y <= 2
            or x + width >= frame_width - 2
            or y + height >= frame_height - 2
        )
        if touches_frame:
            continue

        area_filtered.append(contour)
        _, (rect_width, rect_height), _ = cv2.minAreaRect(contour)
        short_side = min(rect_width, rect_height)
        long_side = max(rect_width, rect_height)
        if short_side <= 0:
            continue

        aspect_ratio = long_side / short_side
        if MIN_ASPECT_RATIO <= aspect_ratio <= MAX_ASPECT_RATIO:
            preferred.append(contour)

    # If the shape filter is too strict, retain the largest plausible contour.
    usable = preferred or area_filtered
    if not usable:
        raise ValueError("Objek tidak terdeteksi. Atur posisi atau pencahayaan objek.")

    return max(usable, key=cv2.contourArea)


def _is_within_tolerance(value, target, tolerance):
    return target - tolerance <= value <= target + tolerance


def run_inspection(session_id, captures_dir):
    if PIXELS_PER_MM <= 0:
        raise RuntimeError("PIXELS_PER_MM harus lebih besar dari 0")

    frame = _capture_frame()
    contour = _find_target_contour(frame)
    rectangle = cv2.minAreaRect(contour)
    box = cv2.boxPoints(rectangle).astype(int)
    rect_width, rect_height = rectangle[1]

    length_px = max(rect_width, rect_height)
    width_px = min(rect_width, rect_height)
    length_mm = round(length_px / PIXELS_PER_MM, 2)
    width_mm = round(width_px / PIXELS_PER_MM, 2)

    length_ok = _is_within_tolerance(
        length_mm, TARGET_LENGTH_MM, LENGTH_TOLERANCE_MM
    )
    width_ok = _is_within_tolerance(
        width_mm, TARGET_WIDTH_MM, WIDTH_TOLERANCE_MM
    )
    status = "OK" if length_ok and width_ok else "NG"
    notes = (
        "Dimensions within tolerance"
        if status == "OK"
        else "One or more dimensions are outside tolerance"
    )

    color = (0, 180, 0) if status == "OK" else (0, 0, 255)
    cv2.drawContours(frame, [box], 0, color, 3)
    cv2.putText(
        frame,
        f"L: {length_mm:.2f} mm  W: {width_mm:.2f} mm  {status}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        color,
        2,
        cv2.LINE_AA,
    )

    os.makedirs(captures_dir, exist_ok=True)
    filename = f"{session_id}.jpg"
    output_path = os.path.join(captures_dir, filename)
    if not cv2.imwrite(output_path, frame):
        raise RuntimeError("Gambar hasil inspeksi gagal disimpan")

    return {
        "length_mm": length_mm,
        "width_mm": width_mm,
        "status": status,
        "source": f"Camera {CAMERA_INDEX + 1}",
        "notes": notes,
        "image_path": f"captures/{filename}",
    }
