# 🚗 Dynamic Road Hazard Detection and Alert System using YOLOv6, IoT, and GPS

A production-style AI + IoT pipeline for detecting road hazards in real time, geotagging them with GPS, and publishing to a backend for monitoring and analytics.

---

## 🌐 Project Website & Live Demo

- **Project Website & Live Server**: [https://sentinel-road-hazard-ai.vercel.app](https://sentinel-road-hazard-ai.vercel.app)

---

## 1) Project Overview

This project detects the following hazards from camera/video:

- Potholes
- Speed breakers
- Road cracks
- Waterlogging
- Debris/obstacles

When a hazard is detected, the system captures:

- `hazard_type`
- `confidence`
- `timestamp`
- `gps.latitude`, `gps.longitude`

Then it sends events to:

- **FastAPI backend** (`HTTP`) OR
- **MQTT topic** (`IoT protocol mode`)

---

## 2) Architecture (AI + IoT Pipeline)

```mermaid
flowchart LR
    A[Camera/Webcam/Video] --> B[YOLOv6 Detector]
    B -->|Fallback if unavailable| C[CNN Classifier]
    B --> D[Hazard Event Builder]
    C --> D
    D --> E[GPS Module\n(simulated/real)]
    E --> F[IoT Sender\nHTTP or MQTT]
    F --> G[FastAPI Backend]
    G --> H[(SQLite + JSON Logs)]
    H --> I[Monitoring / Analytics / Dashboard]
```

---

## 3) Repository Structure

```text
road-hazard-detection-ai-iot/
│── data/
│── models/
│── src/
│   │── detection/
│   │   │── yolov6_infer.py
│   │   │── yolov6_train.py
│   │   │── evaluate.py
│   │── classification/
│   │   │── cnn_model.py
│   │── iot/
│   │   │── gps_module.py
│   │   │── send_data.py
│   │── backend/
│   │   │── server.py
│   │── utils/
│   │   │── config.py
│   │   │── logger.py
│── configs/
│   │── config.yaml
│── outputs/
│   │── logs/
│   │── models/
│── requirements.txt
│── README.md
│── main.py
```

---

## 4) Setup Instructions

### 4.1 Clone and install dependencies

```bash
git clone <your-repo-url>
cd road-hazard-detection-ai-iot
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

### 4.2 Optional YOLOv6 source setup (for training/inference with official repo)

```bash
git clone https://github.com/meituan/YOLOv6.git models/YOLOv6
pip install -r models/YOLOv6/requirements.txt
```

> If YOLOv6 weights/repo are unavailable, runtime falls back to the CNN model (if trained).

---

## 5) Dataset Preparation (Roboflow, YOLO format)

1. Collect and label hazard classes on Roboflow:
   - `pothole`, `speed_breaker`, `road_crack`, `waterlogging`, `debris`
2. Export dataset in **YOLO format**.
3. Place data under `data/` with standard split structure:

```text
data/
  images/
    train/
    val/
    test/
  labels/
    train/
    val/
    test/
```

4. Create `data/dataset.yaml`:

```yaml
train: data/images/train
val: data/images/val
test: data/images/test

nc: 5
names: ["pothole", "speed_breaker", "road_crack", "waterlogging", "debris"]
```

### 5.1 Augmentation

- Horizontal flip
- Rotation
- Brightness jitter

For fallback CNN, augmentation is applied in `FolderImageDataset` (`src/classification/cnn_model.py`).

---

## 6) Training

### 6.1 Train YOLOv6 detector

```bash
python -m src.detection.yolov6_train --config configs/config.yaml
```

Override example:

```bash
python -m src.detection.yolov6_train \
  --data-yaml data/dataset.yaml \
  --epochs 80 \
  --batch-size 16 \
  --img-size 640 \
  --device cuda
```

### 6.2 Train fallback CNN classifier

Organize fallback classification dataset:

```text
data/cnn_train/
  pothole/
  speed_breaker/
  road_crack/
  waterlogging/
  debris/
```

Then run from Python:

```python
from src.classification.cnn_model import train_cnn

train_cnn(
    train_dir="data/cnn_train",
    class_names=["pothole", "speed_breaker", "road_crack", "waterlogging", "debris"],
    out_path="models/cnn_fallback.pt",
    device="cuda",  # or cpu
    epochs=10,
)
```

---

## 7) Running Backend Server

```bash
python main.py --mode server
```

or

```bash
uvicorn src.backend.server:app --host 0.0.0.0 --port 8000
```

### API endpoints

- `GET /` health check
- `POST /hazards` receive hazard events
- `GET /hazards?limit=100` list latest logs

---

## 8) Real-Time Inference

### Webcam mode

```bash
python main.py --mode detect --display
```

### Video file mode

```bash
python main.py --mode detect --source path/to/video.mp4 --display
```

### Headless test mode

```bash
python main.py --mode detect --max-frames 100
```

---

## 9) Configurable Parameters

Edit `configs/config.yaml`:

- Detection threshold and model paths
- CPU/GPU device
- Input source (webcam/video)
- GPS base location + jitter
- IoT protocol: HTTP/MQTT
- Backend endpoint and DB path

---

## 10) Logging and Storage

- Structured logs: `outputs/logs/system.log`
- JSON event log: `outputs/logs/hazard_log.json`
- SQLite database: `outputs/logs/hazards.db`

---

## 11) Evaluation Metrics

`src/detection/evaluate.py` includes helper functions for:

- Precision
- Recall
- F1
- mAP (mean AP)

You can integrate these with your validation pipeline outputs.

---

## 12) Example Hazard Payload

```json
{
  "hazard_type": "pothole",
  "confidence": 0.87,
  "timestamp": "2026-04-12T10:30:00+00:00",
  "gps": {
    "latitude": 37.775812,
    "longitude": -122.418321,
    "gps_timestamp": "2026-04-12T10:30:00+00:00"
  }
}
```

---

## 13) Bonus ideas

- Streamlit dashboard for live hazard table + charts
- Folium/Leaflet map visualization of GPS-tagged hazards
- Severity scoring and route-level risk heatmaps

---

## 14) Production Notes

- Use real GPS hardware (e.g., NEO-6M) by replacing simulated GPS implementation.
- Add authentication for backend endpoints.
- Add retry queue for offline IoT connectivity.
- Containerize backend + inference worker using Docker.
- Add CI/CD checks (lint, tests, model validation).

---

## 15) Quick End-to-End Run

1. Start backend:

```bash
python main.py --mode server
```

2. In a second terminal, start detection:

```bash
python main.py --mode detect --display
```

3. Query logs:

```bash
curl http://127.0.0.1:8000/hazards
```

