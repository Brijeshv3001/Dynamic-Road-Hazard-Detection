"""Real-time hazard detection inference with YOLOv6 + IoT event publishing."""

from __future__ import annotations

import argparse
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np
import torch
from torchvision import transforms

from src.classification.cnn_model import predict_image
from src.iot.gps_module import GPSModule
from src.iot.send_data import HazardPublisher
from src.utils.config import load_config
from src.utils.logger import append_json_log, setup_logger


@dataclass
class Detection:
    class_name: str
    confidence: float
    bbox: Tuple[int, int, int, int]


class HazardDetector:
    """Hazard detector with YOLOv6-first strategy and a CNN fallback option."""

    def __init__(
        self,
        class_names: List[str],
        model_path: str,
        cnn_model_path: str,
        confidence_threshold: float,
        device: str,
    ) -> None:
        self.class_names = class_names
        self.model_path = model_path
        self.cnn_model_path = cnn_model_path
        self.confidence_threshold = confidence_threshold
        self.device = self._resolve_device(device)
        self.yolo_model = self._load_yolo_model()
        self.cnn_transform = transforms.Compose(
            [
                transforms.ToPILImage(),
                transforms.Resize((128, 128)),
                transforms.ToTensor(),
            ]
        )

    def _resolve_device(self, device: str) -> str:
        if device == "cuda" and torch.cuda.is_available():
            return "cuda"
        return "cpu"

    def _load_yolo_model(self):
        """Load YOLOv6 model via torch.hub if possible; otherwise return None."""
        if not Path(self.model_path).exists():
            return None
        try:
            model = torch.hub.load(
                "meituan/YOLOv6",
                "custom",
                path=self.model_path,
                source="github",
                trust_repo=True,
            )
            model.to(self.device)
            model.eval()
            return model
        except Exception:
            return None

    def detect(self, frame: np.ndarray) -> List[Detection]:
        if self.yolo_model is not None:
            yolo_detections = self._detect_with_yolo(frame)
            if yolo_detections:
                return yolo_detections

        return self._detect_with_fallback_cnn(frame)

    def _detect_with_yolo(self, frame: np.ndarray) -> List[Detection]:
        detections: List[Detection] = []
        try:
            results = self.yolo_model(frame)
            preds = results.xyxy[0].cpu().numpy() if hasattr(results, "xyxy") else []
            for row in preds:
                x1, y1, x2, y2, conf, cls_idx = row[:6]
                if conf < self.confidence_threshold:
                    continue
                cls_idx = int(cls_idx)
                class_name = self.class_names[cls_idx] if cls_idx < len(self.class_names) else f"class_{cls_idx}"
                detections.append(
                    Detection(
                        class_name=class_name,
                        confidence=float(conf),
                        bbox=(int(x1), int(y1), int(x2), int(y2)),
                    )
                )
        except Exception:
            return []
        return detections

    def _detect_with_fallback_cnn(self, frame: np.ndarray) -> List[Detection]:
        if not Path(self.cnn_model_path).exists():
            return []

        input_tensor = self.cnn_transform(frame).unsqueeze(0)
        pred_idx, conf, class_names = predict_image(self.cnn_model_path, input_tensor, device=self.device)
        if conf < self.confidence_threshold:
            return []

        h, w = frame.shape[:2]
        return [
            Detection(
                class_name=class_names[pred_idx],
                confidence=conf,
                bbox=(int(0.1 * w), int(0.1 * h), int(0.9 * w), int(0.9 * h)),
            )
        ]


def draw_detections(frame: np.ndarray, detections: List[Detection]) -> np.ndarray:
    """Draw bounding boxes and class labels on frame."""
    for det in detections:
        x1, y1, x2, y2 = det.bbox
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
        text = f"{det.class_name} {det.confidence:.2f}"
        cv2.putText(frame, text, (x1, max(20, y1 - 10)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
    return frame


def build_event(det: Detection, gps_module: GPSModule) -> dict:
    """Build standardized hazard event payload."""
    gps = gps_module.get_location()
    return {
        "hazard_type": det.class_name,
        "confidence": round(det.confidence, 4),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "gps": {
            "latitude": gps.latitude,
            "longitude": gps.longitude,
            "gps_timestamp": gps.timestamp,
        },
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Real-time YOLOv6 hazard detection")
    parser.add_argument("--config", type=str, default="configs/config.yaml")
    parser.add_argument("--source", type=str, default=None, help="Webcam index or video file path")
    parser.add_argument("--display", action="store_true", help="Display inference window")
    parser.add_argument("--max-frames", type=int, default=0, help="Process up to N frames (0 = unlimited)")
    return parser.parse_args()


def run_inference(config_path: str, source: str | None = None, display: bool = False, max_frames: int = 0) -> None:
    cfg = load_config(config_path)
    logger = setup_logger(cfg.get("logging", "log_file"))

    detector = HazardDetector(
        class_names=cfg.get("detection", "class_names", default=[]),
        model_path=cfg.get("detection", "model_path"),
        cnn_model_path=cfg.get("detection", "cnn_model_path"),
        confidence_threshold=cfg.get("detection", "confidence_threshold", default=0.4),
        device=cfg.get("detection", "device", default="cpu"),
    )

    gps_module = GPSModule(
        base_latitude=cfg.get("gps", "base_latitude", default=0.0),
        base_longitude=cfg.get("gps", "base_longitude", default=0.0),
        jitter=cfg.get("gps", "jitter", default=0.0015),
    )

    publisher = HazardPublisher(
        protocol=cfg.get("iot", "protocol", default="http"),
        http_endpoint=cfg.get("iot", "http_endpoint"),
        mqtt_broker=cfg.get("iot", "mqtt", "broker", default="localhost"),
        mqtt_port=cfg.get("iot", "mqtt", "port", default=1883),
        mqtt_topic=cfg.get("iot", "mqtt", "topic", default="road/hazards"),
    )

    src = source if source is not None else cfg.get("input", "source", default=0)
    if isinstance(src, str) and src.isdigit():
        src = int(src)

    cap = cv2.VideoCapture(src)
    if not cap.isOpened():
        raise RuntimeError(f"Unable to open source: {src}")

    frame_count = 0
    min_publish_interval_sec = 1.5
    last_sent_at = 0.0

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break

            detections = detector.detect(frame)
            annotated = draw_detections(frame.copy(), detections)

            now = time.time()
            for det in detections:
                event = build_event(det, gps_module)
                append_json_log(cfg.get("logging", "hazard_log_json"), event)

                if now - last_sent_at >= min_publish_interval_sec:
                    try:
                        resp = publisher.send(event)
                        logger.info("event_sent=%s", resp)
                    except Exception as exc:
                        logger.warning("event_send_failed=%s", exc)
                    last_sent_at = now

                logger.info("hazard_detected=%s", event)

            if display:
                cv2.imshow("Road Hazard Detection", annotated)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break

            frame_count += 1
            if max_frames > 0 and frame_count >= max_frames:
                break

    finally:
        cap.release()
        if display:
            cv2.destroyAllWindows()


def main() -> None:
    args = parse_args()
    run_inference(args.config, args.source, args.display, args.max_frames)


if __name__ == "__main__":
    main()
