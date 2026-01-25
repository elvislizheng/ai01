"use client";

import { useState } from 'react';
import { Settings, Info, X, Music } from 'lucide-react';
import type { AudioToMidiOptions } from '@/lib/audio-to-midi';

interface ConversionOptionsPanelProps {
  fileName: string;
  onConvert: (options: AudioToMidiOptions) => void;
  onCancel: () => void;
}

export default function ConversionOptionsPanel({
  fileName,
  onConvert,
  onCancel
}: ConversionOptionsPanelProps) {
  const [onsetThreshold, setOnsetThreshold] = useState(0.35); // Basic Pitch optimized
  const [frameThreshold, setFrameThreshold] = useState(0.25); // Frame threshold
  const [minimumNoteDuration, setMinimumNoteDuration] = useState(3); // Frames
  const [velocitySensitivity, setVelocitySensitivity] = useState(0.7);

  const handleConvert = () => {
    onConvert({
      onsetThreshold,
      frameThreshold,
      minimumNoteDuration,
      velocitySensitivity,
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
          <Settings className="w-8 h-8 text-purple-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Conversion Settings</h2>
        <p className="text-gray-600">Configure how the audio will be converted</p>
      </div>

      {/* File info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
        <Music className="w-5 h-5 text-gray-600" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
          <p className="text-xs text-gray-500">Ready to convert</p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="Remove file"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Options */}
      <div className="space-y-6 mb-8">
        {/* Onset Threshold */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Note Detection Sensitivity
              </label>
              <p className="text-xs text-gray-500">
                How sensitive the AI is to detecting note onsets
              </p>
            </div>
            <span className="text-sm font-semibold text-purple-600 ml-4">
              {(onsetThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={onsetThreshold}
              onChange={(e) => setOnsetThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>More notes</span>
              <span>Fewer notes</span>
            </div>
          </div>
        </div>

        {/* Frame Threshold */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Frame Threshold
              </label>
              <p className="text-xs text-gray-500">
                Controls sustain and duration detection
              </p>
            </div>
            <span className="text-sm font-semibold text-purple-600 ml-4">
              {(frameThreshold * 100).toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={frameThreshold}
              onChange={(e) => setFrameThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Longer sustain</span>
              <span>Shorter sustain</span>
            </div>
          </div>
        </div>

        {/* Minimum Note Duration */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Minimum Note Duration
              </label>
              <p className="text-xs text-gray-500">
                Filter out very short notes and artifacts
              </p>
            </div>
            <span className="text-sm font-semibold text-purple-600 ml-4">
              {minimumNoteDuration} frames
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={minimumNoteDuration}
              onChange={(e) => setMinimumNoteDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Shorter notes</span>
              <span>Longer notes only</span>
            </div>
          </div>
        </div>

        {/* Velocity Sensitivity */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Velocity Sensitivity
              </label>
              <p className="text-xs text-gray-500">
                How much volume affects note dynamics
              </p>
            </div>
            <span className="text-sm font-semibold text-purple-600 ml-4">
              {(velocitySensitivity * 100).toFixed(0)}%
            </span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={velocitySensitivity}
              onChange={(e) => setVelocitySensitivity(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Uniform</span>
              <span>Dynamic</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Powered by Spotify Basic Pitch</p>
            <p className="text-blue-800">
              Using Spotify's AI model for polyphonic piano transcription with optimized frequency analysis. MidiPlayerJS enhances MIDI event parsing for professional results.
            </p>
          </div>
        </div>
      </div>


      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConvert}
          className="flex-1 px-6 py-3 bg-purple-600 rounded-lg font-medium text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/30"
        >
          Convert to Notation
        </button>
      </div>
    </div>
  );
}
