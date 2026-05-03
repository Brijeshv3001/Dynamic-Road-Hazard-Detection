export const HAZARD_COLORS = {
  person: '#ff3a3a', // PEDESTRIAN - CRITICAL
  bicycle: '#ff6b35', // CYCLIST - HIGH
  motorcycle: '#ff8c00', // MOTORCYCLE - HIGH
  car: '#ffb800', // VEHICLE - MEDIUM
  truck: '#ff6b00', // TRUCK - HIGH
  bus: '#e8a100', // BUS - HIGH
  traffic_light: '#00d4ff', // TRAFFIC LIGHT - INFO
  stop_sign: '#ff3a3a', // STOP SIGN - HIGH
  dog: '#ff6b35', // ANIMAL - HIGH
  cat: '#ff6b35', // ANIMAL - HIGH
  backpack: '#a0aec0', // OBSTACLE - MEDIUM
  suitcase: '#a0aec0', // OBSTACLE - MEDIUM
  default: '#a0aec0'
};

export const getHazardSeverity = (category) => {
  if (['person'].includes(category)) return 'CRITICAL';
  if (['bicycle', 'motorcycle', 'truck', 'bus', 'stop_sign', 'dog', 'cat'].includes(category)) return 'HIGH';
  if (['car', 'backpack', 'suitcase'].includes(category)) return 'MEDIUM';
  if (['traffic_light'].includes(category)) return 'INFO';
  return 'UNKNOWN';
};

export const drawBoxes = (predictions, ctx, width, height) => {
  ctx.clearRect(0, 0, width, height);

  predictions.forEach(prediction => {
    // COCO-SSD returns [x, y, width, height]
    const [x, y, w, h] = prediction.bbox;
    const category = prediction.class;
    const confidence = Math.round(prediction.score * 100);

    // Apply 0.45 confidence threshold
    if (prediction.score < 0.45) return;

    const color = HAZARD_COLORS[category] || HAZARD_COLORS.default;

    // Set glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;

    // Draw thin main border
    ctx.strokeRect(x, y, w, h);

    // Draw semi-transparent fill
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1.0;

    // Draw L-shaped corner brackets (accent marks)
    const bracketLen = Math.min(20, w / 4, h / 4);
    ctx.lineWidth = 4;
    ctx.shadowBlur = 24; // slightly more glow for corners

    ctx.beginPath();
    // Top-left
    ctx.moveTo(x, y + bracketLen);
    ctx.lineTo(x, y);
    ctx.lineTo(x + bracketLen, y);

    // Top-right
    ctx.moveTo(x + w - bracketLen, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + bracketLen);

    // Bottom-right
    ctx.moveTo(x + w, y + h - bracketLen);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w - bracketLen, y + h);

    // Bottom-left
    ctx.moveTo(x + bracketLen, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + h - bracketLen);
    ctx.stroke();

    // Reset shadow for text
    ctx.shadowBlur = 0;

    // Draw Label Chip
    const labelText = `${category.toUpperCase()} ${confidence}%`;
    ctx.font = 'bold 14px "Space Mono", monospace';
    const textWidth = ctx.measureText(labelText).width;
    
    ctx.fillStyle = color;
    ctx.fillRect(x, y - 24, textWidth + 16, 24);

    ctx.fillStyle = '#000000';
    ctx.fillText(labelText, x + 8, y - 7);
  });
};
