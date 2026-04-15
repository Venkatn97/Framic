"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ResultsCard from "@/components/ResultsCard";
import FeedbackWidget from "@/components/FeedbackWidget";
import { analyzeFile, type AnalysisResponse } from "@/lib/api";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (
    file: File,
    device: "iphone" | "android"
  ) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeFile(file, device);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Framic</h1>
          <span className="text-zinc-500 text-sm">Camera Settings Decoder</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-10 space-y-6">
        {!result && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Reverse engineer any photo&apos;s look
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto">
              Upload a photo, video, or Instagram screenshot and get exact
              camera settings and step-by-step recreation instructions.
            </p>
          </div>
        )}

        {!result && (
          <UploadZone onFileSelected={handleFileSelected} isLoading={isLoading} />
        )}

        {error && (
          <div className="w-full max-w-xl mx-auto bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {result && (
          <>
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                &larr; Analyze another image
              </button>
            </div>
            <ResultsCard data={result} />
            <FeedbackWidget analysisId={result.id} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 text-center text-zinc-600 text-xs">
        Framic — AI-powered camera settings analysis
      </footer>
    </div>
  );
}
