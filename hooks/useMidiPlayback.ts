"use client";

import { useRef, useCallback, useEffect } from 'react';
import type { MidiData, MidiNote } from '@/lib/midi-types';
import { midiToFrequency } from '@/lib/midi-types';

interface PlaybackState {
  isPlaying: boolean;
  currentPosition: number;
}

export function useMidiPlayback(
  midiData: MidiData | null,
  onPositionChange: (position: number) => void,
  onPlayingChange: (playing: boolean) => void
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const startTimeRef = useRef(0);
  const startPositionRef = useRef(0);
  const scheduledNotesRef = useRef<Set<string>>(new Set());
  const activeOscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context with iOS compatibility
  const initAudioContext = useCallback(async () => {
    if (audioUnlockedRef.current && audioContextRef.current) {
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      return audioContextRef.current;
    }

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    const ctx = audioContextRef.current;

    // Unlock audio on iOS
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Play silent buffer to fully unlock
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    audioUnlockedRef.current = true;
    return ctx;
  }, []);

  // Play a single note
  const playNote = useCallback(
    async (note: MidiNote, startTime: number) => {
      const ctx = await initAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      const freq = midiToFrequency(note.pitch);
      oscillator.frequency.setValueAtTime(freq, startTime);
      oscillator.type = 'triangle';

      const normalizedVelocity = note.velocity / 127;
      const durationSec = (note.duration / (midiData?.ticksPerBeat ?? 480)) * (60 / (midiData?.tempo ?? 120));

      gainNode.gain.setValueAtTime(normalizedVelocity * 0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durationSec);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + durationSec + 0.1);

      activeOscillatorsRef.current.set(note.id, oscillator);
      oscillator.onended = () => {
        activeOscillatorsRef.current.delete(note.id);
      };
    },
    [initAudioContext, midiData]
  );

  // Preview a single note (for clicking in editor)
  const previewNote = useCallback(
    async (pitch: number, velocity: number = 100, duration: number = 0.3) => {
      const ctx = await initAudioContext();
      if (!ctx) return;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      const freq = midiToFrequency(pitch);
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      oscillator.type = 'triangle';

      const normalizedVelocity = velocity / 127;
      gainNode.gain.setValueAtTime(normalizedVelocity * 0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration + 0.1);
    },
    [initAudioContext]
  );

  // Update playback position
  const updatePosition = useCallback(() => {
    if (!isPlayingRef.current || !midiData || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const elapsedTime = ctx.currentTime - startTimeRef.current;
    const ticksPerSecond = (midiData.ticksPerBeat * midiData.tempo) / 60;
    const currentTicks = startPositionRef.current + elapsedTime * ticksPerSecond;

    // Get max ticks from all notes
    const maxTicks = Math.max(
      ...midiData.tracks.flatMap(t => t.notes.map(n => n.start + n.duration)),
      midiData.ticksPerBeat * 4 // At least one measure
    );

    if (currentTicks >= maxTicks) {
      stop();
      onPositionChange(0);
      return;
    }

    onPositionChange(currentTicks);

    // Schedule notes that should play
    const lookAhead = 0.1; // Look 100ms ahead
    const lookAheadTicks = lookAhead * ticksPerSecond;

    midiData.tracks
      .filter(t => !t.muted)
      .forEach(track => {
        const hasSolo = midiData.tracks.some(t => t.solo);
        if (hasSolo && !track.solo) return;

        track.notes.forEach(note => {
          const noteKey = `${note.id}-${startTimeRef.current}`;
          if (
            note.start >= currentTicks &&
            note.start < currentTicks + lookAheadTicks &&
            !scheduledNotesRef.current.has(noteKey)
          ) {
            scheduledNotesRef.current.add(noteKey);
            const noteStartTime =
              ctx.currentTime + (note.start - currentTicks) / ticksPerSecond;
            playNote(note, noteStartTime);
          }
        });
      });

    animationFrameRef.current = requestAnimationFrame(updatePosition);
  }, [midiData, onPositionChange, playNote]);

  // Play
  const play = useCallback(
    async (fromPosition: number = 0) => {
      if (!midiData) return;

      const ctx = await initAudioContext();
      if (!ctx) return;

      isPlayingRef.current = true;
      startTimeRef.current = ctx.currentTime;
      startPositionRef.current = fromPosition;
      scheduledNotesRef.current.clear();

      onPlayingChange(true);
      updatePosition();
    },
    [midiData, initAudioContext, onPlayingChange, updatePosition]
  );

  // Pause
  const pause = useCallback(() => {
    isPlayingRef.current = false;
    onPlayingChange(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [onPlayingChange]);

  // Stop
  const stop = useCallback(() => {
    pause();
    onPositionChange(0);

    // Stop all active oscillators
    activeOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch {
        // Already stopped
      }
    });
    activeOscillatorsRef.current.clear();
    scheduledNotesRef.current.clear();
  }, [pause, onPositionChange]);

  // Seek
  const seekTo = useCallback(
    (position: number) => {
      const wasPlaying = isPlayingRef.current;
      stop();
      onPositionChange(position);

      if (wasPlaying) {
        play(position);
      }
    },
    [stop, onPositionChange, play]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      activeOscillatorsRef.current.forEach(osc => {
        try {
          osc.stop();
        } catch {
          // Already stopped
        }
      });
    };
  }, []);

  return {
    play,
    pause,
    stop,
    seekTo,
    previewNote,
    initAudioContext,
  };
}
