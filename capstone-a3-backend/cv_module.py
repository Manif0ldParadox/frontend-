import logging
import os
import time

import cv2
import numpy as np


PIXELS_PER_MM = float(os.getenv("PIXELS_PER_MM", "10.0"))
TARGET_LENGTH_MM = float(os.getenv("TARGET_LENGTH_MM", "32.5"))
TARGET_WIDTH_MM = float(os.getenv("TARGET_WIDTH_MM", "12.5"))
LENGTH_TOLERANCE_MM = float(os.getenv("LENGTH_TOLERANCE_MM", "2.0"))
WIDTH_TOLERANCE_MM = float(os.getenv("WIDTH_TOLERANCE_MM", "2.0"))

MIN_AREA_PX = int(os.getenv("MIN_CONTOUR_AREA", "1000"))
MAX_AREA_RATIO = float(os.getenv("MAX_CONTOUR_AREA_RATIO", "0.85"))
MIN_ASPECT_RATIO = float(os.getenv("MIN_ASPECT_RATIO", "1.05"))
MAX_ASPECT_RATIO = float(os.getenv("MAX_ASPECT_RATIO", "15.0"))

logger = logging.getLogger(__name__)

# Internal and external camera indexes can differ between devices. On macOS,
# use test_camera.py or cv2.VideoCapture(index) to find the correct index.
CAMERA_INDEX = 0
CANNY_THRESHOLDS = ((30, 80), (50, 120), (80, 160))


def _capture_frame():
    camera = cv2.VideoCapture(CAMERA_INDEX)
    try:
        if not camera.isOpened():
            raise RuntimeError(
                f"Camera index {CAMERA_INDEX} gagal dibuka/dibaca. "
                "Coba ubah CAMERA_INDEX di cv_module.py."
            )

        camera.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        time.sleep(0.35)

        frame = None
        for _ in range(8):
            success, candidate = camera.read()
            if success and candidate is not None and candidate.size > 0:
                frame = candidate
            time.sleep(0.04)

        if frame is None:
            raise RuntimeError(
                f"Camera index {CAMERA_INDEX} gagal dibuka/dibaca. "
                "Coba ubah CAMERA_INDEX di cv_module.py."
            )

        logger.info("Using OpenCV camera index %s", CAMERA_INDEX)
        return frame, CAMERA_INDEX
    finally:
        camera.release()
        logger.info("Released OpenCV camera index %s", CAMERA_INDEX)


def _filter_contours(contours, frame_shape):
    frame_height, frame_width = frame_shape[:2]
    frame_area = frame_height * frame_width
    edge_margin = max(5, int(min(frame_height, frame_width) * 0.015))
    area_filtered = []
    preferred = []

    for contour in contours:
        area = cv2.contourArea(contour)
        if area < MIN_AREA_PX or area > frame_area * MAX_AREA_RATIO:
            continue

        x, y, width, height = cv2.boundingRect(contour)
        too_close_to_edge = (
            x <= edge_margin
            or y <= edge_margin
            or x + width >= frame_width - edge_margin
            or y + height >= frame_height - edge_margin
        )
        if too_close_to_edge:
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

    # Keep the largest plausible contour when the aspect-ratio filter is strict.
    return preferred or area_filtered


def _find_target_contour(frame, debug_image_path):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrasted = clahe.apply(gray)
    blurred = cv2.GaussianBlur(contrasted, (7, 7), 0)
    kernel = np.ones((3, 3), np.uint8)
    total_contours = 0
    total_valid = 0

    for lower_threshold, upper_threshold in CANNY_THRESHOLDS:
        edges = cv2.Canny(blurred, lower_threshold, upper_threshold)
        edges = cv2.morphologyEx(
            edges, cv2.MORPH_CLOSE, kernel, iterations=2
        )
        contours, _ = cv2.findContours(
            edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
        )
        valid_contours = _filter_contours(contours, frame.shape)
        total_contours += len(contours)
        total_valid += len(valid_contours)

        if valid_contours:
            logger.info(
                "Detected object with Canny thresholds (%s, %s): "
                "%s contours, %s valid",
                lower_threshold,
                upper_threshold,
                len(contours),
                len(valid_contours),
            )
            return max(valid_contours, key=cv2.contourArea)

    raise ValueError(
        "Objek tidak terdeteksi. Kemungkinan background tidak polos/kontras, "
        "cahaya terlalu silau atau gelap, atau objek terlalu kecil/jauh. "
        f"Debug image: {debug_image_path}. "
        f"Contour ditemukan: {total_contours}; contour valid: {total_valid}."
    )


def _is_within_tolerance(value, target, tolerance):
    return target - tolerance <= value <= target + tolerance


def run_inspection(session_id, captures_dir):
    if PIXELS_PER_MM <= 0:
        raise RuntimeError("PIXELS_PER_MM harus lebih besar dari 0")

    frame, camera_index = _capture_frame()
    os.makedirs(captures_dir, exist_ok=True)
    debug_filename = f"{session_id}_debug_raw.jpg"
    debug_output_path = os.path.join(captures_dir, debug_filename)
    if not cv2.imwrite(debug_output_path, frame):
        raise RuntimeError("Debug raw frame gagal disimpan")

    contour = _find_target_contour(
        frame, debug_image_path=f"captures/{debug_filename}"
    )
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
    notes = f"{notes}. Captured with camera index {camera_index}."

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

    filename = f"{session_id}.jpg"
    output_path = os.path.join(captures_dir, filename)
    if not cv2.imwrite(output_path, frame):
        raise RuntimeError("Gambar hasil inspeksi gagal disimpan")

    return {
        "length_mm": length_mm,
        "width_mm": width_mm,
        "status": status,
        "source": f"cv_module_camera_{camera_index}",
        "notes": notes,
        "image_path": f"captures/{filename}",
    }
