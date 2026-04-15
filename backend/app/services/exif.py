from __future__ import annotations
import piexif
from PIL import Image


def extract_exif(image: Image.Image) -> dict | None:
    """Extract EXIF metadata from an image. Returns None if unavailable."""
    try:
        info = image.info.get("exif")
        if not info:
            return None

        exif_dict = piexif.load(info)
        result: dict = {}

        tag_names = {
            piexif.ExifIFD.ExposureTime: "exposure_time",
            piexif.ExifIFD.FNumber: "f_number",
            piexif.ExifIFD.ISOSpeedRatings: "iso",
            piexif.ExifIFD.FocalLength: "focal_length",
            piexif.ExifIFD.WhiteBalance: "white_balance",
            piexif.ExifIFD.Flash: "flash",
            piexif.ExifIFD.LensMake: "lens_make",
            piexif.ExifIFD.LensModel: "lens_model",
            piexif.ExifIFD.ExposureBiasValue: "exposure_bias",
            piexif.ExifIFD.MeteringMode: "metering_mode",
        }

        zeroth_names = {
            piexif.ImageIFD.Make: "camera_make",
            piexif.ImageIFD.Model: "camera_model",
            piexif.ImageIFD.Software: "software",
        }

        for tag_id, name in tag_names.items():
            val = exif_dict.get("Exif", {}).get(tag_id)
            if val is not None:
                if isinstance(val, bytes):
                    val = val.decode("utf-8", errors="ignore")
                elif isinstance(val, tuple) and len(val) == 2:
                    val = f"{val[0]}/{val[1]}"
                result[name] = val

        for tag_id, name in zeroth_names.items():
            val = exif_dict.get("0th", {}).get(tag_id)
            if val is not None:
                if isinstance(val, bytes):
                    val = val.decode("utf-8", errors="ignore")
                result[name] = val

        return result if result else None
    except Exception:
        return None


def detect_edge_cases_from_exif(exif_data: dict | None) -> list[str]:
    """Detect edge case flags from EXIF data."""
    flags: list[str] = []
    if exif_data is None:
        flags.append("exif_missing")
        return flags

    model = str(exif_data.get("camera_model", "")).lower()
    make = str(exif_data.get("camera_make", "")).lower()
    software = str(exif_data.get("software", "")).lower()

    # Detect DSLR/mirrorless
    dslr_brands = ["canon", "nikon", "sony", "fujifilm", "panasonic", "olympus", "leica"]
    if any(b in make for b in dslr_brands) and "iphone" not in model and "pixel" not in model:
        flags.append("dslr_footage")

    # Detect AI generation
    ai_tools = ["stable diffusion", "midjourney", "dall-e", "firefly", "comfyui"]
    if any(t in software for t in ai_tools):
        flags.append("ai_generated")

    return flags
