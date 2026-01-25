import { Midi } from '@tonejs/midi';
import type { MidiData, MidiTrack, MidiNote } from './midi-types';

export async function parseMidiFile(file: File): Promise<MidiData> {
  const arrayBuffer = await file.arrayBuffer();
  const midi = new Midi(arrayBuffer);

  const tracks: MidiTrack[] = midi.tracks
    .filter(track => track.notes.length > 0)
    .map((track, trackIndex) => ({
      id: `track-${trackIndex}`,
      name: track.name || `Track ${trackIndex + 1}`,
      instrument: track.instrument?.number ?? 0,
      notes: track.notes.map((note, noteIndex) => ({
        id: `note-${trackIndex}-${noteIndex}`,
        pitch: note.midi,
        start: note.ticks,
        duration: note.durationTicks,
        velocity: Math.round(note.velocity * 127),
        track: trackIndex,
      })),
      muted: false,
      solo: false,
    }));

  const firstTempo = midi.header.tempos[0];
  const firstTimeSignature = midi.header.timeSignatures[0];

  return {
    name: file.name.replace(/\.(mid|midi)$/i, ''),
    duration: midi.duration,
    tempo: firstTempo?.bpm ?? 120,
    timeSignature: {
      numerator: firstTimeSignature?.timeSignature[0] ?? 4,
      denominator: firstTimeSignature?.timeSignature[1] ?? 4,
    },
    ticksPerBeat: midi.header.ppq,
    tracks,
  };
}

export function createEmptyMidiData(name: string = 'Untitled'): MidiData {
  return {
    name,
    duration: 0,
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    ticksPerBeat: 480,
    tracks: [
      {
        id: 'track-0',
        name: 'Track 1',
        instrument: 0,
        notes: [],
        muted: false,
        solo: false,
      },
    ],
  };
}

export function generateNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
