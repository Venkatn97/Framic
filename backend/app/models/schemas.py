from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional


class RecreationSteps(BaseModel):
    iphone: list[str] = Field(default_factory=list)
    android: list[str] = Field(default_factory=list)
    snapseed: list[str] = Field(default_factory=list)


class AIAnalysis(BaseModel):
    color_temperature: str = ""
    exposure: str = ""
    shadows: str = ""
    highlights: str = ""
    saturation: str = ""
    contrast: str = ""
    grain: str = ""
    color_grade_style: str = ""
    lighting_type: str = ""
    estimated_shot_on: str = ""
    confidence_score: int = 0
    instagram_filter_match: str = ""
    recreation_steps: RecreationSteps = Field(default_factory=RecreationSteps)
    edge_case_flags: list[str] = Field(default_factory=list)


class AnalysisResponse(BaseModel):
    id: str
    image_hash: str
    exif_data: Optional[dict] = None
    ai_analysis: AIAnalysis
    settings_output: dict
    low_confidence: bool = False
    edge_case_warnings: list[str] = Field(default_factory=list)


class FeedbackRequest(BaseModel):
    analysis_id: str
    worked: bool
    rating: int = Field(ge=1, le=5)
    user_device: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    message: str = "Feedback recorded. Thank you!"
