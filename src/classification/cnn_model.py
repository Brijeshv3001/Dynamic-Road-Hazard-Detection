"""Fallback CNN hazard classifier using PyTorch."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Tuple

import torch
import torch.nn as nn
import torch.optim as optim
from PIL import Image
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms


class HazardCNN(nn.Module):
    """Compact CNN classifier for fallback hazard classification."""

    def __init__(self, num_classes: int) -> None:
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Linear(64, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = x.flatten(1)
        return self.classifier(x)


@dataclass
class ImageRecord:
    path: Path
    label: int


class FolderImageDataset(Dataset):
    """Simple dataset: root/class_name/*.jpg"""

    def __init__(self, root: str, class_names: List[str], image_size: int = 128) -> None:
        self.root = Path(root)
        self.class_names = class_names
        self.records: List[ImageRecord] = []
        self.transform = transforms.Compose(
            [
                transforms.Resize((image_size, image_size)),
                transforms.RandomHorizontalFlip(),
                transforms.RandomRotation(15),
                transforms.ColorJitter(brightness=0.25),
                transforms.ToTensor(),
            ]
        )

        for idx, class_name in enumerate(class_names):
            class_dir = self.root / class_name
            if not class_dir.exists():
                continue
            for image_path in class_dir.glob("*.*"):
                if image_path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp"}:
                    self.records.append(ImageRecord(path=image_path, label=idx))

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, index: int) -> Tuple[torch.Tensor, int]:
        record = self.records[index]
        image = Image.open(record.path).convert("RGB")
        image_tensor = self.transform(image)
        return image_tensor, record.label


def train_cnn(
    train_dir: str,
    class_names: List[str],
    out_path: str,
    device: str = "cpu",
    epochs: int = 10,
    lr: float = 1e-3,
    batch_size: int = 16,
) -> None:
    """Train fallback CNN classifier."""
    dataset = FolderImageDataset(train_dir, class_names)
    if len(dataset) == 0:
        raise ValueError("No training images found for CNN fallback training.")

    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    model = HazardCNN(num_classes=len(class_names)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        for images, labels in loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            logits = model(images)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        print(f"[CNN] Epoch {epoch+1}/{epochs} loss={running_loss / max(1, len(loader)):.4f}")

    Path(out_path).parent.mkdir(parents=True, exist_ok=True)
    torch.save({"state_dict": model.state_dict(), "class_names": class_names}, out_path)


def predict_image(model_path: str, image_tensor: torch.Tensor, device: str = "cpu") -> Tuple[int, float, List[str]]:
    """Run single-image prediction with saved fallback CNN model."""
    checkpoint = torch.load(model_path, map_location=device)
    class_names = checkpoint["class_names"]
    model = HazardCNN(num_classes=len(class_names)).to(device)
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()

    with torch.no_grad():
        logits = model(image_tensor.to(device))
        probs = torch.softmax(logits, dim=1)
        conf, pred = torch.max(probs, dim=1)

    return int(pred.item()), float(conf.item()), class_names
