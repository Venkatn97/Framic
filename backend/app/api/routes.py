from __future__ import annotations
import hashlib
import os
import tempfile
from typing import Optional

from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from PIL import Image

from app.config import (
    ALLOWED_IMAGE_TYPES,
    ALLOWED_VIDEO_TYPES,
    CONFIDENCE_DISCLAIMER_THRESHOLD,
    MAX_FILE_SIZE_MB,
)
from app.database import get_supabase
from app.models.schemas import (
    AIAnalysis,
    AnalysisResponse,
    FeedbackRequest,
    FeedbackResponse,
)
from app.services.exif import detect_edge_cases_from_exif, extract_exif
from app.services.gemini import analyze_image
from app.services.video import extract_best_frame

router = APIRouter()


def _build_settings_output(analysis: AIAnalysis, device: str) -> dict:
    """Map AI analysis into user-friendly phone settings."""
    steps_map = {
        "iphone": analysis.recreation_steps.iphone,
        "android": analysis.recreation_steps.android,
        "snapseed": analysis.recreation_steps.snapseed,
    }
    return {
        "device": device,
        "recommended_steps": steps_map.get(device, steps_map["iphone"]),
        "all_steps": {
            "iphone": analysis.recreation_steps.iphone,
            "android": analysis.recreation_steps.android,
            "snapseed": analysis.recreation_steps.snapseed,
        },
        "color_style": analysis.color_grade_style,
        "lighting": analysis.lighting_type,
        "estimated_camera": analysis.estimated_shot_on,
        "filter_match": analysis.instagram_filter_match,
    }


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(
    file: UploadFile = File(...),
    device: Optional[str] = Form("iphone"),
):
    """Accept an image or video upload, extract metadata, analyze with Gemini,
    and return full camera settings analysis."""

    if not file.content_type:
        raise HTTPException(status_code=400, detail="Could not determine file type")

    is_image = file.content_type in ALLOWED_IMAGE_TYPES
    is_video = file.content_type in ALLOWED_VIDEO_TYPES

    if not is_image and not is_video:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. "
            f"Accepted: {ALLOWED_IMAGE_TYPES | ALLOWED_VIDEO_TYPES}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB}MB",
        )

    image_hash = hashlib.sha256(contents).hexdigest()[:16]

    # Get the image to analyze
    if is_video:
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        try:
            image = extract_best_frame(tmp_path)
        finally:
            os.unlink(tmp_path)
        exif_data = None
    else:
        import io
        image = Image.open(io.BytesIO(contents))
        exif_data = extract_exif(image)

    # Detect edge cases from EXIF
    exif_flags = detect_edge_cases_from_exif(exif_data)

    # Run Gemini analysis
    ai_analysis = await analyze_image(image)

    # Merge edge case flags
    all_flags = list(set(ai_analysis.edge_case_flags + exif_flags))
    ai_analysis.edge_case_flags = all_flags

    # Build settings output
    device_type = device if device in ("iphone", "android") else "iphone"
    settings_output = _build_settings_output(ai_analysis, device_type)

    low_confidence = ai_analysis.confidence_score < CONFIDENCE_DISCLAIMER_THRESHOLD

    # Log to Supabase (optional — works without it)
    record_id = image_hash
    try:
        db = get_supabase()
        if db is not None:
            row = {
                "image_hash": image_hash,
                "exif_data": exif_data,
                "ai_analysis": ai_analysis.model_dump(),
                "settings_output": settings_output,
            }
            result = db.table("analyses").insert(row).execute()
            record_id = result.data[0]["id"]
    except Exception:
        pass

    return AnalysisResponse(
        id=str(record_id),
        image_hash=image_hash,
        exif_data=exif_data,
        ai_analysis=ai_analysis,
        settings_output=settings_output,
        low_confidence=low_confidence,
        edge_case_warnings=all_flags,
    )


@router.post("/feedback", response_model=FeedbackResponse)
async def feedback(body: FeedbackRequest):
    """Record user feedback for a given analysis."""
    db = get_supabase()
    if db is None:
        # Supabase not configured — accept feedback silently
        return FeedbackResponse(id="local", message="Feedback noted (database not configured)")

    try:
        row = {
            "analysis_id": body.analysis_id,
            "worked": body.worked,
            "rating": body.rating,
            "user_device": body.user_device,
        }
        result = db.table("feedback").insert(row).execute()
        record_id = result.data[0]["id"]
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to record feedback: {exc}",
        )

    return FeedbackResponse(id=str(record_id))
