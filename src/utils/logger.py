"""Logging utilities."""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Dict, List


def setup_logger(log_file: str) -> logging.Logger:
    """Create and configure project logger."""
    logger = logging.getLogger("road_hazard")
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if logger.handlers:
        return logger

    Path(log_file).parent.mkdir(parents=True, exist_ok=True)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    fh = logging.FileHandler(log_file, encoding="utf-8")
    fh.setFormatter(formatter)
    logger.addHandler(fh)

    sh = logging.StreamHandler()
    sh.setFormatter(formatter)
    logger.addHandler(sh)

    return logger


def append_json_log(path: str, event: Dict) -> None:
    """Append hazard event to a JSON list file."""
    file_path = Path(path)
    file_path.parent.mkdir(parents=True, exist_ok=True)

    if file_path.exists():
        with file_path.open("r", encoding="utf-8") as f:
            try:
                data: List[Dict] = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    data.append(event)
    with file_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
