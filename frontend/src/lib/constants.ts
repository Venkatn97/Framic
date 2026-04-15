export const EDGE_CASE_LABELS: Record<string, string> = {
  portrait_mode:
    "Portrait mode detected — depth blur may affect color analysis accuracy.",
  ai_generated:
    "This image appears to be AI-generated. Settings may not map to real camera adjustments.",
  heavy_compression:
    "Heavy compression detected — fine detail and grain analysis may be unreliable.",
  dslr_footage:
    "Shot on a professional camera. Phone recreation will be approximate.",
  black_and_white:
    "Black & white image — color temperature and saturation values are estimated.",
  heavy_filter:
    "Heavy filter detected — original settings are difficult to determine.",
  exif_missing:
    "No EXIF metadata found (common with Instagram/social media). Using visual analysis only.",
  analysis_failed:
    "AI analysis encountered an error. Results may be incomplete.",
};

export const ACCEPTED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/heic": [".heic"],
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
};
