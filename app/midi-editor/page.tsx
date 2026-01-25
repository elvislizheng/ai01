"use client";

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { MidiEditorProvider, useMidiEditor } from '@/contexts/MidiEditorContext';
import { useMidiPlayback } from '@/hooks/useMidiPlayback';
import type { MidiData, MidiNote } from '@/lib/midi-types';
import { audioToMidi, type AudioToMidiOptions } from '@/lib/audio-to-midi';

import MidiUploader from '@/components/midi-editor/MidiUploader';
import PianoRoll from '@/components/midi-editor/PianoRoll';
import PlaybackControls from '@/components/midi-editor/PlaybackControls';
import Toolbar from '@/components/midi-editor/Toolbar';
import TrackList from '@/components/midi-editor/TrackList';
import ExportPanel from '@/components/midi-editor/ExportPanel';
import ConversionOptionsPanel from '@/components/midi-editor/ConversionOptionsPanel';
import AudioProcessingModal from '@/components/midi-editor/AudioProcessingModal';
import SheetMusicPreview from '@/components/midi-editor/SheetMusicPreview';

function MidiEditorContent() {
  const { state, dispatch } = useMidiEditor();
  const [showExport, setShowExport] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pianoRoll' | 'sheetMusic'>('pianoRoll');

  // Audio conversion state
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');

  const handlePositionChange = useCallback((position: number) => {
    dispatch({ type: 'SET_POSITION', payload: position });
  }, [dispatch]);

  const handlePlayingChange = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_PLAYING', payload: playing });
  }, [dispatch]);

  const { play, pause, stop, seekTo, previewNote, initAudioContext } = useMidiPlayback(
    state.midiData,
    handlePositionChange,
    handlePlayingChange
  );

  // Calculate total ticks
  const totalTicks = useMemo(() => {
    if (!state.midiData) return 0;
    const notesMaxTick = Math.max(
      ...state.midiData.tracks.flatMap(t => t.notes.map(n => n.start + n.duration)),
      0
    );
    return Math.max(notesMaxTick, state.midiData.ticksPerBeat * 4);
  }, [state.midiData]);

  // Handlers
  const handleLoadMidi = useCallback((data: MidiData) => {
    dispatch({ type: 'LOAD_MIDI', payload: data });
    setSelectedTrackId(data.tracks[0]?.id ?? null);
  }, [dispatch]);

  const handleAddNote = useCallback((trackId: string, note: Omit<MidiNote, 'id'>) => {
    dispatch({ type: 'ADD_NOTE', payload: { trackId, note } });
  }, [dispatch]);

  const handleUpdateNote = useCallback((noteId: string, changes: Partial<MidiNote>) => {
    dispatch({ type: 'UPDATE_NOTE', payload: { noteId, changes } });
  }, [dispatch]);

  const handleDeleteNotes = useCallback((noteIds: string[]) => {
    dispatch({ type: 'DELETE_NOTES', payload: noteIds });
  }, [dispatch]);

  const handleSelectNotes = useCallback((noteIds: string[]) => {
    dispatch({ type: 'SELECT_NOTES', payload: noteIds });
  }, [dispatch]);

  const handlePlay = useCallback(async () => {
    await initAudioContext();
    play(state.currentPosition);
  }, [initAudioContext, play, state.currentPosition]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setSelectedAudioFile(null);
  }, [dispatch]);

  const handleAudioFileSelected = useCallback((file: File) => {
    setSelectedAudioFile(file);
  }, []);

  const handleCancelAudioConversion = useCallback(() => {
    setSelectedAudioFile(null);
  }, []);

  const handleConvertAudio = useCallback(async (options: AudioToMidiOptions) => {
    if (!selectedAudioFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStatus('Starting conversion...');

    try {
      const midiData = await audioToMidi(selectedAudioFile, {
        ...options,
        onProgress: (progress, status) => {
          setProcessingProgress(progress);
          setProcessingStatus(status);
        }
      });

      // Load the converted MIDI data
      dispatch({ type: 'LOAD_MIDI', payload: midiData });
      setSelectedTrackId(midiData.tracks[0]?.id ?? null);
      setSelectedAudioFile(null);
    } catch (error) {
      console.error('Audio conversion error:', error);
      alert(error instanceof Error ? error.message : 'Failed to convert audio. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStatus('');
    }
  }, [selectedAudioFile, dispatch]);

  // Render upload view
  if (!state.midiData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-16">
          {selectedAudioFile ? (
            <ConversionOptionsPanel
              fileName={selectedAudioFile.name}
              onConvert={handleConvertAudio}
              onCancel={handleCancelAudioConversion}
            />
          ) : (
            <MidiUploader
              onLoad={handleLoadMidi}
              onAudioFileSelected={handleAudioFileSelected}
            />
          )}
        </main>

        {/* Audio Processing Modal */}
        <AudioProcessingModal
          isOpen={isProcessing}
          progress={processingProgress}
          status={processingStatus}
        />
      </div>
    );
  }

  // Render editor view
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <h1 className="text-lg font-semibold text-gray-900">{state.midiData.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('pianoRoll')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'pianoRoll'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Piano Roll
              </button>
              <button
                onClick={() => setViewMode('sheetMusic')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'sheetMusic'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sheet Music
              </button>
            </div>

            <button
              onClick={() => setShowExport(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Toolbar - Only show in Piano Roll mode */}
      {viewMode === 'pianoRoll' && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <Toolbar
            currentTool={state.currentTool}
            quantization={state.quantization}
            zoom={state.zoom}
            canUndo={state.historyIndex > 0}
            canRedo={state.historyIndex < state.history.length - 1}
            onToolChange={(tool) => dispatch({ type: 'SET_TOOL', payload: tool })}
            onQuantizationChange={(q) => dispatch({ type: 'SET_QUANTIZATION', payload: q })}
            onZoomChange={(z) => dispatch({ type: 'SET_ZOOM', payload: z })}
            onUndo={() => dispatch({ type: 'UNDO' })}
            onRedo={() => dispatch({ type: 'REDO' })}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track list sidebar - Only show in Piano Roll mode */}
        {viewMode === 'pianoRoll' && (
          <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 overflow-auto">
            <TrackList
              tracks={state.midiData.tracks}
              selectedTrackId={selectedTrackId}
              onSelectTrack={setSelectedTrackId}
              onToggleMute={(id) => dispatch({ type: 'TOGGLE_TRACK_MUTE', payload: id })}
              onToggleSolo={(id) => dispatch({ type: 'TOGGLE_TRACK_SOLO', payload: id })}
            />
          </div>
        )}

        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden p-4">
          <div className="flex-1 overflow-auto">
            {viewMode === 'pianoRoll' ? (
              <PianoRoll
                midiData={state.midiData}
                selectedNotes={state.selectedNotes}
                currentTool={state.currentTool}
                zoom={state.zoom}
                currentPosition={state.currentPosition}
                quantization={state.quantization}
                onAddNote={handleAddNote}
                onUpdateNote={handleUpdateNote}
                onDeleteNotes={handleDeleteNotes}
                onSelectNotes={handleSelectNotes}
                onPreviewNote={previewNote}
              />
            ) : (
              <SheetMusicPreview midiData={state.midiData} className="h-full" />
            )}
          </div>

          {/* Playback controls */}
          <div className="mt-4">
            <PlaybackControls
              isPlaying={state.isPlaying}
              currentPosition={state.currentPosition}
              totalTicks={totalTicks}
              tempo={state.midiData.tempo}
              ticksPerBeat={state.midiData.ticksPerBeat}
              onPlay={handlePlay}
              onPause={pause}
              onStop={stop}
              onSeek={seekTo}
              onTempoChange={(tempo) => dispatch({ type: 'SET_TEMPO', payload: tempo })}
            />
          </div>
        </div>
      </div>

      {/* Export modal */}
      {showExport && state.midiData && (
        <ExportPanel
          midiData={state.midiData}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

export default function MidiEditorPage() {
  return (
    <MidiEditorProvider>
      <MidiEditorContent />
    </MidiEditorProvider>
  );
}
