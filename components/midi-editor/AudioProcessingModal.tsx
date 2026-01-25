"use client";

import { Loader2, X } from 'lucide-react';

interface AudioProcessingModalProps {
  isOpen: boolean;
  progress: number;
  status: string;
  onCancel?: () => void;
}

export default function AudioProcessingModal({
  isOpen,
  progress,
  status,
  onCancel
}: AudioProcessingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Close button (only show if onCancel is provided and progress < 100) */}
        {onCancel && progress < 100 && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="text-center">
          {/* Spinner */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-6">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>

          {/* Status text */}
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {progress >= 100 ? 'Conversion Complete!' : 'Converting Audio'}
          </h3>
          <p className="text-gray-600 mb-6">{status}</p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-purple-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress percentage */}
          <p className="text-sm font-medium text-gray-700">{Math.round(progress)}%</p>

          {/* Additional info */}
          {progress < 100 && (
            <p className="mt-4 text-sm text-gray-500">
              This may take a moment depending on file size...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
