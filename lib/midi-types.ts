export interface MidiNote {
  id: string;
  pitch: number;      // MIDI note number (0-127)
  start: number;      // Start time in ticks
  duration: number;   // Duration in ticks
  velocity: number;   // 0-127
  track: number;
}

export interface MidiTrack {
  id: string;
  name: string;
  instrument: number;
  notes: MidiNote[];
  muted: boolean;
  solo: boolean;
}

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface MidiData {
  name: string;
  duration: number;
  tempo: number;
  timeSignature: TimeSignature;
  ticksPerBeat: number;
  tracks: MidiTrack[];
}

export interface MidiEditorState {
  // MIDI data
  midiData: MidiData | null;

  // Playback state
  isPlaying: boolean;
  currentPosition: number;
  loopStart: number | null;
  loopEnd: number | null;

  // Editor state
  selectedNotes: string[];
  currentTool: 'select' | 'pencil' | 'eraser';
  zoom: { x: number; y: number };
  scrollPosition: { x: number; y: number };
  quantization: number; // 1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth

  // History for undo/redo
  history: MidiData[];
  historyIndex: number;
}

export type MidiAction =
  | { type: 'LOAD_MIDI'; payload: MidiData }
  | { type: 'ADD_NOTE'; payload: { trackId: string; note: Omit<MidiNote, 'id'> } }
  | { type: 'UPDATE_NOTE'; payload: { noteId: string; changes: Partial<MidiNote> } }
  | { type: 'DELETE_NOTES'; payload: string[] }
  | { type: 'SELECT_NOTES'; payload: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_POSITION'; payload: number }
  | { type: 'SET_TEMPO'; payload: number }
  | { type: 'SET_TOOL'; payload: 'select' | 'pencil' | 'eraser' }
  | { type: 'SET_ZOOM'; payload: { x: number; y: number } }
  | { type: 'SET_SCROLL'; payload: { x: number; y: number } }
  | { type: 'SET_QUANTIZATION'; payload: number }
  | { type: 'TOGGLE_TRACK_MUTE'; payload: string }
  | { type: 'TOGGLE_TRACK_SOLO'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'RESET' };

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

export function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const note = NOTE_NAMES[midi % 12];
  return `${note}${octave}`;
}

export function noteNameToMidi(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // Default to middle C
  const [, note, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const noteIndex = NOTE_NAMES.indexOf(note as typeof NOTE_NAMES[number]);
  return (octave + 1) * 12 + noteIndex;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
