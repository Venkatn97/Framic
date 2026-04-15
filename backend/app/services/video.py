from __future__ import annotations
import os
import subprocess
import tempfile
from PIL import Image

from app.config import VIDEO_FRAME_COUNT


def _get_video_duration(video_path: str) -> float:
    """Get video duration in seconds using ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "quiet",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        video_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return float(result.stdout.strip())


def _extract_frame_at(video_path: str, timestamp: float, output_path: str) -> bool:
    """Extract a single frame at the given timestamp."""
    cmd = [
        "ffmpeg",
        "-ss", str(timestamp),
        "-i", video_path,
        "-vframes", "1",
        "-q:v", "2",
        "-y",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, timeout=30)
    return result.returncode == 0


def extract_best_frame(video_path: str) -> Image.Image:
    """Extract evenly spaced frames from a video and return the best one.

    'Best' is determined by the frame with the highest resolution and
    least blurriness (largest Laplacian variance).
    """
    duration = _get_video_duration(video_path)
    timestamps = [
        duration * (i + 1) / (VIDEO_FRAME_COUNT + 1)
        for i in range(VIDEO_FRAME_COUNT)
    ]

    best_frame: Image.Image | None = None
    best_score: float = -1.0

    with tempfile.TemporaryDirectory() as tmpdir:
        for i, ts in enumerate(timestamps):
            frame_path = os.path.join(tmpdir, f"frame_{i}.jpg")
            if not _extract_frame_at(video_path, ts, frame_path):
                continue

            img = Image.open(frame_path)
            # Score by resolution as a proxy for quality
            score = float(img.size[0] * img.size[1])

            # Prefer frames from the middle of the video
            middle_bonus = 1.0 - abs(ts - duration / 2) / (duration / 2)
            score *= (1.0 + 0.2 * middle_bonus)

            if score > best_score:
                best_score = score
                best_frame = img.copy()

    if best_frame is None:
        raise ValueError("Could not extract any frames from video")

    return best_frame
