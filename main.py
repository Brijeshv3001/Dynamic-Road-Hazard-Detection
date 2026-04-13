"""Main entrypoint for running backend or detection pipeline."""

from __future__ import annotations

import argparse
import subprocess
import sys

from src.detection.yolov6_infer import run_inference


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Dynamic Road Hazard Detection and Alert System")
    parser.add_argument("--mode", choices=["detect", "server"], default="detect")
    parser.add_argument("--config", type=str, default="configs/config.yaml")
    parser.add_argument("--source", type=str, default=None)
    parser.add_argument("--display", action="store_true")
    parser.add_argument("--max-frames", type=int, default=0)
    return parser.parse_args()


def run_server() -> None:
    cmd = [sys.executable, "-m", "uvicorn", "src.backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
    subprocess.run(cmd, check=True)


def main() -> None:
    args = parse_args()

    if args.mode == "server":
        run_server()
    else:
        run_inference(args.config, source=args.source, display=args.display, max_frames=args.max_frames)


if __name__ == "__main__":
    main()
