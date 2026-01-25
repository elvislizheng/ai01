"use client";

import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { MidiEditorState, MidiAction, MidiData, MidiNote } from '@/lib/midi-types';
import { generateNoteId } from '@/lib/midi-parser';

const initialState: MidiEditorState = {
  midiData: null,
  isPlaying: false,
  currentPosition: 0,
  loopStart: null,
  loopEnd: null,
  selectedNotes: [],
  currentTool: 'select',
  zoom: { x: 1, y: 1 },
  scrollPosition: { x: 0, y: 0 },
  quantization: 4,
  history: [],
  historyIndex: -1,
};

function saveToHistory(state: MidiEditorState): MidiEditorState {
  if (!state.midiData) return state;

  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(state.midiData)));

  // Limit history to 50 entries
  if (newHistory.length > 50) {
    newHistory.shift();
  }

  return {
    ...state,
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
}

function midiReducer(state: MidiEditorState, action: MidiAction): MidiEditorState {
  switch (action.type) {
    case 'LOAD_MIDI':
      return {
        ...initialState,
        midiData: action.payload,
        history: [JSON.parse(JSON.stringify(action.payload))],
        historyIndex: 0,
      };

    case 'ADD_NOTE': {
      if (!state.midiData) return state;

      const newState = saveToHistory(state);
      const trackIndex = newState.midiData!.tracks.findIndex(t => t.id === action.payload.trackId);
      if (trackIndex === -1) return state;

      const newNote: MidiNote = {
        ...action.payload.note,
        id: generateNoteId(),
      };

      const newTracks = [...newState.midiData!.tracks];
      newTracks[trackIndex] = {
        ...newTracks[trackIndex],
        notes: [...newTracks[trackIndex].notes, newNote],
      };

      return {
        ...newState,
        midiData: { ...newState.midiData!, tracks: newTracks },
      };
    }

    case 'UPDATE_NOTE': {
      if (!state.midiData) return state;

      const newState = saveToHistory(state);
      const newTracks = newState.midiData!.tracks.map(track => ({
        ...track,
        notes: track.notes.map(note =>
          note.id === action.payload.noteId
            ? { ...note, ...action.payload.changes }
            : note
        ),
      }));

      return {
        ...newState,
        midiData: { ...newState.midiData!, tracks: newTracks },
      };
    }

    case 'DELETE_NOTES': {
      if (!state.midiData) return state;

      const newState = saveToHistory(state);
      const idsToDelete = new Set(action.payload);
      const newTracks = newState.midiData!.tracks.map(track => ({
        ...track,
        notes: track.notes.filter(note => !idsToDelete.has(note.id)),
      }));

      return {
        ...newState,
        midiData: { ...newState.midiData!, tracks: newTracks },
        selectedNotes: state.selectedNotes.filter(id => !idsToDelete.has(id)),
      };
    }

    case 'SELECT_NOTES':
      return { ...state, selectedNotes: action.payload };

    case 'CLEAR_SELECTION':
      return { ...state, selectedNotes: [] };

    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };

    case 'SET_POSITION':
      return { ...state, currentPosition: action.payload };

    case 'SET_TEMPO': {
      if (!state.midiData) return state;
      return {
        ...state,
        midiData: { ...state.midiData, tempo: action.payload },
      };
    }

    case 'SET_TOOL':
      return { ...state, currentTool: action.payload };

    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };

    case 'SET_SCROLL':
      return { ...state, scrollPosition: action.payload };

    case 'SET_QUANTIZATION':
      return { ...state, quantization: action.payload };

    case 'TOGGLE_TRACK_MUTE': {
      if (!state.midiData) return state;
      const newTracks = state.midiData.tracks.map(track =>
        track.id === action.payload ? { ...track, muted: !track.muted } : track
      );
      return {
        ...state,
        midiData: { ...state.midiData, tracks: newTracks },
      };
    }

    case 'TOGGLE_TRACK_SOLO': {
      if (!state.midiData) return state;
      const newTracks = state.midiData.tracks.map(track =>
        track.id === action.payload ? { ...track, solo: !track.solo } : track
      );
      return {
        ...state,
        midiData: { ...state.midiData, tracks: newTracks },
      };
    }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        midiData: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        midiData: JSON.parse(JSON.stringify(state.history[newIndex])),
        historyIndex: newIndex,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface MidiEditorContextType {
  state: MidiEditorState;
  dispatch: React.Dispatch<MidiAction>;
}

const MidiEditorContext = createContext<MidiEditorContextType | null>(null);

export function MidiEditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(midiReducer, initialState);

  return (
    <MidiEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </MidiEditorContext.Provider>
  );
}

export function useMidiEditor() {
  const context = useContext(MidiEditorContext);
  if (!context) {
    throw new Error('useMidiEditor must be used within a MidiEditorProvider');
  }
  return context;
}
