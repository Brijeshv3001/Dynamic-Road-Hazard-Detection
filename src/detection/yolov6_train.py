"""YOLOv6 training entrypoint for hazard detection datasets in YOLO format."""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

from src.utils.config import load_config


def run_yolov6_training(
    data_yaml: str,
    epochs: int,
    batch_size: int,
    img_size: int,
    device: str,
    output_dir: str,
) -> None:
    """Call official YOLOv6 training script if repository exists."""
    yolov6_dir = Path("models/YOLOv6")
    train_script = yolov6_dir / "tools" / "train.py"

    if not train_script.exists():
        raise FileNotFoundError(
            "YOLOv6 repo not found at models/YOLOv6. "
            "Clone it: git clone https://github.com/meituan/YOLOv6.git models/YOLOv6"
        )

    cmd = [
        sys.executable,
        str(train_script),
        "--data-path",
        data_yaml,
        "--epochs",
        str(epochs),
        "--batch-size",
        str(batch_size),
        "--img-size",
        str(img_size),
        "--device",
        device,
        "--output-dir",
        output_dir,
    ]

    print("Running:", " ".join(cmd))
    subprocess.run(cmd, check=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train YOLOv6 on road hazard dataset")
    parser.add_argument("--config", type=str, default="configs/config.yaml")
    parser.add_argument("--data-yaml", type=str, default=None)
    parser.add_argument("--epochs", type=int, default=None)
    parser.add_argument("--batch-size", type=int, default=None)
    parser.add_argument("--img-size", type=int, default=None)
    parser.add_argument("--device", type=str, default=None)
    parser.add_argument("--output-dir", type=str, default=None)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    cfg = load_config(args.config)

    run_yolov6_training(
        data_yaml=args.data_yaml or cfg.get("training", "data_yaml"),
        epochs=args.epochs or cfg.get("training", "epochs", default=50),
        batch_size=args.batch_size or cfg.get("training", "batch_size", default=16),
        img_size=args.img_size or cfg.get("training", "img_size", default=640),
        device=args.device or cfg.get("detection", "device", default="cpu"),
        output_dir=args.output_dir or cfg.get("training", "output_dir", default="outputs/models"),
    )


if __name__ == "__main__":
    main()
