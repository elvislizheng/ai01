import * as tf from '@tensorflow/tfjs';
import {
  BasicPitch,
  outputToNotesPoly,
  addPitchBendsToNoteEvents,
  noteFramesToTime,
  type NoteEventTime
} from '@spotify/basic-pitch';
import { Midi } from '@tonejs/midi';
import { MidiData, MidiNote, MidiTrack } from './midi-types';

export interface AudioToMidiOptions {
  onsetThreshold?: number;        // 0-1, default 0.35 (higher = stricter note detection)
  frameThreshold?: number;        // 0-1, default 0.25 (controls note sustain)
  minimumNoteDuration?: number;   // in frames, default 3
  velocitySensitivity?: number;   // 0-1, default 0.7
  onProgress?: (progress: number, status: string) => void;
}

// Cache the model to avoid reloading
let modelPromise: Promise<tf.GraphModel> | null = null;

// Model URL - using the bundled Basic Pitch model from public folder
const MODEL_URL = '/models/basic-pitch/model.json';

/**
 * Load the Basic Pitch model
 */
async function loadModel(): Promise<tf.GraphModel> {
  if (!modelPromise) {
    modelPromise = tf.loadGraphModel(MODEL_URL);
  }
  return modelPromise;
}

/**
 * Convert an audio file (WAV/MP3) to MIDI data structure
 */
export async function audioToMidi(
  audioFile: File,
  options: AudioToMidiOptions = {}
): Promise<MidiData> {
  const {
    onsetThreshold = 0.35,  // Lower threshold = more notes detected
    frameThreshold = 0.25,  // Controls note sustain
    minimumNoteDuration = 3,  // Shorter minimum = more notes kept
    velocitySensitivity = 0.7,
    onProgress
  } = options;

  try {
    // Step 1: Decode and resample the audio file
    onProgress?.(0, 'Decoding and resampling audio...');
    const audioBuffer = await decodeAudioFile(audioFile);

    // Step 2: Initialize Basic Pitch with model URL
    onProgress?.(20, 'Loading AI model...');
    const basicPitch = new BasicPitch(MODEL_URL);

    // Step 3: Run Basic Pitch inference
    onProgress?.(30, 'Analyzing audio (this may take a moment)...');

    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];

    await basicPitch.evaluateModel(
      audioBuffer,
      (f: number[][], o: number[][], c: number[][]) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
      },
      (percent: number) => {
        // Progress during model evaluation (30% to 70%)
        onProgress?.(30 + percent * 0.4, 'Analyzing audio...');
      }
    );

    // Step 4: Convert frames to notes
    onProgress?.(70, 'Converting to musical notes...');

    const noteEvents = outputToNotesPoly(
      frames,
      onsets,
      onsetThreshold,  // onset threshold
      frameThreshold,  // frame threshold (controls note sustain)
      minimumNoteDuration,  // minimum note length in frames
      true             // infer onsets
    );

    // Add pitch bends
    const noteEventsWithBends = addPitchBendsToNoteEvents(contours, noteEvents);

    // Convert to time-based notes
    const notes = noteFramesToTime(noteEventsWithBends);

    // Step 5: Convert to MIDI data structure
    onProgress?.(90, 'Generating notation...');
    const midiData = convertToMidiData(
      notes,
      audioBuffer.duration,
      velocitySensitivity
    );

    onProgress?.(100, 'Complete!');
    return midiData;

  } catch (error) {
    console.error('Audio to MIDI conversion error:', error);
    throw new Error(`Failed to convert audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decode audio file to AudioBuffer using Web Audio API
 */
async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;

      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // Basic Pitch requires 22050 Hz sample rate
        const targetSampleRate = 22050;

        if (audioBuffer.sampleRate !== targetSampleRate) {
          // Resample the audio
          const resampledBuffer = await resampleAudioBuffer(audioContext, audioBuffer, targetSampleRate);
          resolve(resampledBuffer);
        } else {
          resolve(audioBuffer);
        }
      } catch (error) {
        reject(new Error('Failed to decode audio file. Make sure it\'s a valid WAV or MP3 file.'));
      } finally {
        // Clean up audio context
        await audioContext.close();
      }
    };

    reader.onerror = () => reject(new Error('Failed to read audio file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Resample audio buffer to target sample rate
 */
async function resampleAudioBuffer(
  audioContext: AudioContext,
  audioBuffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> {
  // Create an offline audio context at the target sample rate
  const offlineContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(audioBuffer.duration * targetSampleRate),
    targetSampleRate
  );

  // Create a buffer source
  const source = offlineContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineContext.destination);
  source.start(0);

  // Render the audio at the new sample rate
  return await offlineContext.startRendering();
}

/**
 * Convert Basic Pitch notes to MidiData structure using @tonejs/midi for better structuring
 */
function convertToMidiData(
  notes: NoteEventTime[],
  audioDuration: number,
  velocitySensitivity: number
): MidiData {
  // Default settings
  const DEFAULT_TEMPO = 120; // BPM
  const TICKS_PER_BEAT = 480; // Standard PPQN

  // Create a Tone.js MIDI file for better structuring
  const toneMidi = new Midi();
  toneMidi.header.setTempo(DEFAULT_TEMPO);
  toneMidi.header.timeSignatures = [{ ticks: 0, timeSignature: [4, 4], measures: 0 }];
  // Note: ppq is read-only and defaults to 480, which matches TICKS_PER_BEAT

  // Split notes into treble (right hand) and bass (left hand) based on pitch
  const MIDDLE_C = 60; // MIDI note 60 is middle C
  const trebleNotes = notes.filter(note => Math.round(note.pitchMidi) >= MIDDLE_C);
  const bassNotes = notes.filter(note => Math.round(note.pitchMidi) < MIDDLE_C);

  // Create treble track (right hand)
  const trebleTrack = toneMidi.addTrack();
  trebleTrack.name = 'Right Hand (Treble)';
  trebleTrack.instrument.number = 0; // Acoustic Grand Piano
  trebleTrack.channel = 0;

  trebleNotes.forEach((note) => {
    trebleTrack.addNote({
      midi: Math.round(note.pitchMidi),
      time: note.startTimeSeconds,
      duration: note.durationSeconds,
      velocity: amplitudeToVelocity(note.amplitude, velocitySensitivity) / 127 // Tone.js uses 0-1
    });
  });

  // Create bass track (left hand)
  const bassTrack = toneMidi.addTrack();
  bassTrack.name = 'Left Hand (Bass)';
  bassTrack.instrument.number = 0; // Acoustic Grand Piano
  bassTrack.channel = 1;

  bassNotes.forEach((note) => {
    bassTrack.addNote({
      midi: Math.round(note.pitchMidi),
      time: note.startTimeSeconds,
      duration: note.durationSeconds,
      velocity: amplitudeToVelocity(note.amplitude, velocitySensitivity) / 127 // Tone.js uses 0-1
    });
  });

  // Convert from Tone.js MIDI back to our MidiData structure
  const ticksPerSecond = (DEFAULT_TEMPO / 60) * TICKS_PER_BEAT;

  // Convert treble track notes
  const trebleMidiNotes: MidiNote[] = trebleTrack.notes.map((note, index) => ({
    id: `treble-${index}`,
    pitch: note.midi,
    start: Math.round(note.time * ticksPerSecond),
    duration: Math.round(note.duration * ticksPerSecond),
    velocity: Math.round(note.velocity * 127),
    track: 0
  }));

  // Convert bass track notes
  const bassMidiNotes: MidiNote[] = bassTrack.notes.map((note, index) => ({
    id: `bass-${index}`,
    pitch: note.midi,
    start: Math.round(note.time * ticksPerSecond),
    duration: Math.round(note.duration * ticksPerSecond),
    velocity: Math.round(note.velocity * 127),
    track: 1
  }));

  // Sort notes by start time
  trebleMidiNotes.sort((a, b) => a.start - b.start);
  bassMidiNotes.sort((a, b) => a.start - b.start);

  // Create treble track (right hand)
  const trebleMidiTrack: MidiTrack = {
    id: 'track-0',
    name: 'Right Hand (Treble)',
    instrument: 0, // Acoustic Grand Piano
    notes: trebleMidiNotes,
    muted: false,
    solo: false
  };

  // Create bass track (left hand)
  const bassMidiTrack: MidiTrack = {
    id: 'track-1',
    name: 'Left Hand (Bass)',
    instrument: 0, // Acoustic Grand Piano
    notes: bassMidiNotes,
    muted: false,
    solo: false
  };

  // Calculate total duration in ticks
  const durationTicks = Math.round(audioDuration * ticksPerSecond);

  // Create MIDI data structure with two tracks (treble and bass)
  const midiData: MidiData = {
    name: 'Converted from Audio',
    duration: durationTicks,
    tempo: DEFAULT_TEMPO,
    timeSignature: {
      numerator: 4,
      denominator: 4
    },
    ticksPerBeat: TICKS_PER_BEAT,
    tracks: [trebleMidiTrack, bassMidiTrack]
  };

  return midiData;
}

/**
 * Convert amplitude (0-1) to MIDI velocity (0-127)
 */
function amplitudeToVelocity(amplitude: number, sensitivity: number): number {
  // Apply sensitivity curve
  const adjusted = Math.pow(amplitude, 1 / sensitivity);

  // Scale to MIDI velocity range (20-127 for better dynamics)
  const velocity = Math.round(20 + adjusted * 107);

  // Clamp to valid range
  return Math.max(0, Math.min(127, velocity));
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): { supported: boolean; message?: string } {
  // Check for Web Audio API
  if (!window.AudioContext && !(window as any).webkitAudioContext) {
    return {
      supported: false,
      message: 'Your browser doesn\'t support the Web Audio API. Please use a modern browser like Chrome, Firefox, or Safari.'
    };
  }

  // Check for WebAssembly (required by Basic Pitch)
  if (typeof WebAssembly !== 'object') {
    return {
      supported: false,
      message: 'Your browser doesn\'t support WebAssembly. Please update to a newer version.'
    };
  }

  return { supported: true };
}

/**
 * Validate audio file before processing
 */
export function validateAudioFile(file: File): { valid: boolean; message?: string } {
  // Check file type
  const validTypes = ['audio/wav', 'audio/wave', 'audio/x-wav', 'audio/mpeg', 'audio/mp3'];
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const validExtensions = ['wav', 'mp3'];

  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
    return {
      valid: false,
      message: 'Please upload a WAV or MP3 file.'
    };
  }

  // Check file size (50MB limit)
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      message: 'File is too large. Please upload a file smaller than 50MB.'
    };
  }

  // Warn for large files
  const WARN_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > WARN_SIZE) {
    return {
      valid: true,
      message: 'Large file detected. Processing may take 30+ seconds.'
    };
  }

  return { valid: true };
}
