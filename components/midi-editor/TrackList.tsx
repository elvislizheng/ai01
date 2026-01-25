"use client";

import { Volume2, VolumeX, Headphones } from 'lucide-react';
import type { MidiTrack } from '@/lib/midi-types';

interface TrackListProps {
  tracks: MidiTrack[];
  selectedTrackId: string | null;
  onSelectTrack: (trackId: string) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
}

export default function TrackList({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onToggleMute,
  onToggleSolo,
}: TrackListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700">Tracks</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {tracks.map(track => (
          <div
            key={track.id}
            onClick={() => onSelectTrack(track.id)}
            className={`
              flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
              ${selectedTrackId === track.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}
            `}
          >
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                track.muted ? 'text-gray-400' : 'text-gray-900'
              }`}>
                {track.name}
              </p>
              <p className="text-xs text-gray-500">
                {track.notes.length} notes
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute(track.id);
                }}
                className={`p-1.5 rounded transition-colors ${
                  track.muted
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={track.muted ? 'Unmute' : 'Mute'}
              >
                {track.muted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSolo(track.id);
                }}
                className={`p-1.5 rounded transition-colors ${
                  track.solo
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title={track.solo ? 'Unsolo' : 'Solo'}
              >
                <Headphones className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">
          No tracks
        </div>
      )}
    </div>
  );
}
