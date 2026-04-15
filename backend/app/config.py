import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")

MAX_FILE_SIZE_MB: int = 50
ALLOWED_IMAGE_TYPES: set[str] = {"image/jpeg", "image/png", "image/webp", "image/heic"}
ALLOWED_VIDEO_TYPES: set[str] = {"video/mp4", "video/quicktime", "video/x-msvideo"}
VIDEO_FRAME_COUNT: int = 5
CONFIDENCE_DISCLAIMER_THRESHOLD: int = 60
