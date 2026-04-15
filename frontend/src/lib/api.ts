const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface RecreationSteps {
  iphone: string[];
  android: string[];
  snapseed: string[];
}

export interface AIAnalysis {
  color_temperature: string;
  exposure: string;
  shadows: string;
  highlights: string;
  saturation: string;
  contrast: string;
  grain: string;
  color_grade_style: string;
  lighting_type: string;
  estimated_shot_on: string;
  confidence_score: number;
  instagram_filter_match: string;
  recreation_steps: RecreationSteps;
  edge_case_flags: string[];
}

export interface AnalysisResponse {
  id: string;
  image_hash: string;
  exif_data: Record<string, unknown> | null;
  ai_analysis: AIAnalysis;
  settings_output: {
    device: string;
    recommended_steps: string[];
    all_steps: RecreationSteps;
    color_style: string;
    lighting: string;
    estimated_camera: string;
    filter_match: string;
  };
  low_confidence: boolean;
  edge_case_warnings: string[];
}

export interface FeedbackResponse {
  id: string;
  message: string;
}

export async function analyzeFile(
  file: File,
  device: "iphone" | "android"
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("device", device);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Analysis failed" }));
    throw new Error(err.detail || "Analysis failed");
  }

  return res.json();
}

export async function submitFeedback(
  analysisId: string,
  worked: boolean,
  rating: number,
  userDevice?: string
): Promise<FeedbackResponse> {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      analysis_id: analysisId,
      worked,
      rating,
      user_device: userDevice,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Feedback failed" }));
    throw new Error(err.detail || "Failed to submit feedback");
  }

  return res.json();
}
