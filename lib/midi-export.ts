import { Midi } from '@tonejs/midi';
import type { MidiData } from './midi-types';

export function exportToMidi(data: MidiData): Uint8Array {
  const midi = new Midi();

  // Set tempo
  midi.header.setTempo(data.tempo);

  // Set time signature
  midi.header.timeSignatures.push({
    ticks: 0,
    timeSignature: [data.timeSignature.numerator, data.timeSignature.denominator],
    measures: 0,
  });

  // PPQ is read-only, set via header if needed (default is 480)

  // Add tracks
  data.tracks.forEach((track) => {
    const midiTrack = midi.addTrack();
    midiTrack.name = track.name;
    midiTrack.instrument.number = track.instrument;

    track.notes.forEach((note) => {
      midiTrack.addNote({
        midi: note.pitch,
        ticks: note.start,
        durationTicks: note.duration,
        velocity: note.velocity / 127,
      });
    });
  });

  return midi.toArray();
}

export function downloadMidi(data: Uint8Array, filename: string): void {
  const blob = new Blob([new Uint8Array(data)], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.mid') ? filename : `${filename}.mid`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
