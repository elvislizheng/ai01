"use client";

import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import type { MidiData, MidiNote } from '@/lib/midi-types';
import { midiToNoteName, NOTE_NAMES } from '@/lib/midi-types';

interface PianoRollProps {
  midiData: MidiData;
  selectedNotes: string[];
  currentTool: 'select' | 'pencil' | 'eraser';
  zoom: { x: number; y: number };
  currentPosition: number;
  quantization: number;
  onAddNote: (trackId: string, note: Omit<MidiNote, 'id'>) => void;
  onUpdateNote: (noteId: string, changes: Partial<MidiNote>) => void;
  onDeleteNotes: (noteIds: string[]) => void;
  onSelectNotes: (noteIds: string[]) => void;
  onPreviewNote: (pitch: number) => void;
}

const NOTE_HEIGHT = 14;
const BEAT_WIDTH = 40;
const PIANO_KEY_WIDTH = 60;
const MIN_PITCH = 21; // A0
const MAX_PITCH = 108; // C8
const PITCH_RANGE = MAX_PITCH - MIN_PITCH + 1;

export default function PianoRoll({
  midiData,
  selectedNotes,
  currentTool,
  zoom,
  currentPosition,
  quantization,
  onAddNote,
  onUpdateNote,
  onDeleteNotes,
  onSelectNotes,
  onPreviewNote,
}: PianoRollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragNote, setDragNote] = useState<string | null>(null);

  const scaledBeatWidth = BEAT_WIDTH * zoom.x;
  const scaledNoteHeight = NOTE_HEIGHT * zoom.y;

  // Calculate total width based on content
  const maxTicks = useMemo(() => {
    const notesMaxTick = Math.max(
      ...midiData.tracks.flatMap(t => t.notes.map(n => n.start + n.duration)),
      0
    );
    // Add extra space (at least 8 measures)
    const minTicks = midiData.ticksPerBeat * midiData.timeSignature.numerator * 8;
    return Math.max(notesMaxTick + midiData.ticksPerBeat * 4, minTicks);
  }, [midiData]);

  const totalWidth = (maxTicks / midiData.ticksPerBeat) * scaledBeatWidth;
  const totalHeight = PITCH_RANGE * scaledNoteHeight;

  // Get all notes from all visible tracks
  const visibleNotes = useMemo(() => {
    const hasSolo = midiData.tracks.some(t => t.solo);
    return midiData.tracks
      .filter(t => !t.muted && (!hasSolo || t.solo))
      .flatMap(t => t.notes.map(n => ({ ...n, trackId: t.id })));
  }, [midiData]);

  // Convert screen position to ticks/pitch
  const screenToTicks = useCallback((x: number) => {
    return Math.round((x / scaledBeatWidth) * midiData.ticksPerBeat);
  }, [scaledBeatWidth, midiData.ticksPerBeat]);

  const screenToPitch = useCallback((y: number) => {
    return MAX_PITCH - Math.floor(y / scaledNoteHeight);
  }, [scaledNoteHeight]);

  // Snap to grid
  const snapToGrid = useCallback((ticks: number) => {
    const gridTicks = midiData.ticksPerBeat / quantization;
    return Math.round(ticks / gridTicks) * gridTicks;
  }, [midiData.ticksPerBeat, quantization]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - PIANO_KEY_WIDTH + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    const pitch = screenToPitch(y);
    const ticks = snapToGrid(screenToTicks(x));

    if (currentTool === 'pencil') {
      // Add new note
      const trackId = midiData.tracks[0]?.id;
      if (trackId) {
        const duration = midiData.ticksPerBeat / quantization;
        onAddNote(trackId, {
          pitch,
          start: ticks,
          duration,
          velocity: 100,
          track: 0,
        });
        onPreviewNote(pitch);
      }
    } else if (currentTool === 'select') {
      setIsDragging(true);
      setDragStart({ x, y });
    }
  }, [currentTool, midiData.tracks, midiData.ticksPerBeat, quantization, screenToPitch, screenToTicks, snapToGrid, onAddNote, onPreviewNote]);

  // Handle note click
  const handleNoteClick = useCallback((e: React.MouseEvent, note: MidiNote & { trackId: string }) => {
    e.stopPropagation();

    if (currentTool === 'eraser') {
      onDeleteNotes([note.id]);
      return;
    }

    if (currentTool === 'select') {
      if (e.shiftKey) {
        // Toggle selection
        if (selectedNotes.includes(note.id)) {
          onSelectNotes(selectedNotes.filter(id => id !== note.id));
        } else {
          onSelectNotes([...selectedNotes, note.id]);
        }
      } else {
        onSelectNotes([note.id]);
      }
      onPreviewNote(note.pitch);
    }
  }, [currentTool, selectedNotes, onDeleteNotes, onSelectNotes, onPreviewNote]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNotes.length > 0) {
          e.preventDefault();
          onDeleteNotes(selectedNotes);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, onDeleteNotes]);

  // Render piano keys
  const renderPianoKeys = () => {
    const keys = [];
    for (let pitch = MAX_PITCH; pitch >= MIN_PITCH; pitch--) {
      const noteName = NOTE_NAMES[pitch % 12];
      const isBlack = noteName.includes('#');
      const octave = Math.floor(pitch / 12) - 1;

      keys.push(
        <div
          key={pitch}
          onClick={() => onPreviewNote(pitch)}
          style={{ height: scaledNoteHeight }}
          className={`
            flex items-center justify-end px-2 text-xs border-b border-gray-200 cursor-pointer
            ${isBlack
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          {noteName === 'C' && <span className="font-medium">{noteName}{octave}</span>}
        </div>
      );
    }
    return keys;
  };

  // Render grid
  const renderGrid = () => {
    const lines = [];
    const ticksPerMeasure = midiData.ticksPerBeat * midiData.timeSignature.numerator;
    const numMeasures = Math.ceil(maxTicks / ticksPerMeasure);

    // Measure lines
    for (let i = 0; i <= numMeasures; i++) {
      const x = (i * ticksPerMeasure / midiData.ticksPerBeat) * scaledBeatWidth;
      lines.push(
        <line
          key={`measure-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={totalHeight}
          stroke="#d1d5db"
          strokeWidth={2}
        />
      );
    }

    // Beat lines
    const totalBeats = Math.ceil(maxTicks / midiData.ticksPerBeat);
    for (let i = 0; i <= totalBeats; i++) {
      if (i % midiData.timeSignature.numerator !== 0) {
        const x = i * scaledBeatWidth;
        lines.push(
          <line
            key={`beat-${i}`}
            x1={x}
            y1={0}
            x2={x}
            y2={totalHeight}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        );
      }
    }

    // Pitch lines (every octave)
    for (let pitch = MIN_PITCH; pitch <= MAX_PITCH; pitch++) {
      if (pitch % 12 === 0) {
        const y = (MAX_PITCH - pitch) * scaledNoteHeight;
        lines.push(
          <line
            key={`pitch-${pitch}`}
            x1={0}
            y1={y}
            x2={totalWidth}
            y2={y}
            stroke="#d1d5db"
            strokeWidth={1}
          />
        );
      }
    }

    return lines;
  };

  // Render playhead
  const playheadX = (currentPosition / midiData.ticksPerBeat) * scaledBeatWidth;

  return (
    <div className="flex bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Piano keys */}
      <div className="flex-shrink-0 border-r border-gray-300" style={{ width: PIANO_KEY_WIDTH }}>
        <div style={{ height: totalHeight }}>
          {renderPianoKeys()}
        </div>
      </div>

      {/* Grid and notes */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto relative"
        onMouseDown={handleMouseDown}
        style={{ cursor: currentTool === 'pencil' ? 'crosshair' : 'default' }}
      >
        <svg
          width={totalWidth}
          height={totalHeight}
          className="absolute top-0 left-0"
        >
          {/* Grid */}
          {renderGrid()}

          {/* Notes */}
          {visibleNotes.map(note => {
            const x = (note.start / midiData.ticksPerBeat) * scaledBeatWidth;
            const y = (MAX_PITCH - note.pitch) * scaledNoteHeight;
            const width = (note.duration / midiData.ticksPerBeat) * scaledBeatWidth;
            const isSelected = selectedNotes.includes(note.id);

            return (
              <rect
                key={note.id}
                x={x}
                y={y + 1}
                width={Math.max(width - 1, 4)}
                height={scaledNoteHeight - 2}
                rx={2}
                fill={isSelected ? '#4f46e5' : '#818cf8'}
                stroke={isSelected ? '#312e81' : '#6366f1'}
                strokeWidth={isSelected ? 2 : 1}
                className="cursor-pointer hover:brightness-110 transition-all"
                onClick={(e) => handleNoteClick(e as unknown as React.MouseEvent, note)}
              />
            );
          })}

          {/* Playhead */}
          <line
            x1={playheadX}
            y1={0}
            x2={playheadX}
            y2={totalHeight}
            stroke="#ef4444"
            strokeWidth={2}
          />
        </svg>
      </div>
    </div>
  );
}
