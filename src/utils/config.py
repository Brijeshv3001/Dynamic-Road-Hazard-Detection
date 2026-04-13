"""Configuration helpers for the road hazard detection project."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict

import yaml


@dataclass
class Config:
    """Thin wrapper for nested dictionary configuration."""

    raw: Dict[str, Any]

    def get(self, *keys: str, default: Any = None) -> Any:
        """Safely fetch nested configuration keys."""
        value: Any = self.raw
        for key in keys:
            if not isinstance(value, dict) or key not in value:
                return default
            value = value[key]
        return value


def load_config(config_path: str | Path = "configs/config.yaml") -> Config:
    """Load YAML config into a Config object."""
    path = Path(config_path)
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    with path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f)

    return Config(raw=raw)
