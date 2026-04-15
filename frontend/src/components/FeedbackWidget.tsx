"use client";

import { useState } from "react";
import { submitFeedback } from "@/lib/api";

interface FeedbackWidgetProps {
  analysisId: string;
}

export default function FeedbackWidget({ analysisId }: FeedbackWidgetProps) {
  const [worked, setWorked] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (worked === null || rating === 0) return;
    setSubmitting(true);
    try {
      await submitFeedback(analysisId, worked, rating);
      setSubmitted(true);
    } catch {
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-center">
        <p className="text-green-400 font-medium">Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 space-y-4">
      <h3 className="text-white font-medium text-center">Did this work?</h3>

      {/* Thumbs up / down */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setWorked(true)}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            worked === true
              ? "bg-green-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          <span className="mr-1.5">&#x1F44D;</span> Yes
        </button>
        <button
          onClick={() => setWorked(false)}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            worked === false
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          <span className="mr-1.5">&#x1F44E;</span> No
        </button>
      </div>

      {/* Star rating */}
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-2xl transition-colors ${
              star <= rating ? "text-yellow-400" : "text-zinc-700"
            }`}
          >
            &#9733;
          </button>
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={worked === null || rating === 0 || submitting}
          className="px-6 py-2 bg-white text-black rounded-lg text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
