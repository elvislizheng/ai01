import type { MidiData, MidiNote } from './midi-types';

/**
 * Parse MusicXML file and convert to MidiData format
 */
export async function parseMusicXMLFile(file: File): Promise<MidiData> {
  const text = await file.text();
  return parseMusicXMLString(text, file.name);
}

/**
 * Parse MusicXML string and convert to MidiData format
 */
export function parseMusicXMLString(xml: string, filename: string = 'Untitled'): MidiData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid MusicXML file');
  }

  // Extract metadata
  const title = doc.querySelector('work-title')?.textContent ||
                filename.replace(/\.(musicxml|xml)$/i, '');

  // Extract tempo (default 120 BPM)
  let tempo = 120;
  const tempoElement = doc.querySelector('sound[tempo]');
  if (tempoElement) {
    tempo = parseInt(tempoElement.getAttribute('tempo') || '120');
  }

  // Also check metronome marking
  const perMinute = doc.querySelector('per-minute')?.textContent;
  if (perMinute) {
    tempo = parseInt(perMinute);
  }

  // Extract time signature (default 4/4)
  let timeSignature = { numerator: 4, denominator: 4 };
  const timeElement = doc.querySelector('time');
  if (timeElement) {
    const beats = timeElement.querySelector('beats')?.textContent;
    const beatType = timeElement.querySelector('beat-type')?.textContent;
    if (beats && beatType) {
      timeSignature = {
        numerator: parseInt(beats),
        denominator: parseInt(beatType)
      };
    }
  }

  // Extract divisions (ticks per quarter note)
  const divisionsElement = doc.querySelector('divisions');
  const divisions = divisionsElement ? parseInt(divisionsElement.textContent || '480') : 480;

  // Parse notes from all parts and staves
  const tracks: Map<number, MidiNote[]> = new Map();
  tracks.set(1, []); // Treble/Right hand
  tracks.set(2, []); // Bass/Left hand

  const parts = doc.querySelectorAll('part');

  parts.forEach(part => {
    let currentTick = 0;
    const measures = part.querySelectorAll('measure');

    measures.forEach(measure => {
      const measureStart = currentTick;
      const notes = measure.querySelectorAll('note');

      notes.forEach(note => {
        // Skip if this is a rest
        if (note.querySelector('rest')) {
          const duration = parseInt(note.querySelector('duration')?.textContent || '0');
          currentTick += duration;
          return;
        }

        // Skip chord notes (they share the same start time as previous note)
        const isChord = note.querySelector('chord') !== null;

        // Get pitch information
        const pitch = note.querySelector('pitch');
        if (!pitch) return;

        const step = pitch.querySelector('step')?.textContent || 'C';
        const octave = parseInt(pitch.querySelector('octave')?.textContent || '4');
        const alter = parseInt(pitch.querySelector('alter')?.textContent || '0');

        // Convert to MIDI note number
        const midiNote = pitchToMidi(step, octave, alter);

        // Get duration
        const duration = parseInt(note.querySelector('duration')?.textContent || '0');

        // Get velocity (default 80)
        const velocity = 80;

        // Get staff number (1 = treble, 2 = bass)
        const staffNumber = parseInt(note.querySelector('staff')?.textContent || '1');

        // Create note object
        const noteObj: MidiNote = {
          id: `${staffNumber}-${currentTick}-${midiNote}-${Math.random()}`,
          pitch: midiNote,
          start: isChord ? currentTick - duration : currentTick,
          duration: duration,
          velocity: velocity,
          track: staffNumber - 1 // Convert staff number (1-based) to track index (0-based)
        };

        // Add to appropriate track
        const trackNotes = tracks.get(staffNumber) || [];
        trackNotes.push(noteObj);
        tracks.set(staffNumber, trackNotes);

        // Advance time only if not a chord
        if (!isChord) {
          currentTick += duration;
        }
      });

      // Handle forward elements (advances time without notes)
      const forwards = measure.querySelectorAll('forward');
      forwards.forEach(forward => {
        const duration = parseInt(forward.querySelector('duration')?.textContent || '0');
        currentTick += duration;
      });

      // Handle backup elements (moves back in time)
      const backups = measure.querySelectorAll('backup');
      backups.forEach(backup => {
        const duration = parseInt(backup.querySelector('duration')?.textContent || '0');
        currentTick -= duration;
      });
    });
  });

  // Convert tracks map to array
  const midiTracks = [
    {
      id: 'track-0',
      name: 'Right Hand (Treble)',
      instrument: 0, // Piano
      notes: tracks.get(1) || [],
      muted: false,
      solo: false
    },
    {
      id: 'track-1',
      name: 'Left Hand (Bass)',
      instrument: 0, // Piano
      notes: tracks.get(2) || [],
      muted: false,
      solo: false
    }
  ];

  // Calculate total duration from all notes
  const allNotes = [...(tracks.get(1) || []), ...(tracks.get(2) || [])];
  const duration = allNotes.length > 0
    ? Math.max(...allNotes.map(n => n.start + n.duration))
    : 0;

  return {
    name: title,
    duration,
    tempo,
    timeSignature,
    ticksPerBeat: divisions,
    tracks: midiTracks
  };
}

/**
 * Convert note name, octave, and alteration to MIDI note number
 */
function pitchToMidi(step: string, octave: number, alter: number = 0): number {
  const noteMap: { [key: string]: number } = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };

  const pitchClass = noteMap[step.toUpperCase()] || 0;
  return (octave + 1) * 12 + pitchClass + alter;
}
