"use client";

import { Play, Pause, Square, SkipBack } from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentPosition: number;
  totalTicks: number;
  tempo: number;
  ticksPerBeat: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (position: number) => void;
  onTempoChange: (tempo: number) => void;
}

function formatTime(ticks: number, ticksPerBeat: number, tempo: number): string {
  const seconds = (ticks / ticksPerBeat) * (60 / tempo);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlaybackControls({
  isPlaying,
  currentPosition,
  totalTicks,
  tempo,
  ticksPerBeat,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onTempoChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-lg">
      {/* Transport controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStop}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Stop"
        >
          <Square className="w-5 h-5" />
        </button>

        <button
          onClick={() => onSeek(0)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          title="Go to start"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>

      {/* Position display */}
      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-[100px]">
        <span className="font-mono">
          {formatTime(currentPosition, ticksPerBeat, tempo)}
        </span>
        <span>/</span>
        <span className="font-mono">
          {formatTime(totalTicks, ticksPerBeat, tempo)}
        </span>
      </div>

      {/* Position slider */}
      <div className="flex-1 mx-4">
        <input
          type="range"
          min={0}
          max={totalTicks}
          value={currentPosition}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>

      {/* Tempo control */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">BPM:</span>
        <input
          type="number"
          min={40}
          max={240}
          value={Math.round(tempo)}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="range"
          min={40}
          max={240}
          value={tempo}
          onChange={(e) => onTempoChange(Number(e.target.value))}
          className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
    </div>
  );
}
