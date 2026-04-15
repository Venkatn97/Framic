"use client";

import { useState } from "react";
import type { AnalysisResponse } from "@/lib/api";
import { EDGE_CASE_LABELS } from "@/lib/constants";

interface ResultsCardProps {
  data: AnalysisResponse;
}

type Tab = "iphone" | "android" | "snapseed";

export default function ResultsCard({ data }: ResultsCardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("iphone");
  const { ai_analysis: analysis, settings_output: settings } = data;

  const tabs: { key: Tab; label: string }[] = [
    { key: "iphone", label: "iPhone" },
    { key: "android", label: "Android" },
    { key: "snapseed", label: "Snapseed" },
  ];

  const steps = settings.all_steps[activeTab] || [];

  const confidenceColor =
    analysis.confidence_score >= 80
      ? "text-green-400"
      : analysis.confidence_score >= 60
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Edge case warnings */}
      {data.edge_case_warnings.length > 0 && (
        <div className="space-y-2">
          {data.edge_case_warnings.map((flag) => (
            <div
              key={flag}
              className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-4 py-3 text-yellow-300 text-sm"
            >
              {EDGE_CASE_LABELS[flag] || flag}
            </div>
          ))}
        </div>
      )}

      {/* Low confidence disclaimer */}
      {data.low_confidence && (
        <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm">
          Low confidence analysis ({analysis.confidence_score}%). Results may not
          be accurate — the image may be heavily filtered, compressed, or
          ambiguous.
        </div>
      )}

      {/* Main analysis card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Header with confidence */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 text-sm">Confidence</span>
            <span className={`text-lg font-bold ${confidenceColor}`}>
              {analysis.confidence_score}%
            </span>
          </div>
        </div>

        {/* Color & style grid */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-zinc-800">
          <InfoItem label="Color Style" value={analysis.color_grade_style} />
          <InfoItem label="Lighting" value={analysis.lighting_type} />
          <InfoItem label="Color Temp" value={analysis.color_temperature} />
          <InfoItem label="Exposure" value={analysis.exposure} />
          <InfoItem label="Shadows" value={analysis.shadows} />
          <InfoItem label="Highlights" value={analysis.highlights} />
          <InfoItem label="Saturation" value={analysis.saturation} />
          <InfoItem label="Contrast" value={analysis.contrast} />
          <InfoItem label="Grain" value={analysis.grain} />
          <InfoItem label="Shot On" value={analysis.estimated_shot_on} />
        </div>

        {/* Filter match */}
        {analysis.instagram_filter_match &&
          analysis.instagram_filter_match !== "none" && (
            <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2">
              <span className="text-zinc-500 text-sm">Filter Match:</span>
              <span className="text-purple-400 font-medium text-sm">
                {analysis.instagram_filter_match}
              </span>
            </div>
          )}

        {/* Recreation steps tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 border-b border-zinc-800">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                  activeTab === tab.key
                    ? "bg-zinc-800 text-white border-b-2 border-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Steps list */}
        <div className="px-6 py-4">
          {steps.length > 0 ? (
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-zinc-600 font-mono shrink-0 w-6 text-right">
                    {i + 1}.
                  </span>
                  <span className="text-zinc-300">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-zinc-500 text-sm">
              No recreation steps available for this platform.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs uppercase tracking-wide">{label}</p>
      <p className="text-zinc-200 text-sm mt-0.5">{value || "—"}</p>
    </div>
  );
}
