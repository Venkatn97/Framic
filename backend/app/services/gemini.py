import json
import re
import google.generativeai as genai
from PIL import Image

from app.config import GEMINI_API_KEY
from app.models.schemas import AIAnalysis

ANALYSIS_PROMPT = """You are a professional photography and color grading expert. Analyze this image and reverse engineer the exact camera settings, color grading, and editing adjustments used.

Return ONLY a valid JSON object with these exact fields. No markdown, no backticks, no explanation — just raw JSON:

{
  "color_temperature": "warm/cool/neutral with Kelvin estimate e.g. 'warm (~5500K)'",
  "exposure": "description e.g. '+0.5 slightly overexposed'",
  "shadows": "lifted/crushed/natural with estimated value e.g. 'lifted (+20)'",
  "highlights": "pulled/blown/natural with estimated value e.g. 'pulled (-15)'",
  "saturation": "high/medium/low/desaturated with estimated value e.g. 'medium (-10)'",
  "contrast": "high/medium/low/flat with estimated value e.g. 'medium (+5)'",
  "grain": "none/subtle/heavy with estimated amount e.g. 'subtle (15%)'",
  "color_grade_style": "name the color grading style e.g. 'film noir', 'teal and orange', 'faded film', 'vibrant pop'",
  "lighting_type": "natural/studio/golden hour/flash/backlit/overcast etc.",
  "estimated_shot_on": "best guess of camera or phone model used",
  "confidence_score": 75,
  "instagram_filter_match": "closest Instagram or VSCO filter match, or 'none'",
  "recreation_steps": {
    "iphone": ["step 1...", "step 2...", "step 3..."],
    "android": ["step 1...", "step 2...", "step 3..."],
    "snapseed": ["step 1...", "step 2...", "step 3..."]
  },
  "edge_case_flags": []
}

For edge_case_flags, include any of these that apply:
- "portrait_mode" if the image appears to use portrait/bokeh mode
- "ai_generated" if the image appears AI-generated
- "heavy_compression" if the image has visible JPEG compression artifacts
- "dslr_footage" if this appears shot on a professional DSLR/mirrorless camera
- "black_and_white" if the image is monochrome/B&W
- "heavy_filter" if a heavy filter makes analysis unreliable

For recreation_steps, provide specific, actionable steps someone can follow on their phone to recreate this look. Include exact slider values where possible.

confidence_score should be 0-100 based on how confident you are in the analysis. Lower it if the image is heavily filtered, compressed, or ambiguous."""


def _configure() -> None:
    genai.configure(api_key=GEMINI_API_KEY)


def _strip_markdown(text: str) -> str:
    """Remove markdown code fences and backticks from response."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _parse_response(text: str) -> dict:
    cleaned = _strip_markdown(text)
    return json.loads(cleaned)


async def analyze_image(image: Image.Image) -> AIAnalysis:
    """Send an image to Gemini 1.5 Flash and get structured analysis back."""
    _configure()
    model = genai.GenerativeModel("gemini-1.5-flash")

    last_error: Exception | None = None
    for attempt in range(2):
        try:
            response = model.generate_content([ANALYSIS_PROMPT, image])
            data = _parse_response(response.text)
            return AIAnalysis(**data)
        except (json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            if attempt == 0:
                continue
            break
        except Exception as exc:
            last_error = exc
            break

    # Return a low-confidence fallback on failure
    return AIAnalysis(
        color_temperature="unknown",
        exposure="unknown",
        confidence_score=0,
        edge_case_flags=["analysis_failed"],
        color_grade_style=f"Analysis error: {last_error}",
    )
