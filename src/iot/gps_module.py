"""GPS module for hazard event geotagging."""

from __future__ import annotations

import random
from dataclasses import dataclass
from datetime import datetime, timezone


@dataclass
class GPSData:
    """Represents one GPS reading."""

    latitude: float
    longitude: float
    timestamp: str


class GPSModule:
    """Simulated GPS module with configurable jitter around a base location."""

    def __init__(self, base_latitude: float, base_longitude: float, jitter: float = 0.0015) -> None:
        self.base_latitude = base_latitude
        self.base_longitude = base_longitude
        self.jitter = jitter

    def get_location(self) -> GPSData:
        """Return a simulated current location and UTC timestamp."""
        lat = self.base_latitude + random.uniform(-self.jitter, self.jitter)
        lon = self.base_longitude + random.uniform(-self.jitter, self.jitter)
        return GPSData(
            latitude=round(lat, 6),
            longitude=round(lon, 6),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
