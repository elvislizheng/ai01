import MidiPlayer from 'midi-player-js';
import { Midi } from '@tonejs/midi';
import type { MidiData, MidiNote } from './midi-types';

/**
 * Convert MIDI data to MusicXML format using MidiPlayerJS for better parsing
 */
export function midiToMusicXML(data: MidiData): string {
  // Use both MidiPlayerJS and Tone.js for comprehensive parsing
  const toneMidi = midiDataToToneMidi(data);

  const { tempo, timeSignature, tracks } = data;

  // Get all notes from all tracks
  const allNotes = tracks.flatMap(track =>
    track.notes.map(note => ({ ...note, trackName: track.name }))
  );

  // Sort by start time
  allNotes.sort((a, b) => a.start - b.start);

  // Intelligently split notes into right hand (treble) and left hand (bass)
  // If tracks are already named for treble/bass, use them directly
  // Otherwise, split by pitch at middle C (MIDI 60)
  const MIDDLE_C = 60;

  let trebleNotes: MidiNote[];
  let bassNotes: MidiNote[];

  // Check if tracks are already split by name
  const hasTrebleTrack = tracks.some(t => t.name.toLowerCase().includes('treble') || t.name.toLowerCase().includes('right'));
  const hasBassTrack = tracks.some(t => t.name.toLowerCase().includes('bass') || t.name.toLowerCase().includes('left'));

  if (hasTrebleTrack && hasBassTrack) {
    // Use existing track split
    trebleNotes = tracks
      .filter(t => t.name.toLowerCase().includes('treble') || t.name.toLowerCase().includes('right'))
      .flatMap(t => t.notes);

    bassNotes = tracks
      .filter(t => t.name.toLowerCase().includes('bass') || t.name.toLowerCase().includes('left'))
      .flatMap(t => t.notes);
  } else {
    // Split by pitch at middle C
    trebleNotes = allNotes.filter(n => n.pitch >= MIDDLE_C);
    bassNotes = allNotes.filter(n => n.pitch < MIDDLE_C);
  }

  // Calculate divisions (ticks per quarter note)
  const divisions = data.ticksPerBeat;

  // Group notes into measures
  const ticksPerMeasure = divisions * timeSignature.numerator;
  const lastNoteTick = Math.max(...allNotes.map(n => n.start + n.duration), ticksPerMeasure);
  const measureCount = Math.ceil(lastNoteTick / ticksPerMeasure);

  // Build MusicXML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work>
    <work-title>${escapeXml(data.name || 'Piano Score')}</work-title>
  </work>
  <identification>
    <creator type="transcriber">AI Music Transcription</creator>
    <encoding>
      <software>OpenSheetMusicDisplay</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <defaults>
    <scaling>
      <millimeters>7</millimeters>
      <tenths>40</tenths>
    </scaling>
    <page-layout>
      <page-height>1545</page-height>
      <page-width>1194</page-width>
      <page-margins type="both">
        <left-margin>70</left-margin>
        <right-margin>70</right-margin>
        <top-margin>70</top-margin>
        <bottom-margin>70</bottom-margin>
      </page-margins>
    </page-layout>
    <system-layout>
      <system-margins>
        <left-margin>0</left-margin>
        <right-margin>0</right-margin>
      </system-margins>
      <system-distance>120</system-distance>
      <top-system-distance>70</top-system-distance>
    </system-layout>
  </defaults>
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
      <score-instrument id="P1-I1">
        <instrument-name>Acoustic Grand Piano</instrument-name>
      </score-instrument>
      <midi-instrument id="P1-I1">
        <midi-channel>1</midi-channel>
        <midi-program>1</midi-program>
      </midi-instrument>
    </score-part>
  </part-list>
  <part id="P1">
`;

  // Generate measures
  for (let measureNum = 0; measureNum < measureCount; measureNum++) {
    const measureStart = measureNum * ticksPerMeasure;
    const measureEnd = measureStart + ticksPerMeasure;

    // Get notes in this measure
    const trebleMeasureNotes = trebleNotes.filter(n =>
      n.start < measureEnd && (n.start + n.duration) > measureStart
    );
    const bassMeasureNotes = bassNotes.filter(n =>
      n.start < measureEnd && (n.start + n.duration) > measureStart
    );

    // Detect chord for this measure
    const allMeasureNotes = [...trebleMeasureNotes, ...bassMeasureNotes];
    const detectedChord = detectChord(allMeasureNotes);

    xml += `    <measure number="${measureNum + 1}">
`;

    // Add attributes on first measure
    if (measureNum === 0) {
      xml += `      <attributes>
        <divisions>${divisions}</divisions>
        <key>
          <fifths>0</fifths>
        </key>
        <time>
          <beats>${timeSignature.numerator}</beats>
          <beat-type>${timeSignature.denominator}</beat-type>
        </time>
        <staves>2</staves>
        <clef number="1">
          <sign>G</sign>
          <line>2</line>
        </clef>
        <clef number="2">
          <sign>F</sign>
          <line>4</line>
        </clef>
      </attributes>
      <direction placement="above">
        <direction-type>
          <metronome parentheses="no">
            <beat-unit>quarter</beat-unit>
            <per-minute>${tempo}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${tempo}"/>
      </direction>
`;

    // Add chord symbol if detected
    if (detectedChord) {
      xml += `      <harmony print-frame="no">
        <root>
          <root-step>${detectedChord.root}</root-step>
${detectedChord.alter !== 0 ? `          <root-alter>${detectedChord.alter}</root-alter>\n` : ''}        </root>
${detectedChord.kind !== 'major' ? `        <kind>${detectedChord.kind}</kind>\n` : ''}        <staff>1</staff>
      </harmony>
`;
    }
    }

    // Add treble staff notes
    xml += generateStaffNotes(trebleMeasureNotes, measureStart, divisions, 1, ticksPerMeasure);

    // Add backup to start of measure for bass staff
    xml += `      <backup>
        <duration>${ticksPerMeasure}</duration>
      </backup>
`;

    // Add bass staff notes
    xml += generateStaffNotes(bassMeasureNotes, measureStart, divisions, 2, ticksPerMeasure);

    xml += `    </measure>
`;
  }

  xml += `  </part>
</score-partwise>`;

  return xml;
}

/**
 * Generate MusicXML for notes in a staff with proper quantization
 */
function generateStaffNotes(
  notes: MidiNote[],
  measureStart: number,
  divisions: number,
  staffNumber: number,
  ticksPerMeasure: number
): string {
  let xml = '';
  let currentTick = measureStart;

  // If no notes, fill with rest
  if (notes.length === 0) {
    xml += `      <note>
        <rest/>
        <duration>${ticksPerMeasure}</duration>
        <voice>1</voice>
        <type>${getDurationType(ticksPerMeasure, divisions)}</type>
        <staff>${staffNumber}</staff>
      </note>
`;
    return xml;
  }

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.start - b.start);

  // Group simultaneous notes (chords) - allow small timing variations
  const noteGroups = new Map<number, MidiNote[]>();
  const CHORD_THRESHOLD = divisions / 16; // Notes within 1/16th beat are considered simultaneous

  sortedNotes.forEach(note => {
    const startInMeasure = Math.max(0, note.start - measureStart);

    // Find if there's an existing group within threshold
    let foundGroup = false;
    for (const [existingStart, group] of noteGroups.entries()) {
      if (Math.abs(existingStart - startInMeasure) < CHORD_THRESHOLD) {
        group.push(note);
        foundGroup = true;
        break;
      }
    }

    if (!foundGroup) {
      noteGroups.set(startInMeasure, [note]);
    }
  });

  const groupStarts = Array.from(noteGroups.keys()).sort((a, b) => a - b);

  // Helper to determine if a note type is beamable
  const isBeamable = (noteType: string): boolean => {
    return ['eighth', '16th', '32nd', '64th'].includes(noteType);
  };

  // Helper to determine beat position (for beam grouping)
  const getBeatPosition = (tick: number, divisions: number): number => {
    return Math.floor(tick / divisions);
  };

  // Pre-calculate beam groups
  interface BeamGroup {
    indices: number[];
    startBeat: number;
  }
  const beamGroups: BeamGroup[] = [];
  let currentBeamGroup: number[] = [];
  let currentBeamBeat = -1;

  groupStarts.forEach((startTick, idx) => {
    const group = noteGroups.get(startTick)!;
    const absoluteStart = measureStart + startTick;

    // Calculate duration
    const durations = group.map(n => {
      const end = Math.min(n.start + n.duration, measureStart + ticksPerMeasure);
      return Math.max(divisions / 8, end - n.start);
    });
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = (measureStart + ticksPerMeasure) - absoluteStart;
    const quantizedDuration = Math.min(quantizeDuration(avgDuration, divisions), maxDuration);

    const noteType = getDurationType(quantizedDuration, divisions);
    const beatPos = getBeatPosition(startTick, divisions);

    if (isBeamable(noteType)) {
      // Start new beam group if beat changed or this is first beamable note
      if (currentBeamBeat !== beatPos) {
        if (currentBeamGroup.length > 0) {
          beamGroups.push({ indices: currentBeamGroup, startBeat: currentBeamBeat });
        }
        currentBeamGroup = [idx];
        currentBeamBeat = beatPos;
      } else {
        currentBeamGroup.push(idx);
      }
    } else {
      // Non-beamable note ends current beam group
      if (currentBeamGroup.length > 0) {
        beamGroups.push({ indices: currentBeamGroup, startBeat: currentBeamBeat });
        currentBeamGroup = [];
        currentBeamBeat = -1;
      }
    }
  });

  // Add final beam group if any
  if (currentBeamGroup.length > 0) {
    beamGroups.push({ indices: currentBeamGroup, startBeat: currentBeamBeat });
  }

  // Create beam state map
  const beamStateMap = new Map<number, string>();
  beamGroups.forEach(group => {
    if (group.indices.length > 1) {
      group.indices.forEach((idx, pos) => {
        if (pos === 0) {
          beamStateMap.set(idx, 'begin');
        } else if (pos === group.indices.length - 1) {
          beamStateMap.set(idx, 'end');
        } else {
          beamStateMap.set(idx, 'continue');
        }
      });
    }
  });

  for (let groupIdx = 0; groupIdx < groupStarts.length; groupIdx++) {
    const startTick = groupStarts[groupIdx];
    const group = noteGroups.get(startTick)!;
    const absoluteStart = measureStart + startTick;

    // Add rest if there's a gap (threshold to avoid tiny rests)
    const gapThreshold = divisions / 32; // Ignore gaps smaller than 1/32nd
    if (currentTick + gapThreshold < absoluteStart) {
      const restDuration = absoluteStart - currentTick;
      // Quantize rest duration
      const quantizedRestDuration = quantizeDuration(restDuration, divisions);

      xml += `      <note>
        <rest/>
        <duration>${quantizedRestDuration}</duration>
        <voice>1</voice>
        <type>${getDurationType(quantizedRestDuration, divisions)}</type>
        <staff>${staffNumber}</staff>
      </note>
`;
      currentTick += quantizedRestDuration;
    }

    // Calculate duration (use average of chord notes, clamped to measure)
    const durations = group.map(n => {
      const end = Math.min(n.start + n.duration, measureStart + ticksPerMeasure);
      return Math.max(divisions / 8, end - n.start); // Minimum 1/8th note
    });
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    // Quantize duration and ensure it doesn't exceed measure
    const maxDuration = (measureStart + ticksPerMeasure) - currentTick;
    const quantizedDuration = Math.min(quantizeDuration(avgDuration, divisions), maxDuration);

    // Sort notes in chord by pitch (low to high)
    const sortedGroup = [...group].sort((a, b) => a.pitch - b.pitch);

    const noteType = getDurationType(quantizedDuration, divisions);
    const beamState = beamStateMap.get(groupIdx);

    // Add notes (chord if multiple)
    sortedGroup.forEach((note, index) => {
      const { pitch, step, octave, alter } = midiToNoteParts(note.pitch);

      xml += `      <note>
`;

      if (index > 0) {
        xml += `        <chord/>
`;
      }

      xml += `        <pitch>
          <step>${step}</step>
`;

      if (alter !== 0) {
        xml += `          <alter>${alter}</alter>
`;
      }

      xml += `          <octave>${octave}</octave>
        </pitch>
        <duration>${quantizedDuration}</duration>
        <voice>1</voice>
        <type>${noteType}</type>
`;

      if (alter !== 0) {
        xml += `        <accidental>${alter > 0 ? 'sharp' : 'flat'}</accidental>
`;
      }

      // Add beam element only for the first note in a chord
      if (index === 0 && beamState) {
        xml += `        <beam number="1">${beamState}</beam>
`;
      }

      xml += `        <staff>${staffNumber}</staff>
      </note>
`;
    });

    currentTick += quantizedDuration;
  }

  // Fill rest of measure with rest if needed
  const measureEnd = measureStart + ticksPerMeasure;
  if (currentTick < measureEnd - (divisions / 32)) {
    const restDuration = measureEnd - currentTick;
    const quantizedRestDuration = quantizeDuration(restDuration, divisions);

    xml += `      <note>
        <rest/>
        <duration>${quantizedRestDuration}</duration>
        <voice>1</voice>
        <type>${getDurationType(quantizedRestDuration, divisions)}</type>
        <staff>${staffNumber}</staff>
      </note>
`;
  }

  return xml;
}

/**
 * Quantize duration to nearest standard note value
 */
function quantizeDuration(duration: number, divisions: number): number {
  const quarters = duration / divisions;

  // Standard note values in quarter notes
  const standardValues = [
    4,    // whole
    3,    // dotted half
    2,    // half
    1.5,  // dotted quarter
    1,    // quarter
    0.75, // dotted eighth
    0.5,  // eighth
    0.25, // sixteenth
    0.125 // thirty-second
  ];

  // Find closest standard value
  let closest = standardValues[0];
  let minDiff = Math.abs(quarters - closest);

  for (const value of standardValues) {
    const diff = Math.abs(quarters - value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = value;
    }
  }

  return Math.round(closest * divisions);
}

/**
 * Convert MIDI note number to note parts (step, octave, alter)
 */
function midiToNoteParts(midiNote: number): {
  pitch: number;
  step: string;
  octave: number;
  alter: number;
} {
  const noteNames = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
  const alters = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]; // 0 = natural, 1 = sharp

  const pitchClass = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;

  return {
    pitch: midiNote,
    step: noteNames[pitchClass],
    octave: octave,
    alter: alters[pitchClass]
  };
}

/**
 * Determine note type from duration
 */
function getDurationType(duration: number, divisions: number): string {
  const quarters = duration / divisions;

  if (quarters >= 3.5) return 'whole';
  if (quarters >= 1.75) return 'half';
  if (quarters >= 0.875) return 'quarter';
  if (quarters >= 0.4375) return 'eighth';
  if (quarters >= 0.21875) return '16th';
  return '32nd';
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert MidiData to Tone.js MIDI format for better parsing
 */
function midiDataToToneMidi(data: MidiData): Midi {
  const midi = new Midi();

  // Set header properties
  midi.header.setTempo(data.tempo);
  midi.header.timeSignatures = [{
    ticks: 0,
    timeSignature: [data.timeSignature.numerator, data.timeSignature.denominator],
    measures: 0
  }];
  // Note: ppq is read-only and defaults to 480

  // Add tracks with notes
  data.tracks.forEach((track) => {
    const midiTrack = midi.addTrack();
    midiTrack.name = track.name;
    midiTrack.instrument.number = track.instrument;

    track.notes.forEach((note) => {
      // Convert ticks to seconds
      const timeInSeconds = (note.start / data.ticksPerBeat) * (60 / data.tempo);
      const durationInSeconds = (note.duration / data.ticksPerBeat) * (60 / data.tempo);

      midiTrack.addNote({
        midi: note.pitch,
        time: timeInSeconds,
        duration: durationInSeconds,
        velocity: note.velocity / 127
      });
    });
  });

  return midi;
}

/**
 * Parse MIDI file using MidiPlayerJS for enhanced event extraction
 * This provides better timing and event data for MusicXML generation
 */
export function parseMidiWithPlayer(midiArrayBuffer: ArrayBuffer | Uint8Array): {
  events: any[];
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  division: number;
} {
  const player = new MidiPlayer.Player();

  // Load MIDI data - convert to Uint8Array if needed
  const buffer = midiArrayBuffer instanceof Uint8Array
    ? midiArrayBuffer
    : new Uint8Array(midiArrayBuffer);
  player.loadArrayBuffer(buffer as any);

  // Get all events
  const allEvents = player.getEvents();
  let tempo = 120;
  let timeSignature = { numerator: 4, denominator: 4 };

  // Extract tempo and time signature from events
  for (const event of allEvents) {
    // Extract tempo changes
    if (event.name === 'Set Tempo' && event.data) {
      const tempoData = Array.isArray(event.data) ? event.data[0] : event.data;
      tempo = Math.round(60000000 / (tempoData as number)); // Convert microseconds per quarter to BPM
    }

    // Extract time signature
    if (event.name === 'Time Signature' && event.data && Array.isArray(event.data)) {
      timeSignature = {
        numerator: event.data[0] as number,
        denominator: Math.pow(2, event.data[1] as number)
      };
    }
  }

  return {
    events: allEvents,
    tempo,
    timeSignature,
    division: player.division || 480
  };
}

/**
 * Detect chord from a set of MIDI notes
 */
function detectChord(notes: MidiNote[]): { root: string; alter: number; kind: string } | null {
  if (notes.length === 0) return null;

  // Get unique pitches (remove duplicates in different octaves)
  const pitchClasses = [...new Set(notes.map(n => n.pitch % 12))].sort((a, b) => a - b);

  if (pitchClasses.length < 2) return null;

  // Note names
  const noteNames = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
  const alters = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];

  // Try each pitch class as potential root
  for (const rootPitch of pitchClasses) {
    const intervals = pitchClasses.map(p => (p - rootPitch + 12) % 12).sort((a, b) => a - b);

    // Check for chord types
    const intervalsStr = intervals.join(',');

    // Major triads and extensions
    if (intervalsStr.includes('0,4,7')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'major' };
    }
    // Minor triads
    if (intervalsStr.includes('0,3,7')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'minor' };
    }
    // Dominant 7th
    if (intervalsStr.includes('0,4,7,10')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'dominant' };
    }
    // Minor 7th
    if (intervalsStr.includes('0,3,7,10')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'minor-seventh' };
    }
    // Major 7th
    if (intervalsStr.includes('0,4,7,11')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'major-seventh' };
    }
    // Half-diminished (minor 7 flat 5)
    if (intervalsStr.includes('0,3,6,10')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'half-diminished' };
    }
    // Diminished
    if (intervalsStr.includes('0,3,6')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'diminished' };
    }
    // Augmented
    if (intervalsStr.includes('0,4,8')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'augmented' };
    }
    // Minor 6th
    if (intervalsStr.includes('0,3,7,9')) {
      return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'minor-sixth' };
    }
  }

  // Default to the lowest note as root with major if no specific chord detected
  const rootPitch = pitchClasses[0];
  return { root: noteNames[rootPitch], alter: alters[rootPitch], kind: 'major' };
}
