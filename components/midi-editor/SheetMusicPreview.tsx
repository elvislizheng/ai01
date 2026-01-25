"use client";

import { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import type { MidiData } from '@/lib/midi-types';
import { midiToMusicXML } from '@/lib/midi-to-musicxml';

interface SheetMusicPreviewProps {
  midiData: MidiData;
  className?: string;
}

export default function SheetMusicPreview({ midiData, className = '' }: SheetMusicPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderSheetMusic = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Ensure container exists
        const container = containerRef.current;
        if (!container) {
          throw new Error('Container element not found');
        }

        // Convert MIDI data to MusicXML
        const musicXML = midiToMusicXML(midiData);

        // Clear previous content
        container.innerHTML = '';

        // Initialize OpenSheetMusicDisplay with optimal settings
        const osmd = new OpenSheetMusicDisplay(container, {
          autoResize: true,
          backend: 'svg',
          drawTitle: true,
          drawSubtitle: false,
          drawComposer: false,
          drawLyricist: false,
          drawCredits: false,
          drawPartNames: false,
          drawMetronomeMarks: true,
          drawingParameters: 'default', // Use default for better spacing in preview
          followCursor: false,
          // Rendering options for better quality
          renderSingleHorizontalStaffline: false,
        });

        // Store reference
        osmdRef.current = osmd;

        // Load and render the MusicXML
        await osmd.load(musicXML);
        await osmd.render();

        setIsLoading(false);
      } catch (err) {
        console.error('Sheet music rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render sheet music');
        setIsLoading(false);
      }
    };

    renderSheetMusic();

    // Cleanup
    return () => {
      if (osmdRef.current && containerRef.current) {
        containerRef.current.innerHTML = '';
        osmdRef.current = null;
      }
    };
  }, [midiData]);

  return (
    <div className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Sheet Music Preview</h3>
            <p className="text-sm text-indigo-100">
              {midiData.name || 'Untitled'} • {Math.round(midiData.tempo)} BPM • {midiData.timeSignature.numerator}/{midiData.timeSignature.denominator}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-indigo-100">Powered by OpenSheetMusicDisplay</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Rendering sheet music...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center py-16 px-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Rendering Error</h4>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      )}

      {/* Sheet Music Container */}
      <div
        ref={containerRef}
        className={`p-8 overflow-auto ${isLoading || error ? 'hidden' : ''}`}
        style={{
          maxHeight: '800px',
          backgroundColor: '#ffffff',
        }}
      />

      {/* Legend */}
      {!isLoading && !error && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
              <span>Treble Clef (Right Hand)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
              <span>Bass Clef (Left Hand)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Chord Symbols</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
