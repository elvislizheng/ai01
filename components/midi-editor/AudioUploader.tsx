"use client";

import { useState, useCallback, useRef } from 'react';
import { Upload, Music2, AlertCircle, Info } from 'lucide-react';
import { validateAudioFile, checkBrowserSupport } from '@/lib/audio-to-midi';

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
}

export default function AudioUploader({ onFileSelected }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check browser support on mount
  const browserSupport = checkBrowserSupport();

  const handleFile = useCallback((file: File) => {
    setError(null);
    setWarning(null);

    // Validate the audio file
    const validation = validateAudioFile(file);

    if (!validation.valid) {
      setError(validation.message || 'Invalid file');
      return;
    }

    // Show warning if file is large
    if (validation.message) {
      setWarning(validation.message);
    }

    // Pass the file to parent component
    onFileSelected(file);
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  // Don't render if browser doesn't support required features
  if (!browserSupport.supported) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Browser Not Supported</h3>
              <p className="text-red-700 text-sm">{browserSupport.message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Music2 className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audio to Notation</h2>
        <p className="text-gray-600">Upload an audio file to convert to sheet music</p>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.mp3,audio/wav,audio/wave,audio/x-wav,audio/mpeg,audio/mp3"
          onChange={handleInputChange}
          className="hidden"
        />

        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-purple-500' : 'text-gray-400'}`} />

        <p className="text-lg font-medium text-gray-700 mb-2">
          Drop your audio file here
        </p>
        <p className="text-sm text-gray-500">
          or click to browse
        </p>
      </div>

      {warning && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-800 text-sm">{warning}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-2">Tips for best results:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Use clear recordings with minimal background noise</li>
              <li>Piano solo recordings work best</li>
              <li>Files under 3 minutes process faster</li>
              <li>You can edit the detected notes before exporting</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Supported formats: WAV, MP3 (max 50MB)</p>
      </div>
    </div>
  );
}
