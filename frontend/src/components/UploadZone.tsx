"use client";

import { useCallback, useState } from "react";
import { ACCEPTED_FILE_TYPES } from "@/lib/constants";

interface UploadZoneProps {
  onFileSelected: (file: File, device: "iphone" | "android") => void;
  isLoading: boolean;
}

export default function UploadZone({ onFileSelected, isLoading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [device, setDevice] = useState<"iphone" | "android">("iphone");
  const [preview, setPreview] = useState<string | null>(null);

  const acceptString = Object.values(ACCEPTED_FILE_TYPES).flat().join(",");

  const handleFile = useCallback(
    (file: File) => {
      const validTypes = Object.keys(ACCEPTED_FILE_TYPES);
      if (!validTypes.includes(file.type)) {
        alert("Unsupported file type. Please upload a JPG, PNG, WebP, HEIC, MP4, or MOV file.");
        return;
      }
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
      } else {
        setPreview(null);
      }
      onFileSelected(file, device);
    },
    [device, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Device selector */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => setDevice("iphone")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            device === "iphone"
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          iPhone
        </button>
        <button
          onClick={() => setDevice("android")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            device === "android"
              ? "bg-white text-black"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          Android
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-white bg-zinc-800/50"
            : "border-zinc-700 hover:border-zinc-500"
        } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
      >
        <input
          type="file"
          accept={acceptString}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="mx-auto max-h-48 rounded-lg mb-4 object-contain"
          />
        ) : (
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
        )}

        <p className="text-zinc-300 text-lg font-medium">
          {isLoading ? "Analyzing..." : "Drop your photo or video here"}
        </p>
        <p className="text-zinc-500 text-sm mt-1">
          JPG, PNG, WebP, HEIC, MP4, MOV — up to 50MB
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <div className="flex items-center gap-3 text-zinc-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>Analyzing your image with AI...</span>
          </div>
        </div>
      )}
    </div>
  );
}
