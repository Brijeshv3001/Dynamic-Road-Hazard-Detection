"""Basic evaluation metrics for detection/classification logs."""

from __future__ import annotations

from typing import Dict, List


def precision_recall_f1(tp: int, fp: int, fn: int) -> Dict[str, float]:
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) else 0.0
    return {"precision": precision, "recall": recall, "f1": f1}


def mean_average_precision(per_class_ap: List[float]) -> float:
    if not per_class_ap:
        return 0.0
    return sum(per_class_ap) / len(per_class_ap)
