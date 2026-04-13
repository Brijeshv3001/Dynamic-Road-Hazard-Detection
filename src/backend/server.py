"""FastAPI backend for receiving and querying hazard events."""

from __future__ import annotations

import sqlite3
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

DB_PATH = Path("outputs/logs/hazards.db")


class GPSPayload(BaseModel):
    latitude: float
    longitude: float
    gps_timestamp: str


class HazardPayload(BaseModel):
    hazard_type: str = Field(..., examples=["pothole"])
    confidence: float = Field(..., ge=0.0, le=1.0)
    timestamp: str
    gps: GPSPayload


app = FastAPI(title="Road Hazard Backend API", version="1.0.0")


def get_conn() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    with get_conn() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS hazards (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                hazard_type TEXT NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                gps_timestamp TEXT NOT NULL
            )
            """
        )


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/")
def health() -> dict:
    return {"status": "ok", "service": "road-hazard-backend"}


@app.post("/hazards")
def create_hazard(payload: HazardPayload) -> dict:
    with get_conn() as conn:
        cur = conn.execute(
            """
            INSERT INTO hazards (hazard_type, confidence, timestamp, latitude, longitude, gps_timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                payload.hazard_type,
                payload.confidence,
                payload.timestamp,
                payload.gps.latitude,
                payload.gps.longitude,
                payload.gps.gps_timestamp,
            ),
        )
        hazard_id = cur.lastrowid
    return {"message": "hazard stored", "id": hazard_id}


@app.get("/hazards")
def list_hazards(limit: int = 100) -> List[dict]:
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="limit should be 1..1000")

    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, hazard_type, confidence, timestamp, latitude, longitude, gps_timestamp
            FROM hazards
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()

    return [
        {
            "id": r[0],
            "hazard_type": r[1],
            "confidence": r[2],
            "timestamp": r[3],
            "gps": {"latitude": r[4], "longitude": r[5], "gps_timestamp": r[6]},
        }
        for r in rows
    ]


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.backend.server:app", host="0.0.0.0", port=8000, reload=False)
