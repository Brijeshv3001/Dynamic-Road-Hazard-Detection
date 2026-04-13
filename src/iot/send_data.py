"""IoT communication layer (HTTP + MQTT)."""

from __future__ import annotations

import json
from typing import Dict, Optional

import paho.mqtt.client as mqtt
import requests


class HazardPublisher:
    """Publish hazard events via HTTP or MQTT."""

    def __init__(
        self,
        protocol: str = "http",
        http_endpoint: Optional[str] = None,
        mqtt_broker: str = "localhost",
        mqtt_port: int = 1883,
        mqtt_topic: str = "road/hazards",
        timeout: int = 5,
    ) -> None:
        self.protocol = protocol.lower()
        self.http_endpoint = http_endpoint
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.mqtt_topic = mqtt_topic
        self.timeout = timeout

    def send(self, payload: Dict) -> Dict:
        """Send payload to configured endpoint and return status details."""
        if self.protocol == "http":
            return self._send_http(payload)
        if self.protocol == "mqtt":
            return self._send_mqtt(payload)
        raise ValueError(f"Unsupported protocol: {self.protocol}")

    def _send_http(self, payload: Dict) -> Dict:
        if not self.http_endpoint:
            raise ValueError("HTTP endpoint is required for protocol=http")

        response = requests.post(self.http_endpoint, json=payload, timeout=self.timeout)
        return {
            "protocol": "http",
            "status_code": response.status_code,
            "ok": response.ok,
            "response": response.text,
        }

    def _send_mqtt(self, payload: Dict) -> Dict:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        client.connect(self.mqtt_broker, self.mqtt_port, keepalive=60)
        result = client.publish(self.mqtt_topic, json.dumps(payload), qos=0, retain=False)
        client.disconnect()

        return {
            "protocol": "mqtt",
            "status_code": int(result.rc),
            "ok": result.rc == mqtt.MQTT_ERR_SUCCESS,
            "response": f"published_to:{self.mqtt_topic}",
        }
